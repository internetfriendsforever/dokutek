const { ipcRenderer, clipboard } = require('electron')
const { bind, wire } = require('hyperhtml')
const { fromEvents, merge, combine } = require('kefir')

const submit = fromEvents(document.body, 'click')
  .filter(event => event.target.type === 'submit')
  .map(event => {
    event.preventDefault()

    const form = event.target.closest('form')
    const textarea = form.querySelector('textarea')

    return textarea.value
  })

submit.onValue(doc => {
  console.log('Saving', doc)
  ipcRenderer.send('save', doc)
})

const defaultValue = () => ''

const value = merge([
  submit.map(defaultValue),
  fromEvents(document.body, 'input')
    .filter(event => event.target.closest('textarea'))
    .map(event => event.target.value)
]).toProperty(defaultValue)

const saved = fromEvents(ipcRenderer, 'saved', (event, result) => result)

saved.onValue(saved => {
  clipboard.writeText(`dokutek://${saved.hash}`)
})

const form = combine({
  value,
  saved: saved.toProperty(() => null)
})

const state = combine({ form })

state.onValue(state => {
  let status

  if (state.form.saved) {
    const url = `dokutek://${state.form.saved.hash}`
    status = wire()`<p>Saved and copied to clipboard! <a href=${url}>${url}</a></p>`
  }

  bind(document.body)`
    <form>
      <textarea value=${state.form.value} />

      <button type='submit'>
        Publish
      </button>

      ${status}
    </form>
  `
})
