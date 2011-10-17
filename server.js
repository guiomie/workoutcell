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
PersonnaReference = mongooseDb.PersonnaReference;
ParcourReference = mongooseDb.ParcourReference;
Parcour = mongooseDb.Parcour;
CalendarEventReference = mongooseDb.CalendarEventReference;
CalendarMonth = mongooseDb.CalendarMonth;
CalendarEvent = mongooseDb.CalendarEvent;

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
    //BUGGED VERSION
    /*var promise = new this.Promise();
    mongooseDb.findOrCreateFacebookUser(fbUserMetadata, promise);
    return promise;*/
    //Verifies if user in database already
    try{
        var id = fbUserMetadata.id;
        var promise = this.Promise();
        User.findOne({ fbid: id}, function(err, result) {
        var user;
        if(!result) {
            //iniate also the users unique reference doc in ref collection
            var newUserRefDoc = new GeneralReference();
            user = new User();
            user.fbid = id;
            newUserRefDoc.id = id;
            user.firstName = fbUserMetadata.first_name;
            user.lastName = fbUserMetadata.last_name;
            user.save();
            newUserRefDoc.save();
        } else {
            user = result;
        }
        promise.fulfill(user);
        });
        return promise;
    }
    catch(err){
        console.log(err); 
     
    }
  })
  .redirectPath('/view/profile');
  
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

//no.de joyent smartMachine port

app.listen(26674);