var editApp = angular.module("editApp", []);

editApp.controller('editctrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

    angular.element(document).ready(function () {

      $scope.char_items = char_items;

      /* Need to assign an item to each item slot display
         TODO: Need to fix this.....
         For now, make it so the image changes when you equip an item.
      */

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

      // TODO: ADD CONDITIONS FOR TYPES OF ARMOR THAT CAN BE EQUIPPED BY CERTAIN CLASS
      $scope.equip_item = function() {
        if (selected_item) {
          if (selected_item.Slot == $scope.slot) {
              if (can_wield($scope.character, selected_item)) {
                char_items[$scope.slot.toLowerCase()] = selected_item;
                set_slot_image($scope.slot);
              } else {
                $scope.message = 'You cannot equip ' + selected_item.Type + '.';
              }
          } else {
            $scope.message = 'Select the correct item slot!';
          }
        } else {
          $scope.message = 'Select an item before trying to equip.';
        }
      }
      // Function to find items for a given set item slot.
      $scope.finditems = function() {

        if (!$scope.slot) {
          $scope.message = 'Select a item slot before searching for items.';
        } else if (!$scope.search_val || $scope.search_val.length < 3) {
          $scope.message = 'Enter a longer search value';
        } else {
          $scope.message = '';

          var temp_slot = $scope.slot;
          var last_char = temp_slot[temp_slot.length - 1];

          // Remove the 1 from Finger1 when searching for items.
          if (last_char == '1' || last_char == '2') {
            temp_slot = temp_slot.slice(0, temp_slot.length - 1);
          }
          //var all_items = [];

          $http.get('/wowdata/' + temp_slot + '.json').then(function(response){
              var all_items = response.data.items;
              var matching_items = [];
              var search_val = $scope.search_val.toLowerCase();

              //TODO: Add TwoHand and OneHand weapons to MainHand list.

              // loop through all items
              angular.forEach(all_items, function(item, key){
                // finding matching items to search value
                var item_name = item.Name.toLowerCase();
                var item_id = item.Id;
                if ($scope.search_type) {
                  /* Filter out the items that have a required class that does
                     not match our chars */
                  if (item.RequiredClasses &&
                    item.RequiredClasses.toLowerCase().indexOf($scope.character.class) > -1
                    || !item.RequiredClasses) {
                    if ($scope.search_type == 'Name' && item_name.indexOf(search_val) > -1) {
                      matching_items.push(item);
                    } else if (item_id.indexOf(search_val) == 0) {
                      matching_items.push(item);
                    }
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

      //TODO: Create a function to search for items in JSON file.
      // Retrieves list of all items from item slot
      $scope.get_items = function(item_slot) {
        $http.get('/wowdata/' + item_slot + '.json').then(function(response) {
          return respone.data.items;
        });
      }

      // find the current character in database - see if it actually
      $http.get('/character/findchar/',
      {params:{"username":user_name, "charname":char_name}}).then(function(response){
          $scope.character = response.data[0];
      });
    });

}]);
