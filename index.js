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
const rawDataCollectionName = "raw_data";
const eventCollectionName = "event";
const eventRuleCollectionName = "event_rule";
const commandCollectionName = "command";
const projectCollectionName = "project";
const deviceGroupCollectionName = "device_group";
const deviceCollectionName = "device";
const deviceSchemaCollectionName = "device_schema";
const locationCollectionName = "location";
const userCollectionName = "user";

// get mongo url from service function
var getMongoUrlForService = function(mongoServiceName) {

    var mongoService = services[mongoServiceName];

    var mongoCredentials = {};
    var mongoUrl = '';

    if(mongoService !== undefined){
        mongoCredentials = services[mongoServiceName].credentials;
        mongoUrl = mongoCredentials.uri;
    }

    console.log("'" + mongoServiceName + "' found in VCAP_SERVICES ! ");
    console.log("Url for mongodb : '" + mongoUrl + "'");

    return mongoUrl;
}

// get and check mongo service urls
const mongoServiceBaseName = "iot_hub_mongo_" + landscapeName + "_" + tenantName;

const mongoUrlMetadata = getMongoUrlForService(mongoServiceBaseName + "_metadata");
const mongoUrlRawData = getMongoUrlForService(mongoServiceBaseName + "_rawdata");
const mongoUrlLocation = getMongoUrlForService(mongoServiceBaseName + "_location");
const mongoUrlEvent = getMongoUrlForService(mongoServiceBaseName + "_event");

if(mongoUrlMetadata.length === 0){
    console.log('No mongo metadata service Binded. Exiting...');
    return;
}

if(mongoUrlRawData.length === 0){
    console.log('No mongo rawdata service Binded. Exiting...');
    return;
}

if(mongoUrlLocation.length === 0){
    console.log('No mongo location service Binded. Exiting...');
    return;
}

if(mongoUrlEvent.length === 0){
    console.log('No mongo events service Binded. Exiting...');
    return;
}

var mongoClient = require('mongodb').MongoClient;

// metatata create
mongoClient.connect(mongoUrlMetadata, function(err, mongoDb) {

    if(err){
        console.log("Connect error on metadata: ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){

        var cols = cols.map(col => col.s.name);
        console.log("Collections at start in metadata :", cols);

        // device collection
        if(cols.indexOf(deviceCollectionName) < 0){
            
            mongoDb.createCollection(deviceCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // device indexes
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });  
                
                res.ensureIndex("created_at", function(val){
                    console.log(val);
                });                
    
                res.ensureIndex("last_contact_ping", function(val){
                    console.log(val);
                });   

                res.ensureIndex("last_contact_location", function(val){
                    console.log(val);
                });   

                res.ensureIndex("last_contact_rawdata", function(val){
                    console.log(val);
                });   
                
                res.ensureIndex("last_event_triggered", function(val){
                    console.log(val);
                });   
                
                res.ensureIndex("last_command_sent", function(val){
                    console.log(val);
                });  
                
                res.ensureIndex("last_command_confirmed", function(val){
                    console.log(val);
                });                                

                res.ensureIndex("mandatory_schema_id", function(val){
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
                res.ensureIndex("project_id", function(val){
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
                res.ensureIndex("project_id", function(val){
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
    
                var userSecret = uuidv4();

                var adminUser = {
                    "name" : "admin",
                    "password": userSecret,
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

// rawdata create
mongoClient.connect(mongoUrlRawData, function(err, mongoDb) {
    
    if(err){
        console.log("Connect error on rawdata: ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){
        
        var cols = cols.map(col => col.s.name);
        console.log("Collections at start in rawdata :", cols);    

        // raw data collection 
        if(cols.indexOf(rawDataCollectionName) < 0){
            
            mongoDb.createCollection(rawDataCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // raw data indexes
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                });
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });

                res.ensureIndex("device_id", function(val){
                    console.log(val);
                });               

                res.ensureIndex("recorded_time", function(val){
                    console.log(val);
                });      

                res.ensureIndex("created_at", function(val){
                    console.log(val);
                });               

                console.log("Collection '" + rawDataCollectionName + "' created !");
            });
        }
    });
});

// location create
mongoClient.connect(mongoUrlLocation, function(err, mongoDb) {

    if(err){
        console.log("Connect error on location: ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){
        
        var cols = cols.map(col => col.s.name);
        console.log("Collections at start in location :", cols);
        
        // location collection
        if(cols.indexOf(locationCollectionName) < 0){
            
            mongoDb.createCollection(locationCollectionName, function(err, res) {
                
                if (err) {
                    console.log(err);
                }

                // location indexes
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });

                res.ensureIndex("device_id", function(val){
                    console.log(val);
                });       
                
                res.ensureIndex("created_at", function(val){
                    console.log(val);
                });

                res.ensureIndex("recorded_time", function(val){
                    console.log(val);
                });    
                
                res.ensureIndex({"latitude" : 1, "longitude" : 1}, function(val){
                    console.log(val);
                });                
    
                console.log("Collection '" + locationCollectionName + "' created !");
            });
        }
    });
});

// event create
mongoClient.connect(mongoUrlEvent, function(err, mongoDb) {

    if(err){
        console.log("Connect error on event: ", err);
        process.exit(1);
        return;
    }

    mongoDb.collections().then(function(cols){
        
        var cols = cols.map(col => col.s.name);
        console.log("Collections at start in event :", cols);
        
        // events collection
        if(cols.indexOf(eventCollectionName) < 0){
            
            mongoDb.createCollection(eventCollectionName, function(err, res) {
                    
                if (err) {
                    console.log(err);
                }

                // event indexes
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                });
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });

                res.ensureIndex("device_id", function(val){
                    console.log(val);
                });  

                res.ensureIndex("user_id", function(val){
                    console.log(val);
                });                  

                res.ensureIndex("rule_id", function(val){
                    console.log(val);
                });    

                res.ensureIndex("rawdata_id", function(val){
                    console.log(val);
                });    
                
                res.ensureIndex("triggered_at", function(val){
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
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });

                res.ensureIndex("device_id", function(val){
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
                res.ensureIndex("project_id", function(val){
                    console.log(val);
                }); 
                
                res.ensureIndex("group_id", function(val){
                    console.log(val);
                });
                
                res.ensureIndex("device_id", function(val){
                    console.log(val);
                });       
                
                res.ensureIndex("created_at", function(val){
                    console.log(val);
                });

                res.ensureIndex("confirmed_at", function(val){
                    console.log(val);
                });                   

                console.log("Collection '" + commandCollectionName + "' created !");
            });
        }
    });        
});

// stop smoothly and list all collections
process.on('exit', function() {

    // check collections created in metadata
    mongoClient.connect(mongoUrlMetadata, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.s.name);
            console.log("Collections at end in metadata : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });

    // check collections created in rawdata
    mongoClient.connect(mongoUrlRawData, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.s.name);
            console.log("Collections at end in rawdata : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });
    
    // check collections created in location
    mongoClient.connect(mongoUrlLocation, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.s.name);
            console.log("Collections at end in location : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });
    
    // check collections created in event
    mongoClient.connect(mongoUrlEvent, function(err, mongoDbCheck) {
        
        mongoDbCheck.collections().then(function(res){

            var names = res.map(col => col.s.name);
            console.log("Collections at end in event : ", names);
            mongoDbCheck.close();

            process.exit(0);
        });
    });    
});
