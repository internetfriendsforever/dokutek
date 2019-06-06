const os = require('os')
const path = require('path')
const url = require('url')
const { app, ipcMain, protocol, BrowserWindow } = require('electron')
const IPFS = require('ipfs')

let createWindow

function openCreateWindow () {
  createWindow = new BrowserWindow({ width: 800, height: 600 })
  createWindow.loadFile('gui/create.html')
  createWindow.on('closed', function () {
    createWindow = null
  })
}

function openViewWindow (hash) {
  const viewWindow = new BrowserWindow({ width: 400, height: 400, additionalArguments: { hash } })

  viewWindow.loadURL(url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'gui/view.html'),
    hash: hash
  }))

  viewWindow.on('', function () {
    createWindow = null
  })
}

app.on('ready', () => {
  protocol.registerStringProtocol('dokutek', (req, callback) => {
    const hash = req.url.substring(('dokutek://').length)
    openViewWindow(hash)
  }, error => {
    console.log(error)
  })

  protocol.interceptStringProtocol('dokutek', (req, callback) => {
    const hash = req.url.substring(('dokutek://').length)
    openViewWindow(hash)
  }, error => {
    console.log(error)
  })

  openCreateWindow()
})

app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault()
    const hash = url.substring(('dokutek://').length)
    openViewWindow(hash)
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (createWindow === null) {
    openCreateWindow()
  }
})

const node = new IPFS({
  repo: path.join(os.homedir(), '.dokutek/repo')
})

node.on('ready', () => {
  node.id((err, id) => {
    if (err) {
      return console.log(err)
    }

    console.log(id)
  })

  ipcMain.on('save', async (event, doc) => {
    console.log('Saving', doc)
    const result = await node.files.add(Buffer.from(doc))
    event.sender.send('saved', result[0])
  })

  ipcMain.on('load', async (event, hash) => {
    console.log('Loading', hash)

    const result = await node.files.get(hash)

    event.sender.send('loaded', {
      ...result[0],
      content: result[0].content.toString('utf8')
    })
  })
})
