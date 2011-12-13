var ObjectId = require('./node_modules/mongoose').Types.ObjectId;

//**************************PARCOUR LOGIC **************************************
//Save a parcour un referencial collection and in data collection
var saveParcour = function(jsonString, distance, name, userId, callback){
    
var newParcour = new Parcour();
newParcour.content = JSON.stringify(jsonString);
newParcour.distance = distance;
newParcour.name = name;

var newParcourReference = new ParcourReference();
newParcourReference.realId = newParcour._id;
newParcourReference.name = name;
newParcourReference.distance = distance;

newParcour.save(function(err){

  if(err) { 
    console.log("error in save: " + err);
    callback("Couldn't save document, Database error");
  }else{
    
    GeneralReference.findOne({ id: userId}, function(err, result){
 
      if(err || result === null){
        console.log("error in save: " + err + " - User returned for " + userId + " : " + result);
        callback("Couldn't find users General Reference Collection");
      }else{
        
        result.parcours.push(newParcourReference);
        result.save(function(err){
          if(err){
             console.log("Error in save: " + err); 
             callback("Couldn't save Parcour Reference");
          }else{
             callback("success");
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
       console.log("Error in getParcourList: " + err + " - User returned for " + userId + " : " + result);
       callB = "No Document found: " + err; 
     }else{
       console.log(userId + " : " + result);
       callB = result.parcours; 
     } 
     callback(callB);
  });
   
}

var getParcour = function(parcourId, callback){
   
   //var myObjectId = ObjectId.fromString(parcourId); 
    console.log("Searching for parcour");
    Parcour.findOne({ _id: parcourId }, function(err, result){
       var callB;
       if(err || result === null){
          console.log("Error in getParcour: " + err + " - Parcour returned for " +  parcourId + " : " + result);
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
    var theEvent = new CalendarEvent();
  
    theEvent.title = eventObject.title;
    theEvent.allDay = eventObject.allDay;
    theEvent.start = eventObject.start;
    theEvent.end = eventObject.end;
    theEvent.url = "/workout/" + workoutRef;
    theEvent.color = eventObject.color;
    theEvent.refWorkout = workoutRef;
    
   
    var month = new CalendarMonth();
    var eventDate = new Date(eventObject.start);
    //The workout array starts on 1 Jan 2011, all other positions in array are 
    //relative to this start day. To find the year/month of an array loc use modulo
    arrayLocation = 1 + (((parseInt(eventDate.getFullYear())) - 2011)*12) + parseInt(eventDate.getMonth());
    //console.log(arrayLocation);
    //console.log(eventDate.getMonth());
    console.log('Searching for userId in event ref collection: ' + userId);
    CalendarEventReference.findOne({ id: userId }, function(err, resultReference){
   
        if(err){
            console.log('Error in finding calendar reference collection: ' + err); 
            callbackVar = "not instantiated";  
            callback(callbackVar);
        }
        else{
            //console.log(resultReference.ref.length);
            var initialRefLength = resultReference.ref.length;
            if(resultReference.ref.length <= arrayLocation){
                console.log("In if");
                for(i = initialRefLength; i <= (arrayLocation); i++){
                    console.log("In loop: " +i);
                    resultReference.ref.push({id: (i + initialRefLength), allEvents: []});  
                } 
                resultReference.ref[arrayLocation].allEvents.push(theEvent);
            }
            else{
             
                resultReference.ref[arrayLocation].allEvents.push(theEvent);
   
            }
      
            
            
            //console.log(JSON.stringify(resultReference));
            resultReference.save(function(err){
     
                if(err){
                    console.log('Error in finding calendar reference: ' + err);
                    callbackVar = "not instantiated";  
                    callback(callbackVar);
                }
                else{
                    console.log('Succesfully saved Event'); 
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
    var receivedParcour = {};
    
    if(workoutObject.parcour.id === "none"){
        receivedParcour = {};
    }
    else{
        receivedParcour = {
            id: ObjectId(workoutObject.parcour.id), 
            name: workoutObject.parcour.name        
        };
    }
    
    if(workoutObject.type === "intervall"){
       
       console.log(JSON.stringify(workoutObject.intervalls));
       //We rewrite the parcour name, not just the id, because we dont want
       //to http request just to get the name
       theWorkout = new CardioWorkout({ 
            sport              :workoutObject.sport, 
            type               :workoutObject.type,
            intervalls         :workoutObject.intervalls,
            description        :workoutObject.description,
            cell               :workoutObject.cell,
            parcour            :receivedParcour,
            //intervallResult    :[]
       }); 
       
       theWorkout.save(function(err){
            if(err){
                console.log("Error in save: " + err);  
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
            sport                :workoutObject.sport, 
            type                 :workoutObject.type,
            distance             :distanceValues,
            description          :workoutObject.description,
            cell                 :workoutObject.cell,
            parcour              :receivedParcour,
            distanceResult       :{}
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


var saveResults = function(workoutId, receivedResult, callback){
    
    console.log(JSON.stringify(receivedResult + " : " + workoutId));
    
    if(workoutId.toString().length !== 24 ){
        
       console.log("Invalid objectId submitted @ getWorkout()");
       callback("Invalid objectId for workoutId");
    }
    else{
        //var myObjectId = ObjectId.fromString(workoutId); 
        //console.log("Searching for parcour at: " + workoutId);
        CardioWorkout.findOne({ _id: workoutId }, function(err, result){
            if(err || result === null){
                console.log("error in find: " + err + " @ workoutId = " + workoutId);
                callback("No Document found: " + err);
            }else{
                //console.log(userId + " : " + result);
                if(result.type === "distance" && typeof(receivedResult.distanceResult) !== "undefined"){   
                    var temp = {
                       unit       :receivedResult.distanceResult.unit, 
                       value      :receivedResult.distanceResult.value, 
                       completed  :receivedResult.distanceResult.completed
                    }
                    
                    result.distanceResult = temp;
                    console.log(JSON.stringify(result.distanceResult));
                    result.save(function(err){
                        if(err){
                            callback("Error in saving result (distance): " + err);
                        }else{
                            callback("Success");
                        }
                    });
                }
                else if(result.type === "intervall" && typeof(receivedResult.intervallResult) !== "undefined"){
                    if(receivedResult.intervallResult.length === result.intervalls.length){
                        result.intervallResult = receivedResult.intervallResult; 
                        result.save(function(err){
                            if(err){
                                callback("Error in saving result (intervall): " + err);
                            }else{
                                callback("Success");
                            }
                        });
                    }
                    else{
                        callback("Mismatch in load intervall size and workout intervall size");
                    }
                    
                }
                else{
                    callback("Invalid Result type, needs to be an intervall or distance based");    
                }
            }  
        });
    }     
}


var getWorkout = function(workoutId, callback){
    
    //Verify the object is a valid objectid
    if(workoutId.toString().length !== 24 ){
        
       console.log("Invalid objectId submitted @ getWorkout()");
       callback("Invalid objectId for workoutId");
    }
    else{
        //var myObjectId = ObjectId.fromString(workoutId); 
        //console.log("Searching for parcour at: " + workoutId);
        CardioWorkout.findOne({ _id: workoutId }, function(err, result){
            var callB;
            if(err || result === null){
                console.log("error in find: " + err + " @ workoutId = " + workoutId);
                callB = "No Document found: " + err;
                callback(callB);
            }else{
                //console.log(userId + " : " + result);
                callB = result; 
                callback(callB);
            }  
        });
    }
  
}

var getMonthEvent = function(userId, year, month, callback){
    
    var callB = "not instantiated";
    
    CalendarEventReference.findOne({ id: userId}, function(err, result){
    
        if(err || result === null){
            //console.log("No document found or: " + err);
            callB = "not instantiated";
            callback(callB);
        }
        else{
            //transform month and year into location
           var arrayLocation = ((parseInt(year) - 2011)*12) + parseInt(month);
           //console.log("Looking if " + arrayLocation + " is smaller then " + result.ref.length);
           if(result.ref.length > arrayLocation && parseInt(year) > 2010){
                //console.log("Getting data in array");
                callB = result.ref[arrayLocation].allEvents; 
                callback(callB); 
           }
           else{
            //console.log("Invalid month or year");
            callB = "not instantiated";
            callback(callB);
           
           }
        } 
 
    });
}

//*****************Exports*****************************************
exports.saveParcour = saveParcour;
exports.getParcourList = getParcourList; 
exports.getParcour = getParcour;

exports.saveWorkout = saveWorkout;
exports.saveEvent = saveEvent;
exports.getWorkout = getWorkout;
exports.getMonthEvent = getMonthEvent;
exports.saveResults = saveResults;