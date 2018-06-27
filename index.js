const html = require('choo/html')
// const devtools = require('choo-devtools')
const choo = require('choo')
const storage = require('random-access-idb')('codemirror-multicore')
const websocket = require('websocket-stream')
const pump = require('pump')
const prettyHash = require('pretty-hash')
const toBuffer = require('to-buffer')
const hypercore = require('hypercore')
const Editor = require('./editor')
const GitHubButton = require('./githubButton')
const Multicore = require('./multicore')
const template = require('./template')
const landingView = require('./views/landing')
const mainView = require('./views/main')

require('events').prototype._maxListeners = 100

const app = choo()
// app.use(devtools())
app.use(store)
app.route('/', landingView)
app.route('/pages', mainView)
app.route('/page/:key', mainView)
app.mount('body')

function store (state, emitter) {
  state.archives = {}
  state.currentArchive = null
  state.indexHtml = ''
  state.title = ''
  state.editor = new Editor()

  function debugStorage (name) {
    // console.log('debugStorage:', name)
    return storage(name)
  }
  const multicore = new Multicore(debugStorage)
  multicore.ready(() => {
    const archiverKey = multicore.archiver.changes.key.toString('hex')
    console.log('Archiver key:', archiverKey)

    emitter.on('publish', () => {
      const archive = state.currentArchive ? state.currentArchive
        : multicore.createArchive()
      const value = state.editor.codemirror.getValue()
      archive.ready(() => {
        const key = archive.key.toString('hex')
        const datJson = {
          url: `dat://${key}/`,
          title: document.getElementById('title').value,
          description: ''
        }
        archive.writeFile('/dat.json', JSON.stringify(datJson, null, 2), err => {
          if (err) {
            console.error('Error writing to Dat', err)
            return
          }
          archive.writeFile('/index.html', value, err => {
            if (err) {
              console.error('Error writing to Dat', err)
              return
            }
            console.log(
              `Published:\n` +
              `metadata ${prettyHash(archive.metadata.key)} ` +
              `dk: ${prettyHash(archive.metadata.discoveryKey)} ` +
              `length: ${archive.metadata.length}\n` +
              `content ${prettyHash(archive.content.key)} ` +
              `dk: ${prettyHash(archive.content.discoveryKey)} ` +
              `length: ${archive.content.length}`
            )
            state.currentArchive = archive
            multicore.replicateFeed(archive)
            emitter.emit('pushState', `/page/${key}`)
          })
        })
      })
    })

    emitter.on('navigate', updateDoc)
    
    emitter.on('delete', key => {
      console.log('Deleting', key)
      state.currentArchive = null
      state.indexHtml = ''
      state.title = ''
      multicore.archiver.remove(key, () => {
        delete state.archives[key]
        emitter.emit('pushState', '/')
      })
    })

    const host = document.location.host
    const proto = document.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${host}/archiver/${archiverKey}`

    function connectWebsocket () {
      console.log('Connecting websocket', url)
      const stream = websocket(url)
      pump(
        stream,
        multicore.archiver.replicate({encrypt: false}),
        stream,
        err => {
          console.log('Pipe finished', err.message)
          connectWebsocket()
        }
      )
    }
    connectWebsocket()

    multicore.archiver.on('add', feed => {
      multicore.replicateFeed(feed)
    })
    multicore.archiver.on('add-archive', readMetadata)
    Object.keys(multicore.archiver.archives).forEach(dk => {
      const archive = multicore.archiver.archives[dk]
      readMetadata(archive.metadata, archive.content)
    })
    updateDoc()

    function updateDoc () {
      if (!state.params.key) {
        state.title = 'My Dat Page'
        state.indexHtml = template
        state.currentArchive = null
        emitter.emit('render')
      } else {
        const key = state.params.key
        /*
        if (
          state.currentArchive &&
          state.currentArchive.key.toString('hex') === key
        ) return
        */
        let archive
        if (state.archives[key] && state.archives[key].archive) {
          archive = state.archives[key].archive
          console.log('Key found (cached)', key)
        } else {
          const dk = hypercore.discoveryKey(toBuffer(key, 'hex'))
            .toString('hex')
          if (multicore.archiver.archives[dk]) {
            archive = multicore.archiver.getHyperdrive(dk)
            if (!state.archives[key]) {
              state.archives[key] = {dk}
            }
            state.archives[key].archive = archive
            console.log('Key found (loaded)', key)
          } else {
            console.error('Key not found locally', key)
            // It might be better to display an error in the UI
            emitter.emit('pushState', '/')
          }
        }
        readMetadata(archive.metadata)
        archive.readFile('index.html', 'utf-8', (err, data) => {
          if (err) {
            console.error('Error reading index.html', key, err)
            return
          }
          try {
            state.indexHtml = data
            state.currentArchive = archive
            emitter.emit('render')
          } catch (e) {
            // FIXME: Throw an error to the UI
          }
        })
      }
    }

    function readMetadata (metadata) {
      const key = metadata.key.toString('hex')
      const dk = metadata.discoveryKey.toString('hex')
      if (!state.archives[key]) {
        state.archives[key] = {dk}
      }
      emitter.emit('render')
      let archive
      if (state.archives[key].archive) {
        archive = state.archives[key].archive
      } else {
        archive = multicore.archiver.getHyperdrive(dk)
        state.archives[key].archive = archive
      }
      archive.readFile('dat.json', 'utf-8', (err, data) => {
        if (err) {
          // console.error('Error reading dat.json', key, err)
          return
        }
        try {
          const {title} = JSON.parse(data.toString())
          state.archives[key].title = title
          if (state.params.key === key) state.title = title
          emitter.emit('render')
        } catch (e) {
          // Don't worry about it
        }
      })
    }
  })
}
