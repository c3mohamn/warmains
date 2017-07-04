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

  // Check if each socket colour matches gem colour
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

/* Add additional stats and percentages for certain stats (hit/arp/armor). */
function alter_stats(stats) {

  // HitRating + SpellHitRating
  if (stats['HitRating']) {
    // adding spellhit
    stats['SpellHitRating'] = stats['HitRating'];

    // adding percentages for both
    stats['HitRatingPercentage'] = (stats['HitRating'] / 32.78).toFixed(2);
    stats['SpellHitRatingPercentage'] = (stats['SpellHitRating'] / 26.23).toFixed(2);
  }

  // ArmorPenetrationRating
  if (stats['ArmorPenetrationRating']) {
    // adding percentage
    stats['ArmorPenetrationRatingPercentage'] = (stats['ArmorPenetrationRating'] / 13.99).toFixed(2);
  }

  // ExpertiseRating + Expertise (note: these are different numbers)
  if (stats['ExpertiseRating']) {
    // adding expertise
    stats['Expertise'] = (stats['ExpertiseRating'] / 7.696).toFixed(2);

    // percentage
    stats['ExpertisePercentage'] = (stats['Expertise'] / 4).toFixed(2);
  }

  // Armor + Bonus Armor
  if (stats['Armor']) {
    // Add BonusArmor to Armor
    if (stats['BonusArmor'])
      stats['Armor'] += stats['BonusArmor'];

    // adding percentage, against level 80 & 83 monsters
    stats['ArmorPercentage80'] = ((stats['Armor'] / (stats['Armor'] + 15232.5)) * 100).toFixed(2);
    stats['ArmorPercentage83'] = ((stats['Armor'] / (stats['Armor'] + 16635)) * 100).toFixed(2);
  }

  // CritRating + SpellCritRating
  if (stats['CritRating']) {
    // Add SpellCritRating
    stats['SpellCritRating'] = stats['CritRating'];

    // add percentages
    stats['CritRatingPercentage'] = (stats['CritRating'] / 45.91).toFixed(2) ;
    stats['SpellCritRatingPercentage'] = stats['CritRatingPercentage'];
  }

  // Defense
  stats['Defense'] = 400; // default value every char has
  if (stats['DefenseRating'])
    stats['Defense'] = (stats['Defense'] + (stats['DefenseRating'] / 5.03)).toFixed(0);
  stats['DefensePercentage'] = ((stats['Defense'] - 400) / 25).toFixed(2);

  // Dodge
  if (stats['DodgeRating']) {
    stats['Dodge'] = (stats['DodgeRating'] / 45.25).toFixed(2);
  }
}
