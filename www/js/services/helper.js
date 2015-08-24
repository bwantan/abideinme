angular.module('app.services').service('helper', function ($ionicBackdrop, $q, $timeout, $cordovaNetwork,$ionicPopup) {

    return (
    {

        setMapClickable: setMapClickable,
        isImage: isImage,
        toast: toast,
        toastLong: toastLong,
        isOffLine: isOffLine
    });

    function isOffLine(){
        if (window.cordova)
        {
            if ($cordovaNetwork.isOffline())
            {
                toastLong("You are currently offline!");
                return true;
            }
        }
        else{
            return false;
        }
    }

    function toast(message)
    {
        if (window.cordova)
        {
            window.plugins.toast.showShortBottom(message,
                function(a){console.log('toast success: ' + a)},
                function(b){alert('toast error: ' + b)})
        }

    }

    function toastLong(message)
    {
        window.plugins.toast.showLongBottom(message,
            function(a){console.log('toast success: ' + a)},
            function(b){alert('toast error: ' + b)})
    }

    function setMapClickable($rootScope, enabled){
        if (window.cordova)
        {
            if ($rootScope.map != null)
            {
                $rootScope.map.setClickable(enabled);
            }
        }
    };

    function isImage(src) {

        var deferred = $q.defer();

        var image = new Image();
        image.onerror = function() {
            deferred.resolve(false);
        };
        image.onload = function() {
            deferred.resolve(true);
        };

        $timeout(function() {
            deferred.resolve(false);
        }, 10000);

        image.src = src;

        return deferred.promise;
    }

})
