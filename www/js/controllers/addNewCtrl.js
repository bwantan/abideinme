angular.module('app.controllers').controller('addNewCtrl', function ($scope, $rootScope, $ionicLoading, bible,
                                                                    helper, $ionicPopover, $cordovaSocialSharing,
                                                                     $timeout, $ionicHistory, $filter, $ionicActionSheet,
                                                                     $cordovaClipboard, $ionicScrollDelegate,
                                                                     $localstorage, $ionicNavBarDelegate) {


    $scope.verse = {};
    $scope.settings = {};
    $scope.new = true;
    $scope.verseSelected = false;
    $scope.newVerses = [];
    $scope.availVersions = {};
    $scope.languages = {};
    $scope.showSearchResult = false;

    $scope.selectBook = function(reference){
        $scope.verse.reference = reference + " ";
        $scope.showSearchResult = false;
        $ionicScrollDelegate.$getByHandle("contentHandle").resize();
        $ionicScrollDelegate.$getByHandle("contentHandle").scrollTop(true);
        $timeout(function() {
            document.getElementById("reference").focus();
        });
    }

    $scope.cancelEntry = function(){
        $scope.verse.reference = "";
        $scope.showSearchResult = false;
    }

    $scope.clearVerse = function(){
        $scope.verse.reference = "";
        $scope.showSearchResult = false;
        $timeout(function() {
            document.getElementById("reference").focus();
        });
    }

    $scope.init = function(){
        $ionicNavBarDelegate.showBackButton(true)
        if ($localstorage.getObject("settings") != undefined)
        {
            $scope.settings = $localstorage.getObject("settings");
        }

        bible.getBibleVersion().then(function(data){
            $scope.availVersions = data;
        });
        bible.getLanguage().then(function(data){
            $scope.languages = data;
        });
        bible.getBooks().then(function(data){
            $scope.books = data;
        });
    }

    $scope.$on('verse.init', function() {
        $scope.init();
    });

    $scope.saveVerses = function(){
        $ionicLoading.show();
        bible.initDB();

        angular.forEach($scope.newVerses, function(verse){
            bible.addVerse(verse);
        })

        $ionicLoading.hide();
        $ionicHistory.goBack();

        $timeout(function() {
            $rootScope.$broadcast('verselist.reload');
        }, 50);

    }

    $scope.videoHelp = function(){
        YoutubeVideoPlayer.openVideo('cufLAhehBc4');
    }

    $scope.closeWindow = function(){
        $scope.verse = {};
        $rootScope.$broadcast('modal.close');
        if (window.cordova && cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.close();
        }
    }

    $scope.shareVerse = function(){
        var passage = $scope.verse.passage;
        var subject = "AbidInMe App";
        var link = "http://goo.gl/sGHJLa";
        var file = null;
        var image = null;

        $cordovaSocialSharing
            .share(message, subject, file, link) // Share via native share sheet
            .then(function(result) {
                // Success!
                $timeout(function() {
                    $scope.verse.bibleversion = "NKJV"
                }, 50);
            }, function(err) {
                // An error occured. Show a message to the user
            });
    }


    $scope.selectBibleLanguage = function(){
        var bibleLanguage = $scope.languages['language'].sort(function(a, b) {
            return a.text.localeCompare(b.text);
        });
        var config = {
            title: $filter('translate')('MENU.SelectLanguage'),
            items: bibleLanguage,
            selectedValue: $scope.settings.bibleLanguage,
            doneButtonLabel: $filter('translate')('MENU.Done'),
            cancelButtonLabel: $filter('translate')('MENU.Cancel')
        };
        // Show the picker
        window.plugins.listpicker.showPicker(config,
            function(item) {
                $scope.settings.bibleLanguage = item;
                $timeout(function() {
                    $scope.selectBible();
                }, 600);
            },
            function() {

            }
        );
    }

    $scope.selectBible = function(){
        var selectLanguage = false;
        var bibles = $scope.availVersions[$scope.settings.bibleLanguage];

        var languageSelct = bibles.shift();
        var bibles = $scope.availVersions[$scope.settings.bibleLanguage].sort(function(a, b) {
            return a.text.localeCompare(b.text);
        });
        bibles.unshift(languageSelct);

        var config = {
            title: $filter('translate')('MENU.SelectBible'),
            items: bibles,
            selectedValue: $scope.settings.bibleVersion,
            doneButtonLabel: $filter('translate')('MENU.Done'),
            cancelButtonLabel: $filter('translate')('MENU.Cancel')
        };

        // Show the picker
        if (window.cordova)
        {
            window.plugins.listpicker.showPicker(config,
                function(item) {
                    if (item == "BOONWAN")
                    {
                        $timeout(function() {
                            $scope.selectBibleLanguage();
                        }, 600);
                    }
                    else
                    {
                        $timeout(function() {
                            $scope.settings.bibleVersion = item;
                            $localstorage.setObject('settings',$scope.settings);

                        }, 50);

                    }
                },
                function() {

                }
            );
        }
    }

    $scope.isNumeric = function(input){
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return (RE.test(input));
    }

    $scope.closeKeyboard = function(){
        if (window.cordova && cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.close();
        }
    }

    $scope.selectVerse = function(){
        if ($scope.verseSelected == false)
        {
            $scope.verseSelected = true;
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: 'Copy' },
                    { text: 'Share' }
                ],
                titleText: 'Share Verse',
                cancel: function() {
                    $scope.verseSelected = false;
                },
                buttonClicked: function(index) {
                    switch (index)
                    {
                        case 0:
                            $cordovaClipboard
                                .copy($scope.verse.passage)
                                .then(function () {
                                    // success
                                    helper.toast("Passage is copied");
                                }, function () {
                                    // error
                                });
                            break;
                        case 1:
                            break;
                    }
                    $scope.verseSelected = false;
                    return true;
                }
            });
        }
    }

    $scope.contentTap = function()
    {
        $scope.showSearchResult = false;
    }
    $scope.typeSearch = function(){
        var reference = $scope.verse.reference;
        if (!$scope.showSearchResult)
        {
            $ionicScrollDelegate.$getByHandle("contentHandle").scrollTop(true);
        }
        $scope.showSearchResult = true;
    }

    $scope.extractReference = function(reference){

        reference = angular.lowercase(reference);
        reference = reference.replace(/\s+/g, " ");

        if (parseInt(reference[0]))
        {
            var array1 = reference.split(" ");
            var array2 = array1[2].split(":");
            var book = array1[0] + " " + array1[1];
            var chapter = array2[0];
            if (array2.length > 1)
            {
                var array3 = array2[1].split("-");
                if (array3.length == 1)
                {

                    var verseStart = parseInt(array2[1]);
                    var verseEnd = parseInt(array2[1]);

                }
                else
                {
                    var verseStart = parseInt(array3[0]);
                    var verseEnd = parseInt(array3[1]);
                }
            }
        }
        else
        {

            var array1 = reference.split(" ");
            var array2 = array1[1].split(":");
            var book = array1[0];
            var chapter = array2[0];

            if (array2.length > 1)
            {
                var array3 = array2[1].split("-");
                if (array3.length == 1)
                {

                    var verseStart = parseInt(array2[1]);
                    var verseEnd = parseInt(array2[1]);

                }
                else
                {
                    var verseStart = parseInt(array3[0]);
                    var verseEnd = parseInt(array3[1]);
                }
            }

        }

        angular.forEach($scope.books[$scope.settings.bibleLanguage], function(bibleBook){

            if (bibleBook.name == book)
            {

                book = bibleBook.id;
            }
        })

        return {
            book : book,
            chapter: chapter,
            verseStart: verseStart,
            verseEnd: verseEnd
        };
    }

    $scope.showAllBooks = function(){
        if ($scope.showSearchResult)
        {
            $scope.showSearchResult = false;
        }
        else{
            $scope.showSearchResult = true;
        }
    }

    $scope.findVerse = function(){
      if (helper.isOffLine())
        return;

        var reference = $scope.verse.reference;
        var bibleVersion = $scope.settings.bibleVersion;
        var book = "";
        var chapter = 0;
        var verseStart = 0;
        var verseEnd = 0;
        $scope.showSearchResult = false;

        if (reference.length > 0)
        {
            var verseInfo = $scope.extractReference(reference);

            book = verseInfo.book;
            chapter = verseInfo.chapter;
            verseStart = verseInfo.verseStart;
            verseEnd = verseInfo.verseEnd;

            if (window.cordova && cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }

            $ionicLoading.show();

            bible.findVerse(reference, book, chapter, verseStart, verseEnd, $scope.settings.bibleVersion, $scope.settings.bibleLanguage)
                .then(
                function(data){
                    if (data.passage.length > 0)
                    {
                        $scope.newVerses.push({
                            'status': "1",
                            "like": false,
                            'version': data.version,
                            "reference": data.reference,
                            "passage": data.passage,
                            "bookId": book,
                            "date": new Date(),
                            "repeat": 0,
                            "stageTwo": false,
                            "dueDate": ""
                        })
                        $ionicScrollDelegate.$getByHandle("contentHandle").scrollBottom(true);
                    }

                    $scope.verse.chapter = chapter;
                    $ionicLoading.hide();
                },
                function( errorMessage ) {

                    $ionicLoading.hide();
                }
            );
        }
    }
})
