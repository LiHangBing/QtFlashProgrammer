#include <QColorDialog>
#include <QFontDialog>

#include "optionsdialog.h"
#include "ui_optionsdialog.h"

OptionsDialog::OptionsDialog(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::OptionsDialog)
{
    ui->setupUi(this);
    readSettings();         //读取设置
    //实际的设置在上一级窗口中应用
    writeSettings();        //写入设置
}

OptionsDialog::~OptionsDialog()
{
    delete ui;
}

void OptionsDialog::show()
{
    readSettings();         //窗口显示之前读取一次设置
    QWidget::show();
}

void OptionsDialog::accept()        //buttonBox 点击确认后执行
{
    writeSettings();        //写入设置
    emit accepted();        //发出该信号给上一级窗口
    QDialog::hide();        //隐藏
}

void OptionsDialog::readSettings()      //读取设置
{
    QString cfgName = "./Config.ini";
    QSettings settings(cfgName,QSettings::IniFormat);

    //读取设置信息并设置控件状态
    ui->cbAddressArea->setChecked(settings.value("AddressArea", true).toBool());    //默认为true
    ui->cbAsciiArea->setChecked(settings.value("AsciiArea", true).toBool());
    ui->cbHighlighting->setChecked(settings.value("Highlighting", true).toBool());
    ui->cbOverwriteMode->setChecked(settings.value("OverwriteMode", true).toBool());
    ui->cbReadOnly->setChecked(settings.value("ReadOnly").toBool());

    //读取设置信息并设置颜色
    setColor(ui->lbHighlightingColor, settings.value("HighlightingColor", QColor(0xff, 0xff, 0x99, 0xff)).value<QColor>());
    setColor(ui->lbAddressAreaColor, settings.value("AddressAreaColor", this->palette().alternateBase().color()).value<QColor>());
    setColor(ui->lbSelectionColor, settings.value("SelectionColor", this->palette().highlight().color()).value<QColor>());
#ifdef Q_OS_WIN32       //32位程序
    ui->leWidgetFont->setFont(settings.value("WidgetFont", QFont("Courier", 10)).value<QFont>());
#else
    ui->leWidgetFont->setFont(settings.value("WidgetFont", QFont("Monospace", 10)).value<QFont>());
#endif

    //读取设置信息并显示到控件
    ui->sbAddressAreaWidth->setValue(settings.value("AddressAreaWidth", 4).toInt());
    ui->sbBytesPerLine->setValue(settings.value("BytesPerLine", 16).toInt());
}

void OptionsDialog::writeSettings()         //写入设置
{
    QString cfgName = "./Config.ini";
    QSettings settings(cfgName,QSettings::IniFormat);
    //根据控件的信息将配置写入（并未应用）
    settings.setValue("AddressArea", ui->cbAddressArea->isChecked());
    settings.setValue("AsciiArea", ui->cbAsciiArea->isChecked());
    settings.setValue("Highlighting", ui->cbHighlighting->isChecked());
    settings.setValue("OverwriteMode", ui->cbOverwriteMode->isChecked());
    settings.setValue("ReadOnly", ui->cbReadOnly->isChecked());

    //settings.setValue("HighlightingColor", ui->lbHighlightingColor->palette().color(QPalette::Background));
    //settings.setValue("AddressAreaColor", ui->lbAddressAreaColor->palette().color(QPalette::Background));
    //settings.setValue("SelectionColor", ui->lbSelectionColor->palette().color(QPalette::Background));
    settings.setValue("HighlightingColor", ui->lbHighlightingColor->palette().color(QPalette::Base));
    settings.setValue("AddressAreaColor", ui->lbAddressAreaColor->palette().color(QPalette::Base));
    settings.setValue("SelectionColor", ui->lbSelectionColor->palette().color(QPalette::Base));
    settings.setValue("WidgetFont",ui->leWidgetFont->font());

    settings.setValue("AddressAreaWidth", ui->sbAddressAreaWidth->value());
    settings.setValue("BytesPerLine", ui->sbBytesPerLine->value());
}

void OptionsDialog::setColor(QWidget *widget, QColor color)     //设置控件颜色
{
    QPalette palette = widget->palette();               //颜色版
    //palette.setColor(QPalette::Background, color);
    palette.setColor(QPalette::Base, color);
    widget->setPalette(palette);                        //设置颜色版
    widget->setAutoFillBackground(true);                //设置控件自动背景填充
}

//一些颜色设置按钮的回调
void OptionsDialog::on_pbHighlightingColor_clicked()
{
    //QColor color = QColorDialog::getColor(ui->lbHighlightingColor->palette().color(QPalette::Background), this);
    //对话框获取颜色，后续皆如此
    QColor color = QColorDialog::getColor(ui->lbHighlightingColor->palette().color(QPalette::Base), this);
    if (color.isValid())
        setColor(ui->lbHighlightingColor, color);   //设置控件颜色，后续皆如此
}
void OptionsDialog::on_pbAddressAreaColor_clicked()
{
    //QColor color = QColorDialog::getColor(ui->lbAddressAreaColor->palette().color(QPalette::Background), this);
    QColor color = QColorDialog::getColor(ui->lbAddressAreaColor->palette().color(QPalette::Base), this);
    if (color.isValid())
        setColor(ui->lbAddressAreaColor, color);
}
void OptionsDialog::on_pbSelectionColor_clicked()
{
    //QColor color = QColorDialog::getColor(ui->lbSelectionColor->palette().color(QPalette::Background), this);
    QColor color = QColorDialog::getColor(ui->lbSelectionColor->palette().color(QPalette::Base), this);
    if (color.isValid())
        setColor(ui->lbSelectionColor, color);
}
//字体设置按钮回调
void OptionsDialog::on_pbWidgetFont_clicked()
{
    bool ok;
    QFont font = QFontDialog::getFont(&ok, ui->leWidgetFont->font(), this);     //对话框获取字体
    if (ok)
        ui->leWidgetFont->setFont(font);        //设置ui字体
}
//注：buttonBox的槽函数通过ui设计工具中的“编辑信号/槽”功能指定
