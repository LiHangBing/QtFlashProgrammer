

mainObject.serialClean();


//1
if (i2c_cmd_deinit() == 0)
	mainObject.statusShow("i2c_cmd_deinit OK");
else
	mainObject.statusShow("i2c_cmd_deinit FAIL");
mainObject.Delay_MSec(300);



//2
if (i2c_cmd_init(0) == 0)
	mainObject.statusShow("i2c_cmd_init OK");
else
	mainObject.statusShow("i2c_cmd_init FAIL");
mainObject.Delay_MSec(300);


//非法启停测试****************************************************************************
//3
if ((ret = i2c_cmd_start() ) == 0)
	mainObject.statusShow("i2c_cmd_start OK");
else
	mainObject.statusShow("i2c_cmd_start FAIL" + ret);
mainObject.Delay_MSec(300);

//4
if (i2c_cmd_stop() == 0)
	mainObject.statusShow("i2c_cmd_stop OK");
else
	mainObject.statusShow("i2c_cmd_stop FAIL");
mainObject.Delay_MSec(300);
//*************************************************************************************************


//以AT24C02写读地址0为例*****************************************************************
//写地址0
if (i2c_cmd_start()  == 0)
	mainObject.statusShow("i2c_cmd_start OK");
else
	mainObject.statusShow("i2c_cmd_start FAIL");
mainObject.Delay_MSec(300);

if (i2c_cmd_write([0xa0, 0x00, 0xaa, 0xbb, 0xcc]) == 0)				//最低位为0，写
	mainObject.statusShow("i2c_cmd_write data OK");
else
	mainObject.statusShow("i2c_cmd_write data FAIL");
mainObject.Delay_MSec(300);

if (i2c_cmd_stop() == 0)
	mainObject.statusShow("i2c_cmd_stop OK");
else
	mainObject.statusShow("i2c_cmd_stop FAIL");
mainObject.Delay_MSec(300);

//随机读地址0
if (i2c_cmd_start()  == 0)
	mainObject.statusShow("i2c_cmd_start OK");
else
	mainObject.statusShow("i2c_cmd_start FAIL");
mainObject.Delay_MSec(300);

if (i2c_cmd_write([0xa0, 0x00]) == 0)				//最低位为0，写
	mainObject.statusShow("i2c_cmd_write data OK");
else
	mainObject.statusShow("i2c_cmd_write data FAIL");
mainObject.Delay_MSec(300);

if ((ret = i2c_cmd_start() ) == 0)				//restart
	mainObject.statusShow("i2c_cmd_start OK");
else
	mainObject.statusShow("i2c_cmd_start FAIL" + ret);
mainObject.Delay_MSec(300);

if (i2c_cmd_write([0xa1]) == 0)				//最低位为1，读
	mainObject.statusShow("i2c_cmd_write data OK");
else
	mainObject.statusShow("i2c_cmd_write data FAIL");
mainObject.Delay_MSec(300);

var datR = i2c_cmd_read(1, 0);			//读1字节，并最后ACK
if (datR != [])
	mainObject.statusShow("i2c_cmd_read OK");
else
	mainObject.statusShow("i2c_cmd_read FAIL");
mainObject.Delay_MSec(300);

var datR2 = i2c_cmd_read(3, 1);			//读3字节，并最后NACK
if (datR2 != [])
	mainObject.statusShow("i2c_cmd_read OK");
else
	mainObject.statusShow("i2c_cmd_read FAIL");
mainObject.Delay_MSec(300);

if (i2c_cmd_stop() == 0)
	mainObject.statusShow("i2c_cmd_stop OK");
else
	mainObject.statusShow("i2c_cmd_stop FAIL");
mainObject.Delay_MSec(300);

if (datR[0] == 0xaa)
	mainObject.statusShow("read success");
else
	mainObject.statusShow("read fail");
//**********************************************************


//以AT24C02读写地址0为例*****************************************************************
//随机读地址0
i2c_cmd_start();
i2c_cmd_write([0xa0, 0x00]);
ret = i2c_cmd_start();				//restart
i2c_cmd_write([0xa1]);				//最低位为1，读
i2c_cmd_read_editor(0, 3, 1);			//读3字节，并最后NACK
i2c_cmd_stop();
//将读出来的数据写入
i2c_cmd_start();
i2c_cmd_write([0xa0, 0x00]);
i2c_cmd_write_editor(0,3);
i2c_cmd_stop();
//随机读地址0
i2c_cmd_start();
i2c_cmd_write([0xa0, 0x00]);
ret = i2c_cmd_start();				//restart
i2c_cmd_write([0xa1]);				//最低位为1，读
i2c_cmd_read_editor(0, 3, 1);			//读3字节，并最后NACK
i2c_cmd_stop();
//**********************************************************




