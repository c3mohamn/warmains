var editApp = angular.module("editApp", []);

editApp.controller('editctrl', ['$scope', '$http', function($scope, $http) {
    angular.element(document).ready(function () {

        $http.get('/wowdata/Back.json').then(function(response){
            $scope.backs = response.data.items;
            var item_names = [];

            //angular.forEach(backs, function(item, key){
            //});
        });
        $http.get('/character/find/').then(function(response){
            $scope.characters = response.data;
            
        });
    });

}]);
