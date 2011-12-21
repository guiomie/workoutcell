
var mongooseLogic = require('./mongooseLogic');


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
     
    mongooseLogic.getParcourList(req.params.userId, function(data){
         
         console.log(data);
         res.json(JSON.stringify(data));
         
         });
  

    });
    
    //Retrieve a specific parcour. A parcour is the name, distance and actual 
    //gmap coordinates.
    app.get("/parcour/:parcourId", function(req, res){
     
    mongooseLogic.getParcour(req.params.parcourId, function(data){
         
         console.log("routes.js level: " + data);
         res.json(JSON.stringify(data));
         
         });
  

    });
    
    
    //retreive specific workout in database
    app.get("/workout/:workoutid", function(req, res){
        
        
         mongooseLogic.getWorkout(req.params.workoutid, function(message){

            if(message === "not instantiated"){
                res.json("{ success: false, message:'Failed to find workout'}");
            }
            else{
                res.json(message);    
            }
         
         });
       
    });
    
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
    
    //----DELETION OF DATA -----------
    
    //This removes the workout first, if the workout is deleted, it then removes 
    //The calendar event reference
    app.get("/workout/delete/:userid/:year/:month/:workoutid/:eventid", function(req, res){       
         
         mongooseLogic.deleteEvent(req.params.eventid, req.params.userid, req.params.month, req.params.year,  function(message){
            if(message !== "Success"){
                res.json({ success: false, message:'Failed to delete workout.'});
            }
            else{
                mongooseLogic.deleteWorkout(req.params.workoutid, function(message){
                    if(message !== "Success"){
                        res.json({ success: false, message:'Failed to delete calendar event.'});    
                    }
                    else{
                        res.json({ success: true, message:'Deleted workout with success.'});
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
        
            mongooseLogic.saveResults(req.params.workoutId, receivedJSON, function(message){
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
        mongooseLogic.saveWorkout(workoutObject, function(savedWorkoutObjectId){
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
    
    //*************************************************************************
    //Facebook auth command samples
    //Sample of auth if statement
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
        res.send('Fb user is: ' + JSON.stringify(req.session.auth.facebook.user.id) + '<br>');
    });
    app.get('/authDetails', function(req, res) {
        res.send('<br>User info: ' + JSON.stringify(req.session));
    });
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