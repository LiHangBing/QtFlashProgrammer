var data1 = "012";
var data2 = ["Saab", "Volvo", "BMW"];
var data3 = [0,1,2];
var data4 = 10;
var data5 = [13,0xa5,0x5a];


////JS<->设备
//mainObject.serialWrite(data1);
//var datR = mainObject.serialRead(3);			//object
//datR[0] = datR[0] + 5;			//修改数值
//datR[1] = '6';					//JS里此处为string，仅能用来显示
//mainObject.statusShow(datR);

//字符串化
//mainObject.statusShow(typeof(datR));
//mainObject.statusShow(Object.keys(0x99).length.toString());		//0
//mainObject.statusShow(Object.keys(datR).length.toString());
//mainObject.statusShow(JSON.stringify(datR));


//JS<->编辑器
//mainObject.editInsert(0,data1);
//mainObject.editInsert(0,data3);
//mainObject.editInsert(0,data4);
//var size = mainObject.getEditLen();
//mainObject.statusShow(size);
//var datR = mainObject.editRead(0,3);
//mainObject.statusShow(datR);


//设备<->编辑器
//mainObject.editInsert(0,data1);
//mainObject.edit2Serial(0,3);
//mainObject.serial2Edit(3,3);

for(i=0;i<100;i++)
{
	mainObject.statusShow(i.toString());
	
	mainObject.Delay_MSec(100);
}
