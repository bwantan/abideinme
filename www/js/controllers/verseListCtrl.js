angular.module('app.controllers').controller('verseListCtrl', function ($scope, $rootScope, $ionicLoading,
                                                                        $ionicModal, helper, $state,$ionicActionSheet,
                                                                        $filter, $timeout, bible, $ionicPopover,$translate, $state, $ionicHistory,
                                                                        $localstorage, $ionicLoading,$location,
                                                                        $ionicTabsDelegate, $ionicScrollDelegate, $ionicListDelegate, $cordovaSocialSharing) {

    $scope.edit = false;
    $scope.editText = $filter('translate')('VERSE_LIST.6');
    $scope.shouldShowDelete = false;
    $scope.allVerses = [];
    $scope.settings = {};

    $scope.share = function(verse){
        var passage = verse.passage + verse.reference + " (" + verse.version + ")";
        var subject =  verse.reference + " (" + verse.version + ")";
        var link = "";
        var file = null;
        var image = null;

        $cordovaSocialSharing
            .share(passage, subject, file, link) // Share via native share sheet
            .then(function(result) {
                // Success!
            }, function(err) {
                // An error occured. Show a message to the user
            });
    }

    $scope.changeLanguge = function(lang){
        $translate.use(lang);
        $timeout(function() {
            $state.go($state.current, {}, {reload: true});
        }, 100);
    }

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/changeFont.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });

    // Execute action on hide popover
    $scope.$on('popover.close', function() {
        $scope.popover.hide();
    });

    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
        // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
        // Execute action
    });

    $scope.$on('verse.fontchange', function(event,message) {
        if ($scope.settings != undefined)
        {
            $scope.settings.fontSize = message.size;
        }
    });

    $scope.changeFont = function($event){
        $scope.popover.show($event);
        $timeout(function() {
            $rootScope.$broadcast('settings.reload');
        });
    }

    $scope.showDueDate = function(verseDue){
        var today = new Date();
        var dueDate = new Date(verseDue);

        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        var utc2 = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        var diffDays = Math.floor((utc2 - utc1) / _MS_PER_DAY);

        var returnString;

        if (diffDays == 0)
        {
            returnString = "Today";
        }
        else if (diffDays < 0)
        {
            if (diffDays == -1)
            {
                returnString = "Yesterday";
            }
            else
            {
                returnString = Math.abs(diffDays) + " day(s) ago";
            }
        }
        else
        {
            if (diffDays == 1)
            {
                returnString = "Tomorrow";
            }
            else
            {
                returnString = "In " + diffDays + " day(s)";
            }
        }
        return returnString;
    }

    Date.prototype.addDays = function (num) {
        var value = this.valueOf();
        value += 86400000 * num;
        return new Date(value);
    }

    $scope.changeStatus = function(verse, status){
        var originalStatus = verse.status;
        var newDueDate = new Date();

        switch(status)
        {
            case 1: // new
                verse.dueDate = "";
                verse.stageTwo = false;
                verse.repeat = 0;
                verse.dueDate = "";
                break;
            case 2: // due
                if (originalStatus == 1 && status == 2)
                {
                    verse.dueDate = new Date()
                }
                break;
            case 3: // known

                if (!verse.stageTwo && (parseInt(verse.repeat) < parseInt($scope.settings.stage1)))
                {
                    var numberOfDaysToAdd = 1;
                    verse.repeat = parseInt(verse.repeat) + 1;
                    verse.dueDate = newDueDate.addDays(1);
                }
                else
                {
                  verse.dueDate = newDueDate.addDays($scope.settings.stage2);
                  verse.stageTwo = true;
                }
                break;
        }
        verse.status = status;
        bible.updateVerse(verse);
        var tabno = $ionicTabsDelegate.selectedIndex();
        $ionicScrollDelegate.$getByHandle(tabno).resize();
    }

    $scope.changeStatusAll = function(verse, status, execute){
        if (execute)
        {
            $scope.changeStatus(verse, status);
        }
    }

    $scope.likeVerse = function(verse){
        verse.like = !verse.like;
        bible.updateVerse(verse);
        var tabno = $ionicTabsDelegate.selectedIndex();
        $ionicScrollDelegate.$getByHandle(tabno).resize();
    }

    $scope.changeSelectedStatus = function(status){
        angular.forEach($scope.allVerses, function(verse){
            if (verse.checked)
            {
                if (status == 1)
                {
                    if (verse.status == 2 || verse.status == 3)
                    {
                        verse.status = verse.status-1;
                        bible.updateVerse(verse);
                    }
                }
                else{
                    if (verse.status == 1 || verse.status == 2)
                    {
                        verse.status = verse.status+1;
                        bible.updateVerse(verse);
                    }
                }
            }
        })
        $scope.editMode();
        $scope.edit = false;
    }

    $scope.more = function(verse,$event){

        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: "<i class='ion-share'></i> " + $filter('translate')('VERSE_LIST.11') },
                { text: "<i class='ion-ios-heart'></i> " + $filter('translate')('VERSE_LIST.12') },
                { text: "<i class='ion-arrow-left-a' style='font-size: x-large'></i> " + $filter('translate')('VERSE_LIST.16')},
                { text: "<i class='ion-arrow-right-a' style='font-size: x-large'></i> " + $filter('translate')('VERSE_LIST.17')},
            ],
            titleText: '',
            cancelText: $filter('translate')('VERSE_LIST.13'),
            cancel: function() {
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function(index) {
                var execute = false;
                switch (index)
                {
                    case 0:
                        // share
                        $scope.share(verse);
                        break;
                    case 1:
                        // favorite
                        $scope.likeVerse(verse);
                        break;
                    case 2:
                        // right
                        if (verse.status == 2 || verse.status == 3){
                            $scope.changeStatus(verse, parseInt(verse.status)-1);
                        }

                        break;
                    case 3:
                        // left
                        if (parseInt(verse.status) == 1 || parseInt(verse.status) == 2){

                            $scope.changeStatus(verse, parseInt(verse.status)+1);
                        }
                        break;
                }
                $ionicListDelegate.closeOptionButtons();
                return true;
            }
        });
        $event.stopPropagation();
    }

    $scope.cardMore = function(verse){
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: "<i class='ion-share'></i> " + $filter('translate')('VERSE_LIST.11') },
                { text: "<i class='ion-document'></i> " + $filter('translate')('VERSE_LIST.15') }
            ],
            titleText: '',
            cancelText: $filter('translate')('VERSE_LIST.13'),
            cancel: function() {
                $ionicListDelegate.closeOptionButtons();
            },
            buttonClicked: function(index) {
                var execute = false;
                switch (index)
                {
                    case 0:
                        // share
                        $scope.share(verse);
                        break;
                    case 1:
                        // favorite
                        $scope.showDetail(verse);
                        break;
                }
                $ionicListDelegate.closeOptionButtons();
                return true;
            }
        });
        $event.stopPropagation();
    }

    $scope.init = function(){
        var settings = $localstorage.getObject("settings");

        if (settings != undefined)
        {
            $scope.settings = settings;
            $rootScope.settings = $scope.settings;
        }
        $ionicLoading.show();
        bible.initDB();

        bible.getAllVerses().then(function(data){
            $scope.allVerses = data;
            $ionicLoading.hide();
        });
    }

    $scope.videoHelp = function(){
        YoutubeVideoPlayer.openVideo('t8jfcp85CKw');
    }

    $scope.editMode = function(){
        if ($scope.edit == false)
        {
            $scope.editText = $filter('translate')('VERSE_LIST.7');
            $scope.edit = true;
        }
        else{
            $scope.editText = $filter('translate')('VERSE_LIST.6');
            $scope.edit = false;
        }

    }

    $scope.$on('Verselist.CheckDue', function(event,message) {
      var today = new Date();
      var dueVerses = $filter('filter')($scope.allVerses, { status: 3 });
      angular.forEach(dueVerses, function(verse){
        var dueDate = new Date(verse.dueDate);
        var _MS_PER_DAY = 1000 * 60 * 60 * 24;
        var utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        var utc2 = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        var diffDays = Math.floor((utc2 - utc1) / _MS_PER_DAY);
        if (diffDays == 0)
        {
          verse.status = 2;
          bible.updateVerse(verse);
        }
      })
    });

    $scope.$on('verse.cardDisplay', function(event,message) {
        $scope.settings = $rootScope.settings;
        var tabno = $ionicTabsDelegate.selectedIndex();
        $ionicScrollDelegate.$getByHandle(tabno).resize();
    });

    $scope.addVerse = function(){
        $scope.edit = false;
        $state.go('app.new', {location: 'replace'});
    }

    $scope.showDetail = function(verse){
        $scope.edit == false;
        $ionicListDelegate.closeOptionButtons();

        $state.transitionTo('app.verse', { 'verse': verse });
    }

    $scope.flashCard = function(){
        $scope.edit = false;
        var dueVerses = $filter('filter')($scope.allVerses, { status: 2 });

        if (dueVerses.length > 0)
        {
            $timeout(function() {
                $state.go("app.flipcard");
                $rootScope.$broadcast('flashCard.reload');
            });
        }
        else{
            helper.toast("No due verses.");
        }
    }

    $scope.deleteVerse = function(verse, index, $event){
        bible.deleteVerse(verse);
        var tabno = $ionicTabsDelegate.selectedIndex();
        $ionicScrollDelegate.$getByHandle(tabno).resize();
        $event.stopPropagation();
        $ionicListDelegate.closeOptionButtons();
    }

    $scope.$on('verselist.reload', function(event,message) {
        $scope.init();
        var delegate = $ionicTabsDelegate.$getByHandle("verses");
        if (delegate != undefined)
        {
            $timeout(function() {
                delegate.select(0);
            }, 50);
        }
        var tabno = $ionicTabsDelegate.selectedIndex();
        $ionicScrollDelegate.$getByHandle(tabno).resize();
        $ionicScrollDelegate.$getByHandle('newScroll').scrollBottom(true);
    });
})
