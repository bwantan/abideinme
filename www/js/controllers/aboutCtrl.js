angular.module('app.controllers').controller('aboutCtrl', function ($scope, $ionicModal, $rootScope, helper, $cordovaEmailComposer, $ionicPopup,
                                                                    $cordovaAppRate, $cordovaSocialSharing, $state) {


    $scope.init = function(){
      if (window.cordova)
      {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.version = version;
        });
      }
    }

    $scope.feedback = function(){
        $cordovaEmailComposer.isAvailable().then(function() {
            // is available
        }, function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Info',
                template: 'Your email account is not setup correctly.'
            });
            alertPopup.then(function(res) {
                //console.log('Thank you for not eating my delicious ice cream cone');
            });
        });

        var email = {
            to: 'contact@pandoo.sg',
            cc: '',
            bcc: '',
            subject: 'AbideInME App',
            body: '',
            isHtml: true

        };

        $cordovaEmailComposer.open(email).then(null, function () {


        });
    }

    $scope.share = function(){
        var message = "App Preview: https://www.youtube.com/watch?v=Uusz1Fkv0R8. Download: ";
        var subject = "AbideInME Memory Verse App";
        var link = "http://goo.gl/AoBlTo";
        var file = null;
        var image = null;

        $cordovaSocialSharing
            .share(message, subject, file, link) // Share via native share sheet
            .then(function(result) {
                // Success!
            }, function(err) {
                // An error occured. Show a message to the user
            });

    }

    $scope.rating = function(){
        $cordovaAppRate.navigateToAppStore().then(function (result) {
            // success
        });
    }
})
