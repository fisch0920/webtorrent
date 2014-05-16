
$(document).ready(function () {
  io = io.connect()

  io.emit('torrent', {
    torrentId: 'JH2TF3UY4IIOMTJ7SCNAZIBZ3IFSX45H'
  })

  io.on('torrent', function (data) {
    console.log(data)
  })
  io.on('error', function (data) { console.log(data) })
  io.on('torrent:metadata:update', function (data) { console.log(data) })
  io.on('torrent:metadata', function (data) { console.log(data) })
  io.on('torrent:update', function (data) { console.log(data) })
})

