
function BibelnSeService($resource, $http, statusService) {

  var minutesBetweenUpdates = 12*60;
  var bibelnSe = { data: null };

  /**
   * Get data from bibeln.se each 12 hours
   */
  if (settings.showBibelnSe) {
    var getDataFn = createAPIGet($resource, $http, { url: 'http://www.bibeln.se/pren/syndikering.jsp', request: 'html' });

    createUpdateTimer(getDataFn, minutesBetweenUpdates, null, function(success, data) {
      statusService.set("bibelnSe", success);
      if (success) {
        bibelnSe.data = BibelnSeConverter(data);
      }
    });
  }

  return {
    bibelnSe: bibelnSe
  }
}

orbicularApp.factory('bibelnSeService', BibelnSeService);