

const buffSize = 64;			//缓冲区大小
const add_start = 0;			//读取的起始地址
const read_size = 128*1024;	//读取大小

mainObject.serialClean();

//GPIO初始化并拉高，用于辅助引脚HOLD、WP的控制,甚至驱动MOS上电flash
gpio_cmd_init(0x00, 0xff);			//所有IO输出，并设置上拉
gpio_cmd_write(0xff);				//所有IO拉高


//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(8) != 0)
{
	mainObject.statusShow("spi_cmd_init FAIL");
	throw new Error("spi_cmd_init FAIL");
}

var sreg;					//状态寄存器
var err = 0;
mainObject.statusShow("read begin at:" + add_start.toString());


//超过16MB的SPI flash使用不同于之前的序列
//当前芯片组织为 2048 Blocks		64 Pages/Block (2048+64)Bytes/Page
//内置缓存一次只能缓存一页，因此每次只能按页读写
const PageSize = 2048;


let addrPage_Read_start = add_start;
let addrPage_start = add_start - add_start%PageSize;
let edit_idx = 0;				//指示已读取数据量或编辑器索引
while( edit_idx < read_size )			//每轮循环读一页，一直读到最后
{
	let addrPage = parseInt( addrPage_Read_start/PageSize );
	
	//加载一页数据到flash缓存
	err += spi_cmd_ce();
	err += spi_cmd_write([0x13, (addrPage>>16) & 0xff, (addrPage>>8) & 0xff, addrPage & 0xff]);	//Page Data Read指令
	err += spi_cmd_dece();
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at begin," + "code:" + err.toString());
		throw new Error("read FAIL at begin," + "code:" + err.toString());
	}
	
	//等待缓存加载完成
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0)
	{
		mainObject.statusShow("Page Data Read FAIL at:" + addrPage_Read_start.toString()+ "code:" + err.toString());
		throw new Error("Page Data Read FAIL at:" + addrPage_Read_start.toString()+ "code:" + err.toString());
	}
	
	//发送数据读指令
	let addrCol = addrPage_Read_start % PageSize;				//列地址
	err += spi_cmd_ce();
	err += spi_cmd_write([0x0b, (addrCol>>8) & 0xff, addrCol & 0xff, 0]);		//快速读数据指令，此处为新格式
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at fast read begin," + "code:" + err.toString());
		throw new Error("read FAIL at fast read begin," + "code:" + err.toString());
	}
	
	//循环读取flash缓冲区
	while( addrCol < PageSize && edit_idx < read_size)	//每轮循环读一片MCU缓冲区，直到页末尾或达到指定字节数
	{
		let current_read = Math.min(buffSize, PageSize - addrCol, read_size - edit_idx);
		err += spi_cmd_read_editor(edit_idx , current_read);
		edit_idx += current_read;
		addrCol += current_read;

		if(err != 0)
		{
			mainObject.statusShow("read FAIL at:" + edit_idx.toString() + "/" 
				+ read_size.toString() + " code:" + err.toString());
			throw new Error("read FAIL at:" + edit_idx.toString() + "/" + read_size.toString() + " code:" + err.toString());
		}
		mainObject.statusShow("read finished at:" + edit_idx.toString() + "/" + read_size.toString() );
	}
	err += spi_cmd_dece();
	
	addrPage_start += PageSize;
	addrPage_Read_start = addrPage_start;
}


mainObject.statusShow("readAll finished");
