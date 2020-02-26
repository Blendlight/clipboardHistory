// Modules to control application life and create native browser window
const electron = require('electron');
const {app, Menu, BrowserWindow, ipcMain, Tray, shell, globalShortcut, clipboard} = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execFile } = require('child_process');

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


ipcMain.on("select", function(event, ind){
  win.minimize();
  win.hide();  
  
  let str = clipy.get(ind).str;

  clipboard.writeText(str);
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
  let h = Math.min(600, Math.max(300, data.h));
  h = Math.round(h);
  // console.log("Height set to ", h);
  win.setSize(400, h);
  
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
    data = data.substr(0, maxLenght)+(orig.length>maxLenght?"...":"");
    let info = clipBoardData[orig];
    info['length'] = orig.length;
    dataD.push({data, info});
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
  rendererUpdate();
  if(toMouse != false){
    win.setPosition(mousePos.x, mousePos.y, true);
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

