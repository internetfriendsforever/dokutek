const { ipcRenderer } = require('electron')
const { fromEvents } = require('kefir')

const load = fromEvents(ipcRenderer, 'loaded', (event, result) => result)

const hash = window.location.hash.substring(1)

console.log(window.location)

ipcRenderer.send('load', hash)

load.onValue(result => {
  document.body.innerHTML = result.content
})
