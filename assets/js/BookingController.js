/*
 * Fetches bookings from a Rosette server and displays each booking in a list.
 * The list is rotating so that the lowest item is moved to the top of the list.
*/

var useBookings = true

//createFetchService({ name: 'bookingService', url: rosetteBaseUrl + 'bookings', request: 'json', isArray: true });
//createFetchService({ name: 'bookingService', url: rosetteBaseUrl + 'bookings?callback=JSON_CALLBACK', request: 'jsonp', isArray: true });
createFetchService({ name: 'bookingService', url: 'bookings.json', request: 'json', isArray: true });

function BookingController($scope, $http, $timeout, $window, bookingService, statusService) {
  $scope.bookings = [];
  
  // TODO: Doesn't work when locations are combined...
  $scope.directionImageUrl = function(booking) {
    var url = getReferenceText(booking.location, function(location) {
      return getReferenceText(location.directionImage, function(upload) {
        return upload.fileUrl;
      });
    });
    if (url.indexOf('http') == 0) {
      return url;
    }
    return null;
  };


  /**
   * Get bookings each 30 minutes
   */
  var bookingsFromService = null;
  if (useBookings) {
    createUpdateTimer(bookingService, 30, null, function(success, dataArray) {
      statusService.set("booking", success);
      if (success) {
        bookingsFromService = dataArray;
      }
    });
  }

  function createDateObject(bookingDateString) {
    var bits = bookingDateString.split(/\D/);
    var bookingDateObject = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);
    return bookingDateObject;
  }

  function filterBookings(incomingBookings) {
    console.log("incoming bookings: " + incomingBookings.length);

    // copy location name to location.text if there is an referenced location present
    for (var i = 0; i < incomingBookings.length; i++) {
      incomingBookings[i].location.text = getReferenceText(incomingBookings[i].location, function(location) { return location.name; })
    }

    // remove passed bookings, bookings for coming days and 
    // bookings missing customerName or start/end time

    for (var i = 0; i < incomingBookings.length; i++) {

      // check that all neccessary values are present else remove booking
      if (!(incomingBookings[i].customerName && incomingBookings[i].startTime && incomingBookings[i].endTime)) {
        console.log("Incoming booking lacking nesseccary data: " + incomingBookings[i].customerName);
        incomingBookings.splice(i,1);
        i--;
        continue;
      }

    }

    var now = new Date()
    console.log("Current time:" + now);

    // concatenate upcoming/ongoing bookings for same customerName

    // loop through the bookings to find same customer
    for (var i = 0; i < incomingBookings.length; i++) {	
      //console.log("Customer name: " + incomingBookings[i].customerName);
      var iStartTime = createDateObject(incomingBookings[i].startTime);
      var iEndTime = createDateObject(incomingBookings[i].endTime);

      for (var j = i + 1; j < incomingBookings.length; j++) {	

        // first check if it is the same customer
        if (incomingBookings[i].customerName == incomingBookings[j].customerName) {
          //console.log("Booking with same customer name found");

          // create date objects for the matching booking
          var jStartTime = createDateObject(incomingBookings[j].startTime);
          var jEndTime = createDateObject(incomingBookings[j].endTime);

          // concatenate locations if same customer and same startTime
          if (iStartTime - jStartTime == 0) {
            // update incomingBookings[i] with info from incomingBookings[j] when needed

            // concatenate the rooms
            incomingBookings[i].location.text += "<br>" + incomingBookings[j].location.text

            // set the endtime to the last of the two bookings
            if (jEndTime > iEndTime) {
              incomingBookings[i].endTime = incomingBookings[j].endTime;
            }	

            console.log("Merged booking with same startTime");

            // remove the merged booking
            incomingBookings.splice(j, 1);
            j--;
          }

          // concatenate if same customer and endtime <= startTime
          // but only show rooms of the first booking

          // we are relying on that the booking is sorted by startTime
          else if (iEndTime - jStartTime >= 0) {

            // update the end time of the booking if neccessary
            if (iEndTime < jEndTime) {
              incomingBookings[i].endTime = incomingBookings[j].endTime;
            }

            // concatenate location if the latter is currently ongoing
            if (now > jStartTime && jEndTime > now) {
              incomingBookings[i].location.text += "<br>" + incomingBookings[j].location.text
            }

            //console.log("Merged booking starting after current booking");

            // remove the merged booking
            incomingBookings.splice(j, 1);
            j--;
          }
        }
      }
    }

    return incomingBookings;
  };

  function bookingInBookings(booking) {
    for (var i = 0; i < $scope.bookings.length; i++) {
      if ($scope.bookings[i].customerName.toUpperCase() === booking.customerName.toUpperCase() &&
          $scope.bookings[i].startTime === booking.startTime &&
          $scope.bookings[i].endTime === booking.endTime &&
          $scope.bookings[i].location.text === booking.location.text) {
        return true;
      }
    }
    return false;
  }

  function addBookings(bookings) {
    angular.forEach(bookings, function(booking) {
      if (!bookingInBookings(booking)) {
        $scope.bookings.push(booking);

        // sort bookings on starttime
        $scope.bookings.sort(function(a, b) {
          var c = createDateObject(a.startTime);
          var d = createDateObject(b.startTime);
          return c - d;
        });

        console.log("Booking added: " + booking.customerName + ": " + booking.location.text);
      }
    });
  }

  function bookingInBookingsRetreived(booking,bookings) {

    for (var i = 0; i < bookings.length; i++) {
      // check if booking is identical
      if (bookings[i].customerName === booking.customerName &&
          bookings[i].startTime === booking.startTime &&
          bookings[i].endTime === booking.endTime &&
          bookings[i].location.text === booking.location.text) {
        return true;
      } 
    }
    console.log("Booking not among incoming bookings");
    return false;

  }

  function removeBookings(bookings) {
    for (var i = 0; i < $scope.bookings.length; i++) {
      if (!bookingInBookingsRetreived($scope.bookings[i], bookings)) {
        $scope.bookings.splice(i, 1);
        console.log("Booking deleted: " + $scope.bookings[i].customerName);
      }  
    }
  }

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
    var now = new Date();

    // Has any bookings been fetched from service?
    if (bookingsFromService) {
      // remove ended bookings and bookings for coming days
      // and concatenate adjacent bookings for same customer
      var incomingBookings = filterBookings(bookingsFromService);

      // add incoming filtered bookings not already present
      // in $scope.bookings
      addBookings(incomingBookings);

      // remove bookings from $scope.bookings that is not found
      // among the incoming filtered bookings
      removeBookings(incomingBookings);
      
      bookingsFromService = null
    }

    cycleBookings();
  }

  // Start timer
  setTimeout(tick, 1000);
}
