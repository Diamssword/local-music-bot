const { contextBridge, ipcRenderer } = require('electron');
var calls={};
contextBridge.exposeInMainWorld('app', {
  send: (name,msg) => ipcRenderer.send('toBack',name, msg),
  on: (name,callback) => {
    console.log("refister:",name)
    calls[name]=callback;}
  
});

ipcRenderer.on('toFront', (event,arg) => {
    const c=calls[arg.name]
    if(c)
        c(arg.msg)
})
