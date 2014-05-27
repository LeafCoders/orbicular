orbicularApp.factory('statusService', function() {
  var status = {};
  return {
    set: function(name, hasConnection) {
      status[name] = { hasConnection: hasConnection };
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
