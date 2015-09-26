
/**
 * options accepts the following keys:
 *   url      Url to call
 *   request  Method to use when calling url: html, jsonp or get
 *   isArray  True if expected data is an array
 */
function createAPIGet($resource, $http, options) {
  return function(params, callback) {
    params = params ? params : '';
    if (options.request == 'html') {
      $http({ method: 'GET', url: options.url + params }).then(function(response) {
        callback(true, response.data);
      }, function() {
        // Failed to get data
        callback(false, null);
      });
    } else {
      var api = null
      if (options.request == 'jsonp') {
        var jsonCallback = (options.url.indexOf('?') == -1 ? '?' : '&') + 'callback=JSON_CALLBACK'; 
        api = $resource(options.url + params + jsonCallback, {}, {
          customGet: { method: 'JSONP', isArray: options.isArray, timeout: 10000, cache: false }
        });
      } else {
        api = $resource(options.url + params, {}, {
          customGet: { method: 'GET', isArray: options.isArray, timeout: 10000, cache: false }
        });
      }

      api.customGet(function(response) {
        callback(true, response);
      }, function() {
        // Failed to get data
        callback(false, null);
      });
    }
  };
}

/**
 * apiGetFn shall be a result of createAPIGet()
 * minutesGetDelay is the number of minutes between apiGetServise is called
 * params params to add to apiGetService
 * responseCallback shall be a method with two params: successfull and an array of data
 */
function createUpdateTimer(apiGetFn, minutesGetDelay, params, responseCallback) {
  var tick = function() {
    apiGetFn(params, function(success, dataArray) {
      if (success) {
        responseCallback(true, dataArray);
      } else {
        responseCallback(false)
      }
    });
  };

  minutesGetDelay = Math.max(1, Math.min(24*60, minutesGetDelay))
  setInterval(function() { tick(); }, 6000*minutesGetDelay);
  tick();
}

// Helper method to get text from a reference
function getReferenceOrText(obj, refObjFunc) {
  if (obj.ref != null) {
    return refObjFunc(obj.ref);
  } else if (obj.text != null) {
    return obj.text;
  }
}

function createDateObject(bookingDateString) {
  var bits = bookingDateString.split(/\D/);
  var bookingDateObject = new Date(bits[0], --bits[1], bits[2], bits[3], bits[4]);
  return bookingDateObject;
}

// Extend Date with week function
Date.prototype.getCurrentWeek = function(incWeeks) {
  incWeeks = incWeeks || 0;
  var date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(incWeeks*7 + date.getDate() + 3 - (date.getDay() + 6) % 7);
  var week1 = new Date(date.getFullYear(), 0, 4);
  var weekNr = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
  return { year: week1.getFullYear(), week: weekNr };
}
