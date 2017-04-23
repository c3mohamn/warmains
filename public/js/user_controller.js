var registerApp = angular.module("registerApp", []);

registerApp.controller('registerctrl', ['$scope', '$http', function($scope, $http) {
    angular.element(document).ready(function () {

        $http.get('/users/AllUser/').then(function(response){
            var all_users = response.data;

            // function used to check if duplicate user name.
            $scope.check_username = function() {
                var entered_user = $scope.user_name;

                if (entered_user && entered_user.length > 2) {
                    entered_user = entered_user.toLowerCase();
                    var is_duplicate = false;

                    // cycle through db usernames and compare
                    angular.forEach(all_users, function(user, key){
                        if (user.username == entered_user) {
                            is_duplicate = true;
                        }
                    });
                    if (is_duplicate) {
                        $scope.duplicate_username = "Username is already taken.";
                        change_border_red(username);
                        user_exists = true;
                    } else {
                        $scope.duplicate_username = "";
                        change_border_green(username);
                        user_exists = false;
                    }
                }
            }

            // function used to check if email address already in use.
            $scope.check_email = function() {
                var entered_email = $scope.email_addr;

                if (entered_email && entered_email.length > 4) {
                    entered_email = entered_email.toLowerCase();
                    var is_duplicate = false;

                    // cycle through db usernames and compare
                    angular.forEach(all_users, function(user, key){
                        if (user.email == entered_email) {
                            is_duplicate = true;
                        }
                    });
                    if (is_duplicate) {
                        $scope.duplicate_email = "Email Address already used.";
                        change_border_red(email);
                        email_used = true;
                    } else {
                        $scope.duplicate_email = "";
                        change_border_green(email);
                        email_used = false;
                    }
                }
            }


        });
    });
}]);
