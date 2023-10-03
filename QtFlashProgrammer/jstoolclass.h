#ifndef JSTOOLCLASS_H
#define JSTOOLCLASS_H

#include <QObject>
#include <QMessageBox>          ///////////////////
#include "mainwindow.h"


class MainWindow;

class JSToolCLass : public QObject
{
    Q_OBJECT
public:
    Q_INVOKABLE JSToolCLass(MainWindow *parent = nullptr);
    Q_INVOKABLE int callFunc(int number1, int number2);

    //JS<->设备 将JS的数据写入设备，从设备读取数据到JS
    Q_INVOKABLE void serialClean();                                 //串口清除缓冲区
    Q_INVOKABLE void serialWrite(const QVariantList &v);            //串口写入（JS传入数组）（阻塞）
            //JS传入数组示例： var data3 = [0,1,2];
    Q_INVOKABLE void serialWrite(const QVariant &v);                //串口写入（JS传入单个值或者字符串）（阻塞）
            //JS传入数值 var data4 = 10; 传入字符串：var data1 = "012";
    //Q_INVOKABLE QVariantList serialRead(const QVariant &n);          //串口读取（返回JS字符数组）（阻塞）(不可靠）
    Q_INVOKABLE QList<uint8_t> serialRead(const QVariant &n);          //串口读取（返回JS字符数组）（阻塞）

    //JS<->编辑器  将将JS的数据写入编辑器，从编辑器读取数据到JS
    Q_INVOKABLE int getEditLen();           //获取编辑器中数据大小
    Q_INVOKABLE void editInsert(int pos,const QVariantList &v);           //写入数据到编辑器指定位置
    Q_INVOKABLE void editInsert(int pos,const QVariant &v);              //写入数据到编辑器指定位置
    //Q_INVOKABLE QVariantList editRead(int pos,const int n);       //从编辑器指定位置读出
    Q_INVOKABLE QList<uint8_t> editRead(int pos,const int n);       //从编辑器指定位置读出

    //设备<->编辑器
    Q_INVOKABLE void edit2Serial(int pos, int n);                   //将编辑器的数据写入设备（阻塞）
    Q_INVOKABLE void serial2Edit(int pos, int n);                   //从设备读取并插入到编辑器（阻塞）

    Q_INVOKABLE void Delay_MSec(unsigned int msec);                 //可靠的延时
    Q_INVOKABLE void statusShow(const QVariantList &v);             //状态栏显示数据
    Q_INVOKABLE void statusShow(const QVariant &v);
signals:

private:
    MainWindow *mainWindow;

};

#endif // JSTOOLCLASS_H
