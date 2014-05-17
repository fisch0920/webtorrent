var WebTorrent = require('../')
var express    = require('express.io')
var path       = require('path')
var exphbs     = require('express3-handlebars')
var numeral    = require('numeral')
var address    = require('network-address')
var moment     = require('moment')

var app = express()
var client = new WebTorrent({ quiet: true })
client.server.listen(9000)
app.http().io()

app.configure(function () {
  app.set('port', process.env.PORT || 3000)
  app.set('views', __dirname)
  app.engine('html', exphbs({
    defaultLayout: false,
    extname: '.html',
  }))
  app.set('view engine', 'html')
  app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')))
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
})

app.configure('development', function () {
  app.use(express.errorHandler())
})

app.io.route('torrent', function(req) {
  var started = Date.now()

  client.add(req.data.torrentId, req.data.opts, function (err, torrent) {
    if (err) {
      app.io.broadcast('error', err)
      return
    }
    app.io.broadcast('torrent', { infoHash: torrent.infoHash })

    function updateMetadata () {
      app.io.broadcast('torrent:metadata:update', {
        infoHash: torrent.infoHash,
        numPeers: torrent.swarm.numPeers
      })
    }

    torrent.swarm.on('wire', updateMetadata)
    client.on('torrent', function (t) {
      if (torrent !== t) return
      torrent.swarm.removeListener('wire', updateMetadata)

      var href = 'http://' + address() + ':' + client.server.address().port + '/'
      var swarm = torrent.swarm
      var wires = swarm.wires
      var hotswaps = 0

      torrent.on('hotswap', function () {
        hotswaps++
      })

      function active (wire) {
        return !wire.peerChoking
      }

      function bytes (num) {
        return numeral(num).format('0.0b')
      }

      function getRuntime () {
        return Math.floor((Date.now() - started) / 1000)
      }

      function update (done) {
        if (torrent._destroyed) {
          clearInterval(updateId)
          return
        }

        var unchoked = swarm.wires.filter(active)
        var runtime = getRuntime()
        var speed = swarm.downloadSpeed()
        var percentDone = swarm.downloaded / torrent.length
        var estimatedSecondsRemaining = Math.max(0, torrent.length - swarm.downloaded) / (speed > 0 ? speed : -1)
        var estimate = moment.duration(estimatedSecondsRemaining, 'seconds').humanize()

        app.io.broadcast('torrent:update', {
          infoHash: torrent.infoHash,
          name: torrent.name,
          runtime: runtime,
          done: !!done,
          streamable: true,
          streamUrl: href,
          mime: client.mime,
          percentDone: 100 * percentDone,
          downloadSpeed: bytes(speed) + '/s',
          downloadSpeedRaw: speed,
          numUnchoked: unchoked.length,
          numPeers: wires.length,
          downloaded: bytes(swarm.downloaded),
          downloadedRaw: swarm.downloaded,
          length: bytes(torrent.length),
          lengthRaw: torrent.length,
          uploaded: bytes(swarm.uploaded),
          uploadedRaw: swarm.uploaded,
          eta: estimate,
          etaRaw: estimatedSecondsRemaining,
          peerQueueSize: swarm.numQueued,
          wires: wires.map(function (wire) {
            return {
              addr: wire.remoteAddress,
              downloaded: bytes(wire.downloaded),
              downloadedRaw: wire.downloaded,
              downloadSpeed: bytes(wire.downloadSpeed()),
              downloadSpeedRaw: wire.downloadSpeed(),
              choked: wire.peerChoking
            }
          })
        })
      }

      var updateId = setInterval(update, 100)
      update()

      torrent.once('done', function () {
        clearInterval(updateId)
        update(true)
      })
    })
  })
})

var routes = [ // initialize all client-side routes
  '/',
  '/torrent/:torrent/stream'
]

routes.forEach(function (route) {
  app.get(route, function(req, res) { res.render('index') })
})

console.log('starting express server on port', app.get('port'))
app.listen(app.get('port'))

