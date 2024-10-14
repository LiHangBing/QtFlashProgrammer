
//注意：写入前需要擦除操作
const add_start = 0;			//写入flash的起始地址
var write_size = 8*1024;	//写入大小（如果设置为<0的值如-1，将会修改为可写入的最大长度）
var pos = 0;					//编辑区域的起始地址
const buffSize = 64;			//串口缓冲区大小（一定要为能整除页大小）
const pageSize = 256;			//w25qxx页大小



//参数判断
if(write_size < 0) write_size = mainObject.getEditLen() - pos;
if(pos + write_size > mainObject.getEditLen() || pageSize % buffSize != 0)
	throw new Error("para err");

mainObject.serialClean();
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

//首页
var addr = add_start;
if(bytesBefore > 0)
{
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	if(err != 0) throw new Error("spi_cmd_write(0x06) err," + "code:" + err.toString());
	
	err = spi_cmd_ce();
	err += spi_cmd_write([0x02, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff]);	//页写指令
	if(err != 0) throw new Error("spi_cmd_write([0x02,... err," + "code:" + err.toString());
	
	while(bytesBefore > buffSize)			//每次写一个buff
	{
		err += spi_cmd_write_editor(pos, buffSize);
		pos += buffSize;
		bytesBefore -= buffSize;
		addr += buffSize;
	}
	if(bytesBefore > 0)
	{
		err += spi_cmd_write_editor(pos, bytesBefore);
		pos += bytesBefore;
		//bytesBefore -= bytesBefore;
		addr += bytesBefore;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("write bytesBefore err," + "code:" + err.toString());
	
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at bytesBefore err," + "code:" + err.toString());
	mainObject.statusShow("write bytesBefore finished");
}

//中间页
const buffsPerPage = parseInt(pageSize / buffSize);
for(i = 0; i < pageSum; i++)
{
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	
	err = spi_cmd_ce();
	err += spi_cmd_write([0x02, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff]);	//页写指令
	if(err != 0) throw new Error("spi cmd err," + "code:" + err.toString() + "page:" + i.toString());
	
	for(j = 0; j < buffsPerPage; j++)
	{
		err += spi_cmd_write_editor(pos, buffSize);
		pos += buffSize;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("spi page write err," + "code:" + err.toString() + "page:" + i.toString());
	addr += pageSize;
	
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at page write err," + "code:" + err.toString() + "page:" + i.toString());
	mainObject.statusShow("write finished at page:" + i.toString() + "/" + pageSum.toString());
}

//尾页
if(bytesAfter > 0)
{
	err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	if(err != 0) throw new Error("spi_cmd_write(0x06) err," + "code:" + err.toString());
	
	err = spi_cmd_ce();
	err += spi_cmd_write([0x02, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff]);	//页写指令
	if(err != 0) throw new Error("spi_cmd_write([0x02,... err," + "code:" + err.toString());
	
	while(bytesAfter > buffSize)			//每次写一个buff
	{
		err += spi_cmd_write_editor(pos, buffSize);
		pos += buffSize;
		bytesAfter -= buffSize;
		addr += buffSize;
	}
	if(bytesAfter > 0)
	{
		err += spi_cmd_write_editor(pos, bytesAfter);
		pos += bytesAfter;
		//bytesAfter -= bytesAfter;
		addr += bytesAfter;
	}
	err += spi_cmd_dece();
	if(err != 0) throw new Error("write bytesAfter err," + "code:" + err.toString());
	
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0) throw new Error("read status at bytesAfter err," + "code:" + err.toString());
	mainObject.statusShow("write bytesAfter finished");
}

mainObject.statusShow("write finished");