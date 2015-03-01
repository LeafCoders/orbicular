/**
 * Fetches posters and events from a Rosette server and displays each at a time.
 * Each page will be displayed as long as the duration is specified for the page.
 */

createFetchService({ name: 'posterService', url: settings.rosetteBaseUrl + 'posters?onlyActive=true', request: 'jsonp', isArray: true });

if (settings.oldEventsServerUrl) {
  createFetchService({ name: 'eventService', url: settings.oldEventsServerUrl, request: 'json', isArray: false });
} else {
  createFetchService({ name: 'eventService', url: settings.rosetteBaseUrl + 'eventWeeks', request: 'jsonp', isArray: false });
}

createFetchService({ name: 'bibelnSeService', url: 'http://www.bibeln.se/pren/syndikering.jsp', request: 'html' });

function PageController($scope, $http, $timeout, posterService, eventService, bibelnSeService, statusService) {
  var NOT_VISITED = 0, ACTIVE = 1, VISITED = 2;
  var activePage = null;
  var pagesLeftToShow = new Array();
  $scope.pages = [];
  $scope.pageIndicators = [];
  $scope.halfDurationPassed = false;
  $scope.welcomeContent = settings.welcomeContent;

  $scope.isTodayOrAfter = function (timeString) {
    return new Date(timeString.substr(0, 10)) >= new Date().setHours(0,0,0,0);
  };

  $scope.eventDayNumber = function (dayNumber) {
    if (settings.oldEventsServerUrl) {
      // Old event server sets day number between 0 and 6. New event server sets day number between 1 and 7.
      return dayNumber + 1;
    } else {
      return dayNumber;
    }
  };

  /**
   * Get posters each 60 minutes
   */
  var postersFromService = [];
  if (settings.showPosters) {
    createUpdateTimer(posterService, 60, null, function(success, dataArray) {
      statusService.set("poster", success);
      if (success) {
        postersFromService = dataArray;
      }
    });
  }

  /**
   * Get events each 60 minutes
   */
  var eventsFromService = [];
  if (settings.showEvents) {
    createUpdateTimer(eventService, 60, function() {
      var week1 = new Date().getCurrentWeek(0);
      var week2 = new Date().getCurrentWeek(1);
      if (settings.oldEventsServerUrl) {
        return [
          '?year=' + week1.year + '&week=' + (week1.week < 10 ? '0' : '') + week1.week,
          '?year=' + week2.year + '&week=' + (week2.week < 10 ? '0' : '') + week2.week
        ];
      } else {
        return [
          '/' + week1.year + '-W' + (week1.week < 10 ? '0' : '') + week1.week,
          '/' + week2.year + '-W' + (week2.week < 10 ? '0' : '') + week2.week
        ];
      }
    }, function(success, data, index) {
      statusService.set("event", success);
      if (success) {
        eventsFromService[index] = data;
      }
    });
  }

  /**
   * Get data from bibeln.se each 12 hours
   */
  if (settings.showBibelnSe) {
    createUpdateTimer(bibelnSeService, 12*60, null, function(success, data) {
      statusService.set("bibelnSe", success);
      if (success) {
        $scope.bibelnSe = BibelnSeConverter(data);
      }
    });
  }

  var resetIndicators = function() {
    for (var i = 0; i < pagesLeftToShow.length; ++i) {
      if (i < $scope.pageIndicators.length) {
        $scope.pageIndicators[i].state = NOT_VISITED;
      } else {
        $scope.pageIndicators.push({ state: NOT_VISITED });
      }
    }
    while ($scope.pageIndicators.length > pagesLeftToShow.length) {
      $scope.pageIndicators.pop();
    }
  };

  var updateIndicators = function(lastIndex, activeIndex) {
    if (lastIndex != null && lastIndex < $scope.pageIndicators.length) {
      $scope.pageIndicators[lastIndex].state = VISITED;
    }
    if (activeIndex < $scope.pageIndicators.length) {
      $scope.pageIndicators[activeIndex].state = ACTIVE;
    }

    $scope.$apply();
  };

  var showNextPage = function() {
    var page = pagesLeftToShow.shift();
    $scope.pages.pop();
    $scope.pages.push(page);
    return page;
  };

  var setupPagesToShow = function() {
    activePage = null;
    pagesLeftToShow = [];
    var pageIndexCounter = 0;

    if (settings.showBibelnSe) {
      pagesLeftToShow.push({ 
        index: pageIndexCounter++,
        view: './views/welcome.html',
        showDuration: 8
      });
    }

    if (settings.showEvents && eventsFromService.length > 0) {
      var eventDays = [];
      eventsFromService.forEach(function(week) {
        week.days.forEach(function(day) {
          eventDays.push(day);
        });
      });
      pagesLeftToShow.push({ 
        index: pageIndexCounter++,
        view: './views/event.html',
        showDuration: 15,
        item: eventDays
      });
    }

    if (settings.showPosters) {
      postersFromService.forEach(function(poster) {
        pagesLeftToShow.push({ 
          index: pageIndexCounter++,
          view: './views/poster.html',
          showDuration: poster.duration,
          centerVertically: true,
          item: jQuery.extend({}, poster)
        });
      });
    }
  };

  var tick = function () {
    if (pagesLeftToShow.length == 0) {
      setupPagesToShow();
      resetIndicators();
    }
    if (pagesLeftToShow.length > 0) {
      var lastPageIndex = activePage ? activePage.index : null;
      activePage = showNextPage();
      updateIndicators(lastPageIndex, activePage.index);
      var showDuration = Math.max(2, Math.min(20, activePage.showDuration || 10));
      setTimeout(tick, 1000*showDuration);

      $scope.halfDurationPassed = false;
      setTimeout(function() { $scope.halfDurationPassed = true; }, 500*showDuration);
    } else {
      // There are no pages to show at all. Wait for services to fetch new data
      setTimeout(tick, 5*60*1000);
    }
  };

  // Start timer
  setTimeout(tick, 3000);
}

orbicularApp.controller('PageController', PageController);
