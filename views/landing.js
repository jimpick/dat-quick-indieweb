const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    .content {
      margin: 1em;
    }
    .ctaWrapper {
      display: flex;
      flex-direction: column;
      padding: 15vmax;
    }
  }
`

module.exports = landingView

function landingView (state, emit) {
  const editor = state.editor
  let link = html`<span class="help">Edit the HTML below, then click on "Publish" to create a new web site!</span>`
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
        <button class="ctaBtn" onclick=${() => emit('publish')}>
          Publish
        </button>
        <div class="link">
          ${link}
        </div>
      </div>
    </body>
  `

}
