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

  var images = [
    "http://placehold.it/400x300",
    "http://placehold.it/400x300",
    "http://placehold.it/400x300",
    "http://placehold.it/400x300",
    "http://placehold.it/400x300",
    "http://placehold.it/400x300"
  ];

  var nextFetchTime = new Date();
  var currentPosters = new Array();
  var activePosterId = 0;

  $scope.posters = [{'img': './assets/img/logotype.jpg' }];

  function posterTimer() {
    var now = new Date();

    if (now >= nextFetchTime) {
      // Wait 30 minutes until next fetch
      nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 30);

      posters.fetchPosters(function(data){
        if (JSON.stringify(currentPosters) != data) {
          currentPosters = angular.fromJson(data);
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
    activePosterId = activePosterId + 1;
    if ((activePosterId < 0) || (activePosterId >= currentPosters.length)) {
      activePosterId = 0;
    }

    $timeout(function() {
      $scope.posters.pop();
      $scope.posters.push({'img': images[activePosterId] });
      $scope.$apply();
      
      setTimeout(function() { posterTimer() }, 5000); //currentPosters[activePosterId].duration * 400);
    });
  }

  // Start timer
  setTimeout(function() { posterTimer() }, 1000);
}
