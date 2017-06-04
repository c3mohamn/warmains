var searchApp = angular.module("searchApp", []);


searchApp.controller('searchCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.orderByField = 'class';
  $scope.reverseSort = false;

  // directs user to the character page
  $scope.char_page = function(user, char) {
    if (user && char) {
      var url = '/character/profile/' + user + '/' + char;
      window.location = url;
    } else {
      $scope.error_msg = 'Select or double click a row.';
    }
  }

  // assigns char as the currently selected char
  $scope.select = function(char) {
    $scope.selected_user = char.username;
    $scope.selected_name = char.name;
  }

  $scope.search = function(search_val, search_for) {
    if (!search_val) search_val = '';
    if (search_for == 'items') {

    }
    else { // characters

      $http.get('/search/findChars/',
      {params:{"search":search_val}}).then(function(response){
          $scope.characters = response.data;

          //console.log($scope.characters);
      });
    }
  }
}]);
