// Modules to control application life and create native browser window
const electron = require('electron');
const {app, Menu, BrowserWindow, ipcMain, Tray, shell, globalShortcut, clipboard} = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execFile } = require('child_process');

const AutoLaunch = require('auto-launch')

const ElectronSampleAppLauncher = new AutoLaunch({
  name: 'Clipboard-history-Copycat'
});

/* 
const clipboardWatcher = require('electron-clipboard-watcher');

clipboardWatcher({
  // (optional) delay in ms between polls
  watchDelay: 500,
  
  // handler for when image data is copied into the clipboard
  onImageChange: function (nativeImage) { console.log(nativeImage) },
  
  // handler for when text data is copied into the clipboard
  onTextChange: function (text) { console.log(text) }
}); */


let clipy = null;

const Clipboard = require('./App/Clipboard');

let clipboardData = ['hello worled', 'buye asdf asd ', 'asdf asdfasdfa s', 'asdsfasdf'];

//character length of rendered data
let maxLenght = 100;





let pe = path.resolve(__dirname, './resources/past.vbs');

if(!fs.existsSync(pe))
{
  pe = path.resolve(process.resourcesPath, "./resources/past.vbs");
}

// electron.app.setLoginItemSettings({
//   openAtLogin: true,
//   path: electron.app.getPath('exe')
// });


ipcMain.on('remove', function(event, ind){
    clipy.remove(ind);
    rendererUpdate();
});

ipcMain.on("select", function(event, ind){
  win.minimize();
  win.hide();  
  
  let element = clipy.get(ind);
  
  if(element.info.type == 'text'){ 
    let str = element.str;
    clipboard.writeText(str);
  }else{
    
    clipboard.writeImage(element.info.image);
  }
  const child = exec(`"${pe}"`, [], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
  });
});

ipcMain.on("console.log", function(event, msg){
  console.log(msg);
});

ipcMain.on("resize-window", function(event, data){
  
  let h = Math.min(600, Math.max(50, data.h));
  // console.log(h);
  h = Math.round(h);
  // console.log(h);
  // console.log("Height set to ", h);
  win.setSize(400, h);
  
  // console.log('resize end\n');
});

const logThis = (s)=>{
  return ()=>console.log(s);
}



let tray = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;


app.commandLine.appendSwitch( 'disable-gpu-compositing' );
app.commandLine.appendSwitch( 'disableHardwareAcceleration' );



function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 100,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    },
    hasShadow: false,
    frame: false,
    transparent: true,
    show: false
  });
  
  
  
  
  
  //don't show taskbar icon only tray icon
  win.setSkipTaskbar(true);
  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, './App/index.html') );
  // win.setIgnoreMouseEvents(true);
  
  // Open the DevTools.
  // win.webContents.openDevTools();
  
  ElectronSampleAppLauncher.enable();
  
  ElectronSampleAppLauncher.isEnabled()
  .then(function(isEnabled){
    if(isEnabled){
      return;
    }
    ElectronSampleAppLauncher.enable();
  })
  .catch(function(err){
    // handle error
  });
  
  win.once('ready-to-show', () => {
    clipy = new Clipboard(clipboardData, win);
    
    clipy.on('add', function(){
      rendererUpdate();
    }); 
    win.show();
    rendererUpdate();
  });
  
  win.on('blur', function(){
    win.hide();
  })
  
}



function rendererUpdate()
{
  let clipBoardData = clipy.data;
  let dataD = [];
  for(data in clipBoardData)
  {
    let orig = data;
    let info = clipBoardData[orig];
    
    if(info.type == 'text')
    {
      data = data.substr(0, maxLenght)+(orig.length>maxLenght?"...":"");
      info['length'] = orig.length;
      if(orig.length > 0){
        dataD.push({data, info});
      }
    }else{
      
      if(info.size.width > info.size.height){
        if(info.size.width > 100){
          let d = info.image.resize({width:100});
          dataD.push({data:d.toDataURL(), info});
        }else{
          dataD.push({data:info.image.toDataURL(), info});
        }
      }else{
        if(info.size.height > 100){
          let d = info.image.resize({height:100});
          dataD.push({data:d.toDataURL(), info});
        }else{
          dataD.push({data:info.image.toDataURL(), info});
        }
      }
    }
  }
  
  // console.log(dataD);
  //sort in reverse
  dataD.sort(function(a, b){
    return a.info.ind==b.info.ind?0:a.info.ind>b.info.ind?-1:1;
  });
  win.send("clipBoardData", dataD);
} 

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(()=>{
  createTray();
  createWindow();
  // rendererUpdate();
  globalShortcut.register('CommandOrControl+Shift+V', setWindowAndShow);
  
});


function setWindowAndShow(toMouse=true)
{
  let mousePos = electron.screen.getCursorScreenPoint();
  const { width:sw, height:sh } = electron.screen.getPrimaryDisplay().workAreaSize;
  
  
  rendererUpdate();
  if(toMouse != false){
    const [ww, wh] = win.getSize(); 
    let mx = mousePos.x;
    let my = mousePos.y;
    if(my+wh > sh)
    {
      my = sh-wh;
    }
    
    if(mx+ww > sw)
    {
      mx = sw-ww;
    }
    
    win.setPosition(mx, my, true);
  }
  win.show();
}

function createTray(){
  
  tray = new Tray(path.join(__dirname, "tray1.ico"));
  const contextMenu = Menu.buildFromTemplate([
    //{label: 'Show main window', click:()=>{appConfig.showwin = true;customStorage.addItem('appConfig', appConfig);win.show();}},
    { label: 'Exit', role: 'close', click:()=>{app.exit(0);}},
    { label: 'Show', click:()=>setWindowAndShow(false)},
  ]);
  tray.setToolTip('Self Notes.')
  tray.setContextMenu(contextMenu);
  tray.on('double-click', function(){
    win.show();
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) createWindow()
})

app.on('activate', () => { win.show() })

app.on('before-quit', () => app.quitting = true)

