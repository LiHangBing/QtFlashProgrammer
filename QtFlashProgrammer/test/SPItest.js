

mainObject.serialClean();


//1
if (spi_cmd_deinit() == 0)
	mainObject.statusShow("spi_cmd_deinit OK");
else
	mainObject.statusShow("spi_cmd_deinit FAIL");
mainObject.Delay_MSec(300);

//2
if (spi_cmd_init(16) == 0)
	mainObject.statusShow("spi_cmd_init OK");
else
	mainObject.statusShow("spi_cmd_init FAIL");
mainObject.Delay_MSec(300);

//3
if (spi_cmd_dece() == 0)
	mainObject.statusShow("spi_cmd_dece OK");
else
	mainObject.statusShow("spi_cmd_dece FAIL");
mainObject.Delay_MSec(300);



//4
if (spi_cmd_ce() == 0)
	mainObject.statusShow("spi_cmd_ce OK");
else
	mainObject.statusShow("spi_cmd_ce FAIL");
mainObject.Delay_MSec(300);


//5
var datR = spi_cmd_read(BUFFSIZE);
if (datR != [])
	mainObject.statusShow("spi_cmd_read OK");
else
	mainObject.statusShow("spi_cmd_read FAIL");
mainObject.Delay_MSec(300);

//6
if (spi_cmd_read_editor(0,BUFFSIZE) == 0)
	mainObject.statusShow("spi_cmd_read_editor OK");
else
	mainObject.statusShow("spi_cmd_read_editor FAIL");
mainObject.Delay_MSec(300);


//7
if (spi_cmd_write(datR) == 0)
	mainObject.statusShow("spi_cmd_write OK");
else
	mainObject.statusShow("spi_cmd_write FAIL");
mainObject.Delay_MSec(300);


//8
if (spi_cmd_write_editor(0,BUFFSIZE) == 0)
	mainObject.statusShow("spi_cmd_write_editor OK");
else
	mainObject.statusShow("spi_cmd_write_editor FAIL");
mainObject.Delay_MSec(300);



//9
if (spi_cmd_tst() == 0)
	mainObject.statusShow("spi_cmd_tst OK");
else
	mainObject.statusShow("spi_cmd_tst FAIL");
mainObject.Delay_MSec(300);



