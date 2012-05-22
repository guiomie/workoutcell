var fbId;              // provided by facebook          
var fbSecret;          // provided by facebook
var port;
var cookieSecret = "cook";     // enter a random hash for security

var express= require('express');
var everyauth= require('everyauth');
var MongoStore = require('connect-mongo')(express);

var mongooseDb = require('./mongooseDb');
var mongooseLogic = require('./mongooseLogic');
var app = express.createServer();
var Promise = everyauth.Promise;

//Import database models
User = mongooseDb.User;
GeneralReference = mongooseDb.GeneralReference;
Permission = mongooseDb.Permission;
PersonnaReference = mongooseDb.PersonnaReference;
NotificationsReference = mongooseDb.NotificationsReference;
Notification = mongooseDb.Notification;
Log = mongooseDb.Log;
ParcourReference = mongooseDb.ParcourReference;
Parcour = mongooseDb.Parcour;
CalendarEventReference = mongooseDb.CalendarEventReference;
CalendarMonth = mongooseDb.CalendarMonth;
CalendarEvent = mongooseDb.CalendarEvent;
CardioWorkout = mongooseDb.CardioWorkout;
CardioResult = mongooseDb.CardioResult;
BasicCell = mongooseDb.BasicCell;
IntervallUnit = mongooseDb.IntervallUnit;
SingleIntervallResult = mongooseDb.SingleIntervallResult;
CellReference = mongooseDb.CellReference; 
CellDetails = mongooseDb.CellDetails; 


//Facebook setting
if(mongooseDb.env = "dev"){
    fbId= "277924085557007";              // provided by facebook          
    fbSecret= "6a4c2dbefa84c7ba0d824ef981a2157f";          // provided by facebook
    port = process.env.C9_PORT;
}
else{
    fbId= "114525048657436";              // provided by facebook          
    fbSecret= "03a45bd3d6c6ed6c9aecd5abc260966d";          // provided by facebook 
    port = 80;
}


everyauth.helpExpress(app);

everyauth.facebook
  .appId(fbId)
  .appSecret(fbSecret)
  .logoutPath('/logout')
  .logoutRedirectPath('/')
  .moduleTimeout(20000) //To verify if this blocks the whole script
  .scope('user_location')
  .handleAuthCallbackError( function (req, res) {
    //Define here for routing in case user decline app     
  })
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
    //Verifies if user in database already
    var id = fbUserMetadata.id;
    var promise = this.Promise();
    //console.log(JSON.stringify(fbUserMetadata));
    var userLocation = "Not Available";
    //If the user has no location in its profile, then the location name will be unavailable
    if(typeof(fbUserMetadata.location) !== 'undefined'){
        userLocation = fbUserMetadata.location.name;
    }
    
    User.findOne({ fbid: id}, function(err, user) {
        if (err) return promise.fail(err);
        if (user) return promise.fulfill(user);
        User.create({ fbid: id, firstName: fbUserMetadata.first_name, lastName: fbUserMetadata.last_name, 
            location: {name: userLocation, latlng: {lat: 0, lng: 0}}, objective: "Train socially and improve ! ",
            color:{bike:"#CCCCCC", swim: "#99CCFF", run: "#CC9966", cell: "#C24747"}}, function (err, user) {
            
            if (err) return promise.fail(err);
            promise.fulfill(user);
            
            GeneralReference.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
            CalendarEventReference.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
            NotificationsReference.create({ id: id, pendingSize: 0, unRead: 0}, function(err, ref){
               if (err) return promise.fail(err);   
            });
            
            CardioResult.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
        });
    });
    return promise;

  })
  //.redirectPath('/view/profile');
  .redirectPath('/hasRights');

console.log("configure");
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  /*var session = express.session({
      secret: cookieSecret,
      store: new MemoryStore({ reapInterval: 60000 * 10 }),
      key: "workoutcelld.sid"
  });
  app.use(session);*/
  app.use(express.session({
    secret: mongooseDb.conf.secret,
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(mongooseDb.conf.db)
  }));
  app.use(everyauth.middleware());
  app.use(express.favicon());
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

});

require('./routes')(app);

app.get('/', function(req, res) {
   //console.log(everyauth.facebook.routes + everyauth.facebook.configurable());  // FTW!
   res.sendfile('./views/welcome.html');
});

app.post('/test', function (req, res) {
    console.log("incoming test2");
    res.end("thanks");
});


app.error(function(err, req, res){
    console.log(err);
});

app.listen(port);