var editApp = angular.module("editApp", []);

editApp.controller('editctrl', ['$scope', '$http', '$compile', function($scope, $http, $compile) {

  /* --------- Globals --------- */
  $scope.orderByField = 'result_ilvl';
  $scope.reverseSort = false;
  $scope.error_msg = '';
  $scope.success_msg = '';
  $scope.Stats = {};
  $scope.multipliers_meta = {};
  $scope.multipliers_enchants = {};


  /* ---------  Functions --------- */

  /* Reset the results table (when switching view). */
  $scope.reset_table = function() {
    $scope.items = [];
  }

  /* Mark the clicked item in results table as the currently selected item.
   */
  $scope.select_search_item = function(item) {
    console.log('selected item: ', item.Name, '. slot: ', $scope.slot);
    selected_item = item;
    if (is_gem_slot(item.Slot))   set_slot_image('selected_gem', item);
    else                          set_slot_image('selected', item);
  }

  /* Set the color of the item name based on its quality in results table. */
  $scope.item_quality = function(quality) {
    if      (quality == 'Epic')         return {'color': 'purple'}
    else if (quality == 'Rare')         return {'color': 'blue'}
    else if (quality == 'Legendary')    return {'color': 'orange'}
    else                                return {'color': 'black'}
  }

  /* Set the color of class name based on class in results table. */
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

  /* Update the stats of the character with the stats gained from the given item.
   *
   * item: item being equipped or unequipped.
   * equipping: true iff item is being equipped.
   * socket: if gem, the socket that the gem is in, null otherwise
   */
  $scope.update_stats = function(item, equipping, socket) {
    var slot = $scope.slot;

    // Do not show the special effects in stats table
    function no_specials(key) {
      if (key == "SpecialEffectCount" || key == "SpecialEffects")
        return false;
      return true;
    }

    // Remove the stats of the previously equipped item if exists
    if (char_items[slot] && !is_gem_slot(item.Slot)) {
      var old_stats = char_items[slot].Stats;
      for (var key in old_stats) {
        if (no_specials(key)) {
          stat_num = parseFloat(old_stats[key], 10);
          $scope.Stats[key] -= stat_num;
          if (slot == 'Head') {
            multiply_stats($scope.multipliers_meta, $scope.Stats, true);
            $scope.multipliers_meta = {};
          }
        }
        //console.log('Removing ', stat_num, ' from ', key);
      }
      // Remove the gem stats as well
      if (char_gems[slot].socket1)
        $scope.update_stats(char_gems[slot].socket1, false, 'socket1')
      if (char_gems[slot].socket2)
        $scope.update_stats(char_gems[slot].socket2, false, 'socket2')
      if (char_gems[slot].socket3)
        $scope.update_stats(char_gems[slot].socket3, false, 'socket3')

    } else if (char_gems[slot] && char_gems[slot][socket]) { // for gems
      var old_stats = char_gems[slot][socket].Stats;
      for (var key in old_stats) {
        if (no_specials(key)) {

          if (key.indexOf('Multiplier') >= 0) {
            multiply_stats($scope.multipliers_meta, $scope.Stats, true);
            $scope.multipliers_meta = {};
          } else {
            stat_num = parseFloat(old_stats[key], 10);
            $scope.Stats[key] -= stat_num;
          }

        }
      }
    }

    // Add the stats of item if we are equipping it.
    if (equipping) {
      var new_stats = item.Stats;
      for (var key in new_stats) {
        if (no_specials(key)) {

          if (key.indexOf('Multiplier') >= 0) {
            $scope.multipliers_meta[key] = new_stats[key];
          } else {
            stat_num = parseFloat(new_stats[key], 10);
            if (!$scope.Stats[key])
              $scope.Stats[key] = 0;
            $scope.Stats[key] += stat_num;
          }
          //console.log('Adding ', stat_num, ' to ', key);
        }
      }
      multiply_stats($scope.multipliers_meta, $scope.Stats, false);
    }
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

    if (char_items[slot] && $scope.slot != slot) {
      // Show gem sockets and their respective colours here.
      // Inserts the gem sockets if they exist as an <li> element
      remove_socket(3);
      if (char_items[slot].SocketColor3) {
        var colour = char_items[slot].SocketColor3;
        $scope.socket3 = colour;

        insert_gem_socket(slot, 3);
        $compile($("#socket3_slot"))($scope);

        if (char_gems[slot].socket3)
          set_slot_image('socket3', char_gems[slot].socket3)
        else set_gem_bg('socket3', colour);
      }

      remove_socket(2);
      if (char_items[slot].SocketColor2) {
        var colour = char_items[slot].SocketColor2;
        $scope.socket2 = colour;

        insert_gem_socket(slot, 2);
        $compile($("#socket2_slot"))($scope);

        if (char_gems[slot].socket2)
          set_slot_image('socket2', char_gems[slot].socket2)
        else set_gem_bg('socket2', colour);
      }

      remove_socket(1);
      if (char_items[slot].SocketColor1) {
        var colour = char_items[slot].SocketColor1;
        $scope.socket1 = colour;

        insert_gem_socket(slot, 1);
        $compile($("#socket1_slot"))($scope);

        if (char_gems[slot].socket1)
          set_slot_image('socket1', char_gems[slot].socket1)
        else set_gem_bg('socket1', colour);
      };
    }

    $scope.slot = slot;
  }

  /* Equips an item to corresponding slot selected.
   *  - Check if an item is selected first.
   *  - Check if the selected item can be equipped in corresponding slot.
   *  - Check if the current character can wield that type of item.
   *  - Make sure we cannot equip an offhand when a twohand is equipped.
   */
  $scope.equip_item = function() {
    var error_msg_1 = 'Select an item before trying to equip.';
    var error_msg_2 = 'That item is already equipped!';
    var error_msg_3 = 'Invalid item selection.';
    var error_msg_4 = 'You cannot equip that type of item.';
    var error_msg_5 = 'Cannot equip an offhand while using a twohand.';
    var error_msg_6 = 'You cannot equip another one of those.';
    var error_msg_7 = 'Select a gem before trying to equip.';
    var error_msg_8 = 'Select a slot to gem first please.';
    var error_msg_9 = 'Select a socket to gem.';
    var error_msg_10 = 'Invalid gem socket.';
    var item = selected_item;
    var slot = $scope.slot;
    var char = $scope.character;
    var cur_view = $scope.cur_view;
    var cur_socket = $scope.cur_socket;
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (cur_view == 'enchants') {
      $scope.error_msg = 'Not implemented just yet.';
      // TODO
    }
    else if (cur_view == 'gems') {
      if (item && is_gem_slot(item.Slot)) {
        if (slot) {
          if (cur_socket) {
            if (can_gem(item, $scope[cur_socket])) {

              // Socket gem, equip in tooltip, and update stats
              $scope.update_stats(item, true, cur_socket);
              char_gems[slot][cur_socket] = item;
              console.log(char_gems[slot]);
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
        //console.log(is_equipped(slot, item));
        if (!is_equipped(slot, item)) {
          var slot = remove_trailing_number(slot);
          if (compare_slot(slot, item, char)) {
            if (can_wield(item, char)) {
              if (!dual_twohand(slot, char)) {
                if (!is_unique($scope.slot, item)) {

                  // Equip item, change icon image and update stats
                  $scope.update_stats(item, true, null);
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
  }

  /* Unequips the item at $scope.slot. Removing stats, image and link.
   * If the current view is gems, then we unequip gem from the selected
   * item slot ($scope.slot).
   */
  $scope.unequip_item = function() {
    var slot = $scope.slot;
    var error_msg_1 = 'You must have slot selected first.';
    var error_msg_2 = 'Nothing to unequip.';
    var error_msg_3 = 'Select a socket to unequip.';
    var cur_view = $scope.cur_view;
    var cur_socket = $scope.cur_socket;
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (cur_view == 'enchants') {
      $scope.error_msg = 'Not implemented just yet.';
      //TODO: Remove enchant from slot
      // Update stats
    }
    else if (cur_view == 'gems') {
       if (cur_socket) {
         if (char_gems[slot][cur_socket]) {

           // Remove gem from current socket & char_gems and update stats
           var gem = char_gems[slot][cur_socket];
           $scope.success_msg = gem.Name + ' has been unequipped from '
           + slot + '.';
           $scope.update_stats(gem, false, cur_socket);
           char_gems[slot][cur_socket] = null;
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
          $scope.update_stats(char_items[slot], false, null);
          char_items[slot] = null;
          char_gems[slot].socket1 = null;
          char_gems[slot].socket2 = null;
          char_gems[slot].socket3 = null;
          remove_socket(1);
          remove_socket(2);
          remove_socket(3);
          remove_slot_image($scope.slot);

          //console.log(char_items[slot]);
        } else { $scope.error_msg = error_msg_2; }
      } else { $scope.error_msg = error_msg_1; }
    }
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

      if (slot) temp_slot = remove_trailing_number(slot);
      if (cur_view == 'gems') temp_slot = 'Gems';
      if (cur_view == 'enchants') temp_slot = 'Enchants';

      $http.get('/wowdata/' + temp_slot + '.json').then(function(response){
        var all_items = response.data.items;
        var matching_items = [];

        // loop through all items
        angular.forEach(all_items, function(item, key){
          var item_name = item.Name.toLowerCase();
          var item_matches = true;

          // do not push item if item does not match requirements
          // wield? - matches ilvls? - matches search_val?
          if (temp_slot != 'Enchants' && !can_wield(item, char)) item_matches = false;
          else if (cur_view == 'gems' && gem_colour && gem_colour != item.Slot)
            item_matches = false;
          else if (temp_slot == 'Enchants' && slot &&
                   slot != item.Slot) item_matches = false;
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
              $scope.update_stats(item, true, null);
              char_items[slot] = item;
              set_slot_image(slot, char_items[slot]);

              if ($scope.character[slot.toLowerCase()].gems) {
                var gems = $scope.character[slot.toLowerCase()].gems;
                if (gems.socket1) {
                  $scope.update_stats(gems.socket1, true, 'socket1')
                  char_gems[slot].socket1 = gems.socket1;
                }
                if (gems.socket2) {
                  $scope.update_stats(gems.socket2, true, 'socket2')
                  char_gems[slot].socket2 = gems.socket2;
                }
                if (gems.socket3) {
                  $scope.update_stats(gems.socket3, true, 'socket3')
                  char_gems[slot].socket3 = gems.socket3;
                }

                set_slot_rel(slot);
              }
            }
          }
      });
    });
}]);
