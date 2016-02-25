orbicular
=========

Kiosk display web application for events, posters and bookings. The data is fetched from a Rosette server.

Setup
-----

* Download the source
* Create a folder in the root named `custom`
* Create a file named `Settings.js` in the `custom` folder
* Overrride settings that are specified in file `assets/js/Settings.js`. Like this:

  ```
  settings.showBookings = false;  
  settings.logoSrc = './custom/mylogo.png';  
  settings.welcomeContent = '<p>"This is the welcome text."</p>';
  ```

* Start the application by open `index.html` with either Safari, Chrome or Firefox.


As window application
---------------------

We had a lot of problems running Chrome in kiosk mode. After restarting Chrome it often showed a dialog
saying "Google Chrome didn't shut down correctly". To prevent this we use [Electron](http://electron.atom.io).  

Setup Electron to run Orbiclar with these steps:

* Download latest release of Electron https://github.com/atom/electron/releases/latest
* Unpack to get this folder structure:

  ```
  app/  
  ├── orbicular/  
      ├── index.html  
      ├── electron-main.js  
      ├── package.json  
      ├── ...  
  ├── electron/  
      ├── electron.exe / electron / Electron.app
  ```

* Run the following command from the app folder:

  ```
  windows$ .\electron\electron.exe orbicular\  
    linux$ ./electron/electron orbicular/  
      osx$ ./electron/Electron.app/Contents/MacOS/Electron orbicular/  
  ```
