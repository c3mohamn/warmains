var editApp = angular.module("editApp", []);

editApp.controller('editctrl', ['$scope', '$http', '$location', function($scope, $http, $location) {

    angular.element(document).ready(function () {

      /* Saves the currently equipped items (from char_items) to database.
       */
      $scope.save_to_db = function() {
        $http.post('/character/saveItems', {
          char: char_items,
          charname: $scope.character.name
        }).then(function successCallback(response) {
            console.log(response);
          }, function errorCallback(response) {
            console.log(response);
          });
      }

      /* Changes what is currently visible on right hand side of page.
       * Switches between: Search, Stats
       */
      $scope.stats_view = function() {
        if ($scope.cur_view != 'stats') {
          return {'display': 'none'};
        } else return {'visibility': 'visible'};
      }
      $scope.search_view = function() {
        if ($scope.cur_view != 'search') {
          return {'display': 'none'};
        } else return {'visibility': 'visible'};
      }

      /* Sets the item slot to search for after clicking an empty item slot
       * in the character panel.
       *
       * cur_slot: currently selected slot.
       */
      $scope.set_slot = function(slot) {
        $scope.slot = slot;
      }

      /* Set the color of the item name based on its quality in results table.
       */
      $scope.item_quality = function(quality) {
        if      (quality == 'Epic')         return {'color': 'purple'}
        else if (quality == 'Rare')         return {'color': 'blue'}
        else if (quality == 'Legendary')    return {'color': 'orange'}
        else                                return {'color': 'black'}
      }

      /* Set the color of class names in results table. */
      $scope.class_color = function(item_class) {
        if      (item_class == 'Warrior')       return {'color': '#C79C6E'};
        else if (item_class == 'Warlock')       return {'color': '#9482C9'};
        else if (item_class == 'Shaman')        return {'color': '#0070DE'};
        else if (item_class == 'Rogue')         return {'color': '#FFF569'};
        else if (item_class == 'Paladin')       return {'color': '#F58CBA'};
        else if (item_class == 'Mage')          return {'color': '#69CCF0'};
        else if (item_class == 'Hunter')        return {'color': '#ABD473'};
        else if (item_class == 'Death Knight')  return {'color': '#C41F3B'};
        else if (item_class == 'Druid')         return {'color': '#FF7D0A'};
        else if (item_class == 'Priest')        return {'color': '#FFFFFF'};
        else                                    return {'color': 'black'};
      }

      /* Mark the clicked item in results table as the currently selected item.
       */
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
        var error_msg_3 = 'You cannot equip that type of item.';
        var error_msg_4 = 'Cannot equip an offhand while using a twohand.';
        var error_msg_5 = 'You cannot equip another one of those.';
        var slot = remove_trailing_number($scope.slot);
        var item = selected_item;
        var char = $scope.character;
        $scope.message = ''; // reset error message

        if (item) {
          if (compare_slot(slot, item, char)) {
            if (can_wield(item, char)) {
              if (!dual_twohand(slot, char)) {
                if (!already_equipped(slot, item)) {

                  // Equip the item and change the icon image.
                  char_items[$scope.slot.toLowerCase()] = item;
                  set_slot_image($scope.slot);

                } else { $scope.message = error_msg_5; }
              } else { $scope.message =  error_msg_4; }
            } else { $scope.message = error_msg_3; }
          } else { $scope.message = error_msg_2; }
        } else { $scope.message = error_msg_1; }
      }

      /* Finds matching items to search_val and displays them in results_table.
      *  - Make sure a item slot is selected before searching.
      *  - Remove trailing numbers after the slot (ex. Finger1/Trinket2)
      *  - Remove items that are not meant for the current character's class.
      *  - Show result table only when we have matching items for search value.
      *  - If search_val is null, return all items for given slot.
      *
      * search_val: value entered in the search bar.
      */
      $scope.finditems = function(search_val) {
        var slot = $scope.slot;
        var char = $scope.character;
        var min = $scope.ilvlmin;
        var max = $scope.ilvlmax;
        $scope.message = ''; // reset error message

        if (!slot)
          $scope.message = 'Select a item slot before searching for items.';
        else if (!valid_number(min))
          $scope.message = 'Invalid min ilvl.';
        else if (!valid_number(max))
          $scope.message = 'Invalid max ilvl.';
        else {

          if (!search_val) search_val = '';
          else search_val = search_val.toLowerCase();

          var temp_slot = remove_trailing_number(slot);

          $http.get('/wowdata/' + temp_slot + '.json').then(function(response){
            var all_items = response.data.items;
            var matching_items = [];

            // loop through all items
            angular.forEach(all_items, function(item, key){
              var item_name = item.Name.toLowerCase();
              var item_matches = true;

              // do not push item if item does not match requirements
              // wield? - matches ilvls? - matches search_val?
              if (!can_wield(item, char)) item_matches = false;
              else if (min && min > item.ItemLevel) item_matches = false;
              else if (max && max < item.ItemLevel) item_matches = false;
              else if (!(search_val == '')) {

                if (isNaN(search_val) && item_name.indexOf(search_val) < 0)
                  item_matches = false;
                else if (!isNaN(search_val) && item.Id.indexOf(search_val) != 0)
                  item_matches = false;
              }

              if (item_matches) matching_items.push(item);
            });

            // Hide or show result table based on whether there are any results
            $scope.show_result_table = function() {
              if (matching_items.length > 0)  return {'visibility': 'visible'}
              else                            return {'visibility': 'hidden'}
            }
            $scope.items = matching_items;
          });
        }
      }

      /* Find the current character in database and display the data ont he page
      */
      $http.get('/character/findchar/',
      {params:{"username":user_name, "charname":char_name}}).then(function(response1){
          $scope.character = response1.data[0];

          // Loop through the items of retrieved character and display data.
          for (var slot in char_items) {
            if ($scope.character[slot].item) {
              char_items[slot] = $scope.character[slot].item;
              set_slot_image(slot);
            }
          }
      });
    });
}]);
