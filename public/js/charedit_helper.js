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
            'OneHandMace', 'TwoHandMace', 'Dagger', 'Polearm', 'Staff']
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

// Setting the icon img of the corresponding slot to what is in char_items
function set_slot_image(slot) {
  slot = slot.toLowerCase();
  $('#' + slot + '_slot').css('background-image', 'url(' +
  "http://wow.zamimg.com/images/wow/icons/large/" + char_items[slot].IconPath +
  '.jpg)');
}

// Check if the current character can wield the corresponding item.
// Will need to make sure that characters do not dual weild two handers.
function can_wield(character, item) {
  var char_class = character.class;
  var item_type = item.Type;
  var item_slot = item.Slot;
  var weapons_slot = ['MainHand', 'OffHand', 'OneHand', 'TwoHand', 'Ranged'];

  // Check if this is a weapon or not.
  if (weapons_slot.indexOf(item_slot) < 0) {
    // Check if the current character can equip that armor type.
    if (class_wield_type[char_class].armor.indexOf(item_type) < 0) {
      console.log('Character cannot wear ', item_type);
      return false;
    }
  } else {
    // Check if the current character can equip that weapon type.
    if (class_wield_type[char_class].weapon.indexOf(item_type) < 0) {
      console.log('Character cannot wear ', item_type);
      return false;
    }
  }
  return true;
}
