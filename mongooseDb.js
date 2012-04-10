var mongoHQadress = 'staff.mongohq.com:10072/workoutcellDb';
//var mongoHQadress = 'dbh54.mongolab.com:27547/workoutcelldb';
var mongoHQuser = 'mongoose';
var mongoHQpassword = '12345';

var mongoose = require('mongoose');
var everyauth= require('everyauth');
var Promise = everyauth.Promise;

//local dev guillaume desktop config
//mongoose.connect('mongodb://' + mongoDbAdress + '/' + mongoDbName);

//online connect url
mongoose.connect('mongodb://' + mongoHQuser + ':' + mongoHQpassword + '@' + mongoHQadress);

Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

//************************SOCIAL SCHEMAS **************************

var User = new Schema({
//id is the facebook id, intrinsincly unique
    fbid       : Number,
    firstName  : String,   
    lastName   : String,
    email      : String,
    location   : {name: String, latlng: {lat: Number, lng: Number}},
    objective  : String,
    joinDate   : {type: Date, default: Date.now}
});

//The general reference is a collection where each document contains 
//the objectid reference for the users parcours, coaches and friends
var GeneralReference = new Schema({
    
    id           : Number,
    friends      : [Number],    //Array of fbids
    //coaches      : [PersonnaReference],  To be implemented in futur releases
    //parcours     : [ParcourReference],
    parcours     : [ new mongoose.Schema({realId: ObjectId, name: String, distance: Number, staticUrl: String})],
    cells        : [ new mongoose.Schema({name: String, isCoach: Boolean, location: String,owner: {id: Number, name: String},cellDetails : ObjectId})]
        
});

var PersonnaReference = new Schema({
   
   realId:   Number,
   name:   String
   
});

//*****************MAPPING APP SCHEMAS *************************
//Currently implemented directly in collection because of mongoose bug
var ParcourReference = new Schema({
   //ref to Parcour which has the content
   realId      : ObjectId,
   name        : String,
   distance    : Number,
   staticUrl   : String
    
});

// content is the parcour data from google map
//Currently no point in transforming the json in an actual object
var Parcour = new Schema({
   
   path       : String,
   distance   : Number,
   name       : String,
   markers    : {latlng: [{lat: Number, lng: Number}], titles: [String]}
    
});



//************* SCHEMA FOR WORKOUTS **********************

//An event is jcalendar compatible and reference a full workout
/*
 IETF format (ex: "Wed, 18 Oct 2009 13:00:00 EST"), a string in ISO8601 format (ex: "2009-11-05T13:15:30Z") or a UNIX timestamp.
*/
var CalendarEvent = new Schema({
   //id         : Number,
   title          : String,
   allDay         : Boolean,
   start          : Date,
   end            : Date,
   url            : String,
   color          : String,
   refWorkout     : String,
   refCellWorkout : String 
   
});

var CalendarMonth = new Schema({
 
 id          : Number, //String consisting of Year and Month ex:1211 = 2011 Dec
 allEvents   : [CalendarEvent]
   
});

//Calendar event Reference collection
//Sorted out by months
var CalendarEventReference = new Schema({
    
   id   : Number,  //Users FBid 
   ref  : [CalendarMonth]  
    
    
});

//If a value is zero, means it wasnt instantiated by the user
var IntervallUnit = new Schema({
   
   distance     :Number,
   time         :Number,
   intensity    :Number 
       
});

var singleIntervall = new Schema({
    targetUnit     : String,
    targetValue    : Number,
    intensityUnit  : String,
    intensityValue : Number,
    quantity       : Number,
    intensityRange : [Number], //TIME IN SECONDS
    description    : String
});

var SingleIntervallResult = new Schema({ 
   unit        :String,  // either m for meters or s for seconds
   value       :Number,
   completed   :Boolean 
});

//Scoial components for workouts
var TinyUser = new Schema({
  
  fbid      : Number,
  fullName  : String

});

var CardioWorkout = new Schema({

    sport                 :String,
    type                  :String,
    intervalls            :[singleIntervall],
    distance              :{targetType:String, minValue:Number,maxValue:Number, intensity:Number},
    description           :String,
    cell                  :{creator: { fbid: Number, fullName  : String}, participants: [TinyUser], cellId: ObjectId}, //Temporarly not a basicCell,
    parcour               :{id: ObjectId, name: String, distance: Number, staticUrl: String},
    distanceResult        :{unit: String , value:Number, completed:Boolean},
    intervallResult       :[SingleIntervallResult],
    feed                  :[new mongoose.Schema({type: String, sender: String, senderId: Number, message: String })]   //type is either notification or message
});

var CardioRef = new Schema({

    workoutId: ObjectId,
    intervalls  : [{unit: String, value: Number, completed: Boolean}]

});

var CardioResult = new Schema({
    
    id             : Number,
    intervallResult  : [CardioRef], 
    distanceResult   : [new mongoose.Schema({workoutId: ObjectId, unit: String, value: Number, completed: Boolean})]
});


var BasicCell = new Schema({
    
   name       :String,
   members    :[ObjectId]
    
});

//!!!!------ Notification System ------ !!!!!
var Notification = new Schema({

    type      : String, //joinMasterCell, workoutCell, broadcast, acceptCellInvite
	message   : String, //Name of person
	refId     : String,
	refOId    : ObjectId,
	date      : Date, 

});

var NotificationsReference = new Schema({

    id             : Number, //fbid
    unRead         : Number,
    pendingSize    : Number,
	pending        : [Notification]

});

//!!!!!!!!!!!!!!--------CELL SCHEMAS-----------!!!!!!!


var CellReference = new Schema({

    name        : String,
	location    : String,
	owner       : {id: Number, name: String}, //creators name
	cellDetails : ObjectId

});


var CellDetails = new Schema({
    name         : String,
	location     : String,
    isPrivate    : Boolean,
    isCoach      : Boolean,
	owner        : {id: Number, name: String},
	members      : [TinyUser],
	description  : String, 
	notification : [Notification],
	activities   : [CalendarMonth]

});


//Workoutcell Admin related

var Log = new Schema({
    
   //fbid : Number
    notificationError   : [String]   
    
});




var Permission = new Schema({
    
   //fbid : Number
    firstName  : String,   
    lastName   : String
    
});



//Create models out of schema
mongoose.model('User', User);
mongoose.model('GeneralReference', GeneralReference);  
mongoose.model('Permission', Permission);
mongoose.model('PersonnaReference', PersonnaReference);

mongoose.model('NotificationsReference', NotificationsReference);
mongoose.model('Notification', Notification);
mongoose.model('Log', Log);

mongoose.model('ParcourReference', ParcourReference);
mongoose.model('Parcour', Parcour);

mongoose.model('CalendarEventReference', CalendarEventReference);  
mongoose.model('CalendarMonth', CalendarMonth);  
mongoose.model('CalendarEvent', CalendarEvent);  


mongoose.model('CardioWorkout', CardioWorkout);
mongoose.model('CardioResult', CardioResult);
//mongoose.model('DistanceUnit', DistanceUnit);
mongoose.model('BasicCell', BasicCell);
mongoose.model('IntervallUnit',IntervallUnit);
mongoose.model('SingleIntervallResult', SingleIntervallResult);

mongoose.model('CellReference', CellReference);
mongoose.model('CellDetails', CellDetails);

//Export models
var User = exports.User = mongoose.model('User');
var GeneralReference = exports.GeneralReference = mongoose.model('GeneralReference');
var Permission = exports.Permission = mongoose.model('Permission');
var PersonnaReference = exports.PersonnaReference = mongoose.model('PersonnaReference');

var NotificationsReference = exports.NotificationsReference = mongoose.model('NotificationsReference');
var Notification = exports.Notification = mongoose.model('Notification');
var Log = exports.Log = mongoose.model('Log');

var ParcourReference = exports.ParcourReference = mongoose.model('ParcourReference');
var Parcour = exports.Parcour = mongoose.model('Parcour');

var CalendarEventReference = exports.CalendarEventReference = mongoose.model('CalendarEventReference');
var CalendarMonth = exports.CalendarMonth = mongoose.model('CalendarMonth');
var CalendarEvent = exports.CalendarEvent = mongoose.model('CalendarEvent');

//var DistanceUnit = exports.DistanceUnit = mongoose.model('DistanceUnit');
var CardioWorkout = exports.CardioWorkout = mongoose.model('CardioWorkout');
var CardioResult = exports.CardioResult = mongoose.model('CardioResult');
var BasicCell = exports.BasicCell = mongoose.model('BasicCell');
var IntervallUnit = exports.IntervallUnit = mongoose.model('IntervallUnit');
var SingleIntervallResult = exports.SingleIntervallResult = mongoose.model('SingleIntervallResult');

var CellReference = exports.CellReference = mongoose.model('CellReference');
var CellDetails = exports.CellDetails = mongoose.model('CellDetails');