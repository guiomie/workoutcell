var mongoDbAdress = '24.202.230.241:27017';
var mongoDbName = 'workoutcellDb';

var mongoose = require('./node_modules/mongoose');
var everyauth= require('everyauth');
var Promise = everyauth.Promise;
mongoose.connect('mongodb://' + mongoDbAdress + '/' + mongoDbName);

Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
 
var User = new Schema({
//id is the facebook id, intrinsincly unique
    fbid       : Number,
    firstName  : String,   
    lastName   : String,
    email      : String,
    joinDate   : {type: Date, default: Date.now}
});

/*
 IETF format (ex: "Wed, 18 Oct 2009 13:00:00 EST"), a string in ISO8601 format (ex: "2009-11-05T13:15:30Z") or a UNIX timestamp.
*/
var CalendarEvent = new Schema({
   id      : Number,
   title   : String,
   allDay  : Boolean,
   start   : Date,
   end     : Date,
   url     : String
    
});

//The general reference is a collection where each document contains 
//the objectid reference for the users parcours, coaches and friends
var GeneralReference = new Schema({
    
    id           : Number,
    friends      : [PersonnaReference],
    coaches      : [PersonnaReference],
    parcours     : [ParcourReference]
        
});

var PersonnaReference = new Schema({
   
   realId:   Number,
   name:   String
   
});

var ParcourReference = new Schema({
   //ref to Parcour which has the content
   realId      : ObjectId,
   name        : String,
   distance    : Number
    
});

// content is the parcour data from google map
//Currently no point in transforming the json in an actual object
var Parcour = new Schema({
   
   content    : String,
   distance   : Number,
   name       : String
    
});



//Create models out of schema
mongoose.model('User', User);
mongoose.model('CalendarEvent', CalendarEvent);   
mongoose.model('GeneralReference', GeneralReference);   
mongoose.model('PersonnaReference', PersonnaReference);
mongoose.model('ParcourReference', ParcourReference);
mongoose.model('Parcour', Parcour);
   
//Export models
var CalendarEvent = exports.CalendarEvent = mongoose.model('CalendarEvent');
var User = exports.User = mongoose.model('User');
var GeneralReference = exports.GeneralReference = mongoose.model('GeneralReference');
var PersonnaReference = exports.PersonnaReference = mongoose.model('PersonnaReference');
var ParcourReference = exports.ParcourReference = mongoose.model('ParcourReference');
var Parcour = exports.Parcour = mongoose.model('Parcour');
