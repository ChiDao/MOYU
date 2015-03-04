angular.module('angular-preload-image', []);
angular.module('angular-preload-image').factory('preLoader', function($timeout){
    return function (url, successCallback, errorCallback, gotSize) {
        //Thank you Adriaan for this little snippet: http://www.bennadel.com/members/11887-adriaan.htm
        var img = new Image();
        var set = setInterval(function(){
            if (gotSize && img.width){
                gotSize(img.width, img.height);
                clearInterval(set);
            }
        },10);
        angular.element(img).bind('load', function(){
            clearInterval(set);
            successCallback();
        }).bind('error', function(){
            clearInterval(set);
            errorCallback();
        }).attr('src', url);
    }
});
angular.module('angular-preload-image').factory('getBase64', function(){
    var base64imgs = {};
    return function(width, height){
        if (base64imgs[width + '-' + height]){
            return base64imgs[width + '-' + height];
        }else{
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            base64imgs[width + '-' + height] = canvas.toDataURL('png');
            return base64imgs[width + '-' + height];
        }
    }
});
angular.module('angular-preload-image').directive('preloadImage', ['getBase64','preLoader','$ionicFrostedDelegate', function(getBase64, preLoader,$ionicFrostedDelegate){
    return {
        restrict: 'A',
        terminal: true,
        priority: 100,
        link: function(scope, element, attrs) {
            var url = attrs.ngSrc;
            scope.default = attrs.defaultImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wEWEygNWiLqlwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=";
            attrs.$set('src', scope.default);
            preLoader(url, function(){
                attrs.$set('src', url);
                $ionicFrostedDelegate.update();
            }, function(){
                if (attrs.fallbackImage != undefined) {
                    attrs.$set('src', attrs.fallbackImage);
                }
            }, function(width, height){
                console.debug(width, height);
                if (attrs.src == scope.default){
                    attrs.$set('src', getBase64(width, height));
                }
            });
        }
    };
}]);
angular.module('angular-preload-image').directive('preloadBgImage', ['preLoader', function(preLoader){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            if (attrs.preloadBgImage != undefined) {
                //Define default image
                scope.default = attrs.defaultImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wEWEygNWiLqlwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=";
                element.css({
                    'background-image': 'url("' + scope.default + '")'
                });
                preLoader(attrs.preloadBgImage, function(){
                    element.css({
                        'background-image': 'url("' + attrs.preloadBgImage + '")'
                    });
                }, function(){
                    if (attrs.fallbackImage != undefined) {
                        element.css({
                            'background-image': 'url("' + attrs.fallbackImage + '")'
                        });
                    }
                });
            }
        }
    };
}]);
