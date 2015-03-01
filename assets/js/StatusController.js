orbicularApp.factory('statusService', function() {
  var status = {};
  return {
    set: function(name, hasConnection) {
      status[name] = { hasConnection: hasConnection };
      if (!hasConnection) {
        console.log('Service "' + name + '" failed to fetch new data at ' + new Date());
      }
    },
    status: status
  };
});


/*
 * Shows status for each fetch service
*/
function StatusController($scope, statusService) {
  $scope.$watch(function() {
    return statusService.status;
  }, function(status) {
    $scope.status = status;
  }, true);
}

orbicularApp.controller('StatusController', StatusController);
