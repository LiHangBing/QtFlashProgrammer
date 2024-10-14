


const SectorSize = 4096; 		//扇区大小
const add_start = 0;			//擦除的起始地址（注意一定要为扇区的整数倍，否则禁止执行）
const erase_size = 8*1024;	//擦除大小（注意一定要为扇区的整数倍，否则禁止执行）

const add_end = add_start + erase_size;

if( (add_start % SectorSize != 0) || (erase_size % SectorSize != 0) )
{
	mainObject.statusShow("parameter error");
	throw new Error("parameter error");
}

mainObject.serialClean();

//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(8) != 0)
{
	mainObject.statusShow("spi_cmd_init FAIL");
	throw new Error("spi_cmd_init FAIL");
}


var sreg;					//状态寄存器

mainObject.statusShow("erase: begin");

let sector_sum = parseInt(erase_size/SectorSize);
for (i = 0; i < sector_sum; i++) {
	let addr = add_start + SectorSize*i;
	let err = 0;
    err = spi_cmd_ce();
	err += spi_cmd_write(0x06);	//wren	写使能
	err += spi_cmd_dece();
	
	
	err += spi_cmd_ce();
	err += spi_cmd_write([0x20, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff]);
	err += spi_cmd_dece();
	
	do{					//Busy?
		err += spi_cmd_ce();
		err += spi_cmd_write(0x05);	//读状态寄存器
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