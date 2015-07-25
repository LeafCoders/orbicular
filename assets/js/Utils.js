
/**
 * options accepts the following keys:
 *   name     Name of created fetch service
 *   url      Url to call
 *   request  Method to use when calling url: html, jsonp or get
 *   isArray  True if expected data is an array
 */
function createFetchService(options) {
  orbicularApp.factory(options.name, function($resource, $http) {
    return {
      fetchData : function(params, callback) {
        params = params ? params : '';
        if (options.request == 'html') {
          $http({ method: 'GET', url: options.url + params }).then(function(response) {
            callback(true, response.data, index);
          }, function() {
            // Failed to fetch data
            callback(false, null, index);
          });
        } else {
          var api = null
          if (options.request == 'jsonp') {
            var jsonCallback = (options.url.indexOf('?') == -1 ? '?' : '&') + 'callback=JSON_CALLBACK'; 
            api = $resource(options.url + params + jsonCallback, {}, {
              fetch: { method: 'JSONP', isArray: options.isArray, timeout: 10000, cache: false }
            });
          } else {
            api = $resource(options.url + params, {}, {
              fetch: { method: 'GET', isArray: options.isArray, timeout: 10000, cache: false }
            });
          }

          api.fetch(function(response) {
            callback(true, response);
          }, function() {
            // Failed to fetch data
            callback(false, null);
          });
        }
      }
    }
  });
}

/**
 * fetchService shall be a result of createFetchService()
 * minutesFetchDelay is the number of minutes between fetchServise is called
 * params params to add to fetchService
 * responseCallback shall be a method with two params: successfull and an array of data
 */
function createUpdateTimer(fetchService, minutesFetchDelay, params, responseCallback) {
  var tick = function() {
    fetchService.fetchData(params, function(success, dataArray) {
      if (success) {
        responseCallback(true, dataArray);
      } else {
        responseCallback(false)
      }
    });
  };

  fetchDelay = Math.max(1, Math.min(24*60, minutesFetchDelay))
  setInterval(function() { tick(); }, 6000*minutesFetchDelay);
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
