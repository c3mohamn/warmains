var charApp = angular.module("charApp", []);

charApp.controller('charctrl', ['$scope', '$http', function($scope, $http) {
    angular.element(document).ready(function () {

        $http.get('/character/find/').then(function(response){
            $scope.characters = response.data;
            $scope.test1 = "HELLO TEST1";
        });
    });

}]);
