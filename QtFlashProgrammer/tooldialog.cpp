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


#include "tooldialog.h"
#include "ui_tooldialog.h"

ToolDialog::ToolDialog(MainWindow *parent) :
    ui(new Ui::ToolDialog),
    mainWindow(parent)
{
    ui->setupUi(this);
    connect(ui->openButton, SIGNAL(clicked()), this, SLOT(on_pushButton_clicked()));             //连接串口
    connect(ui->closeButton, SIGNAL(clicked()), this, SLOT(on_closeButton_clicked()));         //断开串口连接
}

ToolDialog::~ToolDialog()
{
    delete ui;
}

void ToolDialog::on_pushButton_clicked()
{
    mainWindow->openSerialPort();
    ui->openButton->setEnabled(false);
    ui->closeButton->setEnabled(true);
}


void ToolDialog::on_closeButton_clicked()
{
    mainWindow->closeSerialPort();
    ui->openButton->setEnabled(true);
    ui->closeButton->setEnabled(false);
}


void ToolDialog::on_sendButton_clicked()
{
    QByteArray toSend = ui->sendEdit->toPlainText().toLocal8Bit();
    mainWindow->serialWrite(toSend);
    QByteArray toRead = mainWindow->serialRead(toSend.length());
    ui->receivetBrowser->setPlaceholderText(QString(toRead));
}

