          /* ------ Useful Variables ------ */

// Getting the data for the character from the URL
var cur_url = window.location.href;
cur_url = cur_url.split("/");
var char_name = cur_url.pop();
var user_name = cur_url.pop();

// Stores the items equipped for the current character
var char_items = {  head: null, neck: null, shoulders: null, back: null,
                    chest: null, wrist: null, hands: null, waist: null,
                    legs: null, feet: null, finger1: null, finger2: null,
                    trinket1: null, trinket2: null, mainhand: null,
                    offhand: null, ranged: null }

// Store the enchants for corresponding item slots
var char_enchants = {}
// Store the gems for corresponding item slots
var char_gems = {}

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

          /* ------ Useful Functions ------ */

/* This function is used to remove the 1/2 at the end of finger/trinket. */
function remove_trailing_number(slot) {
  var last_char = slot[slot.length - 1];

  // Remove the 1 from Finger1 when searching for items.
  if (last_char == '1' || last_char == '2') {
    return slot.slice(0, slot.length - 1);
  } else return slot
}

/* Return whether item slot is a weapon or not. */
function is_weapon_slot(item_slot) {
  weapons_slot = ['MainHand', 'OffHand', 'OneHand', 'TwoHand', 'Ranged'];
  return (weapons_slot.indexOf(item_slot) >= 0);
}

/* Return whether the given slots are equal.
*  Except for the cases where it is MainHand, OffHand or if character is a
*  warrior (can dual wield two TwoHand).
*  slot1: the currently selected slot
*  sel_item: the currently selected item to be put into slot1
*  char: the current characte profile
*/
function compare_slot(slot1, sel_item, char) {
  var slot2 = sel_item.Slot;
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

/* Make sure that two unique rings/trinkets are not equipped at the same time.
*  slot1: the currently selected slot.
*  sel_item: the currently selected item to be put into slot1.
*/
function is_unique(slot1, sel_item) {
  if (slot1 == 'Finger1') {
    console.log('Finger1.');
    if (char_items.finger2 && char_items.finger2.Unique) {

    }
  } else if (slot1 == 'Finger2') {
    console.log('Finger2.');
  } else if (slot1 == 'Trinket1') {
    console.log('Trinket1.');
  } else if (slot1 == 'Trinket2') {
    console.log('Trinket2.');
  } else return false;

}


/* Setting the icon img of the corresponding slot to what is in char_items */
function set_slot_image(slot) {
  slot = slot.toLowerCase();
  $('#' + slot + '_slot').css('background-image', 'url(' +
  "http://wow.zamimg.com/images/wow/icons/large/" + char_items[slot].IconPath +
  '.jpg)');
}

/* Check if the current character can wield the corresponding item.
*  Will need to make sure that characters do not dual wield two handers.
*/
function can_wield(character, item) {
  var char_class = character.class;
  var item_type = item.Type;
  var item_slot = item.Slot;

  // Check if this is a weapon or not.
  if (!is_weapon_slot(item_slot)) {
    // Check if the current character can equip that armor type.
    if (class_wield_type[char_class].armor.indexOf(item_type) < 0) {
      console.log('Cannot wear armor: ', item_type);
      return false;
    }
  } else {
    // Check if the current character can equip that weapon type.
    if (class_wield_type[char_class].weapon.indexOf(item_type) < 0) {
      console.log('Cannot wear weapon: ', item_type, class_wield_type[char_class].weapon);
      return false;
    }
  }
  return true;
}
