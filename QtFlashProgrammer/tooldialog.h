#ifndef TOOLDIALOG_H
#define TOOLDIALOG_H

#include <QDialog>

#include "mainwindow.h"
class MainWindow;

namespace Ui {
class ToolDialog;
}

class ToolDialog : public QDialog
{
    Q_OBJECT

public:
    explicit ToolDialog(MainWindow *parent);
    ~ToolDialog();

private slots:
    void on_pushButton_clicked();

    void on_closeButton_clicked();

    void on_sendButton_clicked();

private:
    Ui::ToolDialog *ui;
    MainWindow *mainWindow;
};

#endif // TOOLDIALOG_H
