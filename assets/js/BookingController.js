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
    return getReferenceText(booking.location, function(obj) { return obj.name; });
  }

  function bookingTimer() {
    var now = new Date();

    if (now >= nextFetchTime) {
      // Wait 5 minutes until next fetch
      nextFetchTime = now;
      nextFetchTime.setMinutes(nextFetchTime.getMinutes() + 5);

      bookings.fetchBookings(function(data){
        if (JSON.stringify(currentBookings) != data) {
          currentBookings = angular.fromJson(data);
          $scope.bookings = currentBookings;
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
        setTimeout(function() { bookingTimer() }, 3000);
      });
    } else {
      setTimeout(function() { bookingTimer() }, 60*1000);
    }
  }

  // Start timer
  setTimeout(function() { bookingTimer() }, 3000);
}
