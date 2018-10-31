const { app, BrowserWindow } = require('electron')
const IPFS = require('ipfs')

let mainWindow

function createWindow () {
  const node = new IPFS({
    repo: './.repo'
  })

  node.on('ready', () => {
    node.id((err, id) => {
      if (err) {
        return console.log(err)
      }

      console.log(id)
    })
  })

  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
