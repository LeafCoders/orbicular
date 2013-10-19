/*
 * Fetches bookings from a Rosette server and displays each booking in a list.
 * The list is rotating so that the lowest item is moved to the top of the list.
*/

orbicularApp.factory('bookings', function($resource){
  return {
    fetchBookings : function(callback){
      var api = $resource(rosetteBaseUrl + 'posters?callback=JSON_CALLBACK', {}, {  // TODO: Get bookings instead of posters
        fetch : {method:'JSONP', isArray: true}
      });

      api.fetch(function(response){
        callback(response);
      });
    }
  }
});


function BookingController($scope, $http, $timeout, bookings) {
  $scope.bookings = [
    {'customer': 'Företag 1', 'startTime' : '2013-10-01 09:00 Europe/Stockholm', 'endTime' : '2013-10-01 12:00 Europe/Stockholm', 'room' : 'Boken', 'roomImg' : 'http://placehold.it/400x150' },
    {'customer': 'Företag 2', 'startTime' : '2013-10-01 13:00 Europe/Stockholm', 'endTime' : '2013-10-01 16:30 Europe/Stockholm', 'room' : 'Ekkällan' },
    {'customer': 'Företag 3', 'startTime' : '2013-10-01 13:00 Europe/Stockholm', 'endTime' : '2013-10-01 16:30 Europe/Stockholm', 'room' : 'Ekkällan' }
  ];

  var nextFetchTime = new Date(new Date().getTime() + 60*60*1000);  //TODO remove offset
  var currentBookings;

  function bookingTimer() {
    var now = new Date();

    if (now >= nextFetchTime) {
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
