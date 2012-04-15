var ObjectId = require('./node_modules/mongoose').Types.ObjectId;



var searchByFullName = function(first, last, callback){
    
    if(first !== "" && last !== ""){
    
        var query = User.find({});
        query.where('firstName', first);
        query.where('lastName', last);
        query.limit(5);

        query.exec(function (err, docs) {
            if(err){
                callback("failed");   
            }
            else{
                callback(docs);    
            }
        });    
    }
    else{ 
        callback("failed"); 
    }
    
}

var searchOneWordName = function(word, skip, callback){
    
    if(word !== ""){
        //console.log(skip);
        var query = User.find({});
        query.or([{ firstName: word }, { lastName: word }]);
        if(skip > 1){
            query.skip(5 * (skip-1))
        }
        query.limit(5);

        query.exec(function (err, docs) {
            if(err){
                callback("failed");   
            }
            else{
                callback(docs);    
            }
        });    
    }
    else{ 
        callback("failed"); 
    }
 
}

var searchByLocation = function(word, skip, callback){
    
    if(word !== ""){
        //console.log(skip + " : " + word);
        var query = User.find({});
        var expression = new RegExp(word, "i");
        query.where('location.name').$regex(expression);
        if(skip > 1){
            query.skip(5 * (skip-1))
        }
        query.limit(5);

        query.exec(function (err, docs) {
            if(err){
                callback("failed");   
            }
            else{
                callback(docs);    
            }
        });    
    }
    else{ 
        callback("failed"); 
    }
 
}

exports.searchByLocation = searchByLocation;
exports.searchOneWordName = searchOneWordName;
exports.searchByFullName = searchByFullName;