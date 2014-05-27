/*
 * Fetches bookings from a Rosette server and displays each booking in a list.
 * The list is rotating so that the lowest item is moved to the top of the list.
*/

orbicularApp.factory('bookings', function($resource){
  return {
    fetchBookings : function(callback){
      var api = $resource(rosetteBaseUrl + 'bookings?callback=JSON_CALLBACK', {}, {
        fetch : {method:'JSONP', isArray: true}
      });
//      var api = $resource(rosetteBaseUrl + 'bookings.json', {}, {
//        fetch : {method:'GET', isArray: true}
//      });

      api.fetch(function(response){
        callback(response);
      });
    }
  }
});


function BookingController($scope, $http, $timeout, bookings) {
  var nextFetchTime = new Date(new Date().getTime() - 60*60*1000);  //TODO remove offset
  var currentBookings;
  $scope.bookings = [];

  $scope.locationName = function(booking) {
    return utilGetReferenceText(booking.location, function(location) { return location.name; });
  };
  $scope.roomImageUrl = function(booking) {
    var url = utilGetReferenceText(booking.location, function(location) {
      return utilGetReferenceText(location.roomImage, function(upload) {
        return upload.fileUrl;
      });
    });
    if (url.indexOf('http') == 0) {
      return url;
    }
    return null;
  };


  function bookingTimer() {
    var now = new Date();

    if (now >= nextFetchTime) {
      // Wait 5 minutes until next fetch
      nextFetchTime = now;
      nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 5);

      bookings.fetchBookings(function(data) {
        // Test if data has changed before last fetch. Ugly code. Make it cleaner and better.
        var dataString = JSON.stringify(data);
        if (currentBookings != dataString) {
          currentBookings = dataString;
          $scope.bookings = angular.fromJson(data);
        }
        cycleBookings();
      });
      // fetchBookings is asynchron and will return before the respond is returned.
      return;
    }
    cycleBookings();
  }

  function cycleBookings() {
    if ($scope.bookings.length > 0) {
      $timeout(function() {
        var cycleItem = $scope.bookings.pop();
        $scope.$apply();
        $scope.bookings.unshift(cycleItem);
        $scope.$apply();
        // Wait 5 sec until next cycle
        setTimeout(function() { bookingTimer() }, 5000);
      });
    } else {
      // Wait a minute cause we have nothing to show right now
      setTimeout(function() { bookingTimer() }, 60*1000);
    }
  }

  // Start timer
  setTimeout(function() { bookingTimer() }, 3000);
}
