// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);
angular.module('app.filters', []);

angular.module('app', ['ionic', 'ngResource','ngCordova', 'app.controllers', 'ionic.contrib.ui.cards', 'app.services', 'app.directives', 'app.filters','pascalprecht.translate']);

angular.module('app').run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    document.addEventListener("resume", function (event) {
      $rootScope.$broadcast("Verselist.CheckDue");
    });

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
      if (window.localStorage['settings']  == undefined)
      {
        $rootScope.settings = {
          fontSize: 16,
          language: {
            text: 'English',
            value: 'en'
          },
          bibleLanguage: 'en',
          bibleVersion: 'NKJV',
          cardDisplay: false,
          stage1: 5,
          stage2: 5
        };
        window.localStorage['settings'] = JSON.stringify($rootScope.settings);
      }
      else
      {
        $rootScope.settings = JSON.parse(window.localStorage['settings'] || '{}');
      }
    }
  });
});

angular.module('app').config(['$ionicConfigProvider', function($ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('bottom'); // other values: top
  $ionicConfigProvider.views.transition('ios');
  $ionicConfigProvider.tabs.style("standard");
  $ionicConfigProvider.navBar.alignTitle('center').positionPrimaryButtons('left');

}]);

angular.module('app').config(['$translateProvider', function($translateProvider) {
  $translateProvider
    // cs: language locales from lang/*.json by static loader
    .useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
    })
  if (window.localStorage['settings']  != undefined)
  {
    var settings = JSON.parse(window.localStorage['settings']);

    $translateProvider.preferredLanguage(settings.language.value);
  }
  else{
    var settings = {
      fontSize: 16,
      language: {
        text: 'English',
        value: 'en'
      },
      bibleLanguage: 'en',
      bibleVersion: 'NKJV',
      cardDisplay: false,
      stage1: 5,
      stage2: 5
    };
    window.localStorage['settings'] = JSON.stringify(settings);
    $translateProvider.preferredLanguage(settings.language.value);
  }


}]);

angular.module('app').constant('$ionicLoadingConfig', {
  template: '<ion-spinner></ion-spinner>',
  delay: 0,
  noBackdrop: true,
  duration: 15000
});

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html'
    })

    .state('app.help', {
      url: '/help',
      views: {
        'menuContent': {
          templateUrl: 'templates/help.html'
        }
      }
    })

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html'
        }
      }
    })
    .state('app.account', {
      url: '/account',
      views: {
        'menuContent': {
          templateUrl: 'templates/account.html'
        }
      }
    })
    .state('app.verses', {
      url: '/verses',
      views: {
        'menuContent': {
          templateUrl: 'templates/verseList.html'
        }
      }
    })

    .state('app.friends', {
      url: '/friends',
      views: {
        'menuContent': {
          templateUrl: 'templates/friends.html'
        }
      }
    })

    .state('app.new', {
      url: '/new',
      views: {
        'menuContent': {
          templateUrl: 'templates/addNew.html'
        }
      }
    })

    .state('app.flipcard', {
      url: '/flipcard',

      views: {
        'menuContent': {
          templateUrl: 'templates/flashCard.html'
        }
      }
    })

    .state('app.verse', {
      url: '/verse/:verseid',
      params: {verse: null},
      views: {
        'menuContent': {
          templateUrl: 'templates/verse.html'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/verses');

});

//angular.module('app').config(function ($cordovaAppRateProvider) {
//  document.addEventListener("deviceready", function () {
//    var prefs = {
//      language: 'en',
//      appName: 'Pandoo',
//      iosURL: '987372773',
//      androidURL: 'market://details?id=com.boonwan.pandoo&hl=en'
//    };
//
//    $cordovaAppRateProvider.setPreferences(prefs)
//
//  }, false);
//});

