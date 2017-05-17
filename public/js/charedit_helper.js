          /* ------ VARIABLES ------ */

// Getting the data for the character from the URL
var url = window.location.href;
url = url.split("/");
var char_name = url.pop();
var user_name = url.pop();

// Disables links from directing to another page - makes easier to select slots.
$('.char_panel a, #selected_link, #socket1_link, #socket2_link, ' +
  '#socket3_link, #selected_gem_link').click(function() {
  return false;
});

// Stores the items equipped for the current character
var char_items = {  Head: null, Neck: null, Shoulders: null, Back: null,
                    Chest: null, Wrist: null, Hands: null, Waist: null,
                    Legs: null, Feet: null, Finger1: null, Finger2: null,
                    Trinket1: null, Trinket2: null, MainHand: null,
                    OffHand: null, Ranged: null }

// Store the enchants for corresponding item slots
var char_enchants = { Head: null, Neck: null, Shoulders: null, Back: null,
                      Chest: null, Wrist: null, Hands: null, Waist: null,
                      Legs: null, Feet: null, Finger1: null, Finger2: null,
                      Trinket1: null, Trinket2: null, MainHand: null,
                      OffHand: null, Ranged: null }

// Store the gems for corresponding item slots
var char_gems = {
  Head: {socket1: null, socket2: null, socket3: null},
  Neck: {socket1: null, socket2: null, socket3: null},
  Shoulders: {socket1: null, socket2: null, socket3: null},
  Back: {socket1: null, socket2: null, socket3: null},
  Chest: {socket1: null, socket2: null, socket3: null},
  Wrist: {socket1: null, socket2: null, socket3: null},
  Hands: {socket1: null, socket2: null, socket3: null},
  Waist: {socket1: null, socket2: null, socket3: null},
  Legs: {socket1: null, socket2: null, socket3: null},
  Feet: {socket1: null, socket2: null, socket3: null},
  Finger1: {socket1: null, socket2: null, socket3: null},
  Finger2: {socket1: null, socket2: null, socket3: null},
  MainHand: {socket1: null, socket2: null, socket3: null},
  OffHand: {socket1: null, socket2: null, socket3: null},
  Ranged: {socket1: null, socket2: null, socket3: null}
}

// Stores the types of items each class can wield.
var class_wield_type = {
  paladin: {
    armor: ['Cloth', 'Leather', 'Mail', 'Plate', 'None'],
    weapon: ['None', 'Shield', 'Libram', 'OneHandAxe', 'TwoHandAxe',
             'OneHandSword', 'TwoHandSword', 'OneHandMace', 'TwoHandMace',
             'Polearm']
  },
  deathknight: {
    armor: ['Cloth', 'Leather', 'Mail', 'Plate', 'None'],
    weapon: ['None', 'OneHandAxe', 'TwoHandAxe', 'OneHandSword',
             'TwoHandSword', 'OneHandMace', 'TwoHandMace', 'Polearm']
  },
  warrior: {
    armor: ['Cloth', 'Leather', 'Mail', 'Plate', 'None'],
    weapon: ['None', 'Shield', 'OneHandAxe', 'TwoHandAxe', 'OneHandSword',
             'TwoHandSword', 'OneHandMace', 'TwoHandMace', 'Polearm',
             'Staff', 'Dagger', 'FistWeapon', 'Bow', 'Crossbow', 'Gun',
             'Thrown']
  },
  shaman: {
    armor: ['Cloth', 'Leather', 'Mail', 'None'],
    weapon: ['None', 'Shield', 'Totem', 'OneHandAxe', 'TwoHandAxe',
            'OneHandMace', 'TwoHandMace', 'Dagger', 'Staff']
  },
  hunter: {
    armor: ['Cloth', 'Leather', 'Mail', 'None'],
    weapon: ['None', 'OneHandAxe', 'TwoHandAxe', 'OneHandSword', 'Polearm',
             'Staff', 'Dagger', 'FistWeapon', 'Bow', 'Crossbow', 'Gun',
             'TwoHandSword']
  },
  druid: {
    armor: ['Cloth', 'Leather', 'None'],
    weapon: ['None', 'Idol', 'FistWeapon', 'OneHandMace', 'TwoHandMace',
             'Dagger', 'Polearm', 'Staff']
  },
  rogue: {
    armor: ['Cloth', 'Leather', 'None'],
    weapon: ['None', 'Gun', 'Bow', 'Crossbow', 'Thrown', 'FistWeapon', 'Dagger',
             'OneHandMace', 'OneHandAxe', 'OneHandSword']
  },
  mage: {
    armor: ['Cloth', 'None'],
    weapon: ['None', 'Wand', 'OneHandSword', 'Staff', 'Dagger']
  },
  priest: {
    armor: ['Cloth', 'None'],
    weapon: ['None', 'Wand','OneHandMace', 'Staff', 'Dagger']
  },
  warlock: {
    armor: ['Cloth', 'None'],
    weapon: ['None', 'Wand','OneHandSword', 'Staff', 'Dagger']
  }
}

// Stores the currently selected item.
var selected_item = null;

          /* ------ FUNCTIONS ------ */

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
function is_gem_slot(slot) {
  gems = ['Yellow', 'Red', 'Orange', 'Blue', 'Purple', 'Green', 'Meta',
  'Prismatic'];
  return (gems.indexOf(slot) >= 0);
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

/* Return true if the number entered is a valid number or undefined. */
 function valid_number(num) {
  if (num && isNaN(num))
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
      char_items.mainhand.Type == 'Staff') && (slot2 == 'TwoHand'
      && slot1 == 'OffHand')))
    case6 = false;
  else case6 = true;

  return (case1 || case2 || case3 || case4) && case5 && case6;
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

/* Return true iff character already has item equipped in that slot. */
function is_equipped(slot, item) {
  if (char_items[slot]) {
    if (char_items[slot].Id == item.Id) {
      return true;
    }
  }
  return false;
}

/* Setting the icon img of the corresponding slot to what is in char_items.
 * Also adds a link and tooltip for the item equipped into the slot.
 *
 * slot: currently selected item ($scope.slot).
 * item: the selected item.
 */
function set_slot_image(slot, item) {

  $('#' + slot + '_slot').css('background-image', 'url(' +
  "http://cdn.warmane.com/wotlk/icons/large/" + item.IconPath +
  '.jpg)');

  // Add link for the tooltip of item
  $('#' + slot + '_link').attr('href', 'http://db.warmane.com/wotlk/item=' +
                                        item.Id);
  $('#' + slot + '_link').attr('target', '_blank');
}

/* Set the background image of a gem socket to that of colour. */
function set_gem_bg(socket, colour) {
  $('#' + socket + '_slot').css('background-image',
    'url(/images/empty-slots/' + 'UI-' + colour + 'Socket' + '.png)');
}

/* Removes the background image for the socket. */
function remove_gem_image(socket) {
  $('#' + socket + '_slot').css('background-image',
    'none');
}

/* Update the rel attribute of an item so we can see gems in item tooltip. */
function set_slot_rel(slot) {
  var item_id = char_items[slot].Id;
  var ench = 0;
  var sock1 = 0;
  var sock2 = 0;
  var sock3 = 0;
  if (char_gems[slot].socket1) sock1 = char_gems[slot].socket1.enchantId;
  if (char_gems[slot].socket2) sock2 = char_gems[slot].socket2.enchantId;
  if (char_gems[slot].socket3) sock3 = char_gems[slot].socket3.enchantId;

  $('#' + slot + '_link').attr('rel', 'item=' + item_id +
    '&ench=' + ench + '&gems=' + sock1 + ':' + sock2 + ':' + sock3);
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

/* Removes the icon img in the given slot. */
function remove_slot_image(slot) {
  slot1 = remove_trailing_number(slot);

  $('#' + slot + '_slot').css('background-image',
    'url(/images/empty-slots/UI-Empty' + slot1 + '.png)');
  $('#' + slot + '_link').attr('href', ''); // removes link as well
  $('#' + slot + '_link').attr('target', '');
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
