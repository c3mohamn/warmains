var charApp = angular.module("charApp", []);

var back = {};
charApp.controller('charctrl', ['$scope', '$http', function($scope, $http) {
    angular.element(document).ready(function () {

        $http.get('/wowdata/Back.json').then(function(response){
            $scope.backs = response.data.items;
            var item_names = [];

            //angular.forEach(backs, function(item, key){
            //});
        });
    });

}]);
