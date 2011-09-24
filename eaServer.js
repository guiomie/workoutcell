var fbId= "277924085557007";              // provided by facebook          
var fbSecret= "6a4c2dbefa84c7ba0d824ef981a2157f";          // provided by facebook
var fbCallbackAddress= "/signin"; // this could point to your /signin page
var cookieSecret = "cook";     // enter a random hash for security

var express= require('express');
var everyauth= require('everyauth');
var mongooseDb = require('./mongooseDb');
var app = express.createServer();
var Promise = everyauth.Promise;

//Import database models
User = mongooseDb.User;

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

    /*var promise = new this.Promise();
    mongooseDb.findOrCreateFacebookUser(fbUserMetadata, promise);
    return promise;*/
    
    var id = fbUserMetadata.id;
    var promise = this.Promise();
    User.findOne({ fbid: id}, function(err, result) {
    var user;
    if(!result) {
        user = new User();
        user.fbid = id;
        user.firstName = fbUserMetadata.first_name;
        user.lastName = fbUserMetadata.last_name;
        user.save();
    } else {
        user = result.doc;
    }
    promise.fulfill(user);
    });
    return promise;
 
  })
  .redirectPath('/view/profile');
  
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: cookieSecret}));
  app.use(everyauth.middleware());
  
});

require('./routes')(app);

app.get('/', function(req, res) {
   //console.log(everyauth.facebook.routes + everyauth.facebook.configurable());  // FTW!
   res.sendfile('./welcome.html');
});



app.listen(process.env.C9_PORT);