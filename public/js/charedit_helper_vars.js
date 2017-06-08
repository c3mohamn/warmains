/* ------ VARIABLES ------ */

// Getting the data for the character from the URL
var url = window.location.href;
url = url.split("/");
var char_name = url.pop();
var user_name = url.pop();

// Socket html code to be added to DOM when clicking on an item.
var socket1_html =
"<a id='socket1_link'> " +
"<div class='item_slot' id='socket1_slot' ng-click=\"cur_socket='socket1'\"> " +
"</div></a></li>";

var socket2_html =
"<a id='socket2_link'> " +
"<div class='item_slot' id='socket2_slot' ng-click=\"cur_socket='socket2'\"> " +
"</div></a></li>";

var socket3_html =
"<a id='socket3_link'> " +
"<div class='item_slot' id='socket3_slot' ng-click=\"cur_socket='socket3'\"> " +
"</div></a></li>";

// class of the character loaded
var char_class = '';

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
  Ranged: {socket1: null, socket2: null, socket3: null},
  Trinket1: {socket1: null, socket2: null, socket3: null},
  Trinket2: {socket1: null, socket2: null, socket3: null}
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

// Multiplier name and corresponding stat name
var multiplier_to_stat = {
  "BonusBlockValueMultiplier": "BlockValue",
  "BonusIntellectMultiplier": "Intellect",
  "BaseArmorMultiplier": "Armor",
  "BonusStaminaMultiplier": "Stamina",
  "BonusCritMultiplier": null,
  "BonusSpellCritMultiplier": null,
  "BonusCritHealMultiplier": null,
  "SpellDamageTakenMultiplier": null,
  "BonusManaMultiplier": null,
  "ThreatReductionMultiplier": null,
  "ThreatIncreaseMultiplier": null,
  "BonusStrengthMultiplier": null,
  "BonusFrostDamageMultiplier": null
}

// Stores the multipliers gained from enchants and gems
var ench_multipliers = {};

// Stores the currently selected item.
var selected_item = null;

// used to toggle sockets when clicking slots in sequence
var toggle_sockets = 0;
