orbicular
=========

Kiosk display web application for events, posters and bookings. The data is fetched from a Rosette server.

Setup
-----

* Download the source
* Create a folder in the root named `custom`
* Create a file named `Settings.js` in the `custom` folder
* Overrride settings that are specified in file `assets/js/Settings.js`. Like this:

  > settings.showBookings = false;  
  > settings.logoSrc = './custom/mylogo.png';  
  > settings.welcomeContent = '<p>"This is the welcome text."</p>';

* Install Chomre extension "Close Kiosk" and set setting `terminateTime` to `03:55` to
  exit kiosk mode and terminate Chrome gracefully at time 03:55. 
* Start the application by opening `index.html` with either Safari, Chrome or Firefox.
