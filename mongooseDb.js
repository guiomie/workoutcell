var mongoDbAdress = '24.202.230.241:27017';
var mongoDbName = 'workoutcellDb';

var mongoose = require('./node_modules/mongoose');
var everyauth= require('everyauth');
var Promise = everyauth.Promise;
mongoose.connect('mongodb://' + mongoDbAdress + '/' + mongoDbName);

Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
 
var User = new Schema({
//id is the facebook id, intrinsincly unique
    fbid        : Number,
    firstName  : String,   
    lastName   : String,
    email      : String,
    joinDate   : {type: Date, default: Date.now}
});


exports.findOrCreateFacebookUser = function(fbUserData, promise){
 
  User.findOne({_id:fbUserData.id}, function(err, result) {
    var userNew;
    if(err) {
      console.log("Error in finding user for auth. Check Db");
      promise.fail(err);
      return;
    }
    else if(result){
      console.log("User found ");
      promise.fulfill(result);     
    }
    else{
            
        userNew = new User({
            _id:        fbUserData.id,
            firstName:  fbUserData.first_name,
            lastName:   fbUserData.last_name,
            email:      fbUserData.email
        });
      
      //console.log(JSON.stringify(joiningUser));
        userNew.save(function(err, userNew){
        if(err){
            console.log("Couldnt save new user: " + err);
            promise.fail(err);
            return;
        }
        else{
            console.log("User wasnt existant, it is now created: " +            JSON.stringify(userNew));
            promise.fulfill(userNew);
        } 
    }); 

    }
  });
};

//Create models out of schema
mongoose.model('User', User);
    
//Export models
var User = exports.User = mongoose.model('User');
