var ObjectId = require('./node_modules/mongoose').Types.ObjectId;

//**************************PARCOUR LOGIC **************************************
//Save a parcour un referencial collection and in data collection
var saveParcour = function(jsonString, distance, name, userId){
    
var newParcour = new Parcour();
newParcour.content = jsonString;
newParcour.distance = distance;
newParcour.name = name;

var newParcourReference = new ParcourReference();
newParcourReference.realId = newParcour._id;
newParcourReference.name = name;
newParcourReference.distance = distance;

newParcour.save(function(err){

  if(err) { 
    console.log("error in save: " + err); 
  }else{
    
    GeneralReference.findOne({ id: userId}, function(err, result){
 
      if(err || result === null){
        console.log("error in save: " + err + " - User returned for " + userId + " : " + result); 
      }else{
        
        result.parcours.push(newParcourReference);
        result.save(function(err){
          if(err){
             console.log("error in save: " + err);  
          }else{
              
          }
        });
      }
    }); 
  }    
});
  
}

//will return an array of all parcours
var getParcourList = function(userId, callback){
    
 
   GeneralReference.findOne({ id: userId}, function(err, result){
    var callB;
     if(err || result === null){
       console.log("error in save: " + err + " - User returned for " + userId + " : " + result);
       callB = "No Document found: " + err; 
     }else{
       console.log(userId + " : " + result);
       callB = result.parcours; 
     } 
     callback(callB);
  });
   
}

var getParcour = function(parcourId, callback){
   
   var myObjectId = ObjectId.fromString(parcourId); 
    console.log("Searching for parcour at: " + myObjectId);
   Parcour.findOne({ _id: parcourId }, function(err, result){
    var callB;
     if(err || result === null){
       console.log("error in save: " + err + " - Parcour returned for " +  parcourId + " : " + result);
       callB = "No Document found: " + err; 
     }else{
       //console.log(userId + " : " + result);
       callB = result; 
     } 
     callback(callB);
  });
  
}


//****************WORKOUTS LOGIC ****************************************

var saveWorkout = function(reqString, callback){
    
    var receivedObject = JSON.parse(reqString);
    CalendarMonth month = new CalendarMonth();
    CalendarEvent theEvent = CalendarEvent({
      
      title      : receivedObject.title,
      allDay     : receivedObject.allDay,
      start      : receivedObject.start,
      end        : receivedObject.end,
      url        : receivedObject.url,
      color      : receivedObject.color
      //To implement refWorkout : 
    
   });
    
}


//*****************Exports*****************************************8
exports.saveParcour = saveParcour;
exports.getParcourList = getParcourList; 
exports.getParcour = getParcour;