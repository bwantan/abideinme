angular.module('app.services').service('$localstorage', function ($window) {

    return {
        set: function(key, value) {
            window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            if (window.localStorage[key])
            {
                return JSON.parse(window.localStorage[key]);
            }
            else
            {
                return undefined;
            }
        },
        remove: function(key){
            window.localStorage.removeItem(key);
        },
        clear: function(){
            window.localStorage.clear();
        }
    }

})
