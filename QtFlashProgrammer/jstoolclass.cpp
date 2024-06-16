/*
	A simple tool whitch can control device with SPI or IIC by serial port to program or burn flash like W25QXX or 24CXX.
    Copyright (C) 2023  LiHangBing

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/



#include "jstoolclass.h"

JSToolCLass::JSToolCLass(MainWindow *parent)
    : mainWindow(parent)
{

}


int JSToolCLass::callFunc(int number1, int number2)
{
    return number1 + number2;
}

void JSToolCLass::serialClean()                                 //串口清除缓冲区
{
    mainWindow->serialClean();
}

void JSToolCLass::serialWrite(const QVariantList &v)
{
    QByteArray qByteArray;
    for(int i=0;i<v.size();i++)
        qByteArray.append(v.at(i).toInt());     //转换为int并添加进qByteArray后发送
    mainWindow->serialWrite(qByteArray);
}

void JSToolCLass::serialWrite(const QVariant &v)
{
    int typeId = v.typeId();     //仅支持 QMetaType::Int QMetaType::QString
    QByteArray qByteArray;
    switch(typeId)
    {
    case QMetaType::Int:
        qByteArray.append(v.toChar().toLatin1());
        break;

    case QMetaType::QString:
        qByteArray.append(v.toString().toLocal8Bit());
        break;

    default:                //2024/6/16：QT6.7版本下，JS脚本读数据后直接写（对应SPItest 7和9），数组为QVariant，经测试以下方案可解决
        QList<QVariant> vList = v.toList();
        for(int i = 0; i<vList.size(); i++)
            qByteArray.append(vList.at(i).toChar().toLatin1());
        break;
    }
    mainWindow->serialWrite(qByteArray);
}

/*
 * 方案不可靠，传给JS时会包含符号位，由于JS使用64位浮点存储，符号位比较不可靠
QVariantList  JSToolCLass::serialRead(const QVariant &n)
{
    int len = n.toInt();
    QByteArray qByteArray = mainWindow->serialRead(len);
    QVariantList  list;
    for(int i = 0; i<qByteArray.size(); i++)
        list.append(qByteArray.at(i));
    return list;
}
*/
QList<uint8_t>  JSToolCLass::serialRead(const QVariant &n)
{
    int len = n.toInt();
    QByteArray qByteArray = mainWindow->serialRead(len);
    QList<uint8_t>  list;
    for(int i = 0; i<qByteArray.size(); i++)
        list.append(qByteArray.at(i));
    return list;
}

void JSToolCLass::Delay_MSec(unsigned int msec)                 //可靠的延时
{
    mainWindow->Delay_MSec(msec);
}


void JSToolCLass::statusShow(const QVariantList &v)
{
    QString str;
    for(int i=0;i<v.size();i++)
        if(v.at(i).typeId() == QMetaType::QString)      //String转string，其他转char
            str.append(v.at(i).toString());
        else
            str.append(v.at(i).toChar());
    mainWindow->statusShow(str);
}

void JSToolCLass::statusShow(const QVariant &v)
{
    int typeId = v.typeId();     //QMetaType::Int QMetaType::QString
    QString str;
    switch(typeId)
    {
    case QMetaType::Int:
        str.append(v.toChar());
        break;

    case QMetaType::QString:
        str.append(v.toString());
        break;

    case QMetaType::QByteArray:
        str.append(v.toByteArray());
        break;

    default:
        break;
    }
    mainWindow->statusShow(str);
}


int JSToolCLass::getEditLen()           //获取编辑器中数据大小
{
    return mainWindow->getEditLen();
}

void JSToolCLass::editInsert(int pos,const QVariantList &v)           //写入数据到编辑器指定位置
{
    QByteArray qByteArray;
    for(int i=0;i<v.size();i++)
        qByteArray.append(v.at(i).toInt());     //转换为int并添加进qByteArray后发送
    mainWindow->insert(pos,qByteArray);
}
void JSToolCLass::editInsert(int pos,const QVariant &v)              //写入数据到编辑器指定位置
{
    int typeId = v.typeId();     //仅支持 QMetaType::Int QMetaType::QString
    QByteArray qByteArray;
    switch(typeId)
    {
    case QMetaType::Int:
        qByteArray.append(v.toChar().toLatin1());
        break;

    case QMetaType::QString:
        qByteArray.append(v.toString().toLocal8Bit());
        break;
    }
    mainWindow->insert(pos,qByteArray);
}

/*
QVariantList JSToolCLass::editRead(int pos,const int n)       //从编辑器指定位置读出
{
    QByteArray qByteArray = mainWindow->dataAt(pos,n);
    QVariantList  list;
    for(int i = 0; i<qByteArray.size(); i++)
        list.append(qByteArray.at(i));
    return list;
}
*/

QList<uint8_t> JSToolCLass::editRead(int pos,const int n)       //从编辑器指定位置读出
{
    QByteArray qByteArray = mainWindow->dataAt(pos,n);
    QList<uint8_t>  list;
    for(int i = 0; i<qByteArray.size(); i++)
        list.append(qByteArray.at(i));
    return list;
}

void JSToolCLass::edit2Serial(int pos, int n)              //将编辑器的数据写入设备（阻塞）
{
    QByteArray qByteArray = mainWindow->dataAt(pos,n);
    mainWindow->serialWrite(qByteArray);
}

void JSToolCLass::serial2Edit(int pos, int n)                   //从设备读取到编辑器（阻塞）
{
    QByteArray qByteArray = mainWindow->serialRead(n);
    mainWindow->insert(pos,qByteArray);
}

