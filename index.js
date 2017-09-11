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
var mongoCredentials = services[mongoServiceName].credentials;
var mongoUrl = mongoCredentials.uri;
var mongoClient = require('mongodb').MongoClient;

var mongoOptions = undefined;

if(mongoCredentials.ca_certificate_base64 !== undefined) {
    var mongoCA = [new Buffer(mongoCredentials.ca_certificate_base64, 'base64')];
    
    mongoOptions = {
        mongos: {
            ssl: true,
            sslValidate: true,
            sslCA: mongoCA,
            poolSize: 10,
            reconnectTries: 5
        }
    }
}

console.log("'" + mongoServiceName + "' found in VCAP_SERVICES ! ")
//console.log(mongoService);

// raw data
mongoClient.connect(mongoUrl, mongoOptions, function(err, mongoDb1) {
    
    mongoDb1.createCollection(rawDataCollectionName, function(err, res) {
        
        if (err) {
            console.log(err);
        }

        console.log("Collection '" + rawDataCollectionName + "' created !");
        mongoDb1.close();
    });
});

// events
mongoClient.connect(mongoUrl, mongoOptions, function(err, mongoDb2) {

    mongoDb2.createCollection(eventCollectionName, function(err, res) {
        
        if (err) {
            console.log(err);
        }

        console.log("Collection '" + eventCollectionName + "' created !");
        mongoDb2.close();
    });
});

// command
mongoClient.connect(mongoUrl, mongoOptions, function(err, mongoDb3) {

    mongoDb3.createCollection(commandCollectionName, function(err, res) {
        
        if (err) {
            console.log(err);
        }

        console.log("Collection '" + commandCollectionName + "' created !");
        mongoDb3.close();
    });
});

// users
mongoClient.connect(mongoUrl, mongoOptions, function(err, mongoDb4) {

    mongoDb4.createCollection(userCollectionName, function(err, res) {
        
        if (err) {
            console.log(err);
        }

        console.log("Collection '" + userCollectionName + "' created !");

        var usersCol = mongoDb4.collection(userCollectionName);

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
            mongoDb4.close();
        });
    });
});

// stop smoothly after timeout
process.on('exit', function() { process.exit(0); });