var ObjectId = require('./node_modules/mongoose').Types.ObjectId;


// This monster, shouldnt exist, but it will do for all.
//It will get all the users results, then fetch all the required workout
//It then compares the result to the workout, if they match, bundles them together,
//If nothing matches, then it sends the workout, with a result of "none"
var calaculateWorkoutsStatistics = function (arrayOfWorkout, userId, callback){
    
    var compiledData = [];
    //console.log(arrayOfWorkout.length);
    //get all planned workouts
    
    CardioResult.findOne({"id" : parseInt(userId)}, function(err, result2){
        if(err || result2 === null){ 
            //console.log(err + ' (1)');
        }
        else{
            //console.log(JSON.stringify(result2));
            for(i=0; i < arrayOfWorkout.length; i++){
                //console.log('i = ' + i);
                (function(i) {
                    CardioWorkout.findOne({ _id : ObjectId.fromString(arrayOfWorkout[i])}, function(err, result){
                        if(err){
                            //console.log(err + ' (2)');
                        }
                        else{
                            var object = {workout: result, result: "none"};
                            var resultArray = result2[result.type + 'Result'];
                            if(resultArray.length !== 0){
                                for(j=0;j < resultArray.length; j++){
                                    //console.log('j = ' + j);
                                    (function(j) {
                                        //console.log(typeof(resultArray[j].workoutId) + ' vs ' + typeof(result._id));
                                        if((resultArray[j].workoutId).toString() === (result._id).toString()){
                                            object.result = resultArray[j];
                                            
                                        }
                                        
                                        if(j === (resultArray.length -1 )){
                                             compiledData.push(object);
                                             //console.log(JSON.stringify(compiledData));
                                             if(i === (arrayOfWorkout.length -1)){
                                                 //console.log('in last if');
                                                 callback(compiledData);
                                             }
                                        }
                                    
                                    })(j);
                                }
                            }
                            else{
                                compiledData.push(object);
                                if(i === (arrayOfWorkout.length -1)){
                                     //console.log('in last if');
                                     callback(compiledData);
                                 }
                            }
                        }
                    });
                })(i);
            }
        }
    });
}





exports.calaculateWorkoutsStatistics = calaculateWorkoutsStatistics;