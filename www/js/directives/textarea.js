
angular.module('app.directives').directive('textarea', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attr){
            var update = function(){
                element.css("height", "auto");
                var height = element[0].scrollHeight;
                element.css("height", element[0].scrollHeight + "px");
            };
            scope.$watch(attr.ngModel, function(){
                update();
            });
        }
    };
});