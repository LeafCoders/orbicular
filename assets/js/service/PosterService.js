
function PosterService($resource, $http, statusService) {

  var minutesBetweenUpdates = 60;
  var posters = [];

  /**
   * Get posters each 60 minutes
   */
  if (settings.showPosters) {
    var apiGetFn = createAPIGet($resource, $http, { url: settings.rosetteBaseUrl + 'public/posters', request: 'json', isArray: true });

    createUpdateTimer(apiGetFn, minutesBetweenUpdates, null, function(success, dataArray) {
      statusService.set("poster", success);
      if (success) {
        posters.length = 0;
        Array.prototype.push.apply(posters, dataArray);
      }
    });
  }

  return {
    posters: posters
  }
}

orbicularApp.factory('posterService', PosterService);