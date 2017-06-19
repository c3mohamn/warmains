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

      scope.slot = attrs.slot;

      // remove any open sockets
      remove_socket(3);
      remove_socket(2);
      remove_socket(1);

      if (char_items[scope.slot]) {
        toggle_sockets = 1;

        // Show gem sockets and their respective colours here.
        // Inserts the gem sockets if they exist as an <li> element
        if (char_items[scope.slot].SocketColor3 || scope.slot == 'Waist' || scope.slot == 'Hands' || scope.slot == 'Wrist') {
          var colour = 'Prismatic'; // For Eternal Belt Buckle Extra socket && BS sockets

          if (scope.slot != 'Waist' && scope.slot != 'Hands' && scope.slot != 'Wrist') colour = char_items[scope.slot].SocketColor3;
          scope.socket3 = colour;

          insert_gem_socket(scope.slot, 3);
          $compile($("#socket3_slot"))(scope);

          if (char_gems[scope.slot].socket3)
            set_slot_image('socket3', char_gems[scope.slot].socket3)
          else set_gem_bg('socket3', colour);
        }

        if (char_items[scope.slot].SocketColor2) {
          var colour = char_items[scope.slot].SocketColor2;
          scope.socket2 = colour;

          insert_gem_socket(scope.slot, 2);
          $compile($("#socket2_slot"))(scope);

          if (char_gems[scope.slot].socket2)
            set_slot_image('socket2', char_gems[scope.slot].socket2)
          else set_gem_bg('socket2', colour);
        }

        if (char_items[scope.slot].SocketColor1) {
          var colour = char_items[scope.slot].SocketColor1;
          scope.socket1 = colour;

          insert_gem_socket(scope.slot, 1);
          $compile($("#socket1_slot"))(scope);

          if (char_gems[scope.slot].socket1)
            set_slot_image('socket1', char_gems[scope.slot].socket1)
          else set_gem_bg('socket1', colour);
        };
      }
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
