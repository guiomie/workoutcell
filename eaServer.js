var fbId= "277924085557007";              // provided by facebook          
var fbSecret= "6a4c2dbefa84c7ba0d824ef981a2157f";          // provided by facebook
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

NotificationsReference = mongooseDb.NotificationsReference;
Notification = mongooseDb.Notification;

ParcourReference = mongooseDb.ParcourReference;
Parcour = mongooseDb.Parcour;
CalendarEventReference = mongooseDb.CalendarEventReference;
CalendarMonth = mongooseDb.CalendarMonth;
CalendarEvent = mongooseDb.CalendarEvent;

CardioWorkout = mongooseDb.CardioWorkout;
BasicCell = mongooseDb.BasicCell;
IntervallUnit = mongooseDb.IntervallUnit;
SingleIntervallResult = mongooseDb.SingleIntervallResult;

CellReference = mongooseDb.CellReference; 
CellDetails = mongooseDb.CellDetails; 

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
            
            NotificationsReference.create({ id: id}, function(err, ref){
               if (err) return promise.fail(err);   
            }); 
            
        });
    });
    return promise;
    
    /*try{
        var id = fbUserMetadata.id;
        var promise = this.Promise();
        User.findOne({ fbid: id}, function(err, result) {
        var user;
        if(!result) {
            //iniate also the users unique reference doc in ref collection
            var newUserRefDoc = new GeneralReference();
            var newUserWorkoutRef = new CalendarEventReference();
            //newUserWorkoutRef = emptyWorkoutRef;
            user = new User();
            user.fbid = id;
            newUserRefDoc.id = id;
            newUserWorkoutRef.id = id;
            user.firstName = fbUserMetadata.first_name;
            user.lastName = fbUserMetadata.last_name;
            user.save();
            newUserRefDoc.save();
            newUserWorkoutRef.save();
        } else {
            user = result;
        }
        //console.log(user);
        promise.fulfill(user);
        });
        return promise;
    }
    catch(err){
        console.log(err); 
     
    }*/
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



app.listen(process.env.C9_PORT);