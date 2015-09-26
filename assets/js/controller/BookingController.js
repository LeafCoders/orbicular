/*
 * Fetches bookings from a Rosette server and displays each booking in a list.
 * The list is rotating so that the lowest item is moved to the top of the list.
*/
function BookingController($scope, $http, $timeout, $window, bookingService, statusService) {

  $scope.bookings = [];

  // TODO: Doesn't work when locations are combined...
  $scope.directionImageUrl = function(booking) {
    var url = '';
    if (booking.location && booking.location.ref) {
      url = booking.location.ref.directionImage ? booking.location.ref.directionImage.fileUrl : '';
    }
    if (url.indexOf('http') == 0) {
      return url;
    }
    return null;
  };

  
  function cycleEnable() {
    // Check if the bottom position of the last booking 
    // is lower than browser window innerHeight
    var windowHeight = $window.innerHeight;
    var lowestPosition = 0;

    // get booking elements
    var bookings = $window.document.getElementsByClassName("booking");

    // find lowest position
    angular.forEach(bookings, function(element) {
      if (element.getBoundingClientRect().bottom > lowestPosition) {
        lowestPosition = element.getBoundingClientRect().bottom;
      }
    });

    // evaluate if lowest position is outside visible window
    if (lowestPosition > windowHeight) {
      return true;
    } else {
      // since no cycling should be done sort the bookings by starttime
      $scope.bookings.sort(function(a, b) {
        var c = createDateObject(a.startTime);
        var d = createDateObject(b.startTime);
        return c - d;
      });
      return false;
    }
  }

  function cycleBookings() {
    var timeoutLength = 5000;
    // enable cycling if there are bookings present and 
    // the bottom position of the last booking is lower than browser window innerHeight 
    if ($scope.bookings.length > 0) {
      if (cycleEnable()) {
        $timeout(function() {
          var cycleItem = $scope.bookings.pop();
          $scope.$apply();
          $scope.bookings.unshift(cycleItem);
          $scope.$apply();
        });
      }
    } else {
      // Wait a minute cause we have nothing to show right now
      timeoutLength = 60*1000;
    }
    setTimeout(tick, timeoutLength);
  }

  function tick() {
    bookingService.updateBookings($scope.bookings);
    cycleBookings();
  }

  // Start timer
  setTimeout(tick, 1000);
}

orbicularApp.controller('BookingController', BookingController);
