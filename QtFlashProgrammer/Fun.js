const FUNC_SPI_INIT = 7;
const FUNC_SPI_DEINIT = 8;
const FUNC_SPI_CE = 9;
const FUNC_SPI_DECE = 10;
const FUNC_SPI_READ = 11;
const FUNC_SPI_WRITE = 12;
const FUNC_SPI_TST = 13;

const FUNC_I2C_INIT   =   20
const FUNC_I2C_DEINIT =   21
const FUNC_I2C_READ   =   22
const FUNC_I2C_WRITE  =   23
const FUNC_I2C_START  =   24
const FUNC_I2C_STOP   =   25
const FUNC_I2C_TST    =   28


const BUFFSIZE = 64;


//protol reset:
function pro_rst()
{
	let datR;
}



//SPI functions
function spi_cmd_init(speedDiv)
{
	mainObject.serialWrite(FUNC_SPI_INIT);
	mainObject.serialWrite(speedDiv);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_INIT)
		return 0;
	else return datR[0];
}
function spi_cmd_deinit()
{
	mainObject.serialWrite(FUNC_SPI_DEINIT);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_DEINIT)
		return 0;
	else return datR[0];
}
function spi_cmd_ce()					//使能CE引脚
{
	mainObject.serialWrite(FUNC_SPI_CE);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_CE)
		return 0;
	else return datR[0];
}
function spi_cmd_dece()
{
	mainObject.serialWrite(FUNC_SPI_DECE);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_DECE)
		return 0;
	else return datR[0];
}
function spi_cmd_read(len)					//读
{
	mainObject.serialWrite(FUNC_SPI_READ);
	mainObject.serialWrite(len);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_SPI_READ)
		return [];
	let datS = mainObject.serialRead(len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_READ)
		return datS;
	else return [];
}
function spi_cmd_read_editor(pos,len)		//读取到编辑器指定位置
{
	mainObject.serialWrite(FUNC_SPI_READ);
	mainObject.serialWrite(len);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_SPI_READ)
		return datR[0];
	let datS = mainObject.serial2Edit(pos,len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_READ)
		return 0;
	else return datR[0];
}
function spi_cmd_write(datW)				//写
{
	mainObject.serialWrite(FUNC_SPI_WRITE);
	let len = Object.keys(datW).length;		//如果输入的是一个整数，此处为0
	if(len == 0) len = 1;
	mainObject.serialWrite(len);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_SPI_WRITE)
		return datR[0];
	mainObject.serialWrite(datW);
	
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_WRITE)
		return 0;
	else
		return datR[0];
}
function spi_cmd_write_editor(pos,len)			//从编辑器指定位置写
{
	mainObject.serialWrite(FUNC_SPI_WRITE);
	mainObject.serialWrite(len);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_SPI_WRITE)
		return datR[0];
	mainObject.edit2Serial(pos,len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_WRITE)
		return 0;
	else
		return datR[0];
}
function spi_cmd_tst()					//测试设备是否在线
{
	mainObject.serialWrite(FUNC_SPI_TST);
	let datR = mainObject.serialRead(2);	
	if(datR[0] != 0xa5 || datR[1] != 0x5a)
		return -1;
	mainObject.serialWrite(datR);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_SPI_TST)
		return 0;
	else
		return datR[0];
}


//I2C functions
function i2c_cmd_init(clock_speed)
{
	mainObject.serialWrite([FUNC_I2C_INIT, clock_speed]);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_INIT)
		return 0;
	else return datR[0];
}
function i2c_cmd_deinit()
{
	mainObject.serialWrite(FUNC_I2C_DEINIT);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_DEINIT)
		return 0;
	else return datR[0];
}
function i2c_cmd_start()					//使能CE引脚
{
	mainObject.serialWrite(FUNC_I2C_START);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_START)
		return 0;
	else return datR[0];
}
function i2c_cmd_stop()
{
	mainObject.serialWrite(FUNC_I2C_STOP);
	let datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_STOP)
		return 0;
	else return datR[0];
}
function i2c_cmd_read(len, nack_last)					//读
{
	mainObject.serialWrite([FUNC_I2C_READ, len, nack_last]);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_I2C_READ)
		return [];
	let datS = mainObject.serialRead(len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_READ)
		return datS;
	else return [];
}
function i2c_cmd_read_editor(pos,len,nack_last)		//读取到编辑器指定位置
{
	mainObject.serialWrite([FUNC_I2C_READ, len, nack_last]);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_I2C_READ)
		return datR[0];
	let datS = mainObject.serial2Edit(pos,len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_READ)
		return 0;
	else return datR[0];
}
function i2c_cmd_write(datW)				//写
{
	let len = Object.keys(datW).length;		//如果输入的是一个整数，此处为0
	if(len == 0) len = 1;
	mainObject.serialWrite([FUNC_I2C_WRITE, len]);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_I2C_WRITE)
		return datR[0];
	mainObject.serialWrite(datW);
	
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_WRITE)
		return 0;
	else
		return datR[0];
}
function i2c_cmd_write_editor(pos,len)			//从编辑器指定位置写
{
	mainObject.serialWrite([FUNC_I2C_WRITE, len]);
	let datR = mainObject.serialRead(1);
	if(datR[0] != FUNC_I2C_WRITE)
		return datR[0];
	mainObject.edit2Serial(pos,len);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_WRITE)
		return 0;
	else
		return datR[0];
}
function i2c_cmd_tst()					//测试设备是否在线
{
	mainObject.serialWrite(FUNC_I2C_TST);
	let datR = mainObject.serialRead(2);	
	if(datR[0] != 0xa5 || datR[1] != 0x5a)
		return -1;
	mainObject.serialWrite(datR);
	datR = mainObject.serialRead(1);
	if(datR[0] == FUNC_I2C_TST)
		return 0;
	else
		return datR[0];
}