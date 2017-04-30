var editApp = angular.module("editApp", []);

// Getting the data for the character from the URL
var cur_url = window.location.href;
cur_url = cur_url.split("/");
var char_name = cur_url.pop();
var user_name = cur_url.pop();

// Useful Variables
//var item_slot = "Back";
//var items = [];

editApp.controller('editctrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
    angular.element(document).ready(function () {

      // Function to find items for a given item slot.
      $scope.finditems = function() {
        $http.get('/wowdata/' + $scope.pick_slot + '.json').then(function(response){
            $scope.items = response.data.items;
            var item_names = [];

            //angular.forEach(backs, function(item, key){
            //});
        });
      }
        $http.get('/character/findchar/',
        {params:{"username":user_name, "charname":char_name}}).then(function(response){
            $scope.character = response.data[0];
            $scope.charname = response.data.name;

        });
    });

}]);
