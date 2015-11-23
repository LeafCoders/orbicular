function TimeController($scope, $http, $window) {
  var months = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var nextMinuteToShow = new Date().getMinutes();

  $scope.logoSrc = settings.logoSrc;

  $scope.date = "";
  $scope.time = "";

  function timeTick() {
    // Has time past next minute to show?
    var now = new Date();
    if (now.getMinutes() == nextMinuteToShow) {
      updateTime(now);
      checkForTermination(now);

      // Set next minute to show
      nextMinuteToShow = (nextMinuteToShow + 1) % 60;
      var nextMinute = new Date(now);
      nextMinute.setMinutes(nextMinuteToShow, 0, 0);
      var millisToNextTick = (nextMinute.getTime() - now.getTime()) % 60000 + 100;
      setTimeout(function() { timeTick() }, millisToNextTick);
    } else {
      // Wait another second
      setTimeout(function() { timeTick() }, 1000);
    }
  }

  function updateTime(now) {
    $scope.date = now.getDate() + " " + months[now.getMonth()];
    $scope.time = prependZero(now.getHours()) + ":" + prependZero(now.getMinutes());
    $scope.$apply();
  }
  
  function prependZero(value) {
    if (value < 10) {
      return "0" + value;
    }
    return value;
  }

  // Each night we restart the computer who runs Chrome with Orbicular. We restart
  // the computer to "handle" memory leaks. Closing Chrome (with kill process terminal command),
  // when running in kiosk mode, will somethimes make Chrome show a notification dialog
  // with text "Google Chrome didn't shut down correctly". With setting "terminateTime" we
  // change url to "http://closekiosk". The Chomre extension "Close Kiosk" will listen for this
  // url and then close Chrome gracefully. :)
  function checkForTermination(now) {
    if (settings.terminateTime) {
      var parts = settings.terminateTime.split(':');
      if (now.getHours() == parseInt(parts[0]) && now.getMinutes() >= parseInt(parts[1])) {
        $window.location.href = "http://closekiosk";
      }
    }
    now.getHours()
  }

  // Start timer
  setTimeout(function() { timeTick() }, 1000);
}

orbicularApp.controller('TimeController', TimeController);
