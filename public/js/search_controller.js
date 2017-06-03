var searchApp = angular.module("searchApp", []);


searchApp.controller('searchCtrl', ['$scope', '$http', function($scope, $http) {

  // directs user to the character page
  $scope.char_page = function(user, char) {
    var url = '/character/profile/' + user + '/' + char;
    window.location = url;
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
      {params:{"charname":search_val}}).then(function(response){
          $scope.characters = response.data;

          //console.log($scope.characters);
      });
    }
  }
}]);
