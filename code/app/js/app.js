'use strict';

/* App Module */
var app = angular.module('auctionApp', [
    'ngResource',
    'ngRoute',
    'Services',
    'Controllers',
    'Directives'
]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
	url: '/login',
	templateUrl: 'partials/login.html'
    }).state('dashboard', {
	url: '/dashboard',
	templateUrl: 'partials/dashboard.html'
    });

}]);
