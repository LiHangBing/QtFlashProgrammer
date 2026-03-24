mainObject.serialClean();

gpio_cmd_init(0xff, 0xff);			//所有IO输入，并设置上拉
let gpio_in = gpio_cmd_read();
mainObject.statusShow("gpio read = " +  gpio_in.toString());

mainObject.Delay_MSec(2000);


//GPIO初始化并拉高
gpio_cmd_init(0x00, 0xff);			//所有IO输出，并设置上拉
gpio_cmd_write(0xff);				//所有IO拉高

mainObject.statusShow("gpio write 0xff finished");


