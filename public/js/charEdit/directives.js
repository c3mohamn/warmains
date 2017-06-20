// ng-right-click directive
editApp.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

// Directive to show gem sockets for item when clicking on item in char panel
editApp.directive('showGems', function ($compile) {
  function link_fn(scope, element, attrs) {
    element.bind('click', function() {
      // reset socket informaton when clicking on a slot
      scope.cur_socket = '';
      scope.socket1 = '';
      scope.socket2 = '';
      scope.socket3 = '';
      var slot = attrs.slot;

      if (prev_slot != slot) // reset toggle when clicking a new item slot
        toggle_sockets = 0;

      // remove any open sockets
      remove_socket(3);
      remove_socket(2);
      remove_socket(1);
      prev_slot = slot; // used for toggling sockets

      if (char_items[slot] && toggle_sockets == 0) {
        toggle_sockets = 1;

        // Show gem sockets and their respective colours here.
        // Inserts the gem sockets if they exist as an <li> element
        if (char_items[slot].SocketColor3 || slot == 'Waist' || slot == 'Hands' || slot == 'Wrist') {
          var colour = 'Prismatic'; // For Eternal Belt Buckle Extra socket && BS sockets

          if (slot != 'Waist' && slot != 'Hands' && slot != 'Wrist') colour = char_items[slot].SocketColor3;
          scope.socket3 = colour;

          insert_gem_socket(slot, 3);
          $compile($("#socket3_slot"))(scope);

          if (char_gems[slot].socket3)
            set_slot_image('socket3', char_gems[slot].socket3)
          else set_gem_bg('socket3', colour);
        }

        if (char_items[slot].SocketColor2) {
          var colour = char_items[slot].SocketColor2;
          scope.socket2 = colour;

          insert_gem_socket(slot, 2);
          $compile($("#socket2_slot"))(scope);

          if (char_gems[slot].socket2)
            set_slot_image('socket2', char_gems[slot].socket2)
          else set_gem_bg('socket2', colour);
        }

        if (char_items[slot].SocketColor1) {
          var colour = char_items[slot].SocketColor1;
          scope.socket1 = colour;

          insert_gem_socket(slot, 1);
          $compile($("#socket1_slot"))(scope);

          if (char_gems[slot].socket1)
            set_slot_image('socket1', char_gems[slot].socket1)
          else set_gem_bg('socket1', colour);
        };
      } else toggle_sockets = 0;
    });
  }
  return {
    restrict: 'A',
    scope: false,
    link: {
      post: link_fn
    }
  }
});
