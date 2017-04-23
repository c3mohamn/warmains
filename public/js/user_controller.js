var registerApp = angular.module("registerApp", []);

// functions fade border colour if duplicate usernames or valid username
function name_border_red() {
    if ($('input[name=userfield]').css('border-left-color') != 'rgb(197, 0, 0)') {
        $('input[name=userfield]').fadeTo('slow', 0.3, function() {
            $(this).css("border", "1px solid #C50000");
        }).fadeTo('slow', 1);
    }
}
function name_border_green() {
    if ($('input[name=userfield]').css('border-left-color') != 'rgb(10, 197, 0)') {
        $('input[name=userfield]').fadeTo('slow', 0.3, function() {
            $(this).css("border", "1px solid #0AC500");
        }).fadeTo('slow', 1);
    }
}

registerApp.controller('registerctrl', ['$scope', '$http', function($scope, $http) {
    angular.element(document).ready(function () {

        $http.get('/users/AllUser/').then(function(response){
            var all_users = response.data;
            var prev_user = ""; // will use to use if entered user name changed

            // function used to check if duplicate user name.
            $scope.check_username = function() {
                var cur_user = $scope.user_name;

                if (cur_user && cur_user.length > 2 && cur_user != prev_user) {
                    cur_user_prev = cur_user;
                    cur_user = cur_user.toLowerCase();
                    var is_duplicate = false;

                    // cycle through db usernames and compare
                    angular.forEach(all_users, function(user, key){
                        if (user.username.toLowerCase() == cur_user) {
                            is_duplicate = true;
                        }
                    });
                    if (is_duplicate) {
                        $scope.duplicate_username = "Username is already taken.";
                        name_border_red();

                    } else {
                        $scope.duplicate_username = "";
                        name_border_green();
                    }
                }
            }

            // TODO: CHECK IF EMAIL IS ALREADY TAKEN NOW.
            // TODO: DISABLE CREATE ACCOUNT BUTTON FOR DUPLICATES.

        });
    });
}]);
