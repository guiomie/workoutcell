

var getStats = function(arrayObid, callback){
    
    $.ajax({
        url: calculateMonthStats,
        type: "POST",
        dataType: "json",
        data: JSON.stringify({array: arrayObid}),
        contentType: "application/json",
        cache: false,
        timeout: 10000,
        success: function(data) {
        
            if(data.success){
                callback(data.mes);
            }
            else{
                callback('error');
            }
        
        }
    });
 
}


var getIdsFromEventSource = function(arrayOfEvents, callback){
    var array = [];
    for(i=0;i < arrayOfEvents.length;i++){
    
        (function(i){
            array.push(arrayOfEvents[i].refWorkout);
            if(i === (arrayOfEvents.length - 1)){
                callback(array); 
            }
            
        })(i);
    } 
}

var fillStatsPage = function(eventSource){
 
 
    getIdsFromEventSource(eventSource, function(newArray){
        getStats(newArray, function(stats){
        

                document.getElementById("Stats").innerHTML = JSON.stringify(stats);


        });        
    });
}


var computeStats = function(array){
    
    
    var stats = {
        plannedRunDistance: 0,
        plannedSwimDistance: 0,
        plannedBikeDistance: 0,
        plannedCellDistance: 0,
        totalRunDistance: 0,
        totalSwimDistance: 0,
        totalBikeDistance: 0,
        totalCellDistance: 0,
        
        plannedRunIntervall: 0,
        plannedSwimIntervall: 0,
        plannedBikeIntervall: 0,
        plannedCellIntervall: 0,
        totalRunIntervall: 0,
        totalSwimIntervall: 0,
        totalBikeIntervall: 0,
        totalCellIntervall: 0,
  
    }
    
    
    for(i = 0; i < array.length; i++){
       
       (function(i){
           if(array[i].type === "distance"){
                if(array[i].sport === "Bike"){
                    if(array[i].targetType = 'Kilometers'){
                        stats.plannedBikeDistance = (array[i].distance.maxValue * 60) +  array[i].distance.minValue;
                    }
                }
                else if(array[i].sport === "Swim"){
                    if(array[i].targetType = 'Kilometers'){
                        stats.plannedSwimDistance = (array[i].distance.maxValue * 60) +  array[i].distance.minValue;
                    }
                }
                else if(array[i].sport === "Run"){
                    if(array[i].targetType = 'Kilometers'){
                        stats.plannedRunDistance = (array[i].distance.maxValue * 60) +  array[i].distance.minValue;
                    }
                }
                else{
               
                }
               
           }
           else if(array[i].type === "intervall"){
               
               
           }
           else{
               
           }
                   
           
        })(i);
         
    }

}