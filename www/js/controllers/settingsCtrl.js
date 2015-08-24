angular.module('app.controllers').controller('settingsCtrl', function ($scope, $rootScope, bible,$ionicLoading, helper,
                                                                       $timeout, $localstorage, $translate, $state,$filter) {


    $scope.availVersions = {};
    $scope.languages = {};
    $scope.days = [];
    $scope.settings = {};

    $scope.selectLanguage = function(){
        var languages = $scope.languages.sort(function(a, b) {
            return a.text.localeCompare(b.text);
        });

        var config = {
            title: "",
            items: languages,
            selectedValue: $scope.settings.language.value,
            doneButtonLabel: $filter('translate')('MENU.Done'),
            cancelButtonLabel: $filter('translate')('MENU.Cancel')
        };
        // Show the picker
        window.plugins.listpicker.showPicker(config,
            function(item) {

                angular.forEach($scope.languages, function(selected){
                    if (selected.value == item){
                        $scope.settings.language = selected;
                    }
                })

                $localstorage.setObject('settings',$scope.settings);
                $translate.use(item);
                window.location.reload();

            },
            function() {

            }
        );
    }

    $scope.stageChange = function(){
        $localstorage.setObject('settings',$scope.settings);
    }

    $scope.selectBibleLanguage = function(){
        var bibleLanguages = $scope.languages.sort(function(a, b) {
            return a.text.localeCompare(b.text);
        });
        var config = {
            title: $filter('translate')('MENU.SelectLanguage'),
            items: bibleLanguages,
            selectedValue: $scope.settings.bibleLanguage,
            doneButtonLabel: $filter('translate')('MENU.Done'),
            cancelButtonLabel: $filter('translate')('MENU.Cancel')
        };

        // Show the picker
        window.plugins.listpicker.showPicker(config,
            function(item) {
                $scope.settings.bibleLanguage = item;

                $localstorage.setObject('settings',$scope.settings);
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
        var languageSelect = bibles.shift();
        var bibles = $scope.availVersions[$scope.settings.bibleLanguage].sort(function(a, b) {
            return a.text.localeCompare(b.text);
        });
        bibles.unshift(languageSelect);

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

    $scope.init = function(){
        var settings = $localstorage.getObject("settings");

        if (settings != undefined)
        {
            $scope.settings = settings;
            $rootScope.settings = $scope.settings;
        }

        bible.getBibleVersion().then(function(data){
            $scope.availVersions = data;

        });

        $scope.languages = [
            { "text": "English", "value": "en" },
            { "text": "简体中文", "value": "zh"},
            { "text": "繁體中文", "value": "tw"}
        ]

        for (var i = 1; i <= 20;i++){
            $scope.days.push({
                value: i
            })
        }
    }

    $scope.$on('settings.reload', function(event,message) {
        $scope.init();
    });

    $scope.$watch('settings.cardDisplay', function() {
        $localstorage.setObject('settings',$scope.settings);
        $rootScope.settings = $scope.settings;
        $rootScope.$broadcast('verse.cardDisplay');
    });

    $scope.$watch('settings.fontSize', function() {
        if ($scope.settings != undefined)
        {
            if ($scope.settings['fontSize'] != undefined)
            {
                $localstorage.setObject('settings',$scope.settings);
                $rootScope.$broadcast('verse.fontchange', { 'size' : $scope.settings.fontSize });
            }
        }
    });

    $scope.default = function(){
        $scope.settings = $localstorage.getObject("settings");

        if ($scope.settings != undefined)
        {
            $scope.settings.fontSize = 16;
            $scope.settings.cardDisplay = false;
            $rootScope.settings = $scope.settings;
            $localstorage.setObject('settings',$scope.settings);

        }
        $scope.init();
    }
})
