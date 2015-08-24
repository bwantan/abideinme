angular.module('app.controllers').controller('menuCtrl', function ($scope,$ionicLoading, $rootScope,$ionicPopup,
                                                                   helper, $timeout, $ionicSideMenuDelegate, $state) {

    $scope.loadSettings = function(path){
        $timeout(function() {
            $rootScope.$broadcast('settings.reload');
        },50);
    }

    $scope.loadVerse = function(path){
      $timeout(function() {
        $rootScope.$broadcast('verse.cardDisplay');
      },50);
    }


});
