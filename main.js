const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const fs = require('fs');
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

//声明要打开的窗口
let main = null;
let page = null;

// 初始化部分
//利用path获取__dirname防止打包后软件跑不起来
let figureDirPath = path.join(__dirname,"..","..", "data","figure");
// 试运行防止未创建 data 文件夹
if(!fs.existsSync(figureDirPath)) {
    console.log(process.cwd())
    fs.mkdirSync(path.join(__dirname,"..","..", "data"));
    fs.mkdirSync(path.join(__dirname,"..","..", "data","figure"));
    console.log("指定目录不存在");
}else {
    console.log("正在加载指定目录")
}


function _loadData() {
    let figureObjectList = [];

    for (const figureDir of fs.readdirSync(figureDirPath)) {
        let path = figureDirPath + '/' + figureDir;
        let fileList = fs.readdirSync(path);
        let figureData = fs.readFileSync(path + '/data.json', 'utf-8');
        let figureID = figureDir;
        figureObjectList.push({figureID,fileList,figureData});
    }

    // console.log(figureObjectList)
    return figureObjectList;
}
function _loadSetting() {
    let setting = fs.readFileSync(path.join(__dirname, "config.json",), 'utf-8');
    console.log("返回了一次 setting ");
    return setting;
}

function _saveFigureData(arg) {
    let obj = arg;
    let id = obj.figureID;
    let data = obj.figureData;

    console.log(id);
    let targetFigureDirPath = path.join(__dirname, "..", "..", "data","figure",id,'data.json');
    fs.writeFile(targetFigureDirPath, JSON.stringify(data), function(){
        console.log("已修改完毕");
    });
}
function _saveFigureSetting(obj) {
    let configURL =  path.join(__dirname, "config.json");
    fs.writeFile(configURL, JSON.stringify(obj), function(){
        console.log("已保存设置");
    });
}

function _openSetting() {
    page = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        frame: true,
        title: "手办管理器 | 设置",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webSecurity: false
        },
    });

    page.on('closed', () => {
        page = null;
    });

    page.loadFile("./container/setting.html");
    // 打开控制台
    // page.webContents.openDevTools({mode:'detach'})
}


app.on('ready',async () => {
    //隐藏菜单栏
    Menu.setApplicationMenu(null);

    main = new BrowserWindow({
        width: 1280,
        height: 720,
        resizable: false,
        frame: true,
        title: "手办管理器",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            webSecurity: false
        },
    });
    // main.webContents.openDevTools({mode:'detach'})

    main.loadFile('./container/index.html');

    main.on('closed', () => {
        app.quit()
    });

    ipcMain.on('figureList-message', function (event, arg) {
        if(arg == 'get') {
            event.sender.send('figureList-reply', _loadData());
        }
    });

    ipcMain.on('setting-message', function (event, arg) {
        if(arg == 'get') {
            let setting = _loadSetting();
            event.sender.send('setting-reply', setting);
        }
    });

    ipcMain.on('saveFigureData-message', function (event, arg) {
        if(arg != null) {
            _saveFigureData(arg);
            event.sender.send('saveFigureData-reply', true);
        }
    });

    ipcMain.on("view-setting", function(event, arg) {
        if(arg == "open") {
            _openSetting()
        }
    });

    ipcMain.on("save-setting", function(event, arg) {
        _saveFigureSetting(arg)
    });

    console.log("app is ready.");
});

