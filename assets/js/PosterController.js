/*
 * Fetches posters from a Rosette server and displays each poster at a time.
 * Each poster will be displayed as long as the duration is specified for the poster.
*/

orbicularApp.factory('posters', function($resource){
  return {
    fetchPosters : function(callback){
      var api = $resource(rosetteBaseUrl + 'posters?callback=JSON_CALLBACK', {}, {
        fetch : {method:'JSONP', isArray: true}
      });

      api.fetch(function(response){
        callback(response);
      });
    }
  }
});

function PosterController($scope, $http, $timeout, posters) {
  var nextFetchTime = new Date();
  var currentPosters = new Array();
  var activePosterId = 0;
  $scope.posters = [];

  function posterTimer() {
    var now = new Date();

    if (now >= nextFetchTime) {
      // Wait 30 minutes until next fetch
      nextFetchTime = now;
      nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 30);

      posters.fetchPosters(function(data){
        if (JSON.stringify(currentPosters) != data) {
          $scope.posters.length = 0;
          currentPosters = angular.fromJson(data);

          // TODO: Remove this when images have been addes to Posters
          currentPosters = [
            {'img': "http://placehold.it/400x300", 'duration': 5},
            {'img': "http://placehold.it/800x400", 'duration': 5},
            {'img': "http://placehold.it/400x300", 'duration': 5}
          ];

          activePosterId = -1;
        }
        nextPoster();
      });
      // fetchPosters is asynchron and will return before the respond is returned
      return;
    }
    nextPoster();
  }

  function nextPoster() {
    if (currentPosters.length > 0) {
      activePosterId = activePosterId + 1;
      if ((activePosterId < 0) || (activePosterId >= currentPosters.length)) {
        activePosterId = 0;
      }

      $timeout(function() {
        $scope.posters.pop();
        $scope.posters.push(currentPosters[activePosterId]);
        $scope.$apply();
      });
    }
    setNextTimeout();
  }

  function setNextTimeout() {
    var duration = 60; // Wait a minute 
    if (currentPosters.length > 0) {
      duration = currentPosters[activePosterId].duration || 10;
    }
    setTimeout(function() { posterTimer(); }, 1000*duration);
  }

  // Start timer
  setTimeout(function() { posterTimer(); }, 1000);
}
