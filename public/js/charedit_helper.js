          /* ------ VARIABLES ------ */

// Getting the data for the character from the URL
var url = window.location.href;
url = url.split("/");
var char_name = url.pop();
var user_name = url.pop();

// Stores the items equipped for the current character
var char_items = {  head: null, neck: null, shoulders: null, back: null,
                    chest: null, wrist: null, hands: null, waist: null,
                    legs: null, feet: null, finger1: null, finger2: null,
                    trinket1: null, trinket2: null, mainhand: null,
                    offhand: null, ranged: null }

// Net total of character stats gained from the items.
var char_stats = {
  BaseStats: {
    Strength: 0, Agility: 0, Intellect: 0, Spirit: 0, Stamina: 0,
    AttackPower: 0, HitRating: 0, CritRating: 0, ExpertiseRating: 0,
    ArmorPenetrationRating: 0, SpellPower: 0, HasteRating: 0, Mp5: 0
  },
  Defenses: {
    Armor: 0, BonusArmor: 0, DefenseRating: 0, DodgeRating: 0, ParryRating: 0,
    BlockRating: 0, BlockValue: 0, ShadowResistance: 0, ArcaneResistance: 0,
    FrostResistance: 0, NatureResistance: 0, FireResistance: 0, Resilience: 0
  }
}

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

/* Return true if slot is that of a Gem. */
function is_gem_slot(slot) {
  gems = ['Yellow', 'Red', 'Orange', 'Blue', 'Purple', 'Green'];
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
  slot = slot.toLowerCase()
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
  slot = slot.toLowerCase();
  $('#' + slot + '_slot').css('background-image', 'url(' +
  "http://wow.zamimg.com/images/wow/icons/large/" + item.IconPath +
  '.jpg)');

  // Add link for the tooltip of item
  $('#' + slot + '_link').attr('href', 'http://db.warmane.com/wotlk/item=' +
                                        item.Id);
  $('#' + slot + '_link').attr('target', '_blank');
}

/* Removes the icon img in the given slot. */
function remove_slot_image(slot) {
  slot = slot.toLowerCase();

  $('#' + slot + '_slot').css('background-image', 'none');
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
