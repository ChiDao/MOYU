#!/usr/bin/env node

var pluginlist = [
    // FU ADD:
    "org.apache.cordova.console",
    "org.apache.cordova.statusbar",
    "org.apache.cordova.splashscreen",
    "com.ionic.keyboard",
    "org.apache.cordova.file",
    "org.apache.cordova.file-transfer",
    // "org.apache.cordova.camera",
    "self-plugins/org.apache.cordova.camera",
    "org.apache.cordova.inappbrowser",
    "technology.kulak.cordova.appopen",
    "local-plugins/AppAvailability" ,  
    "local-plugins/CameraRoll-PhoneGap-Plugin",
    "local-plugins/Cordova-SQLitePlugin",
    // "https://github.com/ohh2ahh/AppAvailability.git",
    // "https://github.com/EddyVerbruggen/CameraRoll-PhoneGap-Plugin",
    // "https://github.com/brodysoft/Cordova-SQLitePlugin",
    // MA QIAN ADD:
    // "https://github.com/katzer/cordova-plugin-local-notifications",
    "self-plugins/de.appplant.cordova.plugin.local-notification",
    "https://github.com/EddyVerbruggen/LaunchMyApp-PhoneGap-Plugin.git --variable URL_SCHEME=gamo",
    "self-plugins/pushPluginEx",
    "self-plugins/nl.x-services.plugins.actionsheet",
    "local-plugins/CordovaClipboard"
    // "https://github.com/VersoSolutions/CordovaClipboard",
    "self-plugins/org.devgeeks.Canvas2ImagePlugin",
    // QOlI ADD:
    "org.apache.cordova.dialogs"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var async = require('async');

function puts(error, stdout, stderr) {

}

async.eachSeries(pluginlist, function(plugin, callback){
    exec("cordova plugins add " + plugin, function(error, stdout, stderr){
        if (error){
            console.log(error);
            sys.puts(stdout);
            callback(error);
        }
        sys.puts(stdout);
        callback();
    })
}, function(error){
    return false;
})

//exec("cordova plugins add ", puts);
