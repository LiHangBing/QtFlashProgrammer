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


#include "mainwindow.h"
#include "ui_mainwindow.h"

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , hexEdit(new QHexEdit)
    , optionsDialog(new OptionsDialog(this))
    , searchDialog(new SearchDialog(hexEdit, this))
    , settingsDialog(new SettingsDialog(this))
    , m_serial(new QSerialPort(this))
    , toolDialog(new ToolDialog(this))
    , JSTool(new JSToolCLass(this))
{
    ui->setupUi(this);
    setAttribute(Qt::WA_DeleteOnClose);         //在窗口接受了关闭事件后，Qt会释放这个窗口所占用的资源。
    setCentralWidget(hexEdit);      //设置为中心控件
    ui->action_Disconnect->setEnabled(false);  //断开...

    connect(ui->action_Open, SIGNAL(triggered()), this, SLOT(open()));  //触发动作后执行open槽
    connect(ui->action_Save, SIGNAL(triggered()), this, SLOT(save()));  //触发动作后执行save槽
    connect(ui->action_SaveAs, SIGNAL(triggered()), this, SLOT(saveAs()));      //触发动作后执行saveAs槽
    connect(ui->actionSaveASCII, SIGNAL(triggered()), this, SLOT(saveASText()));   //触发动作后执行saveASText槽
    connect(ui->action_Undo, SIGNAL(triggered()), hexEdit, SLOT(undo()));   //...undo
    connect(ui->action_Redo, SIGNAL(triggered()), hexEdit, SLOT(redo()));           //...redo
    connect(ui->action_Find, SIGNAL(triggered()), this, SLOT(showSearchDialog()));  //.....
    connect(ui->action_Option, SIGNAL(triggered()), this, SLOT(showOptionsDialog()));
    connect(optionsDialog, SIGNAL(accepted()), this, SLOT(optionsAccepted()));      //选项窗口确定后设置
    connect(hexEdit, SIGNAL(dataChanged()), this, SLOT(dataChanged()));                         //数据改变
    connect(ui->action_Connect, SIGNAL(triggered()), this, SLOT(openSerialPort()));             //连接串口
    connect(ui->action_Disconnect, SIGNAL(triggered()), this, SLOT(closeSerialPort()));         //断开串口连接
    connect(ui->action_SerialConfig, SIGNAL(triggered()), this, SLOT(showSerialCfg()));         //串口设置
    connect(m_serial, SIGNAL(errorOccurred(QSerialPort::SerialPortError)), this, SLOT(handleError(QSerialPort::SerialPortError)));//串口出错处理
    connect(m_serial, &QSerialPort::bytesWritten, this, &MainWindow::handleBytesWritten);       //串口完成写入
    connect(ui->action_tool, SIGNAL(triggered()), toolDialog, SLOT(show()));                          //工具窗口
    connect(ui->action_About, SIGNAL(triggered()), this, SLOT(about()));        //...about
    connect(ui->actionAbout_Qt, SIGNAL(triggered()), qApp, SLOT(aboutQt()));    //...aboutQt（系统自带）
    //另外部分信号和槽通过ui设计工具设置

    //状态栏设置
    // Address Label
    lbAddressName = new QLabel();
    lbAddressName->setText(tr("Address:"));
    statusBar()->addPermanentWidget(lbAddressName);     //添加固定标签"Address:"
    lbAddress = new QLabel();
    lbAddress->setFrameShape(QFrame::Panel);        //标签的形状
    lbAddress->setFrameShadow(QFrame::Sunken);      //阴影
    lbAddress->setMinimumWidth(70);                 //最小宽度
    statusBar()->addPermanentWidget(lbAddress);     //添加地址值标签（可变）
    connect(hexEdit, SIGNAL(currentAddressChanged(qint64)), this, SLOT(setAddress(qint64)));    //选定的地址变化时改变显示
    // Size Label
    lbSizeName = new QLabel();
    lbSizeName->setText(tr("Size:"));
    statusBar()->addPermanentWidget(lbSizeName);    //标签"Size"，部分同上
    lbSize = new QLabel();
    lbSize->setFrameShape(QFrame::Panel);
    lbSize->setFrameShadow(QFrame::Sunken);
    lbSize->setMinimumWidth(70);
    statusBar()->addPermanentWidget(lbSize);
    connect(hexEdit, SIGNAL(currentSizeChanged(qint64)), this, SLOT(setSize(qint64)));          //文件大小改变时改变显示
    // Overwrite Mode Label
    lbOverwriteModeName = new QLabel();
    lbOverwriteModeName->setText(tr("Mode:"));
    statusBar()->addPermanentWidget(lbOverwriteModeName);   //标签"Mode"，部分同上
    lbOverwriteMode = new QLabel();
    lbOverwriteMode->setFrameShape(QFrame::Panel);
    lbOverwriteMode->setFrameShadow(QFrame::Sunken);
    lbOverwriteMode->setMinimumWidth(70);
    statusBar()->addPermanentWidget(lbOverwriteMode);
    setOverwriteMode(hexEdit->overwriteMode());             //编辑模式改变时改变显示
    connect(hexEdit, SIGNAL(overwriteModeChanged(bool)), this, SLOT(setOverwriteMode(bool)));   //插入/覆盖模式
    statusBar()->showMessage(tr("Ready"), 2000);            //状态栏左侧显示2秒钟的提示文字"Ready"


    isUntitled = true;              //未指定文件标题
    setCurrentFile("");             //当前文件为空
    setUnifiedTitleAndToolBarOnMac(true);   //统一标题和工具栏外观
    readSettings();         //读取配置信息
}

void MainWindow::open()         //打开文件
{
    QString fileName = QFileDialog::getOpenFileName(this);  //对话框获取需要打开的文件
    if (!fileName.isEmpty()) {
        //加载文件
        file.setFileName(fileName);         //文件名
        if (!hexEdit->setData(file)) {      //设置QHexEdit控件的文件
            QMessageBox::warning(this, tr("QHexEdit"),
                                 tr("Cannot read file %1:\n%2.")
                                     .arg(fileName)
                                     .arg(file.errorString()));
            return;         //如果设置失败，弹窗提醒
        }
        setCurrentFile(fileName);                               //设置当前窗口文件路径
        statusBar()->showMessage(tr("File loaded"), 2000);      //状态栏显示提示文字2秒
    }
}

void MainWindow::setCurrentFile(const QString &fileName)        //设置当前窗口文件路径
{
    curFile = QFileInfo(fileName).canonicalFilePath();      //获取绝对路径
    isUntitled = fileName.isEmpty();
    setWindowModified(false);               //标题栏文件名去掉“*”
    if (fileName.isEmpty())
        setWindowFilePath("QHexEdit");
    else
        setWindowFilePath(curFile + " - QHexEdit");     //设置窗口文件路径，并且窗口显示标题为文件名- QHexEdit
}

bool MainWindow::save()
{
    if (isUntitled) {
        return saveAs();            //如果没有指定文件名，保存为
    } else {
        return saveFile(curFile);   //保存文件
    }
}

bool MainWindow::saveAs()       //保存为
{
    QString fileName = QFileDialog::getSaveFileName(this, tr("Save As"),
                                                    curFile);               //通过对话框获得需要保存的文件名
    if (fileName.isEmpty())
        return false;

    return saveFile(fileName);      //保存文件
}

bool MainWindow::saveFile(const QString &fileName)      //保存文件
{
    QString tmpFileName = fileName + ".~tmp";

    QApplication::setOverrideCursor(Qt::WaitCursor);            //窗口内指针：忙
    QFile file(tmpFileName);
    bool ok = hexEdit->write(file);         //先写入临时文件 tmpFile
    if (QFile::exists(fileName))
        ok = QFile::remove(fileName);       //如果欲保存的文件名存在，先移除之
    if (ok)
    {
        file.setFileName(tmpFileName);
        ok = file.copy(fileName);               //拷贝临时文件为欲保存的文件
        if (ok)
            ok = QFile::remove(tmpFileName);    //移除临时文件
    }
    QApplication::restoreOverrideCursor();                      //恢复指针设置

    if (!ok) {
        QMessageBox::warning(this, tr("QHexEdit"),
                             tr("Cannot write file %1.")
                                 .arg(fileName));
        return false;       //如果保存失败，弹窗提醒
    }

    setCurrentFile(fileName);                           //设置当前窗口文件路径
    statusBar()->showMessage(tr("File saved"), 2000);   //状态栏显示提示文字2秒
    return true;
}

void MainWindow::saveASText()               //保存为可阅读的文本格式
{
    QString fileName = QFileDialog::getSaveFileName(this, tr("Save To Readable File")); //对话框获取文件名
    if (!fileName.isEmpty())
    {
        QFile file(fileName);
        if (!file.open(QFile::WriteOnly | QFile::Text)) {
            QMessageBox::warning(this, tr("QHexEdit"),
                                 tr("Cannot write file %1:\n%2.")
                                     .arg(fileName)
                                     .arg(file.errorString()));
            return;     //如果打开失败，弹窗提醒
        }

        QApplication::setOverrideCursor(Qt::WaitCursor);        //窗口内指针：忙
        file.write(hexEdit->toReadableString().toLatin1());     //转换为可读文本并写入
        QApplication::restoreOverrideCursor();                  //恢复指针设置

        statusBar()->showMessage(tr("File saved"), 2000);       //状态栏显示提示文字2秒
    }
}

void MainWindow::showSearchDialog()     //显示搜索窗口 SearchDialog
{
    searchDialog->show();   //show
}

void MainWindow::showOptionsDialog()        //显示选项窗口 OptionsDialog
{
    optionsDialog->show();
}

void MainWindow::about()            //关于信息
{
    QMessageBox::about(this, tr("About QtFlashProgrammer"),
                       tr("The QtFlashProgrammer is a portable tools to progarmmer flash by serial."));
}

void MainWindow::optionsAccepted()          //Options窗口点击确定后的处理
{
    writeSettings();    //保存窗口位置和大小
    readSettings();     //读取设置信息
}

void MainWindow::readSettings()     //读取设置
{
    QString cfgName = "./Config.ini";
    QSettings settings(cfgName,QSettings::IniFormat);               //配置文件路径，必须指定格式为IniFormat，否则会放到注册表
    QPoint pos = settings.value("pos", QPoint(200, 200)).toPoint(); //读取并设置位置和尺寸
    QSize size = settings.value("size", QSize(610, 460)).toSize();
    move(pos);
    resize(size);

    //一些QHexEdit控件的设置
    hexEdit->setAddressArea(settings.value("AddressArea").toBool());
    hexEdit->setAsciiArea(settings.value("AsciiArea").toBool());
    hexEdit->setHighlighting(settings.value("Highlighting").toBool());
    hexEdit->setOverwriteMode(settings.value("OverwriteMode").toBool());
    hexEdit->setReadOnly(settings.value("ReadOnly").toBool());
    hexEdit->setHighlightingColor(settings.value("HighlightingColor").value<QColor>());
    hexEdit->setAddressAreaColor(settings.value("AddressAreaColor").value<QColor>());
    hexEdit->setSelectionColor(settings.value("SelectionColor").value<QColor>());
    hexEdit->setFont(settings.value("WidgetFont").value<QFont>());
    hexEdit->setAddressWidth(settings.value("AddressAreaWidth").toInt());
    hexEdit->setBytesPerLine(settings.value("BytesPerLine").toInt());
}

void MainWindow::writeSettings()    //保存窗口位置和大小
{
    QString cfgName = "./Config.ini";
    QSettings settings(cfgName,QSettings::IniFormat);
    settings.setValue("pos", pos());            //保存窗口位置和大小
    settings.setValue("size", size());
}


void MainWindow::dataChanged()  //文件改变
{
    setWindowModified(hexEdit->isModified());   //标题栏文件名加“*”
}

void MainWindow::setAddress(qint64 address)         //设置标签显示的地址值
{
    lbAddress->setText(QString("%1").arg(address, 1, 16));  //最小填充一个字符，数字的基数16
}

void MainWindow::setSize(qint64 size)               //设置标签显示的文件大小
{
    fileSize = size;
    lbSize->setText(QString("%1").arg(size));
}

void MainWindow::setOverwriteMode(bool mode)        //覆盖/插入模式设置
{
    QString cfgName = "./Config.ini";
    QSettings settings(cfgName,QSettings::IniFormat);
    settings.setValue("OverwriteMode", mode);   //保存设置
    if (mode)
        lbOverwriteMode->setText(tr("Overwrite"));  //右下角的模式栏显示字符串
    else
        lbOverwriteMode->setText(tr("Insert"));
}

void MainWindow::openSerialPort()
{
    const SettingsDialog::Settings p = settingsDialog->settings();
    m_serial->setPortName(p.name);
    m_serial->setBaudRate(p.baudRate);
    m_serial->setDataBits(p.dataBits);
    m_serial->setParity(p.parity);
    m_serial->setStopBits(p.stopBits);
    m_serial->setFlowControl(p.flowControl);
    timeoutEnabled = p.timeoutEnabled;
    timeoutMs = p.timeoutMs;
    if (m_serial->open(QIODevice::ReadWrite)) {
        ui->action_Connect->setEnabled(false);
        ui->action_Disconnect->setEnabled(true);
        ui->action_SerialConfig->setEnabled(false);
        statusBar()->showMessage(tr("Connected to %1 : %2, %3, %4, %5, %6")
                              .arg(p.name, p.stringBaudRate, p.stringDataBits,
                                   p.stringParity, p.stringStopBits, p.stringFlowControl));
    } else {
        QMessageBox::critical(this, tr("Error"), m_serial->errorString());

        statusBar()->showMessage(tr("Open error"));
    }
}

void MainWindow::closeSerialPort()
{
    if (m_serial->isOpen())
        m_serial->close();
    ui->action_Connect->setEnabled(true);
    ui->action_Disconnect->setEnabled(false);
    ui->action_SerialConfig->setEnabled(true);
    statusBar()->showMessage(tr("Disconnected"));
}

void MainWindow::showSerialCfg()
{
    settingsDialog->fillPortsInfo();
    settingsDialog->show();
}

void MainWindow::Delay_MSec(unsigned int msec)      //可靠的延时
{
    QTime _Timer = QTime::currentTime().addMSecs(msec);
    while( QTime::currentTime() < _Timer )
        QCoreApplication::processEvents(QEventLoop::AllEvents, 1);    //延时中处理事件
}

void MainWindow::handleError(QSerialPort::SerialPortError error)
{
    if (error != QSerialPort::NoError) {
        QMessageBox::critical(this, tr("Critical Error"), m_serial->errorString());
        closeSerialPort();
    }
}

void MainWindow::handleBytesWritten(qint64 bytes)
{
    m_bytesToWrite -= bytes;
}

qint64 MainWindow::getBytesToWrite()                           //获取待写入的字节数（用于判断写入忙）
{
    return m_bytesToWrite;
}

void MainWindow::serialClean()                                 //串口清除缓冲区
{
    m_serial->clear();
    m_serial->clearError();
}


void MainWindow::serialWrite(const QByteArray &data)            //串口写入（阻塞执行）
{
    while(m_bytesToWrite > 0)               //等待串口发送完前面的数据
        QCoreApplication::processEvents(QEventLoop::AllEvents);
    const qint64 written = m_serial->write(data);
    if (written == data.size()) {
        m_bytesToWrite += written;
    } else {
        const QString error = tr("Failed to write all data to port %1.\n"
                                 "Error: %2").arg(m_serial->portName(),
                                       m_serial->errorString());
        QMessageBox::warning(this, tr("Warning"), error);
    }
}

/*QByteArray MainWindow::serialRead(qint32 len)           //串口读取（阻塞执行）
{
    while(m_serial->bytesAvailable() < len)
       QCoreApplication::processEvents(QEventLoop::ExcludeUserInputEvents);
    return m_serial->read(len);
}*/

QByteArray MainWindow::serialRead(qint32 len)           //串口读取（阻塞执行）（可设置超时）
{
    QByteArray result;
    qint64 totalRead = 0;

    if(timeoutEnabled)      //每次读都有超时等待
    {
        QElapsedTimer timer;
        timer.start();
        
        while (totalRead < len) {
            qint64 available = m_serial->bytesAvailable();
            
            if (available > 0) {
                QByteArray chunk = m_serial->read(qMin(available, len - totalRead));
                result.append(chunk);
                totalRead += chunk.size();
                timer.restart();  // 收到数据，重置计时器
            } else {
                if (timer.elapsed() >= timeoutMs) {
                    QMessageBox::critical(this, tr("Error"), tr("Serial read timeout, available:%1").arg(m_serial->bytesAvailable()));
                    break;
                }
                QCoreApplication::processEvents(QEventLoop::ExcludeUserInputEvents);
            }
        }
    }
    else            //阻塞一直等
    {
        while(m_serial->bytesAvailable() < len)
            QCoreApplication::processEvents(QEventLoop::ExcludeUserInputEvents);
        result = m_serial->read(len);
    }
    return result;
}

QByteArray MainWindow::serialReadAll()
{
    return m_serial->readAll();
}

void MainWindow::on_action_selectFile_triggered()
{
    QString fileName = QFileDialog::getOpenFileName(this,"select script file",QString(),"JAVAscript(*.js)");  //对话框获取需要打开的文件
    if (!fileName.isEmpty()) {
        //加载文件
        scriptFile.setFileName(fileName);         //文件名
        ui->action_selectFile->setText("&selectFile:" + fileName);
    }
    else
        ui->action_selectFile->setText("&selectFile");
}

void MainWindow::on_action_runScript_triggered()
{
    QString scriptStr;
    QFile funFile;
    int funLine = 0;        //功能文件行数
    funFile.setFileName(ui->action_fun->text());
    if(funFile.exists() && funFile.open(QIODevice::ReadOnly | QIODevice::Text))      //功能函数
    {
        QTextStream in(&funFile);
        /*while (!in.atEnd()) {
            in.readLine();
            funLine++;              //注意：最后一行为空时不计入总行数，该方案不可靠！！！
        }
        funFile.seek(0);*/
        scriptStr += funFile.readAll();
        QStringList list = scriptStr.split("\n");
        funLine += list.size();
        scriptStr += "\n";          //由于拼接时最后一行会丢失，此处添加之。
    }
    if(scriptFile.open(QIODevice::ReadOnly | QIODevice::Text))      //待执行脚本
    {
        scriptStr += scriptFile.readAll();
        scriptFile.close();
    }
    else
        return;
    QJSValue jsObject = jsEngine.newQObject(JSTool);       //将工具对象添加到JS引擎
    jsEngine.globalObject().setProperty("mainObject", jsObject);          //设置引擎中变量jsRunFuncObject为工具对象
    QJSValue errorValue = jsEngine.evaluate(scriptStr);
    if (errorValue.isError())
    {
        QString msg;
        msg.append("Error!");
        msg.append(errorValue.property("name").toString());
        msg.append(", ");
        msg.append(errorValue.property("message").toString());
        msg.append(":");
        int lineNumber = errorValue.property("lineNumber").toInt();
        if(lineNumber > funLine)
        {
            msg.append("Script:");
            msg.append(QString::number(errorValue.property("lineNumber").toInt() - funLine));
        }
        else
        {
            msg.append("Fun:");
            msg.append(errorValue.property("lineNumber").toString());
        }
        qDebug() << msg;
        statusBar()->showMessage(msg);
    }

}

void MainWindow::on_action_fun_triggered()
{
    QString fileName = QFileDialog::getOpenFileName(this,"select function file",ui->action_fun->text(),"JAVAscript(*.js)");  //对话框获取需要打开的文件
    if (!fileName.isEmpty()) {
        ui->action_fun->setText(fileName);
    }
}

void MainWindow::on_action_clean_triggered()
{
    //hexEdit->remove(0,fileSize);          //移除太慢了
    hexEdit->setData(nullptr);
}

void MainWindow::statusShow(QString &str)
{
    statusBar()->showMessage(str);
}


qint32 MainWindow::getEditLen()                                //获取编辑区域长度
{
    return fileSize;
}

void MainWindow::insert(qint64 pos, const QByteArray &ba)      //编辑器插入
{
     hexEdit->insert(pos,ba);
}

void MainWindow::replace(qint64 pos, const QByteArray &ba)      //编辑器替换
{
     hexEdit->insert(pos,ba);
}

QByteArray MainWindow::dataAt(qint64 pos, qint64 count)     //编辑器读取
{
     return hexEdit->dataAt(pos,count);
}


MainWindow::~MainWindow()
{
    writeSettings();
    delete ui;
    delete optionsDialog;
    delete searchDialog;
    delete hexEdit;
    delete lbOverwriteMode;
    delete lbOverwriteModeName;
    delete lbAddress;
    delete lbAddressName;
    delete lbSize;
    delete lbSizeName;
    delete settingsDialog;
    delete m_serial;
    delete toolDialog;
}









