

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
            callback(data);
        }
    });
 
}


var getIdsFromEventSource = function(arrayOfEvents, callback){
    
    var response = {
      
      array: [],
      timeBike: 0,
      timeSwim: 0,
      timeRun: 0,
      timeCell:0
        
    };
    
    
    for(i=0;i < arrayOfEvents.length;i++){
    
        (function(i){
            response.array.push(arrayOfEvents[i].refWorkout);
            
            if(arrayOfEvents[i].title === "Swim"){
                var diff = Math.abs(arrayOfEvents[i].end - arrayOfEvents[i].start) / 1000;
                response.timeSwim = response.timeSwim + (diff);
                
            }
            else if(arrayOfEvents[i].title === "Run"){
                var diff = Math.abs(arrayOfEvents[i].end - arrayOfEvents[i].start) / 1000;
                response.timeRun = response.timeRun + diff;
            }
            else if(arrayOfEvents[i].title === "Bike"){
                var diff = Math.abs(arrayOfEvents[i].end - arrayOfEvents[i].start) / 1000;
                response.timeBike = response.timeBike + diff;
            }
            else{
                
            }
            
            if( arrayOfEvents[i].color === "Swim"=== "#C24747"){
               var diff = Math.abs(arrayOfEvents[i].end - arrayOfEvents[i].start) / 1000; 
                response.timeCell = response.timeCell + diff;
            }
            
            if(i === (arrayOfEvents.length - 1)){
                callback(response); 
            }
            
        })(i);
    } 
}

var fillStatsPage = function(eventSource){
 
 
    getIdsFromEventSource(eventSource, function(newArray){
        getStats(newArray.array, function(statsResult){
                computeStats(statsResult, function(res){
                    
                    console.log(res);

                    d3graph([res.plannedBikeDistanceSum, res.totalBikeDistanceSum, res.plannedSwimDistanceSum, res.totalSwimDistanceSum, res.plannedRunDistanceSum, res.totalRunDistanceSum],
                        ["-", "Planned Bike", "Total Completed", "Planned Swim", "Total Completed", "Planned Run", "Total Completed"]);

                    document.getElementById("timeStats").innerHTML = 'Time biking: ' + newArray.timeBike.toString().toHHMMSS() + '<br>Time swimming: ' + newArray.timeSwim.toString().toHHMMSS() +
                        '<br>Time biking: ' + newArray.timeBike.toString().toHHMMSS() + '<br>Time socializing: ' + newArray.timeCell.toString().toHHMMSS();

                });
        });        
    });
}

String.prototype.toHHMMSS = function () {
    sec_numb    = parseInt(this);
    var hours   = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = sec_numb - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

var d3graph = function(data, titles){

    console.log(data);
    document.getElementById("distanceGraph").innerHTML = "";
    
    var chart = d3.select("#distanceGraph").append("svg")
     .attr("class", "chart")
     .attr("width", 510)
     .attr("height", 20 * data.length); 
    
    var x = d3.scale.linear()
     .domain([0, d3.max(data)])
     .range([0, 350]); 
     
    var x2 = d3.scale.linear()
     .domain([0, d3.max(data)])
     .range([30, 400]);
    
    chart.selectAll("rect")
     .data(data)
    .enter().append("rect")
     .attr("y", function(d, i) { return i * 20; })
     .attr("width", x)
     .attr("x", 80)
     .attr("fill", function(d, i){ return (i%2) ? "#e2f1d5" : "#F0C4B1"  })
     .attr("height", 20)

    chart.selectAll("text")
     .data(data)
    .enter().append("text")
     .attr("x", x)
     .attr("y", function(d, i) { return (i * 20) + 10; })
     .attr("dx", 105) // padding-right
     .attr("dy", ".35em") // vertical-align: middle
     .attr("text-anchor", "end") // text-align: right
     .text(String);

     
     chart.selectAll("rule")
      .data(titles)
     .enter().append("text")
      .attr("class", "rule")
      .attr("x", x)
      .attr("y", function(d, i) { return i * 20; })
      .attr("dy", -3)
      //.attr("text-anchor", "middle")
      .text(String);
    
}

var graphTotalsBarChart = function(arrayB, arrayS, arrayR, arrayBc, arraySc, arrayRc, data){
    
    // Create and populate the data table.
    var data = google.visualization.arrayToDataTable([
        ['Sport', 'Planned', 'Completed'],
        ['Bike',  arrayB,    arrayBc,  ],
        ['Swim',  arrayS,    arraySc,  ],
        ['Run',  arrayR,    arrayRc,   ]
    ]);
    
    // Create and draw the visualization.
    var mileageChart = new google.visualization.BarChart(document.getElementById('distanceGraph'));
       
     var options =  {
        title:"Your mileage",
        width:400, 
        height:400,
        vAxis: {title: "Sports"},
        hAxis: {title: "Meters"}
    }

    mileageChart.draw(data, options);
    
}



var computeStats = function(array, callback){
    
   console.log(array); 
    var stats = {
        plannedRunDistance: [],
        plannedSwimDistance: [],
        plannedBikeDistance: [],
        plannedCellDistance: [],
        totalRunDistance: [],
        totalSwimDistance: [],
        totalBikeDistance: [],
        totalCellDistance: [],
        plannedRunDistanceSum: 0,
        plannedSwimDistanceSum: 0,
        plannedBikeDistanceSum: 0,
        plannedCellDistanceSum: 0,
        totalRunDistanceSum: 0,
        totalSwimDistanceSum: 0,
        totalBikeDistanceSum: 0,
        totalCellDistanceSum: 0,
        
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
           if(array[i].workout.type === "distance"){
                if(array[i].workout.sport === "Bike"){
                    if(array[i].workout.targetType = 'Kilometers'){
                        stats.plannedBikeDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                        stats.plannedBikeDistanceSum = stats.plannedBikeDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        if(array[i].result !== "none"){
                            stats.totalBikeDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                            stats.totalBikeDistanceSum = stats.totalBikeDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        }
                    }
                    else if(array[i].workout.targetType = 'Time'){
                        if(array[i].result !== "none"){
                            stats.totalBikeDistance.push(array[i].result.value);
                            stats.totalBikeDistanceSum = stats.totalBikeDistanceSum + (array[i].result.value);
                        }
                    }
                    else{}
                }
                else if(array[i].workout.sport === "Swim"){
                    if(array[i].workout.targetType = 'Kilometers'){
                        stats.plannedSwimDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                        stats.plannedSwimDistanceSum = stats.plannedSwimDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        if(array[i].result !== "none"){
                            stats.totalSwimDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                            stats.totalSwimDistanceSum = stats.totalSwimDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        }
                    }
                    else if(array[i].workout.targetType = 'Time'){
                        if(array[i].result !== "none"){
                            stats.totalSwimDistance.push(array[i].result.value);
                            stats.totalSwimDistanceSum = stats.totalSwimDistanceSum + (array[i].result.value);
                        }
                    }
                    else{}
                }
                else if(array[i].workout.sport === "Run"){
                    if(array[i].workout.targetType = 'Kilometers'){
                        stats.plannedRunDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                        stats.plannedRunDistanceSum = stats.plannedRunDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        if(array[i].result !== "none"){
                            stats.totalRunDistance.push((array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue);
                            stats.totalRunDistanceSum = stats.totalRunDistanceSum + (array[i].workout.distance.maxValue * 1000) +  array[i].workout.distance.minValue;
                        }
                    }
                    else if(array[i].workout.targetType = 'Time'){
                        if(array[i].result !== "none"){
                            stats.totalRunDistance.push(array[i].result.value);
                            stats.totalRunDistanceSum = stats.totalRunDistanceSum + (array[i].result.value);
                        }
                    }
                    else{}
                }
                else{
               
                }
               
           }
           else if(array[i].workout.type === "intervall"){
               //getIntervallTotalValue(array[i].workout, array[i].result, array[i].workout.sport, stats)
               
           }
           else{
               
           }
           
            if(i === (array.length -1)){
                callback(stats);    
            }
                   
           
        })(i);
        
       
    }

}

var getIntervallTotalValue = function(anArray, resultArray, sport, stats){
    
    for(i=0;i < anArray.length; i++){
        if(anArray[i].targetUnit === 'm'){
            if(sport === 'Bike'){
                stats.plannedBikeDistance =  stats.plannedBikeDistance + anArray[i].targetValue;
                if(resultArray.result !== "none" || resultArray[i].completed){
                    stats.totalBikeDistance = stats.totalBikeDistance + resultArray[i].value;
                }
            }
            else if(sport === 'Swim'){
                stats.plannedSwimDistance =  stats.plannedSwimDistance + anArray[i].targetValue;
                if(resultArray.result !== "none" || resultArray[i].completed){
                    stats.totalSwimDistance = stats.totalSwimDistance + resultArray[i].value;
                }
            }
            else if(sport === 'Run'){
                stats.plannedRunDistance =  stats.plannedRunDistance + anArray[i].targetValue;
                if(resultArray.result !== "none" || resultArray[i].completed){
                    stats.totalRunDistance = stats.totalRunDistance + resultArray[i].value;
                }
            }
            else{
                
            }
            
        }
        else if(anArray[i].targetUnit === 's' || anArray[i].targetUnit === 'min' ){
            if(resultArray.result !== "none" || resultArray[i].completed){
                if(sport === 'Bike'){
                    stats.totalBikeDistance = stats.totalBikeDistance + resultArray[i].value;
                }
                else if(sport === 'Swim'){
                    stats.totalSwimDistance = stats.totalSwimDistance + resultArray[i].value;
                }
                else if(sport === 'Run'){
                    stats.totalRunDistance = stats.totalRunDistance + resultArray[i].value;
                }
                else{
                    
                }
            }
            
        }
        else{
        
        }
        
    }
    
}