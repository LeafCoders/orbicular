function TimeController($scope, $http) {
  var months = ['jan', 'feb', 'mars', 'april', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var nextMinuteToShow = new Date().getMinutes();

  $scope.date = "";
  $scope.time = "";

  function timeTick() {
    // Has time past next minute to show?
    var now = new Date();
    if (now.getMinutes() == nextMinuteToShow) {
      updateTime(now);

      // Set next minute to show
      nextMinuteToShow = (nextMinuteToShow + 1) % 60;
      var nextMinute = new Date(now);
      nextMinute.setMinutes(nextMinuteToShow, 0, 0);
      var millisToNextTick = (nextMinute.getTime() - now.getTime()) % 60000 + 100;
      console.log(millisToNextTick);
      setTimeout(function() { timeTick() }, millisToNextTick);
    } else {
      // Wait another second
      setTimeout(function() { timeTick() }, 1000);
    }
  }

  function updateTime(now) {
    $scope.date = now.getDay() + " " + months[now.getMonth()];
    $scope.time = prependZero(now.getHours()) + ":" + prependZero(now.getMinutes());
    $scope.$apply();
  }
  
  function prependZero(value) {
    if (value < 10) {
      return "0" + value;
    }
    return value;
  }

  // Start timer
  setTimeout(function() { timeTick() }, 1000);
}
