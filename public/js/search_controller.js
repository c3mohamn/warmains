var searchApp = angular.module("searchApp", []);


searchApp.controller('searchCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.orderByField = 'class';
  $scope.reverseSort = false;

  /* Set the color of class name based on class in results table. */
  $scope.class_color = function(class_name) {
    if (class_name) class_name = class_name.toLowerCase();
    if      (class_name == 'warrior')       return {'color': '#C79C6E'};
    else if (class_name == 'warlock')       return {'color': '#9482C9'};
    else if (class_name == 'shaman')        return {'color': '#0070DE'};
    else if (class_name == 'rogue')         return {'color': '#FFF569'};
    else if (class_name == 'paladin')       return {'color': '#F58CBA'};
    else if (class_name == 'mage')          return {'color': '#69CCF0'};
    else if (class_name == 'hunter')        return {'color': '#ABD473'};
    else if (class_name == 'death knight')  return {'color': '#C41F3B'};
    else if (class_name == 'druid')         return {'color': '#FF7D0A'};
    else if (class_name == 'priest')        return {'color': '#FFFFFF'};
    else                                    return {'color': 'black'};
  }

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
