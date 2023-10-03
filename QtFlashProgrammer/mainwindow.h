#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QFileDialog>
#include <QMessageBox>
#include <QLabel>
#include <QJSEngine>            //用于解析JS脚本
#include <qserialport.h>

#include "optionsdialog.h"
#include "searchdialog.h"
#include "qhexedit2/qhexedit.h"
#include "settingsdialog.h"
#include "tooldialog.h"
#include "jstoolclass.h"

class ToolDialog;
class JSToolCLass;

QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();
    void serialClean();                                 //串口清除缓冲区
    qint64 getBytesToWrite();                           //获取待写入的字节数（用于判断写入忙）
    void Delay_MSec(unsigned int msec);                 //可靠的延时
    void statusShow(QString &str);                      //状态栏提示信息
    void serialWrite(const QByteArray &data);           //串口写入（阻塞执行）
    QByteArray serialRead(qint32 len);                  //串口读取（阻塞执行）
    QByteArray serialReadAll();                         //串口读取全部（非阻塞）
    qint32 getEditLen();                                //获取编辑区域长度
    void insert(qint64 pos, const QByteArray &ba);      //编辑器插入
    void replace(qint64 pos, const QByteArray &ba);      //编辑器替换
    QByteArray dataAt(qint64 pos, qint64 count=-1);     //编辑器读取

public slots:
    void openSerialPort();                  //打开串口
    void closeSerialPort();                 //关闭串口

private slots:
    //void about();
    void open();                            //打开文件
    bool save();                            //保存文件
    bool saveAs();                          //另存为
    void saveASText();                      //保存为可读格式
    void showSearchDialog();                //显示搜索窗
    void showOptionsDialog();               //编辑选项窗口
    void about();                           //关于
    void optionsAccepted();                 //选项设置
    void dataChanged();                     //数据改变
    void setAddress(qint64 address);        //设置显示的地址
    void setSize(qint64 size);              //设置显示文件大小
    void setOverwriteMode(bool mode);       //编辑模式：插入/覆盖
    void showSerialCfg();                   //显示串口设置
    void handleError(QSerialPort::SerialPortError error);   //串口出错处理
    void handleBytesWritten(qint64 bytes);  //写入完成


    void on_action_selectFile_triggered();

    void on_action_runScript_triggered();

    void on_action_fun_triggered();

    void on_action_clean_triggered();

private:
    Ui::MainWindow *ui;
    QHexEdit *hexEdit;                  //十六进制编辑器（放在前面先初始化）
    OptionsDialog *optionsDialog;       //编辑器选项
    SearchDialog *searchDialog;         //搜索框
    SettingsDialog *settingsDialog;     //串口设置窗口
    QSerialPort *m_serial;              //串口对象
    ToolDialog *toolDialog;


    QString curFile;
    QFile file;                         //文件对象
    bool isUntitled;                    //未指定文件标题
    qint64 fileSize = 0;                    //文件大小
    QLabel *lbOverwriteMode,*lbOverwriteModeName;       //编辑模式框
    QLabel *lbAddress, *lbAddressName;                  //地址框
    QLabel *lbSize, *lbSizeName;                        //文件大小框
    qint64 m_bytesToWrite = 0;                          //待写入的字节数
    QFile scriptFile;                                   //脚本文件对象
    QJSEngine jsEngine;                                 //JS引擎
    JSToolCLass *JSTool;                                 //JS工具对象

    void setCurrentFile(const QString &fileName);       //设置当前文件名
    bool saveFile(const QString &fileName);             //保存文件
    void readSettings();                                //读取设置
    void writeSettings();                               //保存设置

};
#endif // MAINWINDOW_H
