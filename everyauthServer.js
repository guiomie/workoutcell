var fbId= "277924085557007";              // provided by facebook          
var fbSecret= "6a4c2dbefa84c7ba0d824ef981a2157f";          // provided by facebook
var fbCallbackAddress= "/signin"; // this could point to your /signin page
var mongoHQadress = 'staff.mongohq.com:10072/workoutcellDb';
var mongoHQuser = 'mongoose';
var mongoHQpassword = '12345';
var cookieSecret = "cook"; 

var express= require('express');
var everyauth= require('everyauth');
var mongoose = require('./node_modules/mongoose');
var app = express.createServer();
var Promise = everyauth.Promise;

mongoose.connect('mongodb://' + mongoHQuser + ':' + mongoHQpassword + '@' + mongoHQadress);

var Promise = everyauth.Promise;

Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

var User = new Schema({
//id is the facebook id, intrinsincly unique
    fbid       : Number,
    firstName  : String,   
    lastName   : String,
    email      : String,
    joinDate   : {type: Date, default: Date.now}
});

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

            //newUserWorkoutRef = emptyWorkoutRef;
            user = new User();
            user.fbid = id;

            user.firstName = fbUserMetadata.first_name;
            user.lastName = fbUserMetadata.last_name;
            user.save();

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
     
    }
  })
  .redirectPath('/logged');
  
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: cookieSecret}));
  app.use(everyauth.middleware());
  app.use(express.favicon());
  
});



app.get('/', function(req, res) {

   res.send("<a href='/auth/facebook'>Log in via everyauth/facebook</a>");
});


app.get('/logged', function(req, res){
        console.log(req.loggedIn);
        
        if(req.loggedIn) {
            res.sendfile(JSON.stringify(req.loggedIn));
        }
        else{
        
          res.send(JSON.stringify(req.loggedIn));
        
        }
});



app.listen(process.env.C9_PORT);