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
        $scope.search_val = '';
      }

      // Set the color of the item name based on its quality.
      $scope.item_quality = function(quality) {
        if      (quality == 'Epic')         return {'color': 'purple'}
        else if (quality == 'Rare')         return {'color': 'blue'}
        else if (quality == 'Legendary')    return {'color': 'orange'}
        else                                return {'color': 'black'}
      }
      // Set the color of class names
      $scope.class_color = function(item_class) {
        if      (item_class == 'Warrior')       return {'color': '#C79C6E'}
        else if (item_class == 'Warlock')       return {'color': '#9482C9'}
        else if (item_class == 'Shaman')        return {'color': '#0070DE'}
        else if (item_class == 'Rogue')         return {'color': '#FFF569'}
        else if (item_class == 'Paladin')       return {'color': '#F58CBA'}
        else if (item_class == 'Mage')          return {'color': '#69CCF0'}
        else if (item_class == 'Hunter')        return {'color': '#ABD473'}
        else if (item_class == 'Death Knight')  return {'color': '#C41F3B'}
        else if (item_class == 'Druid')         return {'color': '#FF7D0A'}
        else if (item_class == 'Priest')        return {'color': '#FFFFFF'}
        else                                    return {'color': 'black'}
      }

      // select an item from results table
      $scope.select_search_item = function(item) {
        console.log('selected item: ', item.Name, '. slot: ', $scope.slot);
        selected_item = item;
      }

      /* Equips an item to corresponding slot selected.
      *  - Check if an item is selected first.
      *  - Check if the selected item can be equipped in corresponding slot.
      *  - Check if the current character can wield that type of item.
      *  - Make sure we cannot equip an offhand when a twohand is equipped.
      */
      $scope.equip_item = function() {
        var error_msg_1 = 'Select an item before trying to equip.';
        var error_msg_2 = 'Invalid item selection.';
        var error_msg_4 = 'Cannot equip an offhand while using a twohand.';
        $scope.message = '';
        var temp_slot = $scope.slot;
        temp_slot = remove_trailing_number(temp_slot);

        if (selected_item) {
          var error_msg_3 = 'You cannot equip ' + selected_item.Type + '.';

          //Special cases are so we can equip TwoHand in MainHand slot etc.
          if (compare_slot(temp_slot, selected_item, $scope.character)) {
            if (can_wield($scope.character, selected_item)) {
              if (!(char_items['mainhand'] &&
                char_items['mainhand'].Slot == 'TwoHand' &&
                $scope.character.class != 'warrior' && temp_slot != 'MainHand')) {

                console.log(is_unique($scope.slot, selected_item));
                // Equip the item and change the icon image.
                char_items[$scope.slot.toLowerCase()] = selected_item;
                set_slot_image($scope.slot);
              } else { $scope.message =  error_msg_4; }
            } else { $scope.message = error_msg_3; }
          } else { $scope.message = error_msg_2; }
        } else { $scope.message = error_msg_1; }
      }

      /* Function to find items for a given item slot and search value.
      *  - Make sure a item slot is selected before searching.
      *  - Make sure search value is above 2 characters long.
      *  - Remove trailing numbers after the slot (ex. Finger1/Trinket2)
      *  - Remove items that are not meant for the current character's class.
      *  - Show result table only when we have matching items for search value.
      */
      $scope.finditems = function() {
        var show_results = false; // used to show or hide results table

        if (!$scope.slot) {
          $scope.message = 'Select a item slot before searching for items.';
        } else if (!$scope.search_val || $scope.search_val.length < 3) {
          $scope.message = 'Enter a longer search value';
        } else {
          $scope.message = '';

          var temp_slot = $scope.slot;
          temp_slot = remove_trailing_number(temp_slot);

          $http.get('/wowdata/' + temp_slot + '.json').then(function(response){
            var all_items = response.data.items;
            var matching_items = [];
            var search_val = $scope.search_val.toLowerCase();

            // loop through all items
            angular.forEach(all_items, function(item, key){
              var item_name = item.Name.toLowerCase();
              var item_id = item.Id;

              if ($scope.search_type) {
                /* Filter out the items that have a required class that does
                   not match our chars */
                if (item.RequiredClasses &&
                  item.RequiredClasses.toLowerCase().indexOf($scope.character.class) > -1
                  || !item.RequiredClasses) {
                  // finding matching items based on item name
                  if ($scope.search_type == 'Name' && item_name.indexOf(search_val) > -1) {
                    matching_items.push(item);
                    show_result = true;
                  } // finding matching items based on item ID
                  else if (item_id.indexOf(search_val) == 0) {
                    matching_items.push(item);
                    show_result = true;
                  }
                }
              } else {
                $scope.message = 'Selected a search by.';
              }
            });
            // Hide or show result table based on whether there are any results
            $scope.show_result_table = function() {
              if (show_result)  return {'visibility': 'visible'}
              else              return {'visibility': 'hidden'}
            }
            $scope.items = matching_items;
          });
        }
      }

      // find the current character in database - see if it actually
      $http.get('/character/findchar/',
      {params:{"username":user_name, "charname":char_name}}).then(function(response){
          $scope.character = response.data[0];
      });
    });

}]);
