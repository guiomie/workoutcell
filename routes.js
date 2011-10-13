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
    
    
    app.get("/parcour/:parcourId", function(req, res){
     
    mongooseLogic.getParcour(req.params.parcourId, function(data){
         
         console.log("routes.js level: " + data);
         res.json(JSON.stringify(data));
         
         });
  

    });
    
    
    //HTTP POST REQUEST
    
    //To test auth code with it also 
    app.post("/parcour/:userId/:name/:distance", function(req, res){
       
       //saveParcour = function(jsonString, distance, name, userId)
      //console.log(JSON.stringify(req.body)); 
      mongooseLogic.saveParcour(req.body, req.params.distance, req.params.name,
      req.params.userId);
       
        
    });
    
    
    
    
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