function StatusService() {
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
};

orbicularApp.factory('statusService', StatusService);