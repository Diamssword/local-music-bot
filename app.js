require('dotenv').config();
const { app, BrowserWindow,ipcMain } = require('electron/main');
const path = require('path');
const fs = require('fs');
const bot= require("./bot.js");
var win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
const mus=path.join(__dirname,"musics");
const channels={}
function on(name,callback){channels[name]=callback;}
function send(name,msg){win.webContents.send("toFront",{name,msg})}

var FileList=[];
on("refreshFiles",()=>{
    FileList=fs.readdirSync(mus).filter(v=>fs.statSync(path.join(mus,v)).isFile);
    send("listFiles",FileList)
});
on("pauseFile",(msg)=>{
    bot.pause()
})
on("playFile",(msg)=>{
    var res=bot.playSong(msg.user,path.join(mus,FileList[msg.index]));
    res.then(v=>{
        if(v)
            send("playing",FileList[msg.index])
        else
        send("error","Impossible de lire la piste "+msg.index+" : "+FileList[msg.index])
    })
})
on("changeVolume",(vol)=>{
    bot.setVolume(parseInt(vol));
})
ipcMain.on('toBack', (event,name, arg) => {
    const c=channels[name]
    if(c)
        c(arg)
  });

