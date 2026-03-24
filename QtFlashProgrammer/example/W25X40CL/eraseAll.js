

//初始化SPI引脚的状态并设置SPI频率
if (spi_cmd_init(8) != 0)
{
	mainObject.statusShow("spi_cmd_init FAIL");
	throw new Error();
}

var sreg;					//状态寄存器

mainObject.statusShow("eraseAll start");

mainObject.serialClean();
let err = 0;
err = spi_cmd_ce();
err += spi_cmd_write(0x06);	//wren	写使能
err += spi_cmd_dece();

err += spi_cmd_ce();
err += spi_cmd_write(0xc7);
err += spi_cmd_dece();


do{					//Busy?
	err += spi_cmd_ce();
	err += spi_cmd_write(0x05);	//读状态寄存器
	sreg = spi_cmd_read(1);
	err += spi_cmd_dece();
	
}while(sreg & 0x01 == 0x01);

if(err != 0)
{
	mainObject.statusShow("erase FAIL");
	throw new Error();
}
else
	mainObject.statusShow("eraseAll finished");


