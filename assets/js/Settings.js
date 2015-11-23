// These settings can be overridden by creating a file named 'custom/Settings.js' in root path

var settings = {
  // Base url to Rosette server
  rosetteBaseUrl : "http://localhost:9000/api/v1/",

  // Enable data to show
  showPosters : true,
  showBookings : true,
  showEvents : true,
  showBibelnSe : true,

  // Will terminate chrome at specified time if extension 'Close Kiosk' is installed. Eg. "03:50"
  terminateTime : null,

  logoSrc : './assets/img/logotype.jpg',
  
  welcomeContent : '<p>till oss...</p>'
};
