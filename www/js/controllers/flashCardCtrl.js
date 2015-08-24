angular.module('app.controllers').controller('flipCardCtrl', function ($scope, $rootScope, $ionicLoading, helper,bible,
                                                                       $localstorage,$filter, $timeout, $ionicHistory) {

    $scope.verses = [];

    $scope.init = function(){
        $scope.settings = $localstorage.getObject("settings");
        bible.initDB();
        bible.getAllVerses().then(function(data){
            var verses = $filter('filter')(data, { status: 2 });
            $scope.verses = $filter('orderBy')(verses, 'date');
            angular.forEach($scope.verses, function(verse){
                verse.show = false;
            })
            $scope.showCount();

        });
        if ($scope.verses.length > 0)
        {
            angular.forEach($scope.verses, function(verse){
                verse.show = false;
            })
        }
    }

    $scope.done = function(){
      $ionicHistory.goBack();
    }

    $scope.videoHelp = function(){
        if (YoutubeVideoPlayer != undefined)
        {
            YoutubeVideoPlayer.openVideo('ouuM3y9vN4c');
        }
    }

    $scope.flipCard = function(verse)
    {
        verse.show = !verse.show;
    }

    $scope.correctAnswer = function(verse, index){
        $scope.verses.splice(index, 1);
        $scope.showCount();
        verse.status = verse.status + 1;
        verse.correct = true;
        bible.initDB();
        bible.updateVerse(verse);
    }

    $scope.showCount = function(){
        $timeout(function() {
            if ($scope.verses.length <= 0)
            {
                if ($scope.verses.length <= 0)
                {
                    $ionicHistory.goBack();
                }
            }
            else
            {
                helper.toast($scope.verses.length +  $filter('translate')('FLASH_CARD.4'));
            }

        });
    }

    $scope.cardDestroyed = function(verse, index) {
        $scope.verses.splice(index, 1);
        $scope.showCount();
    };

    $scope.wrongAnswer = function(verse, index){
        $scope.verses.splice(index, 1);
        $scope.showCount();
    }

    $scope.$on('flashCard.reload', function(event,message) {
        $scope.init();
    });
})
