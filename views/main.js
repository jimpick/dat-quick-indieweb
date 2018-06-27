const html = require('choo/html')
const prettyHash = require('pretty-hash')
const Editor = require('../editor')
const GitHubButton = require('../githubButton')

module.exports = mainView

const gitHubButton = new GitHubButton()

function mainView (state, emit) {
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
  let found = false
  const optionList = Object.keys(state.archives).sort().map(key => {
    let label = prettyHash(key)
    const title = state.archives[key].title
    if (title) {
      label += ` ${title}`
    }
    const selected = webPageKey === key ? 'selected' : ''
    if (selected) found = true
    return html`<option value=${key} ${selected}>${label}</option>`
  })
  const optGroup = optionList.length > 0 ? html`
    <optgroup label="Load">
      ${optionList}
    </optgroup>` : null
  const selectNew = found ? '' : 'selected'
  return html`
    <body>
      <h2>
        Create a webpage on the Peer-to-Peer Web!
      </h2>
      <header>
        <select name="docs" onchange=${selectPage}>
          <option value="new" ${selectNew}>Create a new webpage...</option>
          ${optGroup}
        </select>
        <div class="title">
          <span>Title:</span>
          <input id="title" name="title" value="${state.title}">
        </div>
        <button class="publishBtn" onclick=${() => emit('publish')}>
          Publish
        </button>
        <div class="link">
          ${link}
        </div>
      </header>
      ${editor.render(state.indexHtml)}
      <footer>
        <a href="https://glitch.com/edit/#!/codemirror-multicore">
          <img src="https://cdn.glitch.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Fview-source%402x.png?1513093958802"
                alt="view source button" aria-label="view source" height="33">
        </a>
        <a href="https://glitch.com/edit/#!/remix/codemirror-multicore">
          <img src="https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg"
                alt="Remix on Glitch" />
        </a>
        ${gitHubButton.render()}
        <select id="more" onchange=${selectMore}>
          <option selected>More...</option>
          <option ${disabledNoCurrent}>Delete</option>
          <option ${disabledNoCurrent}>Export</option>
        </select>
      </footer>
    </body>
  `

  function selectPage (e) {
    const key = e.target.value
    if (key === 'new') {
      emit('pushState', `/`)
    } else {
      emit('pushState', `/page/${key}`)
    }
  }
  
  function selectMore (e) {
    console.log('Jim more', e.target.value)
    switch (e.target.value) {
      case 'Delete':
        const ok = confirm(
          'Delete this web page?\n\n' +
          'This will delete the master copy in your web browser, ' +
          'but other replicas that may have been synced will ' +
          'still exist.'
        )
        if (ok) {
          emit('delete', webPageKey)
        }
        break;
      case 'Export':
        const secretKey = state.currentArchive.metadata.secretKey.toString('hex')
        console.log('Export', webPageKey, secretKey)
        alert(
          'You can export the data and the secret key to the command-line ' +
          'dat tool. First, you need to clone the data:\n\n' +
          `dat clone dat://${webPageKey}\n\n` +
          'Then change directory into the new directory, and import the ' +
          'secret key:\n\n' +
          'dat keys import\n\n' +
          `The secret key is:\n\n${secretKey}\n\n` +
          'IMPORTANT: Delete your old master copy in the web browser after importing, as ' +
          'there must only be one master copy.'
        )
        break;
      case 'Settings':
        alert('Settings')
        break;
    }
    e.target.selectedIndex = 0
  }
}
