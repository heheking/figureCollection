const $ = require('../module/jquery-3.5.1.min')
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell
const path = require('path');


$(document).ready(async function(){
    window.otaku = [];

    ipcRenderer.on("figureList-reply", function (event, arg) {
        window.otaku.figureList = arg;
        console.log("已收到数据")
    });
    ipcRenderer.on("setting-reply", function (event, arg) {
        let json = $.parseJSON(arg);
        window.otaku.setting = json;
    });
    ipcRenderer.on("saveFigureData-reply", function(event, arg) {
        if(arg == true) {
            console.log("发送成功");
        }
    });

    window.otaku.saveFigureData = function(obj) {
        ipcRenderer.send("saveFigureData-message", obj);
        console.log("发送成功");
        location.reload();
    }

    const fileManagerBtn = document.getElementById('openFigureDir')

    fileManagerBtn.addEventListener('click', function (event) {
        shell.openPath(path.join(__dirname,"..","..","..","data","figure"))
    })

    const settingBtn = document.getElementById("setting-button");
    settingBtn.addEventListener("click", function(event) {
        ipcRenderer.send("view-setting", "open");
    });

    window.otaku.openExternal = function(url) {
        shell.openExternal(url);
    }
});

window.onload = function () {
    ipcRenderer.send("setting-message", "get");
    ipcRenderer.send("figureList-message", "get");
}
