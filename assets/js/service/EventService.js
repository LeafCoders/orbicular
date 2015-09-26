
function EventService($resource, $http, statusService) {

  var minutesBetweenUpdates = 60;
  var eventDays = [];

  /**
   * Get events each 60 minutes
   */
  if (settings.showEvents) {
    var getDataFn = createAPIGet($resource, $http, { url: settings.rosetteBaseUrl + 'public/calendar', request: 'json', isArray: false });

    createUpdateTimer(getDataFn, minutesBetweenUpdates, '?rangeMode=week&numRanges=3&startFromToday=true', function(success, calender) {
      statusService.set("event", success);
      if (success) {
        eventDays.length = 0;;
        calender.days.forEach(function(day) {
          eventDays.push(day);
        });
      }
    });
  }

  return {
    eventDays: eventDays
  }
}

orbicularApp.factory('eventService', EventService);