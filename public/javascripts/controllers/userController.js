var app = angular.module('scotchTodo', []);

function mainController($scope, $http) {
  $scope.formData = {};


  $http.get('/users')
    .success(function(data) {
      $scope.users = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });

/*
  // when submitting the add form, send the text to the node API
  $scope.createTodo = function() {
    $http.post('/users', $scope.formData)
      .success(function(data) {
        $scope.formData = {}; // clear the form so our user is ready to enter another
        $scope.todos = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // delete
  $scope.deleteTodo = function(id) {
    $http.delete('/users' + id)
      .success(function(data) {
        $scope.todos = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
*/
}
