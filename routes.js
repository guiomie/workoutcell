
var mongooseLogic = require('./mongooseLogic');
var notification = require('./notification');

module.exports = function(app) {
    
    //Clear current user session of our auth data
    app.get('/logoff', function(req, res){
        req.logout();
    });
    
    app.get('/view/:htmlpage', function(req, res){
        console.log(req.loggedIn);
        
        if(req.loggedIn) {
            res.sendfile('./views/' + req.params.htmlpage + '.html');
        }
        else{
        
          res.send('You need to be authenticated with a <a href="www.facebook.com">Facebook</a> to access <a href="/"> Workoutcell </a>');
        
        }
    });
    
    //!!!!!--------------HTTP GET REQUEST ----------------!!!!!!!!
    
    //------RETREIVAL OF DATA ----------
    
    //retrieve a list containing objects with name, distance and reference of
    //all users maps
    app.get("/parcour/list/:userId", function(req, res){
     
        mongooseLogic.getParcourList(req.params.userId,  function(data){
         
            console.log(data);
            res.json(JSON.stringify(data));
         
        });
  

    });
    
    //Retrieve a specific parcour. A parcour is the name, distance and actual 
    //gmap coordinates.
    app.get("/parcour/:parcourId", function(req, res){
     
    mongooseLogic.getParcour(req.params.parcourId, function(data){
         
         //console.log("routes.js level: " + data);
         res.json(data);
         
         });
  

    });
    
    app.get("/parcour/delete/:parcourId", function(req, res){
     
        mongooseLogic.deleteParcour(req.params.parcourId, getLogedId(req), function(message){
         
            //console.log("routes.js level: " + data);
            if(message === "Success"){
                res.json({ success: true, message:'Deleted workout'});
            }
            else{
                res.json({ success: false, message:'Failed to delete workout. ' + message});
            }
            
        });
    });
    
    
    //retreive specific workout in database
    app.get("/workout/:workoutid", function(req, res){
        
        
         mongooseLogic.getWorkout(req.params.workoutid, getLogedId(req), function(message){

            if(message === "not instantiated"){
                res.json("{ success: false, message:'Failed to find workout'}");
            }
            else{
                res.json(message);    
            }
         
         });
       
    });
    
    //Retreive specific workout
    
    app.get("/event/:year/:month/:userId", function(req, res){
    
    
        mongooseLogic.getMonthEvent(req.params.userId, req.params.year, 
            req.params.month, function(object){
        
            if(object === "not instantiated"){
                
                res.json({ success: false, message: 'No calendar events for this month'});    
            }
            else{
                
               res.json({ success: true, message: object}); 
            }
        
        });
        
    });
    
    //Adds a notification to the users queu
    app.get("/notification/:userId/:type/:target", function(req, res){
        
        if(isAllowed(req, req.params.userId) && req.params.target !== req.params.userId){ //make sure user submitting request is the user
             mongooseLogic.isUserAFriend(req.params.userId, req.params.target, function(bool){ //If user is a friend request ignored
                console.log(bool);
                if(req.params.type === "joinMasterCell" && !bool){
                    notification.saveFriendshipRequestToQueu(req.params.userId, 
                        req.params.target, getLogedName(req), function(mongooseRes){
                        if(mongooseRes === "Success"){
                            res.json({ success: true, message:'Request sent to join Friends list.'});
                        }
                        else{   
                            res.json({ success: false, message:mongooseRes});
                        }
                    });    
                }
                else{
                    res.json({ success: false, message:'Invalid parameter sent'});
                }
            });
        }
        else{
           res.json({ success: false, message:'Already friends, or invalid authorization'}); 
        }
   
    });

    app.get("/notification/unread", function(req, res){
        notification.getUnreadNotificationsCount(parseInt(getLogedId(req)), function(mes){
            if(mes !== "Failed"){
                res.json({ success: true, message:mes});
            }
            else{
                 res.json({ success: false, message:0});
            } 
        });
        
    });
    
    app.get("/notification/unread/reset", function(req, res){
        notification.resetUnreadNotificationsCount(parseInt(getLogedId(req)), function(mes){
            if(mes === "Success"){
                res.json({ success: true, message:0});
            }
            else{
                res.json({ success: false, message:"Cant mark as read." + mes});
            }   
        });
    });
    
    //Receive all what is in pending  notification queu of use
    app.get("/notification/queu/:userId/:min/:max", function(req, res){
        
        if(isAllowed(req, req.params.userId) && is_int(req.params.min) && is_int(req.params.max)){
            
            notification.getPendingNotifications(req.params.userId, parseInt(req.params.min), 
                parseInt(req.params.max), function(mongooseRes){
                    if(mongooseRes === "not instantiated"){
                        res.json({ success: false, message:"Couldnt find information"});
                    }
                    else{   
                        res.json({ success: true, message:mongooseRes});
                    }
            });
                
        }
        else{
            res.json({ success: false, message:'Invalid parameter sent'});
        }
   
    });
    
    //Send a response to either accepting or denying someone in your cell
    app.get("/notification/joinMasterCell/:userId/:requester/:action", function(req,res){
        
        if(isAllowed(req, req.params.userId) && (req.params.action === "accept" 
            || req.params.action=== "decline")){
            
            if(req.params.action === "accept"){
                mongooseLogic.isUserAFriend(req.params.userId, req.params.requester, function(bool){
                    if(bool){
                        notification.declinePendingFriendship(req.params.userId, req.params.requester, function(mes){
                            if(mes === "Success"){
                                res.json({ success: true, message: "User is already a friend."});
                            }
                            else{
                                res.json({ success: false, message: mes});
                            }
                        });
                    }
                    else{
                        notification.acceptPendingFriendship(req.params.userId, req.params.requester, function(mes){
                            if(mes === "Success"){
                                res.json({ success: true, message: "Successfully added Friend to your cell"});
                            }
                            else{
                                res.json({ success: false, message: mes});
                            }
                        });
                    }
                });
            }
            else if(req.params.action === "decline"){
                notification.declinePendingFriendship(req.params.userId, req.params.requester, function(mes){
                    if(mes === "Success"){
                        res.json({ success: true, message: "Declined users frienship"});
                    }
                    else{
                        res.json({ success: false, message: mes});
                    }
             
                });
            }
            else{
                res.json({ success: false, message:'Invalid parameter sent (1)'}); 
             
            }
        
        }
        else{
           res.json({ success: false, message:'Invalid parameter sent(2)'}); 
        }
        
    });
    
    /*
    app.get("/notifications/cell/:cellId/:from/:to", function(req,res){
        
        mongooseLogic.getCellNotifications(req.params.cellId, req.params.from, req.params.to, function(mes){
        
            if(RealTypeOf(mes) !==  "array"){
                res.json({ success: false, message:mes});   
            }
            else{
                res.json({ success: true, message:mes});   
            }
        
        });
    
    });*/
    
        
    app.get("/notification/cell/message/:cellId/:message", function(req, res){
        
        var newNotification = {
            type      : 'newCellMessage', //joinMasterCell, workoutCell, broadcast
            message   : getLogedName(req) + ' says: ' + req.params.message + '.', 
            refId     : getLogedId(req),
            refOId    : "",  //cellId
            date      : new Date(), 
        }
        
        notification.sendNotificationToCell(req.params.cellId, newNotification, function(mes){
            if(mes !== "Success"){
               res.json({ success: false, message: 'Couldnt post message.'});
            }
            else{
                res.json({ success: true, message:'Posted message to cell.'}); 
                
                var newNotification = {
                    type      : 'newCellMessage', //joinMasterCell, workoutCell, broadcast
                    message   : getLogedName(req) + ' posted a message', //Name of person
                    refId     : req.params.cellId,
                    refOId    : getLogedId(req),  //cellId
                    date      : new Date(), 
                }

                notification.sendNotificationToCellUsers(req.params.cellId, newNotification, function(res){
                    if(res !== "Success"){
                          notification.pushToNotificationLog(res + " @ POST: /workout/cell/:cellId/:userId");
                    }
                });

            } 
        });
    });
    
    
    //Returns the users friend list, an array with their Facebook Ids
    app.get("/cell/friends/:userId", function(req,res){
        
        
        mongooseLogic.getFriendList(req.params.userId, function(mes){
            if(mes === "Error"){
                res.json({ success: false, message:'Failed to find List.'});  
            }
            else if(mes === "Empty"){
                res.json({ success: true, message:'You have no friend in your cell'});
            }
            else{
                res.json({ success: true, message: mes}); 
            }
        });
         
     });
     
     app.get("/cell/join/:cellId", function(req,res){
        
        mongooseLogic.joinCell(req.params.cellId, getLogedId(req), function(mes){
            if(mes !== "Success"){
                res.json({ success: false, message:'Failed to find join Cell.'});  
            }
            else{
                res.json({ success: true, message: mes}); 
            }  
        });
     });
     
     app.get("/cell/quit/:cellId", function(req, res){
        mongooseLogic.quitCell(getLogedId(req), req.params.cellId, function(mes){
            if(mes === "Success"){
                res.json({ success: true, message: 'Joined Cell'});
            }
            else{
                res.json({ success: false, message:'Failed to quit Cell.' + mes});     
            }  
        });
     });
     
    //returns all of a users cells
    app.get("/cell/all/:userId", function(req,res){
       
       mongooseLogic.getUsersCells(req.params.userId, function(mes){
            if(mes === "Error"){
                res.json({ success: false, message:'Failed to find Users Cells.'});  
            }
            else if(mes === "Empty"){
                res.json({ success: true, message:'You are not part of any cells.'});
            }
            else{
                res.json({ success: true, message: mes}); 
            }
        });       
    });
    
    //Stakes a objectid and returns workout for it
    app.get("/cell/details/:cellId", function(req, res){
     
        mongooseLogic.getCellDetails(req.params.cellId, function(mes){
            if(mes === "Error"){
                res.json({ success: false, message: "An error happened in the request."});
            }
            else{
                if(mes.isPrivate){
                    for(i=0; i < mes.members.length; i++){
                        //console.log(typeof(getLogedId(req)) + " vs " + typeof(mes.members[i]));
                        if(parseInt(getLogedId(req)) === mes.members[i]){
                           res.json({ success: true, message: mes});
                           break;
                        }
                        else if(i === mes.members.length - 1){ //When loop is doen send failure
                            res.json({ success: true, message: "This cell is private"});
                        }
                        else{
                            
                        }
                    } 
                }
                else{
                    res.json({ success: true, message: mes});
                }
            } 
        });
    });
    
    
    app.get("/cell/event/:year/:month/:cellId", function(req, res){

        mongooseLogic.getCellMonthEvent(req.params.cellId, req.params.year, 
            req.params.month, function(object){
        
            if(object === "not instantiated"){
                
                res.json({ success: false, message: 'No calendar events for this month'});    
            }
            else{
                
               res.json({ success: true, message: object}); 
            }
        
        });
        
    });
     
    //Sends response as a string/html
    app.get("/user/snippet/:userId", function(req,res){
        mongooseLogic.getProfileSnippet(req.params.userId, function(mes){
            if(mes === "Error"){
                //res.json({ success: false, message:'Failed to find profile.'}); 
                res.send("You can not see this information");
            }
            else{
                //res.json({ success: true, message: mes}); 
                res.send(mes); 
            }   
        });
  
    });
    
    app.get("/user/isFriend/:userId/:target", function(req,res){
         //console.log("got request");
         mongooseLogic.isUserAFriend(req.params.userId, req.params.target, function(bool){
            if(bool){
                res.json({ success: true, message:'You are friends'});   
            }
            else{
                res.json({ success: false, message:'You are  not friends'});
            }  
         });
 
    });
    
    //Checks if user is a friends, if it is, sends request true with user profile
    app.get("/user/profile/:target", function(req,res){
         //console.log("got request");
         mongooseLogic.isUserAFriend(getLogedId(req), req.params.target, function(bool){
            if(bool){
                 mongooseLogic.getFriendList(req.params.target, function(array){
                    if(array === "Error"){
                        res.json({ success: false, message:'Failed to find friends List.'});  
                    }
                    else{
                        mongooseLogic.getUsersCells(req.params.target, function(cells){
                            if(cells === "Error"){
                                res.json({ success: false, message:'Failed to find Users Cells.'});  
                            }
                            else{
                                mongooseLogic.getUserBasicInfo(req.params.target, function(profil){
                                    if(profil === "Error"){
                                        res.json({ success: false, message:'Failed to find Users Cells.'});  
                                    }
                                    else{
                                        res.json({ success: true, message: {cell: cells, friends: array, profile: profil}}); 
                                    }
                                });
                            }
                        });       
                    }   
                });  
            }
            else{
                 res.json({ success: false, message:'You are  not friends.'}); 
            }
         });
    });

    
    //----DELETION OF DATA -----------
    
    //This removes the workout first, if the workout is deleted, it then removes 
    //The calendar event reference
    app.get("/workout/delete/:userid/:year/:month/:workoutid/:eventid", function(req, res){       
         
         mongooseLogic.deleteEvent(req.params.eventid, req.params.userid, req.params.month, req.params.year,  function(message){
            if(message !== "Success"){
                res.json({ success: false, message:'Failed to delete Event.'});
            }
            else{
                mongooseLogic.deleteWorkout(req.params.workoutid, function(message){
                    if(message !== "Success"){
                        res.json({ success: false, message:'Failed to delete calendar Workout.'});    
                    }
                    else{
                        res.json({ success: true, message:'Deleted workout with success.'});
                    }
                });
            }
         
         });
       
    });
    
    //Quit a cell workout, and delete workoutcell if your the last member
    app.get("/workout/cell/quit/:year/:month/:workoutid/:eventid", function(req, res){
        //Delevent workout even in users profile
        mongooseLogic.deleteEvent(req.params.eventid, getLogedId(req), req.params.month, req.params.year,  function(message1){
            if(message1 !== "Success"){
                res.json({ success: false, message:'Failed to delete Event.'});
            }
            else{
                 //Removes the user from the workout participants list
                 mongooseLogic.leaveWorkout(req.params.workoutid, getLogedId(req), function(message2){
                    if(message2 === "Success"){
                        res.json({ success: true, message:'Left workout.'});
                    }
                    else if (message2 === "Failed"){
                        res.json({ success: false, message:'Failed to leave Workout.'});
                    }
                    //If the list is empty when user leaves, the function returns the cells ID so we can delete it
                    else{ //This means the workoutcell has no users anymore, so delete the whole thing
                        console.log(message2);
                        mongooseLogic.deleteCellEvent(message2, req.params.month, req.params.year, req.params.workoutid, function(message3){
                            if(message3 === "Success"){ //Event gone, can now delete workout savely
                                mongooseLogic.deleteWorkout(req.params.workoutid, function(message4){
                                    if(message4 !== "Success"){
                                        res.json({ success: false, message:'Failed to delete Workout.'});    
                                    }
                                    else{
                                        res.json({ success: true, message:'Left and Deleted workout with success.'});
                                    }
                                });
                            }
                            else{
                                res.json({ success: false, message:'Left workout, but Failed to delete Workout.'}); 
                            }   
                        });
                    } 
                });  
            }
        });
    
    });

    //!!!----Search -----!!!
    
    app.get("/search/fullname/:first/:last", function(req, res){
        
        var validRegEx = /^[^\\\/&]*$/;
        
        if(req.params.first.match(validRegEx) && req.params.last.match(validRegEx)){
        
            mongooseLogic.searchByFullName(req.params.first, req.params.last, function(msg){
                if(msg === "failed"){
                    res.json({ success: false, message:'Couldnt process search, internal error'});     
                }
                else{
                    res.json({ success: true, message: msg});
                }
                
                
            });
            
        }
        else{
            res.json({ success: false, message:'Couldnt process search, invalid format submitted.'});   
            
        }
        
    });
    
    
    //HTTP POST REQUEST
    

    app.post("/parcour/:userId/:name/:distance", function(req, res){
      
      if(isAllowed(req, req.params.userId)){
        //console.log(req.body); 
        mongooseLogic.saveParcour(req.body, req.params.distance, req.params.name,
            req.params.userId, function(mess){
      
            if(mess === "success"){
                res.json({ success: true, message: "Parcour '" + req.params.name + "' was saved"});
            }    
            else{
                res.json({ success: false, message: mess });   
            }
        });
      }
      else{
          res.json({ success: false, message: "Improper authentication" }); 
      }
       
        
    });
    
    //To post/update the results of a workout 
    app.post("/result/:userId/:workoutId", function(req, res){
        
        var receivedJSON = req.body;    
    
        //Making sure the receive request is valid
        if(typeof(receivedJSON.type) !== undefined){
        
            mongooseLogic.saveResults(req.params.workoutId, receivedJSON, req.params.userId, function(message){
                if(message === "Success"){
                    res.json({ success: true,  message: 'Result saved.'});    
                }
                else{
                    res.json({ success: false,  message: 'Error in saving results. Trace: ' + message});
                }

            });
        
        }
        else{
            res.json({ success: false,  message: 'Failed, Invalid object sent to server'});   
        }
           
    });
    
    //Creates a cell with his reference
    app.post("/cell/create/:userId", function(req, res){
        
        var receivedJSON = req.body
        
        if(isAllowed(req, req.params.userId) && typeof(receivedJSON.type) !== undefined){
            mongooseLogic.createCell(req.params.userId, receivedJSON, getLogedName(req), function(mes){
                if(mes === "Success"){
                    res.json({ success: true,  message: 'Cell created.'});    
                }
                else{
                    res.json({ success: false,  message: 'Error in saving Cell. Trace: ' + mes});
                }
            });
        }
        else{
            res.json({ success: false,  message: 'Failed, Invalid object sent to server'});     
        }
        
    });
    
    
    //To post a workout 
    //Step 2: write event in event reference collection
    //Step 1: write full workout in workout collection, and callback objectId
    app.post("/workout/:userId", function(req, res){
     
     //submitted object sould have event and workout inner object
     //console.log(req.body);
     var receivedJSON = req.body;//JSON.parse(req.body);
     var eventObject = receivedJSON.event;
     //console.log(eventObject);
     var workoutObject = receivedJSON.workout;
     
      //step1   
      if(typeof(eventObject) !== undefined && typeof(workoutObject) !== undefined){
        mongooseLogic.saveWorkout(workoutObject, "none", "none", "none", function(savedWorkoutObjectId){
            //console.log(savedWorkoutObjectId);
            if(savedWorkoutObjectId !== "not instantiated"){
                console.log("Saved Workout ...");
                mongooseLogic.saveEvent(eventObject, req.params.userId, 
                savedWorkoutObjectId, function(message){
                    //res.contentType('application/json');
                    if(message === "not instantiated"){
                        //console.log("Event not Saved ...");
                        res.json({ success: false, message: 'Failed to saved workout.'});
                    }
                    else{
                        //console.log("Saved Event ...");
                        res.json({ success: true,  message: 'Workout saved successfully.'});    
                    }
                });
            }
            else{
                //res.header('application/json');
                res.json({ success: false,  message: 'Failed, could not save event.'});          
            }       
        });
      }
      else{        
         //res.header('application/json');
         res.json({ success: false,  message: 'Failed, Invalid object sent to server'});  
      }  
    });
    
    
    //Posting of a workout to a cell
    //1- Save workout
    //2- with workout id save cell workout month reference 
    //3- with workout id save user workout month reference 
    app.post("/workout/cell/:cellId/:userId", function(req, res){
        var receivedJSON = req.body;//JSON.parse(req.body);
        var eventObject = receivedJSON.event;
        var workoutObject = receivedJSON.workout;
        //console.log( "CELLID IS --> " + req.params.cellId);
        //step1   
        if(typeof(eventObject) !== undefined && typeof(workoutObject) !== undefined){
            mongooseLogic.saveWorkout(workoutObject, getLogedId(req), getLogedName(req), req.params.cellId, function(savedWorkoutObjectId){
                if(savedWorkoutObjectId !== "not instantiated"){
                    mongooseLogic.saveCellEvent(eventObject, req.params.cellId, 
                        savedWorkoutObjectId, function(cellEventMessage){   //If not failed, callback returns cell name, essential for notification           
                        if(cellEventMessage === "Failed"){
                            res.json({ success: false, message: 'Failed to saved Cell Event.'});
                        }
                        else{  
                            eventObject.color = "#C24747";  // BAD' BUT IM LAZY AND LACKING TIME
                            mongooseLogic.saveEvent(eventObject, req.params.userId, 
                            savedWorkoutObjectId, function(message){
                                if(message === "not instantiated"){
                                    //console.log("Event not Saved ...");
                                    res.json({ success: false, message: 'Failed to saved workout.'});
                                }
                                else{
                                    //console.log("Saved Event ...");
                                    res.json({ success: true,  message: 'Workout saved successfully.'});
                                   
                                    //This section adds all proper new notifications
                                    var mes = getLogedName(req) + ' added a new workout in ' + cellEventMessage + ' cell';
                                    
                                    var newNotification = {
                                        type      : 'newCellWorkout', //joinMasterCell, workoutCell, broadcast
                                        message   : mes, //Name of person
	                                    refId     : savedWorkoutObjectId,
	                                    refOId    : req.params.cellId,  //cellId
	                                    date      : new Date(), 
                                    }

                                    notification.sendNotificationToCellUsers(req.params.cellId, newNotification, function(res){
                                        if(res !== "Success"){
                                              mongooseLogic.pushToNotificationLog(res + " @ POST: /workout/cell/:cellId/:userId");
                                        }
                                    });
                                    
                                    notification.sendNotificationToCell(req.params.cellId, newNotification, function(res){
                                        if(res !== "Success"){
                                            mongooseLogic.pushToNotificationLog(res + " @ POST: /workout/cell/:cellId/:userId");
                                        }
                                    });
                                }
                            }); 
                        }
                    });
                }
                else{

                    res.json({ success: false,  message: 'Failed, could not save event.'});          
                }       
            });
        }
        else{        
            //res.header('application/json');
             res.json({ success: false,  message: 'Failed, Invalid object sent to server'});  
        }    
    });
    
        
    
    //Join a cell workout, not a cell, but a workout in a cell, kinda confusing
    app.post("/workout/cell/join/", function(req, res){

        var eventObject = req.body.event;
        
        mongooseLogic.joinCellWorkout(getLogedId(req), getLogedName(req), eventObject.refWorkout, function(mes){
            if(mes !== "Success"){
                res.json({ success: false, message:'Failed to join Workout.'});    
            }
            else{
                mongooseLogic.saveEvent(eventObject, getLogedId(req), 
                eventObject.refWorkout, function(message){
                    //res.contentType('application/json');
                    if(message === "not instantiated"){
                        //console.log("Event not Saved ...");
                        res.json({ success: false, message: 'Failed to saved event.'});
                    }
                    else{
                        //console.log("Saved Event ...");
                        res.json({ success: true,  message: 'Joined workout successfully.'});    
                    }
                });
            }
        });
    });
        
    //*************************************************************************
    //Facebook auth command samples
    //Sample of auth if statement
    app.get('/hasRights', function(req, res){
    
        Permission.findOne({ firstName: req.session.auth.facebook.user.first_name, lastName: req.session.auth.facebook.user.last_name}, function(err, result){
            console.log(JSON.stringify(result) + " for " + req.session.auth.facebook.user.first_name);
            if(err){
                res.redirect('/logout');
            }
            else if(result){
                res.redirect('/view/profile');
            }
            else{
                res.redirect('/logout');
            }
        });

    });
    
    app.get('/test', function(req, res) {
        //console.log(everyauth.facebook.routes + everyauth.facebook.configurable());  // FTW!
        if (req.loggedIn) {
            res.send('Logged in');
        }
        else {
            res.send("Not logged in");
        }
    });
    app.get('/profile', function(req, res) {
        //console.log(everyauth.facebook.routes + everyauth.facebook.configurable()); // FTW!
        res.send('Fb user is: ' + JSON.stringify(req.session.auth.facebook) + '<br>');
    });
    app.get('/authDetails', function(req, res) {
        res.send('<br>User info: ' + JSON.stringify(req.session));
    });
}

var getLogedName = function(req){
    
    return req.session.auth.facebook.user.name;

}

var getLogedId = function(req){
    
    return req.session.auth.facebook.user.id;
    
}

//Security measures implemented here

var isAllowed = function(request, urlId){
    
    if(request.session.auth.facebook.user.id === urlId){
       return true; 
    }
    else{
      return false;     
    }
        
}


function is_int(value){ 
  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
      return true;
  } else { 
      return false;
  } 
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