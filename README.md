# Realtime auctioning platform for a multiplayer game

## Overview

This Single Page Application (SPA) enables players place game tokens (bread, carrots or diamonds) up for auctioning.
Other players can bid for these tokens, after a time duration when no player has bidded, the auction ends and the auctioned tokens go to the highest bidder while the
coins used in purchasing are deducted from his/her account. The auctioner's inventory and coins also reflect the appropriate changes.


## Prerequisites

### Node.js and Tools

- Get [Node.js][node-download].
- Install the tool dependencies (`npm install`).

### MySQL


## Workings of the application

- The application filesystem layout structure is based on the [angular-seed] project.


### Installing dependencies

The application relies upon various node.js tools, such as Bower, Karma and Protractor.  You can
install these by running:

```
npm install
```

This will also run bower, which will download the angular files needed.

### Unit testing
Run:
```
npm test
```

### End to end testing
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
