
angular.module('webtorrent', [
  'ngRoute',
  'ngTable',
  'btford.socket-io',
  'ui.bootstrap'
])

angular.module('webtorrent').config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl : '/html/home.html',
    controller  : 'HomeCtrl'
  }).when('/torrent/:infoHash/stream', {
    templateUrl : '/html/torrent-stream.html',
    controller  : 'TorrentStreamCtrl'
  }).otherwise({
    redirectTo: '/'
  })

  $locationProvider.html5Mode(true)
})

