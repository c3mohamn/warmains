/* ------ FUNCTIONS ------ */

//$.getScript('/js/talent_ranks/shaman.js');
// initialize bootstrap tooltips
$(document).ready(function(){
    $('[data-toggle=tooltip]').hover(function(){
        // on mouseenter
        $(this).tooltip('show');
    }, function(){
        // on mouseleave
        $(this).tooltip('hide');
    });
});

/* Return true if the number entered is a valid number or undefined. */
function valid_number(num) {
  if (num && isNaN(num))
    return false;

  return true;
}

/* Removes the '1' or '2' at the end of slot if it exist.
 * Used mainly for finger/trinket slots to avoid errors.
 *
 * slot: the currently selected slot ($scope.slot).
 */
function remove_trailing_number(slot) {
  var last_char = slot[slot.length - 1];

  // Remove the 1 from Finger1 when searching for items.
  if (last_char == '1' || last_char == '2') {
    return slot.slice(0, slot.length - 1);
  } else return slot
}

/* Return true if slot is a weapon.
 *
 * slot: the currently selected slot ($scope.slot).
 */
function is_weapon_slot(slot) {
  weapons = ['MainHand', 'OffHand', 'OneHand', 'TwoHand', 'Ranged'];
  return (weapons.indexOf(slot) >= 0);
}

/* Return true if slot is that of a Gem.
 * An item is a gem if it's Slot value is a colour.
 */
function is_gem(item) {
  gems = ['Yellow', 'Red', 'Orange', 'Blue', 'Purple', 'Green', 'Meta',
    'Prismatic'
  ];
  return (gems.indexOf(item.Slot) >= 0);
}

/* Return true iff the item is an enchant.
 * An item is an enchant if it contains an enchantId.
 */
function is_enchant(item) {
  if (item.enchantId)
    return true;
  return false;
}

/* Return true iff character already has item equipped in that slot. */
function is_equipped(slot, item) {
  if (char_items[slot]) {
    if (char_items[slot].Id == item.Id) {
      return true;
    }
  }
  return false;
}

/* Return true iff the item is not already equipped in another slot.
 * - Exceptions for certain rings/trinkets.
 *
 *  slot: the currently selected slot ($scope.slot).
 *  item: the currently selected item (selected_item).
 *  ~ Not all cases covered yet.
 */
function is_unique(slot, item) {

  if (slot == 'Finger1') {
    if (char_items.finger2)
      if (char_items.finger2.Name == item.Name)
        return true;
  } else if (slot == 'Finger2') {
    if (char_items.finger1)
      if (char_items.finger1.Name == item.Name)
        return true;
  } else if (slot == 'Trinket1') {
    if (char_items.trinket2) {
      if (char_items.trinket2.Name != "Death's Choice" &&
        char_items.trinket2.Name != "Death's Verdict") {
        if (char_items.trinket2.Name == item.Name)
          return true;
      }
    }
  } else if (slot == 'Trinket2') {
    if (char_items.trinket1) {
      if (char_items.trinket1.Name != "Death's Choice" &&
        char_items.trinket1.Name != "Death's Verdict") {
        if (char_items.trinket1.Name == item.Name)
          return true;
      }
    }
  } else return false;
}

/* Return true iff user is trying to equip a TwoHand item in their OffHand
 * while already carrying a TwoHand item in their MainHand.
 * - Only exception is if the current character is a warrior.
 *
 * slot: the currently selected slot ($scope.slot).
 * char: the current character's profile ($scope.character).
 */
function dual_twohand(slot, char) {
  var char_mh = char_items['mainhand'];

  if (char_mh && char_mh.Slot == 'TwoHand' && char.class != 'warrior' &&
    slot == 'OffHand') {
    return true;
  }
  return false;
}

/* Return true iff the class of char and item match.
 *
 * slot: the currently selected slot ($scope.slot).
 * char: the current character's profile ($scope.character).
 */
function compare_class(item, char) {
  if (item.RequiredClasses)
    if (item.RequiredClasses.toLowerCase().indexOf(char.class) < 0)
      return false;
  return true;
}

/* Return true iff the the item can be equipped into the slot.
 * - Exceptions and cases made for weapons.
 *
 *  slot: the currently selected slot ($scope.slot).
 *  item: the currently selected item (selected_item).
 *  char: the current character's profile ($scope.slot).
 *  ~ Not all cases covered yet.
 */
function compare_slot(slot, item, char) {
  var slot1 = slot;
  var slot2 = item.Slot;
  // for armor
  var case1 = slot1 == slot2;
  // to allow two handers to be equipped by mainhand
  var case2 = slot1 == 'MainHand' && (slot2 == 'TwoHand' || slot2 == 'OneHand');
  // to allow one handers to be equipped by offhand
  var case3 = slot1 == 'OffHand' && slot2 == 'OneHand';
  // to allow warriors to dual wield
  var case4 = slot1 == 'OffHand' && char.class == 'warrior' &&
    slot2 == 'TwoHand';

  // to prevent two handers being equipped after a offhand has been equipped.
  var case5 = true;
  if (char_items.offhand && slot1 == 'MainHand' && slot2 == 'TwoHand' &&
    char.class != 'warrior')
    case5 = false;
  else case5 = true;

  // to prevent warriors from dual wielding with polearm/staff
  var case6 = true;
  if (char_items.mainhand && ((char_items.mainhand.Type == 'Polearm' ||
      char_items.mainhand.Type == 'Staff') && (slot2 == 'TwoHand' &&
      slot1 == 'OffHand')))
    case6 = false;
  else case6 = true;

  return (case1 || case2 || case3 || case4) && case5 && case6;
}

/* Setting the icon img of the corresponding slot to what is in char_items.
 * Also adds a link and tooltip for the item equipped into the slot.
 *
 * slot: currently selected item ($scope.slot).
 * item: the selected item.
 */
function set_slot_image(slot, item) {

  var item_path = 'item=';
  var spell_path = 'spell=';
  var Idpath = '';

  if (item.Id == '') Idpath = spell_path + item.SpellId;
  else Idpath = item_path + item.Id;

  // Add icon image for item
  $('#' + slot + '_slot').css('background-image', 'url(' +
    "http://cdn.warmane.com/wotlk/icons/large/" + item.IconPath +
    '.jpg)');

  // Add link for the tooltip of item
  $('#' + slot + '_link').attr('href', 'http://db.warmane.com/wotlk/' + Idpath);
  $('#' + slot + '_link').attr('target', '_blank');
}

/* Set the background image of a gem socket to that of colour. */
function set_gem_bg(socket, colour) {
  $('#' + socket + '_slot').css('background-image',
    'url(/images/empty-slots/' + 'UI-' + colour + 'Socket' + '.png)');
}

/* Update the rel attribute of an item so we can see gems in item tooltip. */
function set_slot_rel(slot) {
  if (slot == 'TwoHand' || slot == 'OneHand')
    slot = 'MainHand';
  var item_id = char_items[slot].Id,
    ench = 0,
    sock1 = 0,
    sock2 = 0,
    sock3 = 0;
  if (char_gems[slot].socket1) sock1 = char_gems[slot].socket1.enchantId;
  if (char_gems[slot].socket2) sock2 = char_gems[slot].socket2.enchantId;
  if (char_gems[slot].socket3) sock3 = char_gems[slot].socket3.enchantId;
  if (char_enchants[slot]) ench = char_enchants[slot].enchantId;
  //console.log(ench, sock1, sock2, sock3);

  $('#' + slot + '_link').attr('rel', 'item=' + item_id +
    '&ench=' + ench + '&gems=' + sock1 + ':' + sock2 + ':' + sock3);
}

/* Removes the icon img in the given slot. */
function remove_slot_image(slot) {
  slot1 = remove_trailing_number(slot);

  // sets background image to empty item slot image
  $('#' + slot + '_slot').css('background-image',
    'url(/images/empty-slots/UI-Empty' + slot1 + '.png)');
  $('#' + slot + '_link').attr('href', ''); // removes link as well
  $('#' + slot + '_link').attr('target', '');
}

/* Inserts a gem socket beside the item slot in character panel by adding
 * the <li> element and it's derivatives.
 *
 * slot: the slot currently selected.
 * socket_num: the socket number to be inserted beside slot.
 */
function insert_gem_socket(slot, socket_num) {

  var socket = '';
  var socket_html = '';
  var socket_side = "<li class='pull-center'>";
  var slot_id = '#li_' + slot;
  var side = $(slot_id).attr('class');
  //console.log(slot_id, side);

  if (side)
    socket_side = "<li class=" + side + ">"

  switch (socket_num) {
    case 1:
      socket_html = socket1_html;
      break;
    case 2:
      socket_html = socket2_html;
      break
    case 3:
      socket_html = socket3_html;
      break;
  }
  socket = $(socket_side + socket_html);

  // if weapons row
  if (!side)
    $(socket).hide().insertAfter('#li_Wrist').show('normal');
  else
    $(socket).hide().insertAfter('#li_' + slot).show('normal');

  // disable the links
  $('#socket' + socket_num + '_link').click(function() {
    return false;
  });
  // add the pointer on hover
  $('#socket' + socket_num + '_slot').hover(function() {
    $(this).css('cursor', 'pointer');
  });
  // add class when selected
  $('#socket' + socket_num + '_slot').attr('ng-class',
    "{'selected_slot': cur_socket == 'socket" + socket_num + "'}");
}

/* Remove the socket from character panel.
 *
 * num: the socket number
 */
function remove_socket(num) {
  var socket = $('#socket' + num + '_slot');
  var li_socket = socket.parent().parent();
  $(li_socket).remove();
}

/* Check if we can put gem into socket.
 * Mainly for meta socket.
 */
function can_gem(gem, socket) {
  if (gem.Slot != 'Meta' && socket == 'Meta')
    return false;
  if (gem.Slot == 'Meta' && socket != 'Meta')
    return false;
  return true;
}

/* Check if we can enchant given item.
 * TODO: Add conditions for professions.
 */
function can_enchant(enchant, item, char_class) {
  // Staff specific enchant.
  if (enchant.Id == '45056' && item.Type != 'Staff')
    return false;
  // only dks can use runeforged enchants
  if (enchant.Requirements == 'Runeforging' && char_class != 'death knight')
    return false;
  // Twohand weapons can also used OneHand weapon enchants
  if (enchant.Slot == 'OneHand' && item.Slot == 'TwoHand')
    return true;
  if (enchant.Slot != item.Slot)
    return false;
  return true;
}

/* Return true iff char can equip item.
 *
 * item: currently selected item (selected_item).
 * char: current character's profile ($scope.character).
 */
function can_wield(item, char) {
  var char_class = char.class.replace(' ', ''); // remove white space
  var item_type = item.Type;
  var item_slot = item.Slot;

  // Check if this is a weapon or not.
  if (!is_weapon_slot(item_slot)) {
    // Check if the current character can equip that armor type.
    if (class_wield_type[char_class].armor.indexOf(item_type) < 0) {
      //console.log('Cannot wear armor: ', item_type);
      return false;
    }
  } else {
    // Check if the current character can equip that weapon type.
    if (class_wield_type[char_class].weapon.indexOf(item_type) < 0) {
      //console.log('Cannot wear weapon: ', item_type, class_wield_type[char_class].weapon);
      return false;
    }
  }

  // Check if the current character meets class requirements.
  if (!compare_class(item, char)) {
    return false;
  }
  return true;
}


/* Helper function for stat functions:
 * Ignore SpecialEffects when adding/removing stats.
 */
function not_special(key) {
  if (key == "SpecialEffectCount" || key == "SpecialEffects")
    return false;
  return true;
}

/* Remove item.Stats from stats.
 *
 * item: item that is being unequipped
 * has_enchants: true iff we need to remove gem and enchant stats as well
 * slot: slot of item
 * stats: the current net stats of character
 */
function remove_stats(item, has_enchants, slot, stats) {
  var old_stats = item.Stats;

  if (!has_enchants) {
    for (var key in old_stats) {
      if (not_special(key)) {

        // if a multiplier stat, remove from list of multipliers
        // TODO
        if (key.indexOf('Multiplier') >= 0) {
          delete ench_multipliers[key];
        } else {
          stat_num = parseFloat(old_stats[key], 10);
          stats[key] -= stat_num;
        }
      }
    }

  } else { // must remove enchants and gems as well
    // Remove the gem stats if gems exist.
    if (char_gems[slot].socket1)
      remove_stats(char_gems[slot].socket1, false, slot, stats);
    if (char_gems[slot].socket2)
      remove_stats(char_gems[slot].socket2, false, slot, stats);
    if (char_gems[slot].socket3)
      remove_stats(char_gems[slot].socket3, false, slot, stats);

    // Remove enchant stats if enchant exists
    if (char_enchants[slot])
      remove_stats(char_enchants[slot], false, slot, stats);

    // remove stats of the item itself now
    remove_stats(item, false, slot, stats);
  }
}

/* Remove prev_item.Stats from stats, then add new_item.Stats to stats.
 *
 * prev_item: the item previously equipped
 * new_item: item that is being equipped
 * type: gem, enchant or regular item
 * slot: slot of item
 * stats: the current net stats of character
 */
function add_stats(prev_item, new_item, has_enchants, slot, stats) {
  var new_stats = new_item.Stats;

  // remove stats of the previous item
  if (prev_item) {
    remove_stats(prev_item, has_enchants, slot, stats);
  }

  // add stats of the new item
  for (var key in new_stats) {
    if (not_special(key)) {
      // if a multiplier stat, add the list of multipliers
      // TODO:
      if (key.indexOf('Multiplier') >= 0) {
        ench_multipliers[key] = new_stats[key];
      } else {
        stat_num = parseFloat(new_stats[key], 10);
        // initialize stat to 0 if it does not exist already
        if (!stats[key])
          stats[key] = 0;
        stats[key] += stat_num;
      }
      //console.log('Adding ', stat_num, ' to ', key);
    }
  }
}

/* Multiply character stats by multiplier.
 *
 * multipliers: the current multipliers active at the moment.
 * stats: the current character stats
 * reverse: true if multiplier is being removed (negative multiplier)
 */
function multiply_stats(multipliers, stats) {

  // clone stats
  var new_stats = jQuery.extend({}, stats);

  for (var key in multipliers) {
    if (multiplier_to_stat[key]) {
      var stat = multiplier_to_stat[key];
      var m_value = parseFloat(multipliers[key], 10);
      var stat_value = 0;

      if (stats[stat]) stat_value = stats[stat];

      new_stats[stat] = Math.round(stat_value * (1 + m_value));
    }
  }
  return new_stats;
}

/* Add any active SocketBonus stats to stats. */
function bonus_stats(stats) {

  // clone stats
  var new_stats = jQuery.extend({}, stats);
  //var bonuses = {};

  // check if any of the equipped items have active socket bonuses.
  for (var slot in char_items) {
    if (char_items[slot] && char_items[slot].SocketBonus != 'none') {
      // if it does, add socket bonus stats to new stats
      if (is_bonus_active(slot)) {
        var SocketBonus = char_items[slot].SocketBonus;

        // add the socket bonuses to new_stats
        for (var stat in SocketBonus) {

          if (new_stats[stat])
            new_stats[stat] = new_stats[stat] + parseFloat(SocketBonus[stat], 10);
          else
            new_stats[stat] = SocketBonus[stat];
        }
      }
    }
  }

  return new_stats;
}

/* Check if an item at given slot has active socket bonuses.
 *
 * Helper function for bonus_stats.
 */
function is_bonus_active(slot) {
  var item = char_items[slot],
    gems = char_gems[slot],
    socket_colour = '',
    gem_colour = '',
    socket1_active = true,
    socket2_active = true,
    socket3_active = true;

  // Check if each socket match
  if (item.SocketColor1) {
    if (gems.socket1) {
      socket_colour = item.SocketColor1;
      gem_colour = gems.socket1.Slot;

      socket1_active = socket_matches(socket_colour, gem_colour);
    } else {
      socket1_active = false;
    }
  }
  if (item.SocketColor2) {
    if (gems.socket2) {
      socket_colour = item.SocketColor2;
      gem_colour = gems.socket2.Slot;

      socket2_active = socket_matches(socket_colour, gem_colour);
    } else {
      socket2_active = false;
    }
  }
  if (item.SocketColor3) {
    if (gems.socket3) {
      socket_colour = item.SocketColor3;
      gem_colour = gems.socket3.Slot;

      socket3_active = socket_matches(socket_colour, gem_colour);
    } else {
      socket3_active = false;
    }
  }

  return socket1_active && socket2_active && socket3_active;
}

/* Check if the socket and the gem match.
 *
 * Helper function for is_bonus_active.
 */
function socket_matches(socket, gem) {
  if (socket == 'Prismatic' || gem == 'Prismatic')
    return true;
  if (socket == gem)
    return true;
  if ((socket == 'Red' || socket == 'Blue') && gem == 'Purple')
    return true;
  if ((socket == 'Blue' || socket == 'Yellow') && gem == 'Green')
    return true;
  if ((socket == 'Yellow' || socket == 'Red') && gem == 'Orange')
    return true;
  return false;
}

/* Adding percentages for certain stats (arp/hit rating). */
function add_percentages(stats) {
  for (var stat in stats) {
    if (stat == 'HitRating') {
      stats['SpellHitRating'] = stats[stat] + ' (' + (stats[stat] / 26.23).toFixed(2)
      + '%)';
      stats[stat] = stats[stat] + ' (' + (stats[stat] / 32.78).toFixed(2) +
        '%)';
    } else if (stat == 'ArmorPenetrationRating') {
      stats[stat] = stats[stat] + ' (' + (stats[stat] / 13.99).toFixed(2) +
        '%)';
    } else if (stat == 'ExpertiseRating') {
      stats['Expertise'] = (stats[stat] / 7.696).toFixed(2);
    }
  }
}

// return the sum of talent points spent in all the rows <= last_rows
function sum_rows(last_row, all_rows) {
  var sum = 0,
      i = last_row - 1;

  // at row 0
  if (i == -1)
    return all_rows[0];

  while (i >= 0) {
    sum += all_rows[i];
    i -= 1;
  }
  return sum;
}
