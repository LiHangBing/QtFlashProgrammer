#include "searchdialog.h"
#include "ui_searchdialog.h"

#include <QMessageBox>

SearchDialog::SearchDialog(QHexEdit *hexEdit, QWidget *parent) :
    QDialog(parent),
    ui(new Ui::SearchDialog)
{
  ui->setupUi(this);
  _hexEdit = hexEdit;
}

SearchDialog::~SearchDialog()
{
  delete ui;
}

qint64 SearchDialog::findNext()         //查找下一个字符（会同时设置指针位置）
{
    qint64 from = _hexEdit->cursorPosition() / 2;               //指针选中的是一个十六进制字符，4位，查找以字节为单位
    _findBa = getContent(ui->cbFindFormat->currentIndex(), ui->cbFind->currentText());      //将欲查找的字符串转换为比特流
    qint64 idx = -1;

    if (_findBa.length() > 0)
    {
        if (ui->cbBackwards->isChecked())                   //Backwards框被选定
            idx = _hexEdit->lastIndexOf(_findBa, from);     //向后查找（会同时设置指针位置）
        else
            idx = _hexEdit->indexOf(_findBa, from);         //往前查找（会同时设置指针位置）
    }
    return idx;
}

//下面时一系列按钮点击回调
void SearchDialog::on_pbFind_clicked()
{
    findNext();
}
void SearchDialog::on_pbReplace_clicked()
{
    int idx = findNext();       //查找下一个
    if (idx >= 0)
    {
        QByteArray replaceBa = getContent(ui->cbReplaceFormat->currentIndex(), ui->cbReplace->currentText());//同↑
        replaceOccurrence(idx, replaceBa);      //替换对应位置的比特流
    }
}
void SearchDialog::on_pbReplaceAll_clicked()
{
    int replaceCounter = 0;
    int idx = 0;
    int goOn = QMessageBox::Yes;

    while ((idx >= 0) && (goOn == QMessageBox::Yes))    //循环替换直到找不到下一个或用户取消（限交互模式）
    {
        idx = findNext();       //查找下一个
        if (idx >= 0)
        {
            QByteArray replaceBa = getContent(ui->cbReplaceFormat->currentIndex(), ui->cbReplace->currentText());//同↑
            int result = replaceOccurrence(idx, replaceBa);     //执行替换

            if (result == QMessageBox::Yes)
                replaceCounter += 1;

            if (result == QMessageBox::Cancel)  //如果选中了Prompt框，交互时选择了取消，则停止替换
                goOn = result;
        }
    }

    if (replaceCounter > 0)         //消息框提示替换的总数
        QMessageBox::information(this, tr("QHexEdit"), QString(tr("%1 occurrences replaced.")).arg(replaceCounter));
}
//注：close按钮的槽函数通过ui设计工具中的“编辑信号/槽”功能指定为hide()


QByteArray SearchDialog::getContent(int comboIndex, const QString &input)   //将字符转换为比特流  参数：格式、字符串
{
    QByteArray findBa;
    switch (comboIndex)
    {
        case 0:     // hex      查找的格式：输入的字符表示十六进制
            findBa = QByteArray::fromHex(input.toLatin1());
            break;
        case 1:     // text     输入的字符为utf8码
            findBa = input.toUtf8();
            break;
    }
    return findBa;
}

qint64 SearchDialog::replaceOccurrence(qint64 idx, const QByteArray &replaceBa)     //替换对应位置的比特流
{
    int result = QMessageBox::Yes;
    if (replaceBa.length() >= 0)
    {
        if (ui->cbPrompt->isChecked())      //如果勾选了Prompt框，则替换前和用户交互
        {
            result = QMessageBox::question(this, tr("QHexEdit"),
                     tr("Replace occurrence?"),
                     QMessageBox::Yes | QMessageBox::No | QMessageBox::Cancel); //询问框

            if (result == QMessageBox::Yes)             //用户确认替换
            {
                _hexEdit->replace(idx, replaceBa.length(), replaceBa);      //替换对应位置的比特流
                _hexEdit->update();                                         //更新控件
            }
        }
        else
        {
            _hexEdit->replace(idx, _findBa.length(), replaceBa);            //...
        }
    }
    return result;
}
