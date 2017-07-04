var editApp = angular.module("editApp", []);

editApp.controller('editCtrl', ['$scope', '$http', '$compile', function($scope, $http, $compile) {

  /* --------- Variables --------- */
  $scope.orderByField = 'result_ilvl';
  $scope.reverseSort = true;
  $scope.error_msg = '';
  $scope.success_msg = '';
  $scope.stats = {}; // stores the stats after updating with multipliers
  $scope.character = {}; // stores all character information on load
  $scope.multipliers = {}; // stores multipliers gained from gems/enchants
  $scope.talent_points = {}; // stores additional talent point information
  $scope.major_glyphs = {}; // stores all major glyphs for current character's class
  $scope.minor_glyphs = {}; // stores all minor glyphs for current character's class
  $scope.glyph_results = {}; // glyphs that will be displayed in table for user
  $scope.cur_glyph_slot = 0; // the currently selected glyph

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

  // list of all available profs used to populate details>prof section
  $scope.all_profs = [
    'blacksmithing', 'enchanting', 'engineering', 'inscription', 'jewelcrafting'
  , 'leatherworking', 'tailoring'];

  // list of all races
  $scope.all_races = [
    'human', 'dwarf', 'night elf', 'gnome', 'draenei',
    'orc', 'undead', 'tauren', 'troll', 'blood elf'
  ];

  /* --------- Functions --------- */



  // ------------ DETAILS FUNCTIONS START ---------------

  // Add prof to character's professions
  $scope.add_prof = function(prof, num) {
    var old_prof = prof;
    // TODO: make sure we remove profession perks when we remove/change profession
    //remove_perks(old_prof);

    // make sure we cannot add the same prof twice
    if ($scope.has_prof(prof, 1) || $scope.has_prof(prof, 2))
      return false;
    char_professions[num] = prof;
    $scope.character.professions[num] = prof;
    //console.log(char_professions, 'after');
  }

  // Remove prof perks from character
  function remove_perks(prof) {
    //TODO
    return false;
  }

  // Add perks to character
  function add_perks(prof) {
    //TODO
  }

  // return true iff character has profession
  $scope.has_prof = function(prof, num) {
    if (char_professions[num] == prof)
      return true;
    return false;
  }

  // Change character's race
  $scope.change_race = function(race) {
    $scope.error_msg = '';
    $scope.success_msg = '';
    // check if we can change to race first.
    if (valid_race($scope.character.class, race)) {
      $scope.character.race = race;
      $scope.success_msg = 'Race changed to ' + race + '.';
    } else {
      $scope.error_msg = race + ' ' +  $scope.character.class + 's do not exist\
      in wotlk.';
    }
  }
  // ------------ DETAILS FUNCTIONS END ---------------



  // ------------ TALENT FUNCTIONS START ---------------

  // Returns the amount of points spent on talent
  $scope.get_talent_count = function(talent) {
    return char_talents[talent];
  }

  // add a talent point to the talent
  $scope.add_point = function(talent) {
    var class_talents = all_talents[$scope.character.class],
        row = class_talents[talent].row,
        tree = class_talents[talent].tree,
        points_used = $scope.talent_points[tree].total,
        last_active_row = $scope.talent_points[tree].last_active_row;

    if (!$scope.permission)
      return false;

    // only add points to rows that are enabled
    if (points_used < 5 * row)
      return false;
    // check if we have points remaining
    else if ($scope.talent_points.remaining <= 0)
      return false;
    // check if talent is not already maxed
    else if (char_talents[talent] >= class_talents[talent].max_rank)
      return false;
    // make sure prequisite talents for current talent are fulfilled
    else if (class_talents[talent].requires) {
      if (char_talents[class_talents[talent].requires] != class_talents[class_talents[talent].requires].max_rank)
        return false;
    }

    // update talent point variables
    char_talents[talent] += 1;
    $scope.talent_points[tree].row[row] += 1;
    $scope.talent_points[tree].total += 1;
    $scope.talent_points.remaining -= 1;
    if (last_active_row < row) $scope.talent_points[tree].last_active_row = row;
    // update tooltip while still hovered over
    $('#talent_' + talent)
    .attr('data-original-title', $scope.talent_tooltip(talent))
    .parent().find('.tooltip-inner').html($scope.talent_tooltip(talent));
  }

  // remove a talent point from talent
  $scope.remove_point = function(talent) {
    var class_talents = all_talents[$scope.character.class],
        row = class_talents[talent].row,
        tree = class_talents[talent].tree,
        points_used = $scope.talent_points[tree].total,
        last_active_row = $scope.talent_points[tree].last_active_row;

    if (!$scope.permission)
      return false;

    // need to have points in there to remove it
    if (char_talents[talent] <= 0)
      return false;

    // check it talent is prequisite for any talents down the road we chose
    if (class_talents[talent].allows) {
      for (var i=0; i < class_talents[talent].allows.length; i+=1) {
        if (char_talents[class_talents[talent].allows[i]] > 0)
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

    // update associated variables
    char_talents[talent] -= 1;
    $scope.talent_points[tree].row[row] -= 1;
    $scope.talent_points[tree].total -= 1;
    $scope.talent_points.remaining += 1;
    if (row == last_active_row && $scope.talent_points[tree].row[row] == 0)
      $scope.talent_points[tree].last_active_row -= 1;
    // update tooltip while still hovered over
    $('#talent_' + talent)
    .attr('data-original-title', $scope.talent_tooltip(talent))
    .parent().find('.tooltip-inner').html($scope.talent_tooltip(talent));

  }

  // Reset all Talents points to default
  $scope.reset_talents = function() {
    // Resetting all talent variables to initial values
    for (var talent in char_talents) {
      char_talents[talent] = 0;
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

  // gets tooltip for given talent at it's current rank
  $scope.talent_tooltip = function(talent) {
    var cur_rank = 0,
        talent_rank_info = '',
        talent_rank_info_next = '',
        char_class = $scope.character.class,
        rank = [],
        talent_info = all_talents[char_class][talent],
        actual_cur_rank = 0,
        click_to_learn = '',
        talent_icon = '',
        tree = all_talents[char_class][talent].tree,
        tree_index = 0;

    if (tree == 'center') tree_index = 1;
    if (tree == 'right') tree_index = 2;

    // get the talent ranks for current class
    if (char_class == 'druid') rank = druid_ranks;
    else if (char_class == 'death knight') rank = dk_ranks;
    else if (char_class == 'mage') rank = mage_ranks;
    else if (char_class == 'hunter') rank = hunter_ranks;
    else if (char_class == 'paladin') rank = paladin_ranks;
    else if (char_class == 'priest') rank = priest_ranks;
    else if (char_class == 'rogue') rank = rogue_ranks;
    else if (char_class == 'shaman') rank = shaman_ranks;
    else if (char_class == 'warlock') rank = warlock_ranks;
    else if (char_class == 'warrior') rank = warrior_ranks;

    // update the rank to that of current, compensating for the array indexes
    // also store actual talent rank for tooltip info
    if (char_talents[talent]) {
      cur_rank = char_talents[talent] - 1;
      actual_cur_rank = cur_rank + 1;
    }

    // get the tooltip info for the next rank if it exists.
    if (talent_info.max_rank - 1 > cur_rank) {
      talent_rank_info_next = rank[talent][cur_rank + 1];
    }

    // get the talent info
    talent_rank_info = rank[talent][cur_rank];

    // get talent icon
    talent_icon = "<img class='pull-left' style='margin-left:-52px; \
     margin-top:-3px;border-radius:5px;'\
     src='/images/talents/" + char_class.replace(/\s/g, '') + '/' + $scope.class_specs[char_class][tree_index]
     +  '/' + talent + ".jpg'></img>";

    // if talent is active and have 0 talent points in it, add this line
    if (!$scope.is_inactive(talent) && char_talents[talent] == 0)
      click_to_learn = "<br><span class='pull-left' style='color:#00FF44;'>Click to Learn</span>";

    // if we're maxed out in talent or it is a 0/1 talent or have no points in talent
    if (talent_rank_info_next == '' || actual_cur_rank == 0) {
      return talent_icon + "<span class='pull-left' style='color:#FF5500;font-size:14px'>" + talent_info.name + '</span>' +
      '<span class=\'pull-right\' style=\'color:#DAA500;\'> Rank ' + actual_cur_rank + '/' +
      talent_info.max_rank + '</span></br>' +
      '</br><br>' + talent_rank_info + click_to_learn;
    }
    // otherwise we post the info for the next rank as well
    return talent_icon + "<span class='pull-left' style='color:#FF5500;font-size:14px'>" + talent_info.name + '</span>' +
    '<span class=\'pull-right\' style=\'color:#DAA500;\'> Rank ' + actual_cur_rank + '/' +
    talent_info.max_rank + '</span></br>' +
    '</br><br>' + talent_rank_info +
    '</br><span class=\'pull-left\' style=\'color:#DAA500;\'>Next Rank:</span></br>'
    + talent_rank_info_next + click_to_learn;
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

    if (char_talents[talent]) {
      return char_talents[talent] == class_talents[talent].max_rank;
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
    if (remaining_points == 0 && char_talents[talent] == 0)
      return true;
    // check if talent has a prequisite talent
    if (class_talents[talent].requires) {
      var required_tal = class_talents[talent].requires;
      if (char_talents[required_tal] != class_talents[required_tal].max_rank)
        return true;
    }
    return false;
  }

  // Equips a glyph to the currently selected glyph slot.
  $scope.equip_glyph = function(key) {
    var cur_slot = $scope.cur_glyph_slot,
        glyph = g_glyphs[key];
    $scope.error_msg = '';
    $scope.success_msg = '';

    // check if glyph type and glyph slot match
    if (glyph.type == 'Minor' && cur_slot < 4) {
      $scope.error_msg = 'You cannot equip a Major Glyph there.';
      return false;
    }
    if (glyph.type == 'Major' &&  cur_slot > 3) {
      $scope.error_msg = 'You cannot equip a Minor Glyph there.';
      return false;
    }

    // check if glyph is already equipped or not.
    for (var key in char_glyphs) {
      if (glyph == char_glyphs[key]) {
        $scope.error_msg = 'That glyph is already equipped.';
        return false;
      }
    }

    if (cur_slot) {
      $scope.success_msg = glyph.name + ' has been equipped!';
      set_slot_image('glyph_' + cur_slot, glyph);
      char_glyphs[cur_slot] = glyph;
      //console.log(char_glyphs);
    }
  }

  // ------------ TALENT FUNCTIONS END ---------------

  /* Saves the current state of the character in db. */
  $scope.save_to_db = function() {
    $http.post('/character/saveChar', {
      items: char_items,
      gems: char_gems,
      enchants: char_enchants,
      glyphs: char_glyphs,
      talents: char_talents,
      professions: char_professions,
      spec: $scope.character.spec,
      race: $scope.character.race,
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

  /* Exports a character and all it's info, saving it as a new character. */
  $scope.save_as = function() {
    $scope.error_msg = '';

    // quick name checks.
    if (!$scope.save_as_name) {
      $scope.error_msg = 'Enter a name first.';
      return false;
    } else if ($scope.save_as_name.length < 2 || $scope.save_as_name.length > 12) {
      $scope.error_msg = 'Name must be between 2 to 12 characters long.';
      return false;
    } else if (!/^[a-zA-Z]+$/.test($scope.save_as_name)) {
      $scope.error_msg = 'Aplha characters only.';
      return false;
    }

    $http.post('/character/saveCharAs', {
      old_name: $scope.character.name,
      old_user: $scope.character.username,
      new_name: $scope.save_as_name,
      class: $scope.character.class,
      items: char_items,
      gems: char_gems,
      enchants: char_enchants,
      glyphs: char_glyphs,
      talents: char_talents,
      professions: char_professions,
      spec: $scope.character.spec,
      race: $scope.character.race,
      points: $scope.talent_points
    }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      });
    $scope.show_save_as = false;
  }

  /* Reset the results table (when switching view). */
  $scope.reset_table = function() {
    $scope.items = [];
    $scope.search_val = '';
  }

  /* Updates base Stats with any multipliers and active Socket Bonuses */
  function update_stats() {

    //TODO: Will need to add stats gained from talents/glyphs as well

    // add any socketbonus to stats
    $scope.stats = bonus_stats(base_stats);

    // update multipliers and stats based on multipliers
    $scope.multipliers.ench = ench_multipliers;
    $scope.stats = multiply_stats(ench_multipliers, $scope.stats);

    // alter stats by adding percentages / adding new stat
    alter_stats($scope.stats);
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
    else                                return {'color': 'white'}
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
              add_stats(char_enchants[slot], item, false, slot, base_stats);
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
          console.log(cur_socket);
          if (cur_socket) {
            console.log(cur_socket);
            if (can_gem(item, $scope[cur_socket])) {

              // Socket gem, equip in tooltip, and update stats
              add_stats(char_gems[slot][cur_socket], item, false, slot, base_stats);
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

                  // unequip old item first if any
                  if (char_items[$scope.slot])
                    $scope.unequip_item();

                  // Equip item, change icon image and update stats
                  add_stats(char_items[$scope.slot], item, true, slot, base_stats);
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
          remove_stats(char_enchants[slot], false, slot, base_stats);
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
           remove_stats(gem, false, slot, base_stats);
           char_gems[slot][cur_socket] = null;
           set_slot_rel(slot);
           console.log(cur_socket, $scope[cur_socket]);
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
          remove_stats(char_items[slot], true, slot, base_stats);
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

    if (gear_view != 'items' && gear_view != 'gems' && gear_view != 'enchants')
      return false;

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
            add_stats(null, item, false, slot, base_stats);
            char_items[slot] = item;
            set_slot_image(slot, char_items[slot]);

            // getting all the gems and enchants & their stats
            if ($scope.character[slot.toLowerCase()].gems) {
              var gems = $scope.character[slot.toLowerCase()].gems,
                  enchant = $scope.character[slot.toLowerCase()].enchant;
              if (gems.socket1) {
                add_stats(null, gems.socket1, false, slot, base_stats);
                char_gems[slot].socket1 = gems.socket1;
              }
              if (gems.socket2) {
                add_stats(null, gems.socket2, false, slot, base_stats);
                char_gems[slot].socket2 = gems.socket2;
              }
              if (gems.socket3) {
                add_stats(null, gems.socket3, false, slot, base_stats);
                char_gems[slot].socket3 = gems.socket3;
              }
              if (enchant) {
                add_stats(null, enchant, false, slot, base_stats);
                char_enchants[slot] = enchant;
              }

              set_slot_rel(slot);
            }
          }
        }
        update_stats();

        // talents
        if ($scope.character.talents) {
          char_talents = $scope.character.talents;
        } else {
          // initialize talents
          for (var talent in all_talents[$scope.character.class]) {
            char_talents[talent] = 0;
          }
        }
        // talent tree information
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
        // populates the talent tree with talents from the character's class
        insert_talents($scope.character.class);
        // compile used to compile angular attributes
        $compile($('.talent_tree'))($scope);

        // loades the glyphs for the glyphs for the current character's class
        load_class_glyphs($scope.character.class, $scope.major_glyphs, $scope.minor_glyphs);

        // fetches the character's glyphs (if any)
        if ($scope.character.glyphs) {
          for (var key in $scope.character.glyphs) {
            $scope.cur_glyph_slot = key;
            $scope.equip_glyph($scope.character.glyphs[key].Id);
            $scope.success_msg = '';
          }
        }

        // gets character's professions (if any)
        if ($scope.character.professions)
          char_professions = $scope.character.professions;
        else
          $scope.character.professions = char_professions;
    });
  });
}]);
