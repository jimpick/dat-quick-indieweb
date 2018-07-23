const html = require('choo/html')
const css = require('sheetify')
const templateWithName = require('../templateWithName')

const prefix = css`
  :host {
    .content {
      margin: 1em;
    }
    .ctaWrapper {
      display: flex;
      flex-direction: column;
      padding: 15vmax;

      .prompt {
        margin-bottom: 0.6rem;
      }

      input {
        font-size: 2rem;
      }

      button {
        height: 3rem;
        margin: 2rem 0;
      }
    }
  }
`

module.exports = landingView

function landingView (state, emit) {
  const editor = state.editor
  let link = html`<span class="help">Edit your name, then click on "Publish" to create a new web site!</span>`
  let webPageKey
  let disabledNoCurrent = 'disabled'
  if (state.currentArchive && state.currentArchive.key) {
    webPageKey = state.currentArchive.key.toString('hex')
    const url = `dat://${webPageKey}`
    link = html`<a href=${url}>${url}</a>`
    disabledNoCurrent = null
  }
  return html`
    <body class=${prefix}>
      <h2>
        Create an IndieWeb profile page with one click!
      </h2>
      <div class="ctaWrapper">
        <div class="prompt">Enter your name</div>
        <input id="firstName" type="text" placeholder="First">
        <input id="lastName" type="text" placeholder="Last">
        <button class="ctaBtn" onclick=${click}>
          Publish
        </button>
        <div class="link">
          ${link}
        </div>
      </div>
      <div class="link">
        <a href="/pages">View/edit previously published pages</a>
      </div>
    </body>
  `

  function click () {
    const firstName = document.getElementById('firstName').value.trim()
    const lastName = document.getElementById('lastName').value.trim()
    if (firstName === '' || lastName === '') {
      alert('Please enter full name')
      return
    }
    const indexHtml = templateWithName(firstName, lastName)
    state.editor.update(indexHtml)
    state.title = `${firstName} ${lastName}`
    // alert('publish')
    emit('publish')
  }
}
