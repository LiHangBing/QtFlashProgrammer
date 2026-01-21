
const _IC_SIZE = 16*1024*1024;	//芯片容量
const SectorSize = 4096; 		//扇区大小
const buffSize = 64;			//缓冲区大小


mainObject.serialClean();

//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(16) != 0)
{
	mainObject.statusShow("spi_cmd_init FAIL");
	throw new Error("spi_cmd_init FAIL");
}

var sreg;					//状态寄存器

mainObject.statusShow("read:0/" + (_IC_SIZE/SectorSize).toString());


var err = 0;


for (i = 0; i < _IC_SIZE/SectorSize; i++) {
	
	var addr = i * SectorSize;
	err += spi_cmd_ce();
	err += spi_cmd_write([0x0b, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff,0]);	//快速读数据指令
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at spi_cmd_write:" + i.toString());
		throw new Error("read FAIL at spi_cmd_write:" + i.toString());
	}
	
	
	for(j = 0; j < SectorSize/buffSize ; j++)
	{
		
		err += spi_cmd_read_editor(i*SectorSize + j*buffSize , buffSize);
		if(err != 0)
		{
			mainObject.statusShow("read FAIL at sector:" + i.toString() + " buff:" + j.toString());
			throw new Error("read FAIL at sector:" + i.toString() + " buff:" + j.toString() + " err:" + err.toString());
		}
		
	}
	err += spi_cmd_dece();
	mainObject.statusShow("read finished:" + (i+1).toString()+ "/" + (_IC_SIZE/SectorSize).toString());
}

mainObject.statusShow("readAll finished:" + (_IC_SIZE/SectorSize).toString());