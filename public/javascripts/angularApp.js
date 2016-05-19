(function() {
  "use strict";

  var app = angular.module("mobiliteit", [
    "mobiliteit.controllers.parking",
    "mobiliteit.controllers.nav",
    "mobiliteit.services.parking",
    "ui.router"
  ]);

  app.config([
    "$stateProvider",
    "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {
      $stateProvider.state("root", {
        abstract: true,
        views: {
          "header": {
            templateUrl: "partials/navbar",
            controller: "NavController"
          }
        }
      });

      $urlRouterProvider.otherwise("home");
    }
  ]);
})();
