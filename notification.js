var ObjectId = require('./node_modules/mongoose').Types.ObjectId;


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


var saveCellRequestToQueu = function(requesterName, cellName, userId, cellId, callback){
    
    var pendingNotification = {
        type      : "cellInvite", //joinMasterCell, workoutCell 
        message   : requesterName + " has invited you to " + cellName + "'s cell", //Name of person
        refId     : userId,
        refOId    : cellId, //cell Id
        date      : new Date()
    }
    
     NotificationsReference.findOne({ "id" : parseInt(userId), "pending.refOId" : ObjectId.fromString(cellId)}, function(err, result){
        if(err){ 
            callback("Failed");
        }
        else if(result === null){
            //This means user hasnt filled in any result for this workout yet
            NotificationsReference.update({ "id" : parseInt(userId)}, { $push: { pending: pendingNotification}, $inc: { unRead : 1 }}, function(err){
                if(err){
                    callback("Error in pushing not to found user. User:" + result.members[i]);
                }
                else{ 
                    callback("Success");
                }
            });
        }
        else{
            callback("Existant");
        }
     }); 
}

var removeCellInviteNotification = function(cellId, userId, callback){
    
    
    NotificationsReference.findOne({ 'id' : userId, "pending.refOId" :  ObjectId.fromString(cellId)}, function(err, result){
        if(err || result === null){
            console.log(err + " - " + result);
            callback('InvalidRequest');
        }
        else{
            NotificationsReference.update({ "id" : userId}, { $pull: { pending: { refOId :  ObjectId.fromString(cellId)}}}, function(err, result){
                if(err || result === null){
                    console.log("User isnt part of this cell. Stack: " + err );
                    callback("InvalidRequest");
                }
                else{ //Memeber not in cell yet, so he can join
                    callback("User removed");
                
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
               if( result.pending[i].refId === requesterId && result.pending[i].type === "joinMasterCell"){
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




var sendNotificationToCellUsers = function(cellId, notification, callback){
    console.log('in not for users');
    CellDetails.findOne({_id: cellId}, function(err, result){
        if(err || null){
            console.log(result + " - " + err);
            callback("Can't send notification. Stack:" + err);
        }
        else{
        
            for(i =0; i < result.members.length; i++){
                console.log( i  + " user is " + result.members[i]);
                NotificationsReference.update({ "id" : result.members[i]}, { $push: { pending: notification}, $inc: { unRead : 1 }}, function(err){
                    if(err){
                        callback("Error in pushing not to found user. User:" + result.members[i]);
                    }
                    else{ 
                        callback("Success");
                    }
                });
            }
        }      
    });
}

var sendNotificationToCell = function(cellId, newNotification, callback){
    
    CellDetails.update({ _id: cellId }, { $push: { notification: newNotification}}, function(err){
         if(err){
            callback("Can't send notification. Stack:" + err);
        }
        else{
            callback("Success");
        }
    });
    
}

var getUnreadNotificationsCount = function(userId, callback){
    
    NotificationsReference.findOne({ id: userId }, function(err, results){
        if(err || null){
            //console.log(result + " - " + err);
            callback("Failed");
        }
        else{
            callback(results.unRead);
            
        } 
    }); 
}

var resetUnreadNotificationsCount = function(userId, callback){
    
    NotificationsReference.update({ id: userId }, { $set: { unRead: 0}}, function(err){
        if(err){
            //console.log(result + " - " + err);
            callback("Can't get unread notifications. Stack:" + err);
        }
        else{
            callback("Success"); 
        } 
    }); 
}

var getCellNotifications = function(cellId, from, to, callback){
    
    CellDetails.find({_id: cellId }, {"notification" : {"$slice" : [parseInt(from), parseInt(to)]}}, function(err, result){
        if(err || result === null){
            //console.log(err);
            callback("Error in notifications Cell. Stack: " + err);
        }
        else{
            callback(result);
        }
    });
    
}




//!---------------------- Private functions to this module------------------ //

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

var checkIfCellpending = function(cellId, array, callback){

    for(i = 0; i < array.length;i++){
        if(array[i].type === "cellInvite" && array[i].refOId === cellId){
            callback("isPending");
            break;
        }
        else if(i === array.length - 1){
             callbackResult("isNotPending");
        }
        else{
            
        }       
    }
}

// --------------------- Exports  -------------------------------------//

exports.getCellNotifications = getCellNotifications;
exports.saveFriendshipRequestToQueu = saveFriendshipRequestToQueu;
exports.saveCellRequestToQueu = saveCellRequestToQueu;
exports.getPendingNotifications = getPendingNotifications;
exports.acceptPendingFriendship = acceptPendingFriendship;
exports.declinePendingFriendship = declinePendingFriendship;
exports.sendNotificationToCellUsers = sendNotificationToCellUsers;
exports.sendNotificationToCell = sendNotificationToCell;
exports.getUnreadNotificationsCount = getUnreadNotificationsCount;
exports.resetUnreadNotificationsCount = resetUnreadNotificationsCount;
exports.getCellNotifications = getCellNotifications;
exports.removeCellInviteNotification = removeCellInviteNotification;