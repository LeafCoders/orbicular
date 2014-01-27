
// Base url to Rosette server
var rosetteBaseUrl = "http://yourhost.se/api/v1-snapshot/";

// Custom angular filters
angular.module('orbicularFilters', [])
  // Returns time part of date in format "2013-10-29 10:45 Europe/Stockholm"
  .filter('time', function() {
    return function(input) {
      return input.substr(11, 5);
    };
  });

// Main angular application instance
var orbicularApp = angular.module('orbicularApp', ['ngResource', 'ngAnimate', 'orbicularFilters']);




// Update body font size to width size
function updateBodyFontSize() {
  $('body').css({'font-size' : document.documentElement.clientWidth/7.0 + '%'});
};
$(document).ready(function() {
  updateBodyFontSize();
});
$(window).resize(function() {
  updateBodyFontSize();
});

// Helper method to get text from a reference
function getReferenceText(ref, refObjFunc) {
  if (ref.idRef != null) {
    if (ref.referredObject != null) {
      return refObjFunc(ref.referredObject);
    }
  } else if ((ref.text != null)) {
    return ref.text;
  }
}
