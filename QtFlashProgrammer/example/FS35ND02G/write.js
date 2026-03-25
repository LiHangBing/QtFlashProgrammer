
//注意：写入前需要擦除操作
const add_start = 0;			//写入flash的起始地址
var write_size = -1*1024;	//写入大小（如果设置为<0的值如-1，将会修改为可写入的最大长度）
var pos = 0;					//编辑区域的起始地址


const buffSize = 64;			//串口缓冲区大小（一定要为能整除页大小）
const pageSize = 2048;			//页大小

//参数判断
if(write_size < 0) write_size = mainObject.getEditLen() - pos;
if(pos + write_size > mainObject.getEditLen() || pageSize % buffSize != 0)
	throw new Error("para err");

mainObject.serialClean();

//GPIO初始化并拉高，用于辅助引脚HOLD、WP的控制,甚至驱动MOS上电flash
gpio_cmd_init(0x00, 0xff);			//所有IO输出，并设置上拉
gpio_cmd_write(0xff);				//所有IO拉高

//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(8) != 0)
	throw new Error("spi_cmd_init FAIL");


mainObject.statusShow("write begin at:" + add_start.toString());


var sreg;					//状态寄存器
var err = 0;

//将分页写入，起始地址若非页起始，结束地址若非页结尾，需特殊处理
var bytesBefore = pageSize - (add_start % pageSize); //刚开始写的第一页可能不是从0开始
bytesBefore = bytesBefore % pageSize;       //检查前面是否完整一页
var pageSum = parseInt( (write_size - bytesBefore) / pageSize );    //中间的整页
var bytesAfter = (write_size - bytesBefore) % pageSize;//后面多余的部分

//取消写保护
err = spi_cmd_ce();
err += spi_cmd_write(0x01);	//写状态寄存器，新格式
err += spi_cmd_write([0xa0, 0]); //Status Register 1 / Protection Register: Addr = A0h
err += spi_cmd_dece();

//首页
var addr = add_start;
if(bytesBefore > 0)
{
	//由于该芯片写入方式为缓存机制写入，因此未满一页时剩余数据需要读出来
	//加载一页数据到flash缓存
	let addrPage = parseInt( addr/pageSize );
	err += spi_cmd_ce();
	err += spi_cmd_write([0x13, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]);	//Page Data Read指令
	err += spi_cmd_dece();
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at page read," + "code:" + err.toString());
		throw new Error("read FAIL at page read," + "code:" + err.toString());
	}
	do{					//等待缓存加载完成,Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0)
	{
		mainObject.statusShow("Page Data Read FAIL," + "code:" + err.toString());
		throw new Error("Page Data Read FAIL," + "code:" + err.toString());
	}
	
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	if(err != 0) throw new Error("spi_cmd_write(0x06) err," + "code:" + err.toString());
	
	//写缓存
	let addrCol = addr % pageSize;				//列地址
	err = spi_cmd_ce();
	err += spi_cmd_write([0x84, (addrCol>>>8) & 0xff, addrCol & 0xff]);	//Random Load Program Data指令
	if(err != 0) throw new Error("spi_cmd_write([0x84,... err," + "code:" + err.toString());
	while(bytesBefore > 0)				//每次写入至多一个buff
	{
		let current_write = Math.min(buffSize, bytesBefore);
		err += spi_cmd_write_editor(pos, current_write);
		pos += current_write;
		bytesBefore -= current_write;
		addr += current_write;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("write bytesBefore err," + "code:" + err.toString());
	
	//缓存写入
	err = spi_cmd_ce();
	err += spi_cmd_write([0x10, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]); //flash Program Execute指令
	err += spi_cmd_dece();
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at bytesBefore err," + "code:" + err.toString());
	mainObject.statusShow("write bytesBefore finished");
}

//中间页
for(i = 0; i < pageSum; i++)
{
	let addrPage = parseInt( addr/pageSize );
	
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	
	//写缓存
	let addrCol = addr % pageSize;				//列地址
	err = spi_cmd_ce();
	err += spi_cmd_write([0x84, (addrCol>>>8) & 0xff, addrCol & 0xff]);	//Random Load Program Data指令
	if(err != 0) throw new Error("spi_cmd_write([0x84,... err at page:" + i.toString() + ",code:" + err.toString());
	let pageLeft = pageSize;
	while(pageLeft > 0)				//每次写入至多一个buff
	{
		let current_write = Math.min(buffSize, pageLeft);
		err += spi_cmd_write_editor(pos, current_write);
		pos += current_write;
		pageLeft -= current_write;
		addr += current_write;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("write buff err at page:" + i.toString() + ",code:" + err.toString());
	
	//缓存写入
	err = spi_cmd_ce();
	err += spi_cmd_write([0x10, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]); //flash Program Execute指令
	err += spi_cmd_dece();
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at page write err," + "code:" + err.toString() + "page:" + i.toString());
	mainObject.statusShow("write finished at page:" + i.toString() + "/" + pageSum.toString());
}

//尾页
if(bytesAfter > 0)
{
	//由于该芯片写入方式为缓存机制写入，因此未满一页时剩余数据需要读出来
	//加载一页数据到flash缓存
	let addrPage = parseInt( addr/pageSize );
	err += spi_cmd_ce();
	err += spi_cmd_write([0x13, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]);	//Page Data Read指令
	err += spi_cmd_dece();
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at page read," + "code:" + err.toString());
		throw new Error("read FAIL at page read," + "code:" + err.toString());
	}
	do{					//等待缓存加载完成,Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0)
	{
		mainObject.statusShow("Page Data Read FAIL," + "code:" + err.toString());
		throw new Error("Page Data Read FAIL," + "code:" + err.toString());
	}
	
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	if(err != 0) throw new Error("spi_cmd_write(0x06) err," + "code:" + err.toString());
	
	//写缓存
	let addrCol = addr % pageSize;				//列地址
	err = spi_cmd_ce();
	err += spi_cmd_write([0x84, (addrCol>>>8) & 0xff, addrCol & 0xff]);	//Random Load Program Data指令
	if(err != 0) throw new Error("spi_cmd_write([0x84,... err," + "code:" + err.toString());
	while(bytesAfter > 0)				//每次写入至多一个buff
	{
		let current_write = Math.min(buffSize, bytesAfter);
		err += spi_cmd_write_editor(pos, current_write);
		pos += current_write;
		bytesAfter -= current_write;
		addr += current_write;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("write bytesAfter err," + "code:" + err.toString());
	
	//缓存写入
	err = spi_cmd_ce();
	err += spi_cmd_write([0x10, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]); //flash Program Execute指令
	err += spi_cmd_dece();
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at bytesAfter err," + "code:" + err.toString());
	mainObject.statusShow("write bytesAfter finished");
}

mainObject.statusShow("write finished");