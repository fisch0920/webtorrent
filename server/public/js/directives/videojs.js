
angular.module('webtorrent').directive('videojs', function () {
  var linker = function (scope, element, attrs) {
    attrs.type = attrs.type || scope.torrent.mime || "video/mp4"

    var setup = {
      techOrder: ['html5', 'flash'],
      controls: true,
      preload: 'auto',
      autoplay: true,
      width: 640,
      height: 480
    }

    var videoid = 107
    attrs.id = "videojs"
    element.attr('id', attrs.id)
    var player = _V_(attrs.id, setup, function () {
      var source = [{
        type: attrs.type,
        src: attrs.src || scope.torrent.streamUrl
      }]
      this.src({type : attrs.type, src: source })
    })
    scope.$on('$destroy', function () {
      player.dispose()
    })
  }
  return {
    restrict : 'A',
    link : linker
  }
})

