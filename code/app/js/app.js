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
    $stateProvider.state('login', {
	url: '/login',
	templateUrl: 'partials/login.html',
	controller: 'LoginCtrl'
    }).state('dashboard', {
	url: '/dashboard',
	params: {
	    login: false
	},
	templateUrl: 'partials/dashboard.html',
	controller: 'DashboardCtrl'
    });

    $urlRouterProvider.otherwise('login');

}]);

app.run(['$rootScope', '$state', '$stateParams', 'AuthService', function($rootScope, $state, $stateParams, AuthService) {
    $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
	if (!AuthService.isLoggedIn() && newUrl.split('#')[1] !== '/login') {
	    $state.go('login');
	    event.preventDefault();
	}	
    });
}]);
