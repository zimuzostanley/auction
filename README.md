# Realtime auctioning platform for a multiplayer game

## Overview

This Single Page Application (SPA) enables players place game tokens (bread, carrots or diamonds) up for auctioning.
Other players can bid for these tokens, after a time duration when no player has bidded, the auction ends and the auctioned tokens go to the highest bidder while the
coins used in purchasing are deducted from his/her account. The auctioner's inventory and coins also reflect the appropriate changes.


## Prerequisites

### Node.js and Tools

- Get Node.js from https://nodejs.org/en/download/
- Install the tool dependencies (`npm install`).

### MySQL
- See http://dev.mysql.com/doc/refman/5.7/en/installing.html for install instructions for your platform
- Create a MySQL user and change the MySQL username and password in the ```code/scripts/startup.sh``` file
- cd into the code/ directory and run:

```
chmod +x scripts/startup.sh
bash scripts/startup.sh
```


## Workings of the application

- The application filesystem layout structure is based on the [angular-seed] project.


### Installing dependencies

The application relies upon various node.js tools, such as Bower, Karma and Protractor.  You can
install these by running:

```
npm install
```

This will also run bower, which will download the angular files needed.

### Unit testing using Karma/Mocha
Run:
```
npm test
```

### End to end testing using Protractor/Jasmine
Start local server:
```
npm start
```

Run:
```
npm install -g protractor

webdriver-manager update

webdriver-manager start

npm run protractor
```

## Application Directory Layout
    server.js   		--> Http and Websocket server
    auction.js		--> Auction class
    app/                --> all of the files to be used in production
      css/              --> css files
        app.css         --> default stylesheet
      img/              --> image files
      index.html        --> app layout file (the main html template file of the app)
      js/               --> javascript files
        app.js          --> the main application module
        controllers.js  --> application controllers
        directives.js   --> application directives
        services.js     --> custom angular services
      partials/         --> angular view partials (partial html templates) used by ngRoute
        login.html	--> login template
        dashboard.html	--> dashboard template
	stats.html	--> stats widget
	inventory.html	--> inventory widget
	auction.html	--> auction widget
      bower_components  --> 3rd party js libraries, including angular and jquery

    scripts/            --> handy scripts
      startup.sh	--> bash script to create schema and populate db with dummy data
      sql/              --> database initialization
        init.sql	--> MySQL script to create the database schema
	populate.js	--> Javascript file to populate the db with dummy data
    test/               --> test source files and libraries
      karma.conf.js        --> config file for running unit tests with Karma
      protractor-conf.js   --> config file for running e2e tests with Protractor
      e2e/
        scenarios.js       --> end-to-end specs
      unit/             --> unit level specs/tests
        controllersSpec.js --> specs for controllers
        directivesSpec.js  --> specs for directives
        servicesSpec.js    --> specs for services

## Issue
- Some disparity in the timing of the server and client. This leads to spurious behaviour when, say, the server finishes counting down to an auction, meanwhile the client
is still counting down to the user. Maybe, NTP could help. I think that's a bit overkill though.
- A related but even more noticeable issue was that chrome and some other browsers, pause long running background activity when the tab is not in focus. The timer was beign paused and it was causing a noticeable lag in the time remainging on the server and browser. I listened to the ```window.onfocus``` event and refresh the page, whenever the tab came in focus.
- Currently, there's no support for atomicity of the operations at auction completion or other critical stages. I intend to use the facilities of MySQL to group the critical operations as atomic operations.

## Suggestion
- I think in future Jasmine should be specified as the testing framework. It's very similar to Mocha and is self contained, in that it comes with an assertion library and a mocking library that would be suitable for most needs in a project like this. Besides, Protractor, a really helpful test-runner advertises strong support for Jasmine. This would help prevent needless errors when applicants try to use a less supported tool for a job.

