
function BookingService($resource, $http, statusService) {

  var minutesBetweenUpdates = 30;
  var bookings = [];

  /**
   * Get bookings each 30 minutes
   */
  if (settings.showBookings) {
    var getDataFn = createAPIGet($resource, $http, { url: settings.rosetteBaseUrl + 'public/bookings', request: 'json', isArray: true });

    createUpdateTimer(getDataFn, minutesBetweenUpdates, null, function(success, dataArray) {
      statusService.set("booking", success);
      if (success) {
        bookings.length = 0;
        Array.prototype.push.apply(bookings, combineBookings(dataArray));
      }
    });
  }

  /**
   * Returns bookings that starts in 20 minutes or has started less then 10 minutrs ago
   */
  function bookingsStartsSoon() {
    return bookings.filter(function (booking) {
      var minutesUntil = (createDateObject(booking.startTime) - new Date())/(60*1000);
      return minutesUntil < 20 && minutesUntil > -10;
    });
  };

  function combineBookings(incomingBookings) {
    // copy location name to location.text if there is an referenced location present
    for (var i = 0; i < incomingBookings.length; i++) {
      incomingBookings[i].location.text = getReferenceOrText(incomingBookings[i].location, function(location) {
        return location.name;
      });
    }

    var now = new Date()

    // concatenate upcoming/ongoing bookings for same customerName

    // loop through the bookings to find same customer
    for (var i = 0; i < incomingBookings.length; i++) {	
      var iStartTime = createDateObject(incomingBookings[i].startTime);
      var iEndTime = createDateObject(incomingBookings[i].endTime);

      for (var j = i + 1; j < incomingBookings.length; j++) {	

        // first check if it is the same customer
        if (incomingBookings[i].customerName == incomingBookings[j].customerName) {
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

            // remove the merged booking
            incomingBookings.splice(j, 1);
            j--;
          }
        }
      }
    }

    return incomingBookings;
  };

  function bookingInBookings(existingBookings, booking) {
    return existingBookings.some(function (existingBooking) {
      if (existingBooking.customerName.toUpperCase() === booking.customerName.toUpperCase() &&
          existingBooking.startTime === booking.startTime &&
          existingBooking.endTime === booking.endTime &&
          existingBooking.location.text === booking.location.text) {
        return true;
      }
      return false;
    });
  }

  function addBookings(existingBookings, bookings) {
    angular.forEach(bookings, function(booking) {
      if (!bookingInBookings(existingBookings, booking)) {
        existingBookings.push(booking);

        // sort bookings on starttime
        existingBookings.sort(function(a, b) {
          var c = createDateObject(a.startTime);
          var d = createDateObject(b.startTime);
          return c - d;
        });
      }
    });
  }

  function bookingInBookingsRetreived(booking, bookings) {
    for (var i = 0; i < bookings.length; i++) {
      // check if booking is identical
      if (bookings[i].customerName === booking.customerName &&
          bookings[i].startTime === booking.startTime &&
          bookings[i].endTime === booking.endTime &&
          bookings[i].location.text === booking.location.text) {
        return true;
      } 
    }
    return false;
  }

  function removeBookings(existingBookings, bookings) {
    for (var i = 0; i < existingBookings.length; i++) {
      if (!bookingInBookingsRetreived(existingBookings[i], bookings)) {
        existingBookings.splice(i, 1);
      }  
    }
  }

  function updateBookings(existingBookings) {
    // add combined bookings not already present in existingBookings
    addBookings(existingBookings, bookings);

    // remove bookings from existingBookings that is not found among the combined bookings
    removeBookings(existingBookings, bookings);
  }


  return {
    bookings: bookings,
    updateBookings: updateBookings,
    bookingsStartsSoon: bookingsStartsSoon
  }
}

orbicularApp.factory('bookingService', BookingService);