angular.module('app.services').service('timer', function ($interval) {
    var clock = null;
    return (
    {
        start: start,
        stop: stop

    });

    function start(fn, duration){
        if(clock === null){
            clock = $interval(fn, duration);
        }
    };

    function stop(){
        if(clock !== null){
            $interval.cancel(clock);
            clock = null;
        }
    };

})
