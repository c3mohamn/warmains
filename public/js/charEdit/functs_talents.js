/* Add major glyphs to major, minor glyphs to minor and only glyphs of
 * specified char_class.
 */
function load_class_glyphs(char_class, major, minor) {
  var classes = {
    'warrior': 1, 'paladin': 2, 'hunter': 3, 'rogue': 4, 'priest': 5,
    'death knight': 6, 'shaman': 7, 'mage': 8, 'warlock': 9, 'druid': 11
  };

  for (var glyph in g_glyphs) {
    var cur_glyph = g_glyphs[glyph];

    if (classes[char_class] == cur_glyph.classs) { // class glyph
      cur_glyph.IconPath = cur_glyph.icon.toLowerCase();
      delete cur_glyph.icon;
      cur_glyph.Id = glyph;
      if (cur_glyph.type == 1)  { // is major glyph
        major[glyph] = cur_glyph;
        major[glyph].type = 'Major';
      } else if (cur_glyph.type == 2) { // is minor glyph
        minor[glyph] = cur_glyph;
        minor[glyph].type = 'Minor';
      }
    }
  }
}

/* Inserts the talents and into the DOM using info from all_talents based
 * on the class of the current character.
 */
function insert_talents(char_class) {

  if (!char_class)
    return false;

  var talents = all_talents[char_class];

  // Insert the backgrounds for each talent tree
  $('#tree-bg-left').attr('ng-style', "get_talent_img(0, 'background')");
  $('#tree-bg-center').attr('ng-style', "get_talent_img(1, 'background')");
  $('#tree-bg-right').attr('ng-style', "get_talent_img(2, 'background')");

  /* looping through all the talents and inserting them into their respective
   * locations in the talent tree. */
  for (var talent in talents) {
    var tree = talents[talent].tree,
        talent_name = talents[talent].name;
        row = talents[talent].row,
        col = talents[talent].col,
        tree_index = 0;

    // index of the tree used to get the name of the talent tree using class_specs
    if (tree == 'center') tree_index = 1;
    else if (tree == 'right') tree_index = 2;
    //console.log(talent, talents[talent].tree, talents[talent].row, talents[talent].col);

    // location of the talent in the DOM, determined by tree, row and col
    talent_loc = '.tree_' + tree + ' .r' + row + ' ' + '.c' + col + ' div';

    // replace empty spot with a talent spot
    $(talent_loc).removeClass('empty_talent_space');
    $(talent_loc).addClass('talent');
    $(talent_loc).attr('id', 'talent_' + talent);

    // set background image of talent
    $(talent_loc).attr('ng-style', "get_talent_img(" + tree_index + ", " + talent + ")");

    // set angular attributes for adding and removing talent points
    $(talent_loc).attr('ng-click', "add_point(" + talent + ")");
    $(talent_loc).attr('ng-right-click', "remove_point(" + talent + ")");
    $(talent_loc).attr('ng-class', "{'talent_inactive': is_inactive(" + talent + ")}");

    // add the tooltip
    $(talent_loc).attr('data-toggle', 'tooltip');
    $(talent_loc).attr('data-trigger', 'hover');
    $(talent_loc).attr('data-placement', 'bottom');
    $(talent_loc).attr('data-html', 'true');
    $(talent_loc).attr('data-original-title', '{{talent_tooltip(' + talent + ')}}');

    // insert the talent counter for the given talent into the DOM
    $(talent_loc).html("<div class='talent_counter' ng-class=\"{'maxed_talent': is_talent_maxed("
    + talent + ")}\">{{get_talent_count(" + talent + ")}}</div>");
  }
  $("body").tooltip({
    selector: '[data-toggle="tooltip"]'
  });
}

// return the sum of talent points spent in all the rows <= last_row
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
