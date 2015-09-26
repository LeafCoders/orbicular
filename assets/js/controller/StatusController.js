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
