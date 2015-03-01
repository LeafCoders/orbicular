
// Main angular application instance
var orbicularApp = angular.module('orbicularApp', ['ngResource', 'ngAnimate', 'ngSanitize']);

// Returns time part of date in format "2013-10-29 10:45 Europe/Stockholm"
orbicularApp.filter('time', function() {
  return function(input) {
    return input ? input.substr(11, 5) : '--:--';
  };
});

orbicularApp.filter('dayOfDate', function() {
  return function(input) {
    return input ? parseInt(input.substr(8, 2), 10) : '--';
  };
});

orbicularApp.filter('nameOfDay', function() {
  return function(input) {
    return ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön', '--'][Math.max(0, Math.min(6, input != null ? input-1 : 6))];
  };
});

orbicularApp.filter('unsafe', function($sce) {
  return function(val) {
      return $sce.trustAsHtml(val);
  };
});
