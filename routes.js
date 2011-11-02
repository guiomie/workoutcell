var mongooseLogic = require('./mongooseLogic');


module.exports = function(app) {
    
    //Clear current user session of our auth data
    app.get('/logoff', function(req, res){
        req.logout();
    });
    
    app.get('/view/:htmlpage', function(req, res){
        if(req.loggedIn) {
          res.sendfile('./views/' + req.params.htmlpage + '.html');
        }
        else{
        
          res.send('You need to be authenticated with a <a href="www.facebook.com">Facebook</a> to access <a href="/"> Workoutcell </a>');
        
        }
    });
    
    //HTTP GET REQUEST
    
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
        
       res.send("Will look out for workout at objectid: " + req.params.workoutid); 
       
    });
    
    
    //HTTP POST REQUEST
    
    //To test auth code with it also 
    app.post("/parcour/:userId/:name/:distance", function(req, res){
       
       //saveParcour = function(jsonString, distance, name, userId)
      //console.log(JSON.stringify(req.body)); 
      mongooseLogic.saveParcour(req.body, req.params.distance, req.params.name,
      req.params.userId);
       
        
    });
    
    
    //To post a workout 
    //Step 2: write event in event reference collection
    //Step 1: write full workout in workout collection, and callback objectId
    app.post("/workout/:userId", function(req, res){
     
     //submitted object sould have event and workout inner object
     var receivedJSON = JSON.parse(req.body);
     var eventObject = receivedJSON.event;
     var workoutObject = receivedJSON.workout;
     
      //step1   
      if(typeof(eventObject) !== undefined && typeof(workoutObject) !== undefined){
        mongooseLogic.saveWorkout(workoutObject, function(savedWorkoutObjectId){
          
            if(savedWorkoutObjectId !== "not instantiated"){
                //step 2
                mongooseLogic.saveEvent(eventObject, req.params.userId, 
                savedWorkoutObjectId, function(message){
             
                    res.header('application/json');
                    if(message === "not instantiated")
                        res.send("{ state: 'failed'}");            
                });
            }
            else{
                res.header('application/json');
                res.send("{ state: 'failed'}"); 
            
            }       
        });
      }
      else{
         
         res.header('application/json');
         res.send("{ state: 'Invalid object sent to server'}");
       
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
        console.log(everyauth.facebook.routes + everyauth.facebook.configurable()); // FTW!
        res.send('Fb user is: ' + req.user + '<br>' + everyauth.facebook.user);
    });
    app.get('/authDetails', function(req, res) {
        res.send('<br>User info: ' + JSON.stringify(req.session));
    });
}