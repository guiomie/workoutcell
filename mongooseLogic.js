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

//NOT IMPLEMENTED YET 
/*var deleteParcourReference = function(referenceId, userId, callback){
    
    //Verify the object is a valid objectid
    if(referenceId.toString().length !== 24 || userId.toString().length !== 24){
        
       console.log("Invalid objectId or input submitted @ deleteParcourReference()");
       callback("Invalid objectId or input");
    }
    else{
        GeneralReference.findOne({ id: userId }, function (err, result) {
            if (err || result === null) { 
                console.log("In deleteParcourReference error(1)");
                callback("Error in deletion. Stack Trace: " + err); 
            }
            else{
                console.log(result.ref.length + " vs " + arrayLocation);
                if( result.ref[arrayLocation].allEvents.id(eventId) !== null){
                    //Mongoose special command to .id to search an _id
                    result.save(function (err) {
                        if (err) { 
                            console.log("In deleteParcourReference error(2)");
                            callback("Error in deletion. Stack Trace: " + err); 
                        }
                        else{
                            console.log("In deleteEvent Success");
                            callback("Success");      
                        }      
                    });
                
                }
                else{
                    console.log("In deleteParcourReference error(3)");
                    callback("Error, couldnt find calendar event");
                }                   
            }
        });
    }
}*/


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
var saveWorkout = function(workoutObject, logedId, logedName, callback){
    
    var theWorkout = "not instantiated";
    var callbackValue = "not instantiated";
    var receivedParcour = {};
    var cell = {};

    if(workoutObject.parcour.id === "none"){
        receivedParcour = {};
    }
    else{
        receivedParcour = {
            id: ObjectId(workoutObject.parcour.id), 
            name: workoutObject.parcour.name        
        };
    }
    
    if(logedId !== "none" && logedName !== "none"){
          
        var tinyuser = {
            fbid      : parseInt(logedId),
            fullNamee : logedName
        }
    
        var array = [];
        array.push(tinyuser);
            
        cell = {
           creator       : logedName,
           participants  : array
           
        }; 
    
    }
    else{                  
          cell = {};  
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
            cell               :cell,
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
            cell                 :cell,
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


var saveCellEvent = function(eventObject, cellId, workoutRef, callback){
    
    var callbackVar = "not instantiated";
    var theEvent = new CalendarEvent();
  
    theEvent.title = eventObject.title;
    theEvent.allDay = eventObject.allDay;
    theEvent.start = eventObject.start;
    theEvent.end = eventObject.end;
    theEvent.url = "/workout/" + workoutRef;
    theEvent.color = "#C24747";  //Special color for cells
    theEvent.refWorkout = workoutRef;
    
   
    var month = new CalendarMonth();
    var eventDate = new Date(eventObject.start);
    //The workout array starts on 1 Jan 2011, all other positions in array are 
    //relative to this start day. To find the year/month of an array loc use modulo
    arrayLocation = 1 + (((parseInt(eventDate.getFullYear())) - 2011)*12) + parseInt(eventDate.getMonth());
    CellDetails.findOne({ _id: cellId }, function(err, resultReference){
   
        if(err || resultReference === null){
            console.log('Error in finding calendar reference collection: ' + err + ' at id: ' + cellId); 
            callbackVar = "not instantiated";  
            callback(callbackVar);
        }
        else{
            console.log(resultReference);
            var initialRefLength = resultReference.activities.length;
            if(resultReference.activities.length <= arrayLocation){
                console.log("In if");
                for(i = initialRefLength; i <= (arrayLocation); i++){
                    console.log("In loop: " +i);
                    resultReference.activities.push({id: (i + initialRefLength), allEvents: []});  
                } 
                resultReference.activities[arrayLocation].allEvents.push(theEvent);
            }
            else{        
                resultReference.activities[arrayLocation].allEvents.push(theEvent); 
            }
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

/*
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
                if(result.type === "distance"){ //&& typeof(receivedResult.distanceResult) !== "undefined"){   
                    var temp = {
                       unit       :receivedResult.unit, 
                       value      :receivedResult.value, 
                       completed  :receivedResult.completed
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
                else if(result.type === "intervall" && typeof(receivedResult.length) !== "undefined"){ // && typeof(receivedResult.intervallResult) !== "undefined"){
                    if(receivedResult.length === result.intervalls.length){
                        result.intervallResult = receivedResult; 
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
}*/

var saveResults = function(workoutRefId, receivedResult, userId, callback){
    
    console.log(JSON.stringify(receivedResult + " : " + workoutRefId));
    
    if(workoutRefId.toString().length !== 24 ){
        
       console.log("Invalid objectId submitted @ getWorkout()");
       callback("Invalid objectId for workoutId");
    }
    else{
        //Means this is a intervall trainning
        if(RealTypeOf(receivedResult) === "array"){
            console.log("Looking for: " + userId + " at workout id: " +  workoutRefId);
            CardioResult.findOne({ "id" : userId, "intervallResult.workoutId": workoutRefId }, function(err, result){
                if(err){
                    callback("No Document found: " + err);
                }
                else if( result === null){ //this means the document doesnt exist so lets push it to the array
                    console.log('document not found');
                    var tempResult = {
                        workoutId    :workoutRefId,
                        intervalls   :receivedResult
                    }
                    
                    CardioResult.update({ "id" : userId}, { $push: {"intervallResult": tempResult}}, {upsert: true}, function(err){
                        if(err){
                            callback("Error in saving result (intervall): " + err);
                        }
                        else{
                            callback("Success");
                        }
                    });
                }
                else{
                    console.log('in document update');
                    CardioResult.update({ "id" : userId, "intervallResult.workoutId": workoutRefId },
                        { $set:{"intervallResult.$.intervalls":receivedResult}},{upsert: true}, function(err){
                            if(err){
                                callback("Cant update doc: " + err);
                            }
                            else{
                                 callback("Success");
                            }
                    });
                }
            });   
        }
        else{ //should be a distance training
            CardioResult.findOne({ "id" : userId, "distanceResult.workoutId": workoutRefId }, function(err, result){
                if(err){
                    callback("No Document found: " + err);
                }
                else if( result === null){
                    var tempResult =  {
                        workoutId    : workoutRefId, 
                        unit         : receivedResult.unit, 
                        value        : receivedResult.value, 
                        completed    : receivedResult.completed
                    }
                    CardioResult.update({ "id" : userId}, { $push: {"distanceResult": tempResult}}, {upsert: true}, function(err){
                        if(err){
                            callback("Error in saving result (Distance): " + err);
                        }
                        else{
                            callback("Success");
                        }
                    });
                }
                else{
                    console.log("Looking for: " + userId + " at workout id: " +  workoutRefId);              
                    CardioResult.update({ "id" : userId, "distanceResult.workoutId": workoutRefId },
                        { $set:{
                            "distanceResult.$.unit"        : receivedResult.unit,
                            "distanceResult.$.value"       : receivedResult.value,
                            "distanceResult.$.completed"   : receivedResult.completed}
                        },{upsert: true}, function(err){
                            if(err){
                                callback("Cant update doc: " + err);
                            }
                            else{
                                 callback("Success");
                            }
                    }); 
                }
            }); 
        }
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

//Similar has previous but for a cell
var getCellMonthEvent = function(cellId, year, month, callback){
    
    var callB = "not instantiated";
    
    CellDetails.findOne({ _id: cellId}, function(err, result){
    
        if(err || result === null){
            callB = "not instantiated";
            callback(callB);
        }
        else{
           var arrayLocation = ((parseInt(year) - 2011)*12) + parseInt(month);
           if(result.activities.length > arrayLocation && parseInt(year) > 2010){
                callB = result.activities[arrayLocation].allEvents; 
                callback(callB); 
           }
           else{
            callB = "not instantiated";
            callback(callB);
           
           }
        } 
 
    });
}

//Remove specific workout from its workoutid
var deleteWorkout = function(workoutId, callback){
    
    //Verify the object is a valid objectid
    if(workoutId.toString().length !== 24 ){
        
       console.log("Invalid objectId submitted @ deleteWorkout()");
       callback("Invalid objectId for workoutId");
    }
    else{
        //var myObjectId = ObjectId.fromString(workoutId); 
        //console.log("Searching for parcour at: " + workoutId);
        CardioWorkout.remove({ _id: workoutId }, function (err) {
            if (err) { 
                console.log("In deleteWorkout Failed");
                callback("Error in deletion. Stack Trace: " + err); 
            }
            else{
                console.log("In deleteWorkout success");
                callback("Success");      
            }      
        });
    }  
}

var deleteEvent = function(eventId, userId, month, year, callback){
    
    //Verify the object is a valid objectid
    if(eventId.toString().length !== 24 || !isNumber(month) || !isNumber(year) || month < 1 || year < 2011){
        
       //console.log("Invalid objectId or input submitted @ deleteEvent()");
       callback("Invalid objectId or input for eventId");
    }
    else{
        var arrayLocation = 1 + ((parseInt(year) - 2011)*12) + parseInt(month);
        //var myObjectId = ObjectId.fromString(workoutId); 
        //console.log("Searching for parcour at: " + workoutId);
        CalendarEventReference.findOne({ id: userId }, function (err, result) {
            if (err || result === null) { 
                //console.log("In deleteEvent error(1)");
                callback("Error in deletion. Stack Trace: " + err); 
            }
            else{
                console.log(result.ref.length + " vs " + arrayLocation);
                if(typeof(result.ref.length) !== "undefined" && result.ref.length > arrayLocation 
                    && result.ref[arrayLocation].allEvents.id(eventId) !== null){
                    //Mongoose special command to .id to search an _id
                    result.ref[arrayLocation].allEvents.id(eventId).remove();
                    result.save(function (err) {
                        if (err) { 
                            console.log("In deleteEvent error(2)");
                            callback("Error in deletion. Stack Trace: " + err); 
                        }
                        else{
                            console.log("In deleteEvent Success");
                            callback("Success");      
                        }      
                    });
                
                }
                else{
                    console.log("In deleteEvent error(3)");
                    callback("Error, couldnt find calendar event");
                }                   
            }
        });
    }
}


/////*********************** Social and SEARCH *****************************////

//This will add a user friendship request in the users notification queu
var saveFriendshipRequestToQueu = function(requester, requestee, requesterName, callback){
   
    var pendingNotification = {
        type      : "joinMasterCell", //joinMasterCell, workoutCell 
        message   : requesterName + " wants to be friend.", //Name of person
        refId     : requester,
        date      : new Date()
    }
    
    NotificationsReference.findOne({ id: requestee}, function(err, result){
        if(err || result === null){
            console.log("No document found or: " + err + " - Result:" + result + " for " + requestee);
            callback("Error in request (1). Stack Trace: " + err);
        }
        else{
            checkIfpending(requester, result.pending, function(mes){     
                if(mes === "isNotPending"){
                    result.pending.push(pendingNotification);
                    result.save(function (err) {
                        if (err) { 
                            //console.log("In deleteEvent error(2)");
                            callback("Error in saving request(2). Stack Trace: " + err); 
                        }
                        else{
                            //console.log("In deleteEvent Success");
                            callback("Success");      
                        }      
                    });
                }
                else{
                    callback("Request is already pending");    
                }
            });
        }
    });
    
}

//This will return the values in between the ranges in relation to the array size
var getPendingNotifications = function(userId, rangeMin, rangeMax, callback){
    
    NotificationsReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            //console.log("No document found or: " + err);
            callback("not instantiated");
        }
        else{
            var length = result.pending.length;
            if(length === 0){
                
               callback([]); 
            }
            else if(rangeMin < length || rangeMax > rangeMin){
               var multiplicant = length / 10;
               if(multiplicant <= 1){
                   callback(result.pending);
               }
               else if(rangeMax <= 10){
                  callback(result.pending.slice(0, 9));
               }
               else {
                  callback(result.pending.slice(rangeMin, rangeMax));              
               }
                
            }
            else{
              callback([]);     
            }
    
        }
    });
    
}

//This will go in the users pending notifications, remove the requesters id
//and copy it to its friends list in the his general reference collection
var acceptPendingFriendship = function(userId, requesterId, callback){
    
    NotificationsReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            callback("Could not accept notification. Stack: " + err);
        }
        else{
            var deletedRefId = 'unchanged';
            for(i = 0; i < result.pending.length; i++){
             
               if( result.pending[i].refId === requesterId){
                    //console.log(deletedRefId);
                    deletedRefId = result.pending.splice(i, 1);
                    //console.log(deletedRefId + " - " + JSON.stringify(result));
                    result.save(function (err) {
                        if (err) { 
                            callback("Error in saving request(2). Stack Trace: " + err); 
                        }
                        else{
                            GeneralReference.findOne({ id: userId}, function(err, result){
                                if(err || result === null){
                                    callback("Error in saving request(3). Stack Trace: " + err);  
                                }
                                else{
                                    result.friends.push(parseInt(requesterId));    
                                    result.save(function (err){
                                        if (err) { 
                                            callback("Error in saving request(2). Stack Trace: " + err); 
                                        }
                                        else{
                                            GeneralReference.findOne({ id: requesterId}, function(err, result){
                                                if(err || result === null){
                                                    callback("Error in saving request(3). Stack Trace: " + err);  
                                                }
                                                else{
                                                    result.friends.push(parseInt(userId));    
                                                    result.save(function (err){
                                                        if (err) { 
                                                            callback("Error in saving request(2). Stack Trace: " + err); 
                                                        }
                                                        else{
                                                            callback("Success");    
                                                        
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }); 
                        }
                    });
                }
            }
        }
    });  
}

var declinePendingFriendship = function(userId, requesterId, callback){
    
    NotificationsReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            callback("Could not accept notification. Stack: " + err);
        }
        else{
            var deletedRefId = 'unchanged';
            var cbResponse = "Couldnt find user pending notifications";
            var inIf = false;
            for(i = 0; i < result.pending.length; i++){
               if( result.pending[i].refId === requesterId){
                    inIf = true;
                    deletedRefId = result.pending.splice(i, 1);
                    result.save(function (err) {
                        if (err) { 
                            callback("Error in saving request(1). Stack Trace: " + err);
                        }
                        else{
                            callback("Success");
                        }
                    });
                    break;
               }
            }
            if(!inIf){
                callback(cbResponse);
            }
        }
    });  
}

var getFriendList = function(userId, callback){
 
    GeneralReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            console.log("For : " + userId + "  " + err + " : " + result);
            callback("Error");
        }
        else{ 
            if(result.friends.length == 0){
                callback("Empty"); 
            }
            else{
                callback(result.friends);    
            }
        }
    });        
}

var getUserBasicInfo = function(userId, callback){
 
    User.findOne({ fbid: userId }, function(err, result){
        if(err || result === null){
            //console.log("For : " + userId + "  " + err + " : " + result);
            callback("Error");
        }
        else{
            callback(result);
        }
    }); 
}

var getProfileSnippet = function(userId, callback){
 
    User.findOne({ fbid: userId }, function(err, result){
        if(err || result === null){
            //console.log("For : " + userId + "  " + err + " : " + result);
            callback("Error");
        }
        else{
            var html = result.firstName + " " + result.lastName + "<br> <span class='btn_viewProfile' userId='" + 
                    result.fbid + "' style='cursor: pointer;'> View Profile </span>";
            callback(html);
        }
    }); 
}

var searchByFullName = function(first, last, callback){
    
    if(first !== "" && last !== ""){
    
        var query = User.find({});
        query.where('firstName', first);
        query.where('lastName', last);
        query.limit(5);

        query.exec(function (err, docs) {
            if(err){
                callback("failed");   
            }
            else{
                callback(docs);    
            }
        });    
    }
    else{ 
        callback("failed"); 
    }
    
}

var createCell = function(creatorId, cellObject, userName, callback){
 

    var newCellDetails = new CellDetails({
        name         : cellObject.name,
	    location     : cellObject.location,
	    owner        : parseInt(creatorId), 
	    members      : [parseInt(creatorId)],
	    description  : cellObject.description, 
    });
    
    newCellDetails.save(function(err, result){
        if(err){
            callback("Error in saving cell: Stack: " + err);        
        }
        else{
        
            var newCellRef = new CellReference({
                name        : cellObject.name,
                location    : cellObject.location,
                owner       : userName, //creators id
	            cellDetails : result._id
            });
            
            GeneralReference.findOne({ id: creatorId}, function(err, result){
                if(err || result === null){
                    callback("Error in finding Users Ref. Stack: " + err);
                }
                else{  
                    result.cells.push(newCellRef);
                    result.save(function(err, result){
                        if(err){
                            callback("Error in saving cellRef: Stack: " + err);        
                        }
                        else{
                            callback("Success");       
                        }
                
                    });
                }
            
            });
        }    
    });
}
//Returns an array with all athletes Cell References
var getUsersCells = function(userId, callback){
    
    GeneralReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            callback("Error");
        }
        else{
            if(result.cells.length === 0){
                callback("Empty");    
            }
            else{
                callback(result.cells);    
            }
        }      
    });
}

var getCellDetails = function(cellId, callback){
    
    if(cellId.toString().length !== 24 ){
       //console.log("not 24 char");
       callback("Error");
    }
    else{
        CellDetails.findOne({ _id: cellId }, function(err, result){
            if(err || result === null){
                console.log(err);
                callback("Error");
            }
            else{
                callback(result);
            }
        });
    }
}


var joinCell = function(cellId, userId, callback){
    
   if(cellId.toString().length !== 24 && isNumber(parseInt(userId)) ){
       //console.log("not 24 char");
       callback("Error, improper Id");
    }
    else{
        CellDetails.findOne({ _id: cellId }, function(err, resultCellDetails){
            if(err || resultCellDetails === null){
                console.log(err);
                callback("Error in finding Cell. Stack: " + err);
            }
            else{
                resultCellDetails.members.push(userId);
                resultCellDetails.save(function(err){
                    if(err){
                        callback("Error in saving cellRef: Stack: " + err);        
                    }
                    else{
                        GeneralReference.findOne({ id: userId }, function(err, result){
                            if(err || result === null){
                                callback("Error in finding User. Stack: " + err);
                            }
                            else{
                                var newCellRef = new CellReference({
                                    name        : resultCellDetails.name,
                                    location    : resultCellDetails.location,
                                    owner       : resultCellDetails.owner, 
                                    cellDetails : resultCellDetails._id
                                });
                                result.cells.push(newCellRef);
                                result.save(function(err){
                                    if(err){
                                        callback("Error in saving cellRef: Stack: " + err);        
                                    }
                                    else{
                                        callback("Success");
                                    }
                                }); 
                            }
                        });
                    }
                });
            }
        });
    } 
}

/// Random functions

//Validates numbers
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var checkIfpending = function(requester, array, callback){
    var callbackResult =  "isNotPending";
    for(i = 0; i < array.length;i++){
        if(array[i].type === "joinMasterCell" && array[i].refId === requester){
            callbackResult = "isPending";
            break;
        }
                
    }
    callback(callbackResult);
}


var isUserAFriend = function(userId, target, callback){
    
    GeneralReference.findOne({ id: userId}, function(err, result){
        if(err || result === null){
            console.log("For : " + userId + "  " + err + " : " + result);
            callback(false);
        }
        else{ 
            if(result.friends.length === 0){
                callback(false); 
            }
            else{
                var response = false;
                for(i = 0; i < result.friends.length;i++){
                    //console.log(result.friends[i]);
                    if(result.friends[i] === parseInt(target)){
                        response = true;  
                        break;
                    }
                }
                callback(response);
            }
        }
    }); 
        
}

//Taken from http://joncom.be/code/realtypeof/
function RealTypeOf(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor) return "array";
    if (v.constructor == (new Date).constructor) return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}
/*
var getCellStats = function(objectId){
    
    CellDetails.findOne({ _id: objectId }, function(err, result){
        if(err || result === null){
            callback("Error");
        }
        else{
            var stat = {
                memberSize   : result.members.length,
                calendarSize : result.activities.length
            }
            callback(stat);
        }
    });
    
}*/

//*****************Exports*****************************************
exports.saveParcour = saveParcour;
exports.getParcourList = getParcourList; 
exports.getParcour = getParcour;

exports.saveWorkout = saveWorkout;
exports.saveEvent = saveEvent;
exports.getWorkout = getWorkout;
exports.getMonthEvent = getMonthEvent;
exports.saveResults = saveResults;
exports.deleteWorkout = deleteWorkout;
exports.deleteEvent = deleteEvent;
exports.saveCellEvent = saveCellEvent;
exports.getCellMonthEvent = getCellMonthEvent;

exports.getUserBasicInfo = getUserBasicInfo;
exports.getCellDetails = getCellDetails;
exports.createCell = createCell;
exports.getUsersCells = getUsersCells;
exports.isUserAFriend = isUserAFriend;
exports.getProfileSnippet = getProfileSnippet;
exports.searchByFullName = searchByFullName;
exports.saveFriendshipRequestToQueu = saveFriendshipRequestToQueu;
exports.getFriendList = getFriendList;
exports.getPendingNotifications = getPendingNotifications;
exports.acceptPendingFriendship = acceptPendingFriendship;
exports.declinePendingFriendship =declinePendingFriendship;