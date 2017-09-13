"use strict";

// required modules
var cfenv = require("cfenv");

// configs from env vars
var appEnv = cfenv.getAppEnv();

if(!appEnv.isLocal){
    console.log("appEnv.isLocal=", appEnv.isLocal);
}

var landscapeName = process.env.landscapeName;
var tenantName = process.env.tenantName;

console.log("LANDSCAPE_NAME : ", landscapeName);
console.log("TENANT_NAME : ", tenantName);

var services = appEnv.getServices();
//console.log(services);

// tenant collection names
var rawDataCollectionName = tenantName + "_raw_data";
var eventCollectionName = tenantName + "_event";
var commandCollectionName = tenantName + "_command";
var userCollectionName = tenantName + "_user";

// mongo connect and create missing collections
var mongoServiceName = "mongo_" + landscapeName;
var mongoService = services[mongoServiceName];

var mongoCredentials = {};
var mongoUrl = '';

if(mongoService !== undefined){
    mongoCredentials = services[mongoServiceName].credentials;
    mongoUrl = mongoCredentials.uri;
}

var mongoClient = require('mongodb').MongoClient;

console.log("'" + mongoServiceName + "' found in VCAP_SERVICES ! ");
console.log("Url for mongodb : '" + mongoUrl + "'");

if(mongoUrl.length === 0){
    console.log('No mongo service Binded. Exiting...');
    return;
}

mongoClient.connect(mongoUrl, function(err, mongoDb) {

    if(err){
        console.log("Connect error : ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){

        var cols = cols.map(col => col.s.name);
        console.log("Collections at start :", cols);

        // raw data collection 
        if(cols.indexOf(rawDataCollectionName) < 0){
    
            mongoDb.createCollection(rawDataCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + rawDataCollectionName + "' created !");
                mongoDb.close();
            });
        }
    
        // events collection
        if(cols.indexOf(eventCollectionName) < 0){
    
            mongoDb.createCollection(eventCollectionName, function(err, res) {
                    
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + eventCollectionName + "' created !");
                mongoDb.close();
            });
        }
    
        // command collection
        if(cols.indexOf(commandCollectionName) < 0){
    
            mongoDb.createCollection(commandCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + commandCollectionName + "' created !");
                mongoDb.close();
            });
        }
    
        // user collection
        if(cols.indexOf(userCollectionName) < 0){
    
            mongoDb.createCollection(userCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + userCollectionName + "' created !");
    
                var usersCol = mongoDb.collection(userCollectionName);
    
                var adminUser = {
                    "name" : "admin",
                    "password": "admin",
                    "roles":[
                        "ADMIN",
                        "DEVELOPER",
                        "READONLY"
                    ]
                };
    
                usersCol.insertOne(adminUser, function(){
                    mongoDb.close();
                });
            });
        }

    });

});

// stop smoothly after timeout
process.on('exit', function() {

    // check collections created
    mongoClient.connect(mongoUrl, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.name);
            console.log("Collections : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });
});
