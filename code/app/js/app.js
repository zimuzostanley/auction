'use strict';

/* App Module */
var app = angular.module('AuctionApp', [
    'ngResource',
    'ui.router',
    'Services',
    'Controllers',
    'Directives'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
//    $locationProvider.html5Mode(true);
    $stateProvider.state('login', {
	url: '/login',
	templateUrl: 'partials/login.html',
	controller: 'LoginCtrl'
    }).state('dashboard', {
	url: '/dashboard',
	templateUrl: 'partials/dashboard.html',
	controller: 'DashboardCtrl'
    });

    $urlRouterProvider.otherwise('login');

}]);

app.run(['$rootScope', '$state', '$stateParams', 'AuthService', function($rootScope, $state, $stateParams, AuthService) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
	if (!AuthService.isLoggedIn()) {
	    $state.go('login');
	    console.log("Route log prevent");
	    event.preventDefault();
	}
    });

    $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
	if (!AuthService.isLoggedIn()) {
	    $state.go('login');
	    console.log("Location log prevent");
	    event.preventDefault();
	}	
    });

    /* $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
       if (!AuthService.isLoggedIn()) {
       $state.go('login');
       console.log("State log prevent");
       event.preventDefault();
       }	
       }); */
}]);
