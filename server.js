var fbId= "114525048657436";              // provided by facebook          
var fbSecret= "03a45bd3d6c6ed6c9aecd5abc260966d";          // provided by facebook
var fbCallbackAddress= "/signin"; // this could point to your /signin page
var cookieSecret = "cook";     // enter a random hash for security

var express= require('express');
var everyauth= require('everyauth');
var mongooseDb = require('./mongooseDb');
var app = express.createServer();
var Promise = everyauth.Promise;

var mongooseLogic = require('./mongooseLogic');

//Import database models
User = mongooseDb.User;
GeneralReference = mongooseDb.GeneralReference;
Permission = mongooseDb.Permission;
PersonnaReference = mongooseDb.PersonnaReference;

ParcourReference = mongooseDb.ParcourReference;
Parcour = mongooseDb.Parcour;
CalendarEventReference = mongooseDb.CalendarEventReference;
CalendarMonth = mongooseDb.CalendarMonth;
CalendarEvent = mongooseDb.CalendarEvent;
//DistanceUnit = mongooseDb.DistanceUnit;
CardioWorkout = mongooseDb.CardioWorkout;
BasicCell = mongooseDb.BasicCell;
IntervallUnit = mongooseDb.IntervallUnit;
SingleIntervallResult = mongooseDb.SingleIntervallResult;

everyauth.helpExpress(app);

everyauth.facebook
  .appId(fbId)
  .appSecret(fbSecret)
  .logoutPath('/logout')
  .logoutRedirectPath('/')
  .handleAuthCallbackError( function (req, res) {
    //Define here for routing in case user decline app     
  })
  .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
    //Verifies if user in database already
    var id = fbUserMetadata.id;
    var promise = this.Promise();
    
    User.findOne({ fbid: id}, function(err, user) {
        if (err) return promise.fail(err);
        if (user) return promise.fulfill(user);
        User.create({ fbid: id, firstName: fbUserMetadata.first_name, lastName: fbUserMetadata.last_name}, function (err, user) {
            if (err) return promise.fail(err);
            promise.fulfill(user);
            
            GeneralReference.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
            CalendarEventReference.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
        });
    });
    return promise;
  })
  //.redirectPath('/view/profile');
  .redirectPath('/hasRights');
  
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: cookieSecret}));
  app.use(everyauth.middleware());
  app.use(express.favicon());
  
});

require('./routes')(app);

app.get('/', function(req, res) {
   //console.log(everyauth.facebook.routes + everyauth.facebook.configurable());  // FTW!
   res.sendfile('./welcome.html');
});



app.listen(80);