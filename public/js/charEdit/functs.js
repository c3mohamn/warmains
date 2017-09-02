/* ------ FUNCTIONS ------ */

//$.getScript('/js/talent_ranks/shaman.js');

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
  $('#' + slot + '_link').attr('href', 'https://wowgaming.altervista.org/aowow?' + Idpath);
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
    sock3 = 0,
    ench_link = '';

  if (char_gems[slot].socket1) sock1 = char_gems[slot].socket1.Id;
  if (char_gems[slot].socket2) sock2 = char_gems[slot].socket2.Id;
  if (char_gems[slot].socket3) sock3 = char_gems[slot].socket3.Id;
  if (char_enchants[slot]) ench = char_enchants[slot].enchantId;
  //console.log(ench, sock1, sock2, sock3);

  // build rel tooltip link
  if (ench !== 0)
    ench_link = '&ench=' + ench;

  $('#' + slot + '_link').attr('rel', 'gems=' + sock1 + ':' + sock2 + ':' + sock3 + ench_link);
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
  // add class to highlight socket when selected
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

/* Check if character of class can be race. */
function valid_race(char_class, race) {
  //console.log(class_to_race[char_class].indexOf(race) > -1);
  return class_to_race[char_class].indexOf(race) > -1;
}
