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

//Saves an event (also a reference at the same time), the callback will send the
//
var saveEvent = function(eventObject, userId, workoutRef, callback){
    
    var callbackVar = "not instantiated";
    var theEvent = new CalendarEvent({
      
        title      : eventObject.title,
        allDay     : eventObject.allDay,
        start      : eventObject.start,
        end        : eventObject.end,
        url        : "/workout/" + workoutRef,
        color      : eventObject.color,
        refWorkout : workoutRef
    });
   
    var month = new CalendarMonth();
    var eventDate = new Date(eventObject.start);
    //The workout array starts on 1 Jan 2011, all other positions in array are 
    //relative to this start day. To find the year/month of an array loc use modulo
    arrayLocation = 1 + (((parseInt(eventDate.getFullYear()) - 2011)*12) + parseInt(eventDate.getMonth()));
    console.log(arrayLocation);
    //console.log(eventDate.getMonth());
    console.log('Searching for userId in event ref collection: ' + userId);
    CalendarEventReference.findOne({ id: userId }, function(err, resultReference){
   
        if(err){
            console.log('Error in finding calendar reference collection: ' + err); 
            callbackVar = "not instantiated";  
            callback("Cant find CalendarEventReference for user, callback: " + callbackVar);
        }
        else{
            //console.log(resultReference.ref.length);
            var initialRefLength = resultReference.ref.length;
            if(resultReference.ref.length !== arrayLocation){
          
                for(i = 0; i < (arrayLocation - initialRefLength + 1); i++){
                    //console.log(i);
                    resultReference.ref.push({id: (i + initialRefLength), allEvents: []});  
                } 
                
            }
      
            resultReference.ref[arrayLocation].allEvents.push(theEvent);
            console.log(JSON.stringify(resultReference));
            resultReference.save(function(err){
     
                if(err){
                    console.log('Error in finding calendar reference: ' + err);
                    callbackVar = "not instantiated";  
                    callback("Cant save allEvents in CalendarEventReference");
                }
                else{
                    console.log('Succesfully saved Event');
                    callbackVar = "not instantiated";   
                    callback("Successfully saved Workout and Reference");
                }      
            });
        }

    });

}

//Saves workout, sends callback has the objectid, to then save in reference collection
var saveWorkout = function(workoutObject, callback){
    
    var theWorkout = "not instantiated";
    var callbackValue = "not instantiated";
    
    var receivedParcour = {
        id: ObjectId(workoutObject.parcour.id), 
        name: workoutObject.parcour.name        
    };
    
    if(workoutObject.type === "intervall"){
       
       //We rewrite the parcour name, not just the id, because we dont want
       //to http request just to get the name
       theWorkout = new CardioWorkout({ 
            sport         :workoutObject.sport, 
            type          :workoutObject.type,
            intervalls    :workoutObject.intervalls,
            description   :workoutObject.description,
            cell          :workoutObject.cell,
            parcour       :receivedParcour,
            results       :workoutObject.results
       }); 
       
       theWorkout.save(function(err){
            if(err){
                console.log("error in save: " + err);  
                callbackValue = "not instantiated";
                callback(callbackValue);
            }else{
                callbackValue = theWorkout._id;
                callback(callbackValue);
            }
        });  
    }
    else if(workoutObject.type === "distance" ){
        
        var distanceValues = {
            targetType     :workoutObject.distance.targetType, 
            minValue       :workoutObject.distance.minValue,
            maxValue       :workoutObject.distance.maxValue, 
            intensity      :workoutObject.distance.intensity          
        };
        
        theWorkout = new CardioWorkout({ 
            sport         :workoutObject.sport, 
            type          :workoutObject.type,
            distance      :distanceValues,
            description   :workoutObject.description,
            cell          :workoutObject.cell,
            parcour       :receivedParcour,
            results       :workoutObject.results
       }); 
       
       theWorkout.save(function(err){
            if(err){
                console.log("error in save: " + err);  
                callbackValue = "not instantiated";
                callback(callbackValue);
            }else{
                callbackValue = theWorkout._id;
                callback(callbackValue);
            }
        });
    }
    else{
        //something went wrong
        callbackValue = "not instantiated";
        callback(callbackValue);
    }
        
};

//*****************Exports*****************************************
exports.saveParcour = saveParcour;
exports.getParcourList = getParcourList; 
exports.getParcour = getParcour;

exports.saveWorkout = saveWorkout;
exports.saveEvent = saveEvent;