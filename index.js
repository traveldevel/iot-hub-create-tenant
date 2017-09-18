"use strict";

// Load env vars from .env
require('dotenv').config();

// required modules
const cfenv = require("cfenv");
const uuidv4 = require('uuid/v4');

// configs from env vars
const appEnv = cfenv.getAppEnv();

if(!appEnv.isLocal){
    console.log("appEnv.isLocal=", appEnv.isLocal);
}

const landscapeName = process.env.LANDSCAPE_NAME;
const tenantName = process.env.TENANT_NAME;

console.log("LANDSCAPE_NAME : ", landscapeName);
console.log("TENANT_NAME : ", tenantName);

const services = appEnv.getServices();
//console.log(services);

// tenant collection names
const rawDataCollectionName = tenantName + "_raw_data";
const eventCollectionName = tenantName + "_event";
const eventRuleCollectionName = tenantName + "_event_rule";
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
                            "tenant_secret" : tenantSecret,
                            "tenant_hdfs_coldstore" : false,
                            "tenant_rule_processing" : false
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
                        "tenant_secret" : tenantSecret,
                        "tenant_hdfs_coldstore" : false,
                        "tenant_rule_processing" : false                        
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

                // raw data indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                });
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("device_id", function(val){
                    console.log(val);
                });               

                mongoDb.collection(rawDataCollectionName).ensureIndex("recorded_time", function(val){
                    console.log(val);
                });      

                mongoDb.collection(rawDataCollectionName).ensureIndex("created_at", function(val){
                    console.log(val);
                });               

                console.log("Collection '" + rawDataCollectionName + "' created !");
            });
        }
    
        // events collection
        if(cols.indexOf(eventCollectionName) < 0){
    
            mongoDb.createCollection(eventCollectionName, function(err, res) {
                    
                if (err) {
                    console.log(err);
                }
    
                // event indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                });
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("device_id", function(val){
                    console.log(val);
                });  

                mongoDb.collection(rawDataCollectionName).ensureIndex("user_id", function(val){
                    console.log(val);
                });                  

                console.log("Collection '" + eventCollectionName + "' created !");
            });
        }

        // event rules collection
        if(cols.indexOf(eventRuleCollectionName) < 0){
    
            mongoDb.createCollection(eventRuleCollectionName, function(err, res) {
                    
                if (err) {
                    console.log(err);
                }

                // event rule indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("device_id", function(val){
                    console.log(val);
                });                 
    
                console.log("Collection '" + eventRuleCollectionName + "' created !");
            });
        }        
    
        // command collection
        if(cols.indexOf(commandCollectionName) < 0){
    
            mongoDb.createCollection(commandCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // command indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("device_id", function(val){
                    console.log(val);
                });       
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("created_at", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("confirmed_at", function(val){
                    console.log(val);
                });                   
    
                console.log("Collection '" + commandCollectionName + "' created !");
            });
        }

        // location collection
        if(cols.indexOf(locationCollectionName) < 0){
            
            mongoDb.createCollection(locationCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // location indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("device_id", function(val){
                    console.log(val);
                });       
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("created_at", function(val){
                    console.log(val);
                });

                mongoDb.collection(rawDataCollectionName).ensureIndex("recorded_time", function(val){
                    console.log(val);
                });    
                
                mongoDb.collection(rawDataCollectionName).ensureIndex({"latitude" : 1, "longitude" : 1}, function(val){
                    console.log(val);
                });                
    
                console.log("Collection '" + locationCollectionName + "' created !");
            });
        }
    
        // device collection
        if(cols.indexOf(deviceCollectionName) < 0){
            
            mongoDb.createCollection(deviceCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // device indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("group_id", function(val){
                    console.log(val);
                });  
                
                mongoDb.collection(rawDataCollectionName).ensureIndex("created_at", function(val){
                    console.log(val);
                });                
    
                mongoDb.collection(rawDataCollectionName).ensureIndex("last_contact", function(val){
                    console.log(val);
                });   

                mongoDb.collection(rawDataCollectionName).ensureIndex("mandatory_schema_id", function(val){
                    console.log(val);
                });                

                console.log("Collection '" + deviceCollectionName + "' created !");
            });
        }

        // device group collection
        if(cols.indexOf(deviceGroupCollectionName) < 0){
            
            mongoDb.createCollection(deviceGroupCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // device group indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                });                 
    
                console.log("Collection '" + deviceGroupCollectionName + "' created !");
            });
        }

        // device schema collection
        if(cols.indexOf(deviceSchemaCollectionName) < 0){
            
            mongoDb.createCollection(deviceSchemaCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // device schema indexes
                mongoDb.collection(rawDataCollectionName).ensureIndex("project_id", function(val){
                    console.log(val);
                });                  
    
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
