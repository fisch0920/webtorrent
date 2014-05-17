
angular.module('webtorrent').controller('RootCtrl', function (
  $rootScope, socket)
{
  socket.emit('torrent', { torrentId: 'JH2TF3UY4IIOMTJ7SCNAZIBZ3IFSX45H' })
  $rootScope.safeApply = function (fn) {
    var phase = this.$root.$$phase
    if (phase == '$apply' || phase == '$digest') {
      if (fn && typeof(fn) === 'function') {
        fn()
      }
    } else {
      this.$apply(fn)
    }
  }

  $rootScope.torrentMap = {}
  $rootScope.torrents = []

  socket.on('torrent', function (data) {
    var id = data.infoHash
    if (!(id in $rootScope.torrentMap)) {
      data.numPeers = 0
      $rootScope.safeApply(function () {
        $rootScope.torrentMap[id] = data
        $rootScope.torrents.push(data)
      })
    }
  })

  socket.on('error', function (data) { console.log(data) })
  socket.on('torrent:metadata:update', function (data) {
    var torrent = $rootScope.torrentMap[data.infoHash]

    $rootScope.safeApply(function () {
      torrent.numPeers = data.numPeers
    })
  })

  socket.on('torrent:update', function (data) {
    var torrent = $rootScope.torrentMap[data.infoHash]

    $rootScope.safeApply(function () {
      $rootScope.torrentMap[data.infoHash] = $rootScope.torrents[$rootScope.torrents.indexOf(torrent)] = _.extend(torrent, data)
    })
  })
})

