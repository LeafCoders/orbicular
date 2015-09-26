/**
 * Fetches posters and events from a Rosette server and displays each at a time.
 * Each page will be displayed as long as the duration is specified for the page.
 */
function PageController($scope, $http, $timeout, posterService, eventService, bookingService, bibelnSeService, statusService) {
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

  function resetIndicators() {
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

  var isShowingBookings = false;

  function showNextPage() {
    var page;

    // Show bookings page before a page is shown
    var soonBookings = bookingService.bookingsStartsSoon();
    if (soonBookings && soonBookings.length && !isShowingBookings) {
      isShowingBookings = true;
      page = {
        index: pagesLeftToShow[0].index,
        view: './views/bookings.html',
        showDuration: 5,
        item: soonBookings
      };
    } else {
      isShowingBookings = false;
      page = pagesLeftToShow.shift();
    }

    $scope.pages.pop();
    $scope.pages.push(page);
    return page;
  };

  function setupPagesToShow() {
    activePage = null;
    pagesLeftToShow = [];
    var pageIndexCounter = 0;

    if (bibelnSeService.bibelnSe.data) {
      $scope.bibelnSe = bibelnSeService.bibelnSe.data;
      pagesLeftToShow.push({ 
        index: pageIndexCounter++,
        view: './views/welcome.html',
        showDuration: 8
      });
    }

    var eventDaysFromService = eventService.eventDays;
    if (eventDaysFromService && eventDaysFromService.length > 0) {
      pagesLeftToShow.push({ 
        index: pageIndexCounter++,
        view: './views/event.html',
        showDuration: 15,
        item: eventDaysFromService
      });
    }

    var postersFromService = posterService.posters;
    if (postersFromService && postersFromService.length > 0) {
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

  function tick() {
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
