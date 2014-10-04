
// Base url to Rosette server
var rosetteBaseUrl = "http://yourhost.se/api/v1-snapshot/";

// Main angular application instance
var orbicularApp = angular.module('orbicularApp', ['ngResource', 'ngAnimate', 'ngSanitize']);

orbicularApp

// Returns time part of date in format "2013-10-29 10:45 Europe/Stockholm"
.filter('time', function() {
  return function(input) {
    return input ? input.substr(11, 5) : '--:--';
  };
})

.filter('dayOfDate', function() {
  return function(input) {
    return input ? parseInt(input.substr(8, 2), 10) : '--';
  };
})

.filter('nameOfDay', function() {
  return function(input) {
    return ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön', '--'][Math.max(0, Math.min(6, input != null ? input-1 : 6))];
  };
})

.filter('unsafe', function($sce) {
  return function(val) {
      return $sce.trustAsHtml(val);
  };
});

