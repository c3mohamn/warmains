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

      // Set the item slot that we are looking for.
      $scope.set_slot = function(slot) {
        $scope.slot = slot;
      }

      // Set the color of the item name based on its quality.
      $scope.item_quality = function(quality) {
        if (quality == 'Epic')
          return {'color': 'purple'}
        else if (quality == 'Rare')
          return {'color': 'blue'}
        else if (quality == 'Legendary')
          return {'color': 'orange'}
        else
          return {'color': 'black'}
      }

      // Function to find items for a given set item slot.
      $scope.finditems = function() {
        if (!$scope.slot) {
          $scope.message = 'Select a item slot before searching for items.';
        } else if (!$scope.search || $scope.search.length < 3) {
          $scope.message = 'Enter a longer search value';
        } else {
          $scope.message = '';
          $http.get('/wowdata/' + $scope.slot + '.json').then(function(response){
              var all_items = response.data.items;
              var matching_items = [];
              var search_val = $scope.search.toLowerCase();
              console.log(search_val);

              // loop through all items
              angular.forEach(all_items, function(item, key){
                // finding matching items to search value
                var item_name = item.Name.toLowerCase();
                if (item_name.indexOf(search_val) > -1) {
                  matching_items.push(item);
                }
              });
              console.log(matching_items);
              $scope.items = matching_items;
          });
        }
      }
        $http.get('/character/findchar/',
        {params:{"username":user_name, "charname":char_name}}).then(function(response){
            $scope.character = response.data[0];
            $scope.charname = response.data.name;

        });
    });

}]);
