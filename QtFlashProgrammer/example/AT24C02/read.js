

const buffSize = 32;			//缓冲区大小，串口最大64字节，但I2C最大32字节
const add_start = 0;			//读取的起始地址
const read_size = 256;			//读取大小

mainObject.serialClean();


var err = 0;
let buff_sum = parseInt(read_size/buffSize);
let addr = add_start;
mainObject.statusShow("read begin at:" + add_start.toString());

err += i2c_cmd_init(0)
err += i2c_cmd_start()
if(err != 0)
{
	mainObject.statusShow("read FAIL at begin," + "code:" + err.toString());
	throw new Error("read FAIL at begin," + "code:" + err.toString());
}


err += i2c_cmd_write([0xa0, 0x00])				//最低位为0，写
if(err != 0)
{
	mainObject.statusShow("read FAIL at i2c_cmd_write([0xa0, 0x00])," + "code:" + err.toString());
	throw new Error("read FAIL at i2c_cmd_write([0xa0, 0x00])," + "code:" + err.toString());
}


err += i2c_cmd_start()				//restart
err += i2c_cmd_write([0xa1])				//最低位为1，读
if(err != 0)
{
	mainObject.statusShow("read FAIL at restart," + "code:" + err.toString());
	throw new Error("read FAIL at restart," + "code:" + err.toString());
}


for (let i = 0; i < buff_sum; i++)
{
	err += i2c_cmd_read_editor(i*buffSize, buffSize, 0);			//读 buffSize 字节，并最后ACK
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at i2c_cmd_read_editor," + "code:" + err.toString());
		throw new Error("read FAIL at i2c_cmd_read_editor," + "code:" + err.toString());
	}
}


if(read_size % buffSize != 0)
{
	err += i2c_cmd_read_editor(buff_sum*buffSize , read_size % buffSize);
	if(err != 0)
	{
		mainObject.statusShow("read FAIL at last i2c_cmd_read_editor," + " code:" + err.toString());
		throw new Error("read FAIL at last i2c_cmd_read_editor," + " code:" + err.toString());
	}
}

i2c_cmd_stop();

mainObject.statusShow("readAll finished");







