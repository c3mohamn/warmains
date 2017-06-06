var all_talents = {
  'shaman': {
    // elemental tree
    'convection': {max_rank:5, row: 0, tree: 'left'},
    'concussion': {max_rank:5, row: 0, tree: 'left'},
    'call_of_flame': {max_rank:3, row: 1, tree: 'left'},
    'elemental_warding': {max_rank:3, row: 1, tree: 'left'},
    'elemental_devastation': {max_rank:3, row: 1, tree: 'left'},
    'reverberation': {max_rank:5, row: 2, tree: 'left'},
    'elemental_focus': {max_rank:1, row: 2, tree: 'left', allows: ['call_of_thunder']},
    'elemental_fury': {max_rank:5, row: 2, tree: 'left', allows: ['lightning_mastery']},
    'improved_fire_nova': {max_rank:2, row: 3, tree: 'left'},
    'eye_of_the_storm': {max_rank:3, row: 3, tree: 'left'},
    'elemental_reach': {max_rank:2, row: 4, tree: 'left'},
    'call_of_thunder': {max_rank:1, row: 4, tree: 'left', allows: ['elemental_mastery'],requires: 'elemental_focus'},
    'unrelenting_storm': {max_rank:3, row: 4, tree: 'left'},
    'elemental_precision': {max_rank:3, row: 5, tree: 'left'},
    'lightning_mastery': {max_rank:5, row: 5, tree: 'left', requires: 'elemental_fury'},
    'elemental_mastery': {max_rank:1, row: 6, tree: 'left', allows: ['elemental_oath'], requires: 'call_of_thunder'},
    'storm_earth_fire': {max_rank:3, row: 6, tree: 'left'},
    'booming_echoes': {max_rank:2, row: 7, tree: 'left'},
    'elemental_oath': {max_rank:2, row: 7, tree: 'left', requires: 'elemental_mastery'},
    'lightning_overload': {max_rank:3, row: 7, tree: 'left'},
    'astral_shift': {max_rank:3, row: 8, tree: 'left'},
    'totem_of_wrath': {max_rank:1, row: 8, tree: 'left'},
    'lava_flows': {max_rank:3, row: 8, tree: 'left'},
    'shamanism': {max_rank:5, row: 9, tree: 'left'},
    'thunderstorm': {max_rank:1, row: 10, tree: 'left'},

    // enhance tree
    'enhancing_totems': {max_rank:3, row: 0, tree: 'center'},
    "earth's_grasp": {max_rank:2, row: 0, tree: 'center'},
    "ancestral_knowledge": {max_rank:5, row: 0, tree: 'center'},
    'guardian_totems': {max_rank:2, row: 1, tree: 'center'},
    'thundering_strikes': {max_rank:5, row: 1, tree: 'center', allows: ['flurry']},
    'improved_ghost_wolf': {max_rank:2, row: 1, tree: 'center'},
    'improved_shields': {max_rank:3, row: 1, tree: 'center'},
    'elemental_weapons': {max_rank:3, row: 2, tree: 'center'},
    'shamanistic_focus': {max_rank:1, row: 2, tree: 'center'},
    'anticipation': {max_rank:3, row: 2, tree: 'center'},
    'flurry': {max_rank:5, row: 3, tree: 'center', requires: 'thundering_strikes'},
    'toughness': {max_rank:5, row: 3, tree: 'center'},
    'improved_windfury_totem': {max_rank:2, row: 4, tree: 'center'},
    'spirit_weapons': {max_rank:1, row: 4, tree: 'center', allows: ['dual_wield']},
    'mental_dexterity': {max_rank:3, row: 4, tree: 'center'},
    'unleashed_rage': {max_rank:3, row: 5, tree: 'center'},
    'weapon_mastery': {max_rank:3, row: 5, tree: 'center'},
    'frozen_power': {max_rank:2, row: 5, tree: 'center'},
    'dual_wield_specialization': {max_rank:3, row: 6, tree: 'center', requires: 'dual_wield'},
    'dual_wield': {max_rank:1, row: 6, tree: 'center', allows: ['lava_lash', 'dual_wield_specialization'], requires: 'spirit_weapons'},
    'stormstrike': {max_rank:1, row: 6, tree: 'center', allows: ['improved_stormstrike']},
    'static_shock': {max_rank:2, row: 7, tree: 'center'},
    'lava_lash': {max_rank:2, row: 7, tree: 'center', requires: 'dual_wield'},
    'improved_stormstrike': {max_rank:3, row: 7, tree: 'center', requires: 'stormstrike'},
    'mental_quickness': {max_rank:3, row: 8, tree: 'center'},
    'shamanistic_rage': {max_rank:1, row: 8, tree: 'center'},
    'earthen_power': {max_rank:2, row: 8, tree: 'center'},
    'maelstrom_weapon': {max_rank:5, row: 9, tree: 'center'},
    'feral_spirit': {max_rank:1, row: 10, tree: 'center'},

    // resto tree
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
