var editApp = angular.module("editApp", []);

// ng-right-click directive
editApp.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

editApp.controller('editctrl', ['$scope', '$http', '$compile', function($scope, $http, $compile) {

  /* --------- Globals --------- */
  $scope.orderByField = 'result_ilvl';
  $scope.reverseSort = false;
  $scope.error_msg = '';
  $scope.success_msg = '';
  $scope.Stats = {};
  $scope.updated_Stats = {};
  $scope.character = {};
  // all multipliers for enchants/gems currently equipped TODO: calculate at end
  $scope.multipliers = {};
  $scope.talent_points = {};
  $scope.cur_talents = {};
  $scope.talent_tooltips = [];

  //classes and corresponding specs for each class
  $scope.class_specs = {
    'death knight': ['blood', 'frost', 'unholy'],
    'druid': ['balance', 'feral', 'restoration'],
    'mage': ['arcane', 'fire', 'frost'],
    'paladin': ['holy', 'protection', 'retribution'],
    'priest': ['discipline', 'holy', 'shadow'],
    'rogue': ['assassination', 'combat', 'subtlety'],
    'shaman': ['elemental', 'enhancement', 'restoration'],
    'warlock': ['affliction', 'demonology', 'destruction'],
    'warrior': ['arms', 'fury', 'protection'],
    'hunter': ['beastmastery', 'marksmanship', 'survival']
  }


  /* --------- Functions --------- */

  // --------- Talent Functions

  /* Inserts the talents and into the DOM using info from all_talents based
   * on the class of the current character.
   */
  $scope.insert_talents = function() {
    var talents = all_talents[$scope.character.class];

    // Insert the backgrounds for each talent tree
    $('#tree-bg-left').attr('ng-style', "get_talent_img(0, 'background')");
    $('#tree-bg-center').attr('ng-style', "get_talent_img(1, 'background')");
    $('#tree-bg-right').attr('ng-style', "get_talent_img(2, 'background')");

    /* looping through all the talents and inserting them into their respective
     * locations in the talent tree. */
    for (var talent in talents) {
      var tree = talents[talent].tree,
          talent_name = talents[talent].name;
          row = talents[talent].row,
          col = talents[talent].col;

      // index of the tree used to get the name of the talent tree using class_specs
      var tree_index = 0;
      if (tree == 'center') tree_index = 1;
      if (tree == 'right') tree_index = 2;
      //console.log(talent, talents[talent].tree, talents[talent].row, talents[talent].col);

      // location of the talent in the DOM, determined by tree, row and col
      talent_loc = '.tree_' + tree + ' .r' + row + ' ' + '.c' + col + ' div';

      // replace empty spot with a talent spot
      $(talent_loc).removeClass('empty_talent_space');
      $(talent_loc).addClass('talent');
      $(talent_loc).attr('id', 'talent_' + talent);

      // set background image of talent
      $(talent_loc).attr('ng-style', "get_talent_img(" + tree_index + ", " + talent + ")");

      // set angular attributes for adding and removing talent points
      $(talent_loc).attr('ng-click', "add_point(" + talent + ")");
      $(talent_loc).attr('ng-right-click', "remove_point(" + talent + ")");
      $(talent_loc).attr('ng-class', "{'talent_inactive': is_inactive(" + talent + ")}");

      // add the tooltip
      $(talent_loc).attr('data-toggle', 'tooltip');
      $(talent_loc).attr('data-trigger', 'hover');
      $(talent_loc).attr('data-placement', 'bottom'); // TODO: make left/center/right
      $(talent_loc).attr('data-html', 'true');
      $(talent_loc).attr('data-original-title', talent_name);

      // insert the talent counter for the given talent into the DOM
      $(talent_loc).html("<div class='talent_counter' ng-class=\"{'maxed_talent': is_talent_maxed("
      + talent + ")}\">{{cur_talents[" + talent + "]}}</div>");
    }

    // compile used to compile angular attributes
    $compile($('.talent_tree'))($scope);
    $("body").tooltip({
      selector: '[data-toggle="tooltip"]'
    });
  }

  // TODO: Still need to fix up for different classes & add talent name/rank/next rank
  /* Insert the tooltips for each talent based on rank of talent. */
  $scope.talent_tooltip = function(talent) {
    if (rank[talent]) {
      return rank[talent][$scope.cur_talents[talent]];
    } else {
      return 'hello';
    }
  }

  // add a talent point to the talent
  $scope.add_point = function(talent) {
    var class_talents = all_talents[$scope.character.class],
        row = class_talents[talent].row,
        tree = class_talents[talent].tree,
        points_used = $scope.talent_points[tree].total,
        last_active_row = $scope.talent_points[tree].last_active_row,
        can_add = true;

    if (!$scope.permission)
      return false;

    // only add points to rows that are enabled
    if (points_used < 5 * row)
      can_add = false;
    // check if we have points remaining
    else if ($scope.talent_points.remaining <= 0)
      can_add = false;
    // check if talent is not already maxed
    else if ($scope.cur_talents[talent] >= class_talents[talent].max_rank)
      can_add = false;
    // make sure prequisite talents for current talent are fulfilled
    else if (class_talents[talent].requires) {
      if ($scope.cur_talents[class_talents[talent].requires] != class_talents[class_talents[talent].requires].max_rank)
        return false;
    }

    if (can_add) {
      // update talent point variables
      $scope.cur_talents[talent] += 1;
      $scope.talent_points[tree].row[row] += 1;
      $scope.talent_points[tree].total += 1;
      $scope.talent_points.remaining -= 1;
      if (last_active_row < row) $scope.talent_points[tree].last_active_row = row;
      // update tooltip while still hovered over
      //$('#talent_' + talent)
      //.attr('data-original-title', $scope.talent_tooltip(talent))
      //.parent().find('.tooltip-inner').html($scope.talent_tooltip(talent));
    }
  }

  // remove a talent point from talent
  $scope.remove_point = function(talent) {
    var class_talents = all_talents[$scope.character.class],
        row = class_talents[talent].row,
        tree = class_talents[talent].tree,
        points_used = $scope.talent_points[tree].total,
        last_active_row = $scope.talent_points[tree].last_active_row,
        can_remove = true;

    if (!$scope.permission)
      return false;

    // need to have points in there to remove it
    if ($scope.cur_talents[talent] <= 0)
      return false;

    // check it talent is prequisite for any talents down the road we chose
    if (class_talents[talent].allows) {
      for (var i=0; i < class_talents[talent].allows.length; i+=1) {
        if ($scope.cur_talents[class_talents[talent].allows[i]] > 0)
          return false;
      }
    }

    // check if talents further down the tree depend on this talent
    if (row != last_active_row) {
      var i = 0;
      while (last_active_row - i > row) {
        if (sum_rows(last_active_row - i, $scope.talent_points[tree].row) <= (last_active_row - i) * 5)
          return false;
        i += 1;
      }
    }

    if(can_remove) {
      $scope.cur_talents[talent] -= 1;
      $scope.talent_points[tree].row[row] -= 1;
      $scope.talent_points[tree].total -= 1;
      $scope.talent_points.remaining += 1;
      if (row == last_active_row && $scope.talent_points[tree].row[row] == 0)
        $scope.talent_points[tree].last_active_row -= 1;
    }
  }

  // Reset Talents points
  $scope.reset_talents = function() {
    // Resetting all talent variables to initial values
    for (var talent in $scope.cur_talents) {
      $scope.cur_talents[talent] = 0;
    }
    $scope.talent_points.remaining = 71;
    $scope.talent_points.left.total = 0;
    $scope.talent_points.center.total = 0;
    $scope.talent_points.right.total = 0;
    $scope.talent_points.left.last_active_row = 0;
    $scope.talent_points.center.last_active_row = 0;
    $scope.talent_points.right.last_active_row = 0;
    $scope.talent_points.left.row = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0};
    $scope.talent_points.center.row = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0};
    $scope.talent_points.right.row = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0};
  }

  // gets talent info for given rank + next rank
  $scope.display_talent_info = function(talent) {
    var cur_rank = $scope.cur_talents[talent];
    var next_rank = 0;
    if (rank[cur_rank + 1]) next_rank = cur_rank + 1;

    $scope.talent_info = rank[all_talents[$scope.character.class][talent].ranks][cur_rank];
    $scope.talent_info_next = rank[all_talents[$scope.character.class][talent].ranks][next_rank];
  }

  // returns url of image for talent
  $scope.get_talent_img = function(spec, talent) {
    var char_class = $scope.character.class.replace(/\s/g, ''); // remove empty space

    return {'background-image': 'url(/images/talents/' + char_class + '/' +
    $scope.class_specs[$scope.character.class][spec] + '/' + talent + '.jpg)'};
  }

  // check if talent has reached it's max rank.
  $scope.is_talent_maxed = function(talent) {
    var class_talents = all_talents[$scope.character.class];

    if ($scope.cur_talents[talent]) {
      //console.log(talent, cur_talents[talent].rank, cur_talents[talent]);
      return $scope.cur_talents[talent] == class_talents[talent].max_rank;
    }
    return false;
  }

  // return true if talent is inactive
  $scope.is_inactive = function(talent) {
    var class_talents = all_talents[$scope.character.class],
        row = class_talents[talent].row,
        tree = class_talents[talent].tree,
        points_used = $scope.talent_points[tree].total,
        remaining_points = $scope.talent_points.remaining;

    if (points_used < row * 5)
      return true;
    if (remaining_points == 0 && $scope.cur_talents[talent] == 0)
      return true;
    // check if talent has a prequisite talent
    if (class_talents[talent].requires) {
      var required_tal = class_talents[talent].requires;
      if ($scope.cur_talents[required_tal] != class_talents[required_tal].max_rank)
        return true;
    }
    return false;
  }


  /* Saves the current state of the character in db. */
  $scope.save_to_db = function() {
    $http.post('/character/saveChar', {
      char: char_items,
      gems: char_gems,
      enchants: char_enchants,
      spec: $scope.character.spec,
      talents: $scope.cur_talents,
      points: $scope.talent_points,
      charname: $scope.character.name
    }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
      $scope.error_msg = '';
      $scope.success_msg = 'Successfully saved.';
  }

  /* Reset the results table (when switching view). */
  $scope.reset_table = function() {
    $scope.items = [];
    $scope.search_val = '';
  }

  /* Updates base Stats with any multipliers and active Socket Bonuses */
  function update_stats() {

    // add any socketbonus to stats
    $scope.updated_Stats = bonus_stats($scope.Stats);

    // update multipliers and stats based on multipliers
    $scope.multipliers.ench = ench_multipliers;
    $scope.updated_Stats = multiply_stats($scope.multipliers.ench, $scope.updated_Stats);

    // add percentages of arp and hit rating as well
    add_percentages($scope.updated_Stats);
  }

  /* Mark the clicked item in results table as the currently selected item.
   */
  $scope.select_search_item = function(item) {
    console.log('selected item: ', item.Name, '. slot: ', item.Slot);
    selected_item = item;
    $scope.enchant_stats = item.Stats;
    if ($scope.gear_view == 'gems')
      set_slot_image('selected_gem', item);
    else if ($scope.gear_view == 'enchants')
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
        gear_view = $scope.gear_view,
        cur_socket = $scope.cur_socket;
    // reset messages
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (gear_view == 'enchants') {
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
    else if (gear_view == 'gems') {
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
    else if (gear_view == 'items') {
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
        gear_view = $scope.gear_view,
        cur_socket = $scope.cur_socket;
    //reset messages
    $scope.error_msg = '';
    $scope.success_msg = '';

    if (gear_view == 'enchants') {
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
    else if (gear_view == 'gems') {
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
    else if (gear_view == 'items') {
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
    var gear_view = $scope.gear_view;
    var gem_colour = $scope.gem_colour;
    var temp_slot = '';
    $scope.error_msg = ''; // reset error_msg

    if (!slot && gear_view != 'gems' && gear_view != 'enchants')
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
      if (gear_view == 'gems') temp_slot = 'Gems';
      if (gear_view == 'enchants') temp_slot = 'Enchants';

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
          if (gear_view != 'enchants' && !can_wield(item, char)) item_matches = false;
          else if (gear_view == 'gems' && gem_colour && gem_colour != item.Slot)
            item_matches = false;
          else if (gear_view == 'enchants' && slot) {
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
        char_class = $scope.character.class;

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
          }
        }
        update_stats();

        // talents
        if ($scope.character.talents) {
          $scope.cur_talents = $scope.character.talents;
        } else {
          // initialize talents
          for (var talent in all_talents[$scope.character.class]) {
            $scope.cur_talents[talent] = 0;
          }
        }
        if ($scope.character.points) {
          $scope.talent_points = $scope.character.points;
        } else {
          // initialize talent points
          $scope.talent_points = {
            remaining: 71,
            left: {
              last_active_row: 0,
              total: 0,
              row: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
            },
            center: {
              last_active_row: 0,
              total: 0,
              row: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
            },
            right: {
              last_active_row: 0,
              total: 0,
              row: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0}
            }
          };
        }
        $scope.insert_talents();
    });
  });
}]);
