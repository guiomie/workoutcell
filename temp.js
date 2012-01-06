
var GeneralReference = new Schema({
    
    id           : Number,
    friends      : [Number],
    coaches      : [Number],
    parcours     : [ParcourReference],
    coaching     : [Number],
    cells        : [CellReference]
});

var NotificationsReference = new Schema({

	id     : Number,
	pending: [Notification]

});

var CellReference = new Schema({

	name        : String,
	location    : String,
	owner       : Number, //creators id
	cellDetails : ObjectId

});

//Global collection
var CellDetails = new Schema({
	name         : String,
	location     : String,
	owner        : Number, 
	members      : [Number],
	description  : String, 
	notification : [Notification]
	activities   : [CellCalendarMonth]

});

var CellCalendarMonth = new Schema({
 
 id          : Number, //String consisting of Year and Month ex:1211 = 2011 Dec
 allEvents   : [CellCalendarEvent]
   
});

var CellCalendarEvent = new Schema({
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

var CellWorkout = new Schema({

	creator       : Number
	calendarEvent : CalendarEvent
	workoutRef    : ObjectId
	participants  : [Number] //fbid

});

var Notification = new Schema({

	type      : String, //workout, challenge, cell
	message   : String, //Bike, run, swim
	refId     : String,
	refOId    : ObjectId,
	date      : Date, 

});