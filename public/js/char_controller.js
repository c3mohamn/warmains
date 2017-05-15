var charApp = angular.module("charApp", []);

// doesn't work with ng-click there.
$('.table1').on('click', '.table1r', function(event) {
  console.log('DOES THIS DO ANYTHING.');
  $(this).addClass('bg-info').siblings().removeClass('bg-info');
});


charApp.controller('charctrl', ['$scope', '$http', function($scope, $http) {
  $scope.selected_char = '';

    angular.element(document).ready(function () {
        $http.get('/character/findall/').then(function(response){
            $scope.characters = response.data;
        });

        //$scope.selected_char = '';

        /* Mark the char as the currently selected character. */
        $scope.select_char = function(char) {
          $scope.selected_char = char;
        }


        /* Redirect user to the profile page of selected_char. */
        $scope.redirect_edit = function() {
          if (!$scope.selected_char) {
            $scope.message = 'Select a character first please.';
          } else {
            var url = '/character/profile/' + $scope.characters[0].username +
                      '/' + $scope.selected_char;
            window.location = url;
          }
        }

        /* Delete the character from database.
         */
        $scope.delete_char = function() {
          if (!$scope.selected_char) {
            $scope.message = 'Select a character first please.';
          } else {
            $http.post('/character/delete', {
              char: $scope.selected_char
            }).then(function successCallback(response) {
                console.log(response);
              }, function errorCallback(response) {
                console.log(response);
              });
              window.location.reload();
            }
        }
    });
}]);
