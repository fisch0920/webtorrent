
angular.module('webtorrent').controller('HomeCtrl', function (
  $scope, socket, ngTableParams, $modal)
{
  $scope.torrentsTable = new ngTableParams({}, { counts: [] })

  $scope.addTorrent = function () {
    var modalInstance = $modal.open({
      templateUrl: 'html/add-torrent.html',
      controller: 'AddTorrentCtrl',
      resolve: {
        items: function () {
          return $scope.items
        }
      }
    })

    modalInstance.result.then(function (torrentId) {
      socket.emit('torrent', { torrentId: torrentId })
    })
  }
})

