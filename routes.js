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