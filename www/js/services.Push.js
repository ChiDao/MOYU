define(['app'], function(app){
    
    app.factory('PushProcessingService', function(Restangular) {
        var isEnable;
        function checkPush() {
            var pushNotification = window.plugins.pushNotification;
            pushNotification.checkEnabled(function (result) {
                isEnable = result;
            });
        }
        function onDeviceReady() {
            console.info('NOTIFY  Device is ready.  Registering with GCM server');
            var pushNotification = window.plugins.pushNotification;
            if (device.platform == 'android' || device.platform == 'Android') {
                 //register with google GCM server
                pushNotification.register(gcmSuccessHandler, errorHandler, {"senderID":"870712452293","ecb":"onNotificationGCM"});
            }else {
                pushNotification.register(apnTokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});  // required!
            }
        }
        var base64;
        function apnTokenHandler(result) {
            base64 = hexToBase64(result);
            console.log("token:"+base64);
            console.log("token:"+result);
            localStorage.setItem('apnToken', result);
              Restangular.all('apn-token').post({base64Token:base64}).then(function(){
                console.log("post ok!");
              },function(err){
                console.log("post err"+JSON.stringify(err));
              });
            
        }
        function gcmSuccessHandler(result) {
            console.info('NOTIFY  pushNotification.register succeeded.  Result = '+result)
        }
        function errorHandler(error) {
            console.error('NOTIFY  '+error);
        }
        return {
            checkinitialize: function () {
                console.log('check initializing');
                document.addEventListener('deviceready', checkPush, false);
                },
            checkResult: function(){
                return isEnable;
            },
            initialize : function () {
                console.info('NOTIFY  initializing');
                document.addEventListener('deviceready', onDeviceReady, false);
            },
            apnToken:function () {
                console.log("get token:" + base64);
                return base64;
            },
            registerID : function (id) {
                //Insert code here to store the user's ID on your notification server. 
                //You'll probably have a web service (wrapped in an Angular service of course) set up for this.  
                //For example:
                MyService.registerNotificationID(id).then(function(response){
                    if (response.data.Result) {
                        console.info('NOTIFY  Registration succeeded');
                    } else {
                        console.error('NOTIFY  Registration failed');
                    }
                });
            }, 
            //unregister can be called from a settings area.
            unregister : function () {
                console.info('unregister')
                var push = window.plugins.pushNotification;
                if (push) {
                    push.unregister(function () {
                        console.info('unregister success')
                    });
                }
            }
        }
    });

    //trun to base64
    if (!window.atob) {
        var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var table = tableStr.split("");

        window.atob = function (base64) {
            if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
            base64 = base64.replace(/=/g, "");
            var n = base64.length & 3;
            if (n === 1) throw new Error("String contains an invalid character")
            for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
                var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
                var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
                if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
                bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
                bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
                bin[bin.length] = ((c << 6) | d) & 255;
            };
            return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
        };

        window.btoa = function (bin) {
            for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
                var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
                if ((a | b | c) > 255) throw new Error("String contains an invalid character");
                base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
                                                (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
                                                (isNaN(b + c) ? "=" : table[c & 63]);
            }
            return base64.join("");
        };

    }

    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        );
    }
     
     
    // ALL GCM notifications come through here. 
    function onNotificationGCM(e) {
        console.log('EVENT -> RECEIVED:' + e.event + '');
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    console.log('REGISTERED with GCM Server -> REGID:' + e.regid);
     
                }
                break;
     
            case 'message':
                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if (e.foreground)
                {
                    //we're using the app when a message is received.
                    console.log('--INLINE NOTIFICATION--' + '');
     
                    // if the notification contains a soundname, play it.
                    //var my_media = new Media(&quot;/android_asset/www/&quot;+e.soundname);
                    //my_media.play();
                    alert(e.payload.message);
                }
                else
                {   
                    // otherwise we were launched because the user touched a notification in the notification tray.
                    if (e.coldstart)
                        console.log('--COLDSTART NOTIFICATION--' + '');
                    else
                        console.log('--BACKGROUND NOTIFICATION--' + '');
     
                    // direct user here:
                    
                 //   window.location = "#/tab/featured";
                }
     
                console.log('MESSAGE -> MSG: ' + e.payload.message + '');
                console.log('MESSAGE: '+ JSON.stringify(e.payload));
                break;
     
            case 'error':
                console.log('ERROR -> MSG:' + e.msg + '');
                break;
     
            default:
                console.log('EVENT -> Unknown, an event was received and we do not know what it is');
                break;
        }
    }

    // ALL APN notifications come through here. 
    function onNotificationAPN(e){
        console.log("Received a notification! " + e.body);
        console.log("event sound " + e.sound);
        console.log("event badge " + e.badge);
        console.log("event " + e);
        if (e.body) {
            navigator.notification.alert(e.body);
        }
                             
        if (e.sound) {
            var snd = new Media(e.sound);
            snd.play();
        }
                         
        if (e.badge) {
            pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
            function successHandler(result) {
                console.log('NOTIFY  '+result);
            }
            console.log(e.badge);
        }

    }
}); 