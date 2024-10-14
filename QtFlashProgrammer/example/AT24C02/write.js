
const add_start = 0;			//写入起始地址
var write_size = -1;	//写入大小（如果设置为<0的值如-1，将会修改为可写入的最大长度）
var pos = 0;					//编辑区域的起始地址
const pageSize = 8;			//页大小，小于缓冲区大小32

//页写周期最大5ms

//参数判断
if(write_size < 0) write_size = mainObject.getEditLen() - pos;
if(pos + write_size > mainObject.getEditLen() || pageSize == 0)
	throw new Error("para err");

mainObject.serialClean();
//初始化、100K
if (i2c_cmd_init(0) != 0)
	throw new Error("spi_cmd_init FAIL");


mainObject.statusShow("write begin at:" + add_start.toString());


var err = 0;


//将分页写入，起始地址若非页起始，结束地址若非页结尾，需特殊处理
var bytesBefore = pageSize - (add_start % pageSize); //刚开始写的第一页可能不是从0开始
bytesBefore = bytesBefore % pageSize;       //检查前面是否完整一页
var pageSum = parseInt( (write_size - bytesBefore) / pageSize );    //中间的整页
var bytesAfter = (write_size - bytesBefore) % pageSize;//后面多余的部分

//首页--------------------------------------------------------------
var addr = add_start;
if(bytesBefore > 0)
{
	err = i2c_cmd_start();
	err += i2c_cmd_write([0xa0, addr]);	//最低位为0，写，+数据地址
	if(err != 0) throw new Error("i2c_cmd_write([0xa0, addr])," + "code:" + err.toString());
	
	if( i2c_cmd_write_editor(pos, bytesBefore) !=0)
		throw new Error("i2c_cmd_write_editor(pos, bytesBefore)," + "code:" + err.toString());
	if( i2c_cmd_stop() !=0)
		throw new Error("i2c_cmd_stop()," + "code:" + err.toString());
	pos += bytesBefore;
	addr += bytesBefore;
	mainObject.Delay_MSec(5);			//页写周期最大5ms
}

//中间页--------------------------------------------------------------
for(i = 0; i < pageSum; i++)
{
	err = i2c_cmd_start();
	err += i2c_cmd_write([0xa0, addr]);	//最低位为0，写，+数据地址
	if(err != 0) throw new Error("i2c_cmd_write([0xa0, addr])," + "code:" + err.toString());
	
	if( i2c_cmd_write_editor(pos, pageSize) !=0)
		throw new Error("i2c_cmd_write_editor(pos, pageSize)," + "code:" + err.toString());
	if( i2c_cmd_stop() !=0)
		throw new Error("i2c_cmd_stop()," + "code:" + err.toString());
	pos += pageSize;
	addr += pageSize;
	mainObject.Delay_MSec(5);			//页写周期最大5ms
}

//尾页--------------------------------------------------------------
if(bytesAfter > 0)
{
	err = i2c_cmd_start();
	err += i2c_cmd_write([0xa0, addr]);	//最低位为0，写，+数据地址
	if(err != 0) throw new Error("i2c_cmd_write([0xa0, addr])," + "code:" + err.toString());
	
	if( i2c_cmd_write_editor(pos, bytesAfter) !=0)
		throw new Error("i2c_cmd_write_editor(pos, bytesAfter)," + "code:" + err.toString());
	if( i2c_cmd_stop() !=0)
		throw new Error("i2c_cmd_stop()," + "code:" + err.toString());
	pos += bytesAfter;
	addr += bytesAfter;
	mainObject.Delay_MSec(5);			//页写周期最大5ms
}

mainObject.statusShow("write finished");