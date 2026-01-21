

const buffSize = 64;			//缓冲区大小
const add_start = 0;			//读取的起始地址
const read_size = 16*1024;	//读取大小

mainObject.serialClean();

//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(16) != 0)
{
	mainObject.statusShow("spi_cmd_init FAIL");
	throw new Error("spi_cmd_init FAIL");
}

var sreg;					//状态寄存器

mainObject.statusShow("read begin at:" + add_start.toString());


var err = 0;


let buff_sum = parseInt(read_size/buffSize);
let addr = add_start;

err += spi_cmd_ce();
err += spi_cmd_write([0x0b, (addr>>>16) & 0xff, (addr>>>8) & 0xff, addr & 0xff,0]);	//快速读数据指令
if(err != 0)
{
	mainObject.statusShow("read FAIL at begin," + "code:" + err.toString());
	throw new Error("read FAIL at begin," + "code:" + err.toString());
}


for (i = 0; i < buff_sum; i++) {
	
	err += spi_cmd_read_editor(i*buffSize , buffSize);
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at buff:" + i.toString() + "/" + buff_sum.toString() + " code:" + err.toString());
		throw new Error("read FAIL at buff:" + i.toString() + "/" + buff_sum.toString() + " code:" + err.toString());
	}
	mainObject.statusShow("read finished at buff:" + i.toString() + "/" + buff_sum.toString() );
}

if(read_size % buffSize != 0)
{
	err += spi_cmd_read_editor(buff_sum*buffSize , read_size % buffSize);
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at last," + " code:" + err.toString());
		throw new Error("read FAIL at last," + " code:" + err.toString());
	}
}


err += spi_cmd_dece();
mainObject.statusShow("readAll finished");







