var ObjectId = require('./node_modules/mongoose').Types.ObjectId;

var calaculateWorkoutsStatistics = function (arrayOfWorkout, userId, callback){
    
    var compiledData = [];
    console.log(arrayOfWorkout.length);
    //get all planned workouts
    for(i=0; i < arrayOfWorkout.length; i++){
    
        (function(i) {
            CardioWorkout.findOne({ _id : ObjectId.fromString(arrayOfWorkout[i])}, function(err, result){
                if(err){
                    
                }
                else{
                    var workouts = { workout: result, results: "none"};
                    //get workout result if it exists 
                    if(result.type === "distance"){
                        queryRestriction = { "id" : parseInt(userId), "distanceResult.workoutId" : ObjectId.fromString(arrayOfWorkout[i])};
                        parameterName = "distanceResult";
                    }
                    else{
                        queryRestriction = { "id" : parseInt(userId), "intervallResult.workoutId" : ObjectId.fromString(arrayOfWorkout[i])};
                        parameterName = "intervallResult";
                    }
                    CardioResult.findOne(queryRestriction, function(err, result2){
                        if(err || result2 === null){ 
                            compiledData.push(workouts);        
                            if(compiledData.length === arrayOfWorkout.length){
                                callback(compiledData);
                            }
                        }
                        else{ 
                            workouts.results = result2;
                            compiledData.push(workouts);
                            if(compiledData.length === arrayOfWorkout.length){
                                callback(compiledData);
                            }
                        }
                    });
                }
            });
        })(i);

    }
}





exports.calaculateWorkoutsStatistics = calaculateWorkoutsStatistics;