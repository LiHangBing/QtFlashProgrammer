QT       += core gui
QT += designer
QT += widgets
QT += qml               #提供QJSEngine支持
QT += serialport        #提供串口通讯支持

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++17

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    jstoolclass.cpp \
    main.cpp \
    mainwindow.cpp \
    optionsdialog.cpp \
    qhexedit2/QHexEditPlugin.cpp \
    qhexedit2/chunks.cpp \
    qhexedit2/commands.cpp \
    qhexedit2/qhexedit.cpp \
    searchdialog.cpp \
    settingsdialog.cpp \
    tooldialog.cpp

HEADERS += \
    jstoolclass.h \
    mainwindow.h \
    optionsdialog.h \
    qhexedit2/QHexEditPlugin.h \
    qhexedit2/chunks.h \
    qhexedit2/commands.h \
    qhexedit2/qhexedit.h \
    qhexedit2/qhexedit.sip \
    searchdialog.h \
    settingsdialog.h \
    tooldialog.h

FORMS += \
    mainwindow.ui \
    optionsdialog.ui \
    searchdialog.ui \
    settingsdialog.ui \
    tooldialog.ui

TRANSLATIONS += \
    QtFlashProgrammer_yue_CN.ts
CONFIG += lrelease
CONFIG += embed_translations

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

RESOURCES += \
    resource.qrc

SUBDIRS += \
    qhexedit2/qhexedit.pro \
    qhexedit2/qhexeditplugin.pro

DISTFILES += \
    qhexedit2/license.txt
