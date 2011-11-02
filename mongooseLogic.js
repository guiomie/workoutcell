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
    var theEvent = CalendarEvent({
      
      title      : receivedObject.title,
      allDay     : receivedObject.allDay,
      start      : receivedObject.start,
      end        : receivedObject.end,
      url        : receivedObject.url,
      color      : receivedObject.color,
      refWorkout : "/workout/" + workoutRef
   });
   
   var month = new CalendarMonth();
   monthyear = parseInt(eventObject.start.getMonth() + '' + eventObject.start.getYear());
   
   CalendarEventReference.findOne({ id: userId }, function(err, resultReference){
   
      for(i = 0; i < resultReference.ref.length ; i++){
      
        if(resultReference.ref[i].id === monthyear || i === resultReference.ref.length - 1 ){
           
           resultReference.ref[i].event.push(theEvent);
           result.Reference.save(function (err) {
            if (err){
                console.log('Error in saving result');
                //callbackVar = "failed";
            }
            else{
                callbackVar = "success";
            }
            
           });
        }
        //month isnt in database yet, so create it
        else{
        
        //TO COMPLETE, PUSH NEW MOTN IN DATABASE
        resultReference.push(
            
        }
        //get out of loop has soon everything is done.
        break;
    
      }
    
   });
   
}

//Saves workout, sends callback has the objectid, to then save in reference collection
var saveWorkout = function(workoutObject, callback){
    
    var theWorkout = "not instantiated";
    var callbackValue = "not instantiated";
    
    if(workoutObject.type === "intervall"){
       
       //We rewrite the parcour name, not just the id, because we dont want
       //to http request just to get the name
       var receivedParcour = {
            id: workoutObject.parcour.id, 
            name: workoutObject.parcour.name        
       }
 
       theWorkout = CardioWorkout({ 
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
            }else{
                callbackValue = theWorkout._id;    
            }
        });  
    }
    else if(workoutObject.type === "distance" ){
        
        var distanceValues = {
            targetType     :workoutObject.distance.targetType, 
            minValue       :workoutObject.distance.minValue,
            maxValue       :workoutObject.distance.maxValue, 
            intensity      :workoutObject.distance.intensity          
        }
        
        theWorkout = CardioWorkout({ 
            sport         :workoutObject.sport, 
            type          :workoutObject.type,
            distance      :distanceValues,
            description   :workoutObject.description,
            cell          :workoutObject.cell,
            parcour       :workoutObject.parcour,
            results       :workoutObject.results
       }); 
       
       theWorkout.save(function(err){
            if(err){
                console.log("error in save: " + err);  
                callbackValue = "not instantiated";
            }else{
                callbackValue = theWorkout._id;    
            }
        });
    }
    else{
        //something went wrong
        callbackValue = "not instantiated";
    }
    
    
   callback(callbackValue);
    
}

//*****************Exports*****************************************8
exports.saveParcour = saveParcour;
exports.getParcourList = getParcourList; 
exports.getParcour = getParcour;

exports.saveWorkout = saveWorkout;
exports.saveEvent = saveEvent;