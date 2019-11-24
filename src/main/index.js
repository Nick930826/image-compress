import { app, BrowserWindow, Menu, Tray } from 'electron'
import db from '../datastore'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`


let tray = null

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', (event) => {
    mainWindow = null
  })
  mainWindow.on('close', (event) => {
    app.quit()
  })
  const menubarPic = process.platform === 'darwin' ? `${__static}/upload.png` : `${__static}/upload.png`
  tray = new Tray(menubarPic)
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', click: () => {
      mainWindow.destroy()
      tray.destroy()
    }},
  ])
  tray.setToolTip('one piece')
  tray.setContextMenu(contextMenu)

  tray.on('click',function(){
    mainWindow.show();
  })
  mainWindow.on('close',(e) => {  
    app.quit()
    //回收BrowserWindow对象
    // if(mainWindow.isMinimized()){
    //   mainWindow = null;
    // } else {
    //   e.preventDefault();
    //   mainWindow.minimize();
    // } 
  })

  tray.on('drop-files', async (event, files) => {
    console.warn('files', files);
    
    mainWindow.webContents.send('insert-success', files);
  })
}



app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
