var App = angular.module('App', []);

App.config(function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'views/d.html'
    }).when('/dashboard', {
        templateUrl: 'views/d.html'
    }).when('/reports', {
        templateUrl: 'views/r.html'
    });
});
