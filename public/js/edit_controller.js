var editApp = angular.module("editApp", []);

// Getting the data for the character from the URL
var cur_url = window.location.href;
cur_url = cur_url.split("/");
var char_name = cur_url.pop();
var user_name = cur_url.pop();

// Useful Variables
//var item_slot = "Back";

// Stores the items equipped for the current character
var char_items = {  head: null, neck: null, shoulders: null, back: null,
                    chest: null, wrist: null, hands: null, waist: null,
                    legs: null, feet: null, finger1: null, finger2: null,
                    trinket1: null, trinket2: null, mainhand: null,
                    offhand: null, ranged: null }

// Stores the currently selected item.
var selected_item = null;

editApp.controller('editctrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
    angular.element(document).ready(function () {

      $scope.char_items = char_items;

      /* Need to assign an item to each item slot display
         TODO: Need to fix this.....
         For now, make it so the image changes when you equip an item. 
      */
      $scope.set_slot_image = function () {
        return { 'background-image': 'url(' + char_items.head.IconPath + ')'}
      }

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
      // Set the color of class names
      $scope.class_color = function(item_class) {
        if (item_class == 'Warrior')
          return {'color': '#C79C6E'}
        else if (item_class == 'Warlock')
          return {'color': '#9482C9'}
        else if (item_class == 'Shaman')
          return {'color': '#0070DE'}
        else if (item_class == 'Rogue')
          return {'color': '#FFF569'}
        else if (item_class == 'Paladin')
          return {'color': '#F58CBA'}
        else if (item_class == 'Mage')
          return {'color': '#69CCF0	'}
        else if (item_class == 'Hunter')
          return {'color': '#ABD473'}
        else if (item_class == 'Death Knight')
          return {'color': '#C41F3B'}
        else if (item_class == 'Druid')
          return {'color': '#FF7D0A'}
        else if (item_class == 'Priest')
          return {'color': '#FFFFFF'}
        else
          return {'color': 'black'}
      }

      // select an item from results table
      $scope.select_search_item = function(item) {
        console.log('selected item: ', item.Name, '. slot: ', $scope.slot);
        selected_item = item;
      }

      $scope.equip_item = function() {
        char_items[$scope.slot.toLowerCase()] = selected_item;
      }
      // Function to find items for a given set item slot.
      $scope.finditems = function() {

        if (!$scope.slot) {
          $scope.message = 'Select a item slot before searching for items.';
        } else if (!$scope.search_val || $scope.search_val.length < 3) {
          $scope.message = 'Enter a longer search value';
        } else {
          $scope.message = '';
          $http.get('/wowdata/' + $scope.slot + '.json').then(function(response){
              var all_items = response.data.items;
              var matching_items = [];
              var search_val = $scope.search_val.toLowerCase();

              // loop through all items
              angular.forEach(all_items, function(item, key){
                // finding matching items to search value
                var item_name = item.Name.toLowerCase();
                var item_id = item.Id;
                if ($scope.search_type) {
                  if ($scope.search_type == 'Name' && item_name.indexOf(search_val) > -1) {
                    matching_items.push(item);
                  } else if (item_id.indexOf(search_val) == 0) {
                    matching_items.push(item);
                  }
                } else {
                  $scope.message = 'Selected a search by.';
                }
              });

              // Hide / show result table based on whether there are any results
              $scope.show_result_table = function() {
                if (matching_items.length > 0)
                  return {'visibility': 'visible'}
                else
                  return {'visibility': 'hidden'}
              }
              $scope.items = matching_items;
          });
        }
      }

      // find the current character in database - see if it actually
      $http.get('/character/findchar/',
      {params:{"username":user_name, "charname":char_name}}).then(function(response){
          $scope.character = response.data[0];
          $scope.charname = response.data.name;

      });
    });

}]);
