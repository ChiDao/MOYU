#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
    "org.apache.cordova.console",
    "org.apache.cordova.statusbar",
    "org.apache.cordova.splashscreen",
    "com.ionic.keyboard",
    "org.apache.cordova.file",
    "org.apache.cordova.file-transfer",
    "org.apache.cordova.camera",
    "org.apache.cordova.inappbrowser",
    "technology.kulak.cordova.appopen",
    "com.ohh2ahh.plugins.appavailability",
    "nl.x-services.plugins.cameraroll",
    "de.appplant.cordova.plugin.local-notification",
    "nl.x-services.plugins.launchmyapp",
    "com.phonegap.plugins.PushPlugin",
    "nl.x-services.plugins.actionsheet",
    "com.verso.cordova.clipboard",
    "org.apache.cordova.dialogs"
    "com.brodysoft.sqlitePlugin",
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var async = require('async');

async.eachSeries(pluginlist.reverse(), function(plugin, callback){
    exec("cordova plugins rm " + plugin, function(error, stdout, stderr){
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
