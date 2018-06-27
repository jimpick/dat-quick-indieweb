module.exports = (firstName, lastName) => {
  const title = firstName + ' ' + lastName
  const dashedTitle = title.toLowerCase().replace(/ /g, '-')
  return `<html>
<head>
  <title>${firstName} ${lastName}'s IndieWeb Page</title>
  <style>
    body {
      font-family: monospace;
      margin: 0;
    }
    header {
      background: #80c683;
      padding: 1em;
    }
    header h1 {
      margin: 0;
    }
    .content {
      font-size: x-large;
      margin: 1.5em;
    }
    footer a {
      color: yellow;
    }
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.3em;
      background: #509556;
      color: white;
    }
  </style>
</head>
<body>
  <header>
    <h1>${firstName} ${lastName}'s IndieWeb Page</h1>

    Also at: <a href="https://${dashedTitle}-indieweb.hashbase.io/">https://${dashedTitle}-indieweb.hashbase.io/</a>
  </header>

  <div class="content">
    This is my page published as a Dat archive.<br>
    <br>
    Fun times! &#x1f389;
  </div>

  <footer>
    Published to the peer-to-peer web from the
    <a href="https://dat-quick-indieweb.glitch.me/">
    conventional web</a>.
  </footer>
</body>
</html>
`
}
