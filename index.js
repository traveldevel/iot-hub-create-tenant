"use strict";

// required modules
const cfenv = require("cfenv");
const uuidv4 = require('uuid/v4');

// configs from env vars
const appEnv = cfenv.getAppEnv();

if(!appEnv.isLocal){
    console.log("appEnv.isLocal=", appEnv.isLocal);
}

const landscapeName = process.env.landscapeName;
const tenantName = process.env.tenantName;

console.log("LANDSCAPE_NAME : ", landscapeName);
console.log("TENANT_NAME : ", tenantName);

const services = appEnv.getServices();
//console.log(services);

// tenant collection names
const rawDataCollectionName = tenantName + "_raw_data";
const eventCollectionName = tenantName + "_event";
const commandCollectionName = tenantName + "_command";
const projectCollectionName = tenantName + "_project";
const deviceGroupCollectionName = tenantName + "_device_group";
const deviceCollectionName = tenantName + "_device";
const deviceSchemaCollectionName = tenantName + "_device_schema";
const locationCollectionName = tenantName + "_location";
const userCollectionName = tenantName + "_user";

// mongo connect and create missing collections
const mongoServiceName = "iot_hub_mongo_" + landscapeName;
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

var tenantSecret = uuidv4();

mongoClient.connect(mongoUrl, function(err, mongoDb) {

    if(err){
        console.log("Connect error : ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){

        var cols = cols.map(col => col.s.name);
        console.log("Collections at start :", cols);

        // tenants collection 
        if(cols.indexOf("tenants") < 0){
            
            mongoDb.createCollection("tenants", function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection 'tenants' created !");

                var tenantsCol = mongoDb.collection("tenants");

                tenantsCol.find({ name : tenantName } ).toArray(function(err, docs) {
                    console.log("Tenant exists ? ", docs);

                    if(docs.length === 0){
                        var tenant = {
                            "tenant_name" : tenantName,
                            "tenant_secret" : tenantSecret
                        };
            
                        tenantsCol.insertOne(tenant, function(){});
                    }
                });
            });
        }
        else
        {
            var tenantsCol = mongoDb.collection("tenants");
            
            tenantsCol.find({ tenant_name : tenantName } ).toArray(function(err, docs) {
                console.log(docs);

                if(docs.length === 0){
                    var tenant = {
                        "tenant_name" : tenantName,
                        "tenant_secret" : uuidv4()
                    };
        
                    tenantsCol.insertOne(tenant, function(){});
                }
            });           
        }

        // raw data collection 
        if(cols.indexOf(rawDataCollectionName) < 0){
    
            mongoDb.createCollection(rawDataCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + rawDataCollectionName + "' created !");
            });
        }
    
        // events collection
        if(cols.indexOf(eventCollectionName) < 0){
    
            mongoDb.createCollection(eventCollectionName, function(err, res) {
                    
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + eventCollectionName + "' created !");
            });
        }
    
        // command collection
        if(cols.indexOf(commandCollectionName) < 0){
    
            mongoDb.createCollection(commandCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + commandCollectionName + "' created !");
            });
        }

        // location collection
        if(cols.indexOf(locationCollectionName) < 0){
            
            mongoDb.createCollection(locationCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + locationCollectionName + "' created !");
            });
        }
    
        // device collection
        if(cols.indexOf(deviceCollectionName) < 0){
            
            mongoDb.createCollection(deviceCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + deviceCollectionName + "' created !");
            });
        }

        // device group collection
        if(cols.indexOf(deviceGroupCollectionName) < 0){
            
            mongoDb.createCollection(deviceGroupCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + deviceGroupCollectionName + "' created !");
            });
        }

        // device schema collection
        if(cols.indexOf(deviceSchemaCollectionName) < 0){
            
            mongoDb.createCollection(deviceSchemaCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + deviceSchemaCollectionName + "' created !");
            });
        }

        // project collection
        if(cols.indexOf(projectCollectionName) < 0){
            
            mongoDb.createCollection(projectCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }
    
                console.log("Collection '" + projectCollectionName + "' created !");
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
                    "password": tenantSecret,
                    "roles":[
                        "ADMIN",
                        "DEVELOPER",
                        "READONLY"
                    ]
                };
    
                usersCol.insertOne(adminUser, function(){});
            });
        }

    });

});

// stop smoothly after timeout
process.on('exit', function() {

    // check collections created
    mongoClient.connect(mongoUrl, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.s.name);
            console.log("Collections at end : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });
});
