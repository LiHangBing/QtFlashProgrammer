//该flash不支持单独的整片擦除指令


const SectorSize = 128*1024; 		//块大小（当前芯片只支持块擦除），128KB Block
const add_start = 0;			//擦除的起始地址（注意一定要为扇区的整数倍，否则禁止执行）
const erase_size = 256*1024*1024;	//擦除大小（注意一定要为扇区的整数倍，否则禁止执行）

const add_end = add_start + erase_size;

if( (add_start % SectorSize != 0) || (erase_size % SectorSize != 0) )
{
	mainObject.statusShow("parameter error");
	throw new Error("parameter error");
}

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
const PageSize = 2048;

mainObject.statusShow("erase: begin");


//取消写保护
let err = 0;
err = spi_cmd_ce();
err += spi_cmd_write(0x01);	//写状态寄存器，新格式
err += spi_cmd_write([0xa0, 0]); //Status Register 1 / Protection Register: Addr = A0h
err += spi_cmd_dece();

let sector_sum = parseInt(erase_size/SectorSize);
for (i = 0; i < sector_sum; i++) {					//循环擦除每一块
	let addr = add_start + SectorSize*i;
	
    err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	
	let addrPage = parseInt( addr/PageSize );
	err += spi_cmd_ce();
	err += spi_cmd_write([0xd8, (addrPage>>>16) & 0xff, (addrPage>>>8) & 0xff, addrPage & 0xff]);
	err += spi_cmd_dece();
	
	//等待擦除完成
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
		err += spi_cmd_write(0xc0); //Status Register 3 / Status Register: Addr = C0h
		sreg = spi_cmd_read(1);
		err += spi_cmd_dece();
	}while(sreg & 0x01 == 0x01);
	if(err != 0)
	{
		mainObject.statusShow("erase FAIL at:" + addr.toString()+ "/" + add_end.toString() + "code:" + err.toString());
		throw new Error("erase FAIL at:" + addr.toString()+ "/" + add_end.toString() + "code:" + err.toString());
	}
	mainObject.statusShow("erase finished at:" + addr.toString()+ "/" + add_end.toString());
}


mainObject.statusShow("all erase completion, end " + add_end.toString());