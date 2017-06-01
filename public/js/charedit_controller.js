var editApp = angular.module("editApp", []);

editApp.controller('editctrl', ['$scope', '$http', '$compile', function($scope, $http, $compile) {

  /* --------- Globals --------- */
  $scope.orderByField = 'result_ilvl';
  $scope.reverseSort = false;
  $scope.error_msg = '';
  $scope.success_msg = '';
  $scope.Stats = {};
  $scope.updated_Stats = {};
  // all multipliers for enchants/gems currently equipped TODO: calculate at end
  $scope.multipliers = {};


  /* ---------  Functions --------- */

  /* Reset the results table (when switching view). */
  $scope.reset_table = function() {
    $scope.items = [];
  }

  /* Updates base Stats with any multipliers and active Socket Bonuses */
  function update_stats() {

    // add any socketbonus to stats
    $scope.updated_Stats = bonus_stats($scope.Stats);

    // update multipliers and stats based on multipliers
    $scope.multipliers.ench = ench_multipliers;
    $scope.updated_Stats = multiply_stats($scope.multipliers.ench, $scope.updated_Stats);

  }

  /* Mark the clicked item in results table as the currently selected item.
   */
  $scope.select_search_item = function(item) {
    console.log('selected item: ', item.Name, '. slot: ', item.Slot);
    selected_item = item;
    $scope.enchant_stats = item.Stats;
    if ($scope.cur_view == 'gems')
      set_slot_image('selected_gem', item);
    else if ($scope.cur_view == 'enchants')
      set_slot_image('selected_enchant', item);
    else
      set_slot_image('selected', item);
  }

  /* Set the color of the item name based on its quality in results table. */
  $scope.item_quality = function(quality) {
    if      (quality == 'Epic')         return {'color': 'purple'}
    else if (quality == 'Rare')         return {'color': 'blue'}
    else if (quality == 'Legendary')    return {'color': 'orange'}
    else                                return {'color': 'black'}
  }

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


  /* Saves the current state of the character in db. */
  $scope.save_to_db = function() {
    $http.post('/character/saveItems', {
      char: char_items,
      gems: char_gems,
      enchants: char_enchants,
      charname: $scope.character.name
    }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
      $scope.error_msg = '';
      $scope.success_msg = 'Successfully saved.';
  }

  /* Sets the item slot to search for after clicking an empty item slot
   * in the character panel.
   *
   * cur_slot: currently selected slot.
   */
  $scope.set_slot = function(slot) {
    $scope.cur_socket = '';
    $scope.socket1 = '';
    $scope.socket2 = '';
    $scope.socket3 = '';
    remove_socket(3);
    remove_socket(2);
    remove_socket(1);

    // reset toggle when clicking a new item slot
    if ($scope.slot != slot)
      toggle_sockets = 0;

    if (char_items[slot] && toggle_sockets == 0) {
      toggle_sockets = 1;

      // Show gem sockets and their respective colours here.
      // Inserts the gem sockets if they exist as an <li> element
      if (char_items[slot].SocketColor3 || slot == 'Waist') {
        var colour = 'Prismatic'; // For Eternal Belt Buckle Extra socket

        if (slot != 'Waist') colour = char_items[slot].SocketColor3;
        $scope.socket3 = colour;

        insert_gem_socket(slot, 3);
        $compile($("#socket3_slot"))($scope);

        if (char_gems[slot].socket3)
          set_slot_image('socket3', char_gems[slot].socket3)
        else set_gem_bg('socket3', colour);
      }

      if (char_items[slot].SocketColor2) {
        var colour = char_items[slot].SocketColor2;
        $scope.socket2 = colour;

        insert_gem_socket(slot, 2);
        $compile($("#socket2_slot"))($scope);

        if (char_gems[slot].socket2)
          set_slot_image('socket2', char_gems[slot].socket2)
        else set_gem_bg('socket2', colour);
      }

      if (char_items[slot].SocketColor1) {
        var colour = char_items[slot].SocketColor1;
        $scope.socket1 = colour;

        insert_gem_socket(slot, 1);
        $compile($("#socket1_slot"))($scope);

        if (char_gems[slot].socket1)
          set_slot_image('socket1', char_gems[slot].socket1)
        else set_gem_bg('socket1', colour);
      };

      // TODO: Show enchant as well
      //if (char_enchants)
    } else toggle_sockets = 0;

    $scope.slot = slot;
  }

  /* Equips an item to corresponding slot selected.
   *  - Check if an item is selected first.
   *  - Check if the selected item can be equipped in corresponding slot.
   *  - Check if the current character can wield that type of item.
   *  - Make sure we cannot equip an offhand when a twohand is equipped.
   */
  $scope.equip_item = function() {
    var error_msg_1 = 'Select an item before trying to equip.',
        error_msg_2 = 'That item is already equipped!',
        error_msg_3 = 'Invalid item selection.',
        error_msg_4 = 'You cannot equip that type of item.',
        error_msg_5 = 'Cannot equip an offhand while using a twohand.',
        error_msg_6 = 'You cannot equip another one of those.',
        error_msg_7 = 'Select a gem before trying to equip.',
        error_msg_8 = 'Select an item slot to gem first please.',
        error_msg_9 = 'Select a socket to gem.',
        error_msg_10 = 'Invalid gem socket.',
        error_msg_11 = 'Select an enchant before trying to equip.',
        error_msg_12 = 'Select an item slot to enchant first please.',
        error_msg_13 = 'Select an item slot on the left before trying to enchant.',
        error_msg_14 = 'Cannot enchant that item.',
        item = selected_item,
        slot = $scope.slot,
        char = $scope.character,
        cur_view = $scope.cur_view,
        cur_socket = $scope.cur_socket;
    // reset messages
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (cur_view == 'enchants') {
      if (item && is_enchant(item)) {
        if (slot) {
          if (char_items[slot]) {
            if (can_enchant(item, char_items[slot], $scope.character.class)) {

              // enchant item to slot, change tooltip, update stats
              add_stats(char_enchants[slot], item, false, slot, $scope.Stats);
              char_enchants[slot] = item;
              console.log(char_enchants[slot]);
              set_slot_rel(slot);
              $scope.success_msg = "You have enchanted " + char_items[slot].Name
              + " with " + item.Name + '.';

            } else { $scope.error_msg = error_msg_14; }
          } else { $scope.error_msg = error_msg_13; }
        } else { $scope.error_msg = error_msg_12; }
      } else { $scope.error_msg = error_msg_11; }
    }
    else if (cur_view == 'gems') {
      if (item && is_gem(item)) {
        if (slot) {
          if (cur_socket) {
            if (can_gem(item, $scope[cur_socket])) {

              // Socket gem, equip in tooltip, and update stats
              add_stats(char_gems[slot][cur_socket], item, false, slot, $scope.Stats);
              char_gems[slot][cur_socket] = item;
              set_slot_image(cur_socket, item);
              set_slot_rel(slot);
              $scope.success_msg = "You have socketed " + item.Name +
              " into your " + slot + '.';

            } else { $scope.error_msg = error_msg_10; }
          } else { $scope.error_msg = error_msg_9; }
        } else { $scope.error_msg = error_msg_8; }
      } else { $scope.error_msg = error_msg_7; }
    }
    else if (cur_view == 'items') {
      if (item) {
        if (!is_equipped(slot, item)) {
          var slot = remove_trailing_number(slot);
          if (compare_slot(slot, item, char)) {
            if (can_wield(item, char)) {
              if (!dual_twohand(slot, char)) {
                if (!is_unique($scope.slot, item)) {

                  // Equip item, change icon image and update stats
                  add_stats(char_items[$scope.slot], item, true, slot, $scope.Stats);
                  char_items[$scope.slot] = item;
                  set_slot_image($scope.slot, item);
                  $scope.success_msg = item.Name + 'has been equipped!';

                } else { $scope.error_msg = error_msg_6; }
              } else { $scope.error_msg =  error_msg_5; }
            } else { $scope.error_msg = error_msg_4; }
          } else { $scope.error_msg = error_msg_3; }
        } else { $scope.error_msg = error_msg_2; }
      } else { $scope.error_msg = error_msg_1; }
    }
    update_stats();
  }

  /* Unequips the item at $scope.slot. Removing stats, image and link.
   * If the current view is gems, then we unequip gem from the selected
   * item slot ($scope.slot).
   */
  $scope.unequip_item = function() {
    var slot = $scope.slot,
        error_msg_1 = 'You must have item selected first.',
        error_msg_2 = 'Nothing to unequip.',
        error_msg_3 = 'Select a socket to unequip.',
        cur_view = $scope.cur_view,
        cur_socket = $scope.cur_socket;
    //reset messages
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (cur_view == 'enchants') {
      if (slot) {
        if (char_enchants[slot]) {

          // Remove enchant from tooltip, char_enchants and update stats
          $scope.success_msg = char_enchants[slot].Name + ' has been removed from '
          + slot + '.';
          //TODO: update stats
          remove_stats(char_enchants[slot], false, slot, $scope.Stats);
          char_enchants[slot] = null;
          set_slot_rel(slot);

        } else { $scope.error_msg = error_msg_2; }
      } else { $scope.error_msg = error_msg_1; }


    }
    else if (cur_view == 'gems') {
       if (cur_socket) {
         if (char_gems[slot][cur_socket]) {

           // Remove gem from current socket & char_gems and update stats
           var gem = char_gems[slot][cur_socket];
           $scope.success_msg = gem.Name + ' has been unequipped from '
           + slot + '.';
           remove_stats(gem, false, slot, $scope.Stats);
           char_gems[slot][cur_socket] = null;
           set_slot_rel(slot);
           set_gem_bg(cur_socket, $scope[cur_socket]);

         } else { $scope.error_msg = error_msg_2; }
       } else { $scope.error_msg = error_msg_3; }
    }
    else if (cur_view == 'items') {
      if (slot) {
        if (char_items[slot]) {

          // Remove item from current slot & char_items, remove sockets, and
          // update stats.
          $scope.success_msg = char_items[slot].Name + ' has been unequipped.';
          remove_stats(char_items[slot], true, slot, $scope.Stats);
          char_items[slot] = null;
          char_gems[slot].socket1 = null;
          char_gems[slot].socket2 = null;
          char_gems[slot].socket3 = null;
          char_enchants[slot] = null;
          remove_socket(1);
          remove_socket(2);
          remove_socket(3);
          remove_slot_image($scope.slot);

          //console.log(char_items[slot]);
        } else { $scope.error_msg = error_msg_2; }
      } else { $scope.error_msg = error_msg_1; }
    }
    update_stats();
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
    var cur_view = $scope.cur_view;
    var gem_colour = $scope.gem_colour;
    var temp_slot = '';
    $scope.error_msg = ''; // reset error_msg

    if (!slot && cur_view != 'gems' && cur_view != 'enchants')
      $scope.error_msg = 'Select a item slot before searching for items.';
    else if (!valid_number(min))
      $scope.error_msg = 'Invalid min ilvl.';
    else if (!valid_number(max))
      $scope.error_msg = 'Invalid max ilvl.';
    else {

      if (!search_val) search_val = '';
      else search_val = search_val.toLowerCase();

      var temp_slot2 = '';
      if (slot) {
        temp_slot = remove_trailing_number(slot);
        temp_slot2 = remove_trailing_number(slot);
      }
      if (cur_view == 'gems') temp_slot = 'Gems';
      if (cur_view == 'enchants') temp_slot = 'Enchants';

      console.log(temp_slot2, slot);

      $http.get('/wowdata/' + temp_slot + '.json').then(function(response){
        var all_items = response.data.items;
        var matching_items = [];

        // loop through all items
        angular.forEach(all_items, function(item, key){
          var item_name = item.Name.toLowerCase();
          var item_matches = true;

          // do not push item if item does not match requirements
          // wield? - matches ilvls? - matches search_val?
          if (cur_view != 'enchants' && !can_wield(item, char)) item_matches = false;
          else if (cur_view == 'gems' && gem_colour && gem_colour != item.Slot)
            item_matches = false;
          else if (cur_view == 'enchants' && slot) {
            if (slot == 'MainHand') {
              if (item.Slot != 'TwoHand' && item.Slot != 'OneHand')
                item_matches = false;
            }
            else if (temp_slot2 != item.Slot) item_matches = false;
          }
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

        /*// Hide or show result table based on whether there are any results
        $scope.show_result_table = function() {
          if (matching_items.length > 0)  return {'visibility': 'visible'}
          else                            return {'visibility': 'hidden'}
        }*/
        $scope.items = matching_items;
      });
    }
  }

    angular.element(document).ready(function () {

      /* Find the current character in database and display the data ont he page
      */
      $http.get('/character/findchar/',
      {params:{"username":user_name, "charname":char_name}}).then(function(response1){
          $scope.character = response1.data[0];

          // Loop through the items of retrieved character and display data.
          for (var slot in char_items) {
            if ($scope.character[slot.toLowerCase()] &&
                $scope.character[slot.toLowerCase()].item) {
              var item = $scope.character[slot.toLowerCase()].item;
              add_stats(null, item, false, slot, $scope.Stats);
              char_items[slot] = item;
              set_slot_image(slot, char_items[slot]);

              if ($scope.character[slot.toLowerCase()].gems) {
                var gems = $scope.character[slot.toLowerCase()].gems,
                    enchant = $scope.character[slot.toLowerCase()].enchant;
                if (gems.socket1) {
                  add_stats(null, gems.socket1, false, slot, $scope.Stats);
                  char_gems[slot].socket1 = gems.socket1;
                }
                if (gems.socket2) {
                  add_stats(null, gems.socket2, false, slot, $scope.Stats);
                  char_gems[slot].socket2 = gems.socket2;
                }
                if (gems.socket3) {
                  add_stats(null, gems.socket3, false, slot, $scope.Stats);
                  char_gems[slot].socket3 = gems.socket3;
                }
                if (enchant) {
                  add_stats(null, enchant, false, slot, $scope.Stats);
                  char_enchants[slot] = enchant;
                }

                set_slot_rel(slot);
              }
              update_stats();
            }
          }
      });
    });
}]);
