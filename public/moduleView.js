
//Required to keep status on what type of view we are in
//var viewMode = "view";
var startDate;
var endDate;

//This function is called to initialised, or reload a workout view
function initView(workoutObject, start, end ) {
    
    
    var now = new Date();
    jQuery.timeago.settings.allowFuture = true;
    
    if(now<start){
        document.getElementById('viewDate').innerHTML = jQuery.timeago(start);  
    }
    else{
        document.getElementById('viewDate').innerHTML = jQuery.timeago(end);
    }
    
    //Show timing in a qtip
    $('#iconShowTime').qtip({
        content: {
            text: "From " + start.getHours() + ":" + ((start.getMinutes() < 10) ? ("0" + start.getMinutes()) : start.getMinutes()) +
                  " to " + end.getHours() + ":" + ((end.getMinutes() < 10) ? ("0" + end.getMinutes()) : end.getMinutes())
        },
        position: {
            my: 'top center',
            at:'bottom center'
        }     
    });
    
     
    
	if(typeof(workoutObject.parcour) !== "undefined" ){
		document.getElementById('parcour').innerHTML = workoutObject.parcour.name;
	}

	if(typeof(workoutObject.description) !== "undefined"){
		document.getElementById('description').innerHTML = "Description <br>" + workoutObject.description;
	}
	//Input are type of workout and intervall of distance parameters, if the other one is ""
	renderDetails(workoutObject, function(output){
		document.getElementById('typeDetail').innerHTML = output;
        
	});
	
    $('#toggleEdit').unbind('click').click(function(){
        initToggleButton(workoutObject);
    });
    /*
	renderCell(fetched.workout.cell, function(output){
	
		//document.getElementById('cell').innerHTML = output;
	
	});*/
	
	
}


//This fonction will render intervall objects or distance objects
//It will check if the specific result document is either undefined or empty
//The callback returns the the formatted HTML
function renderDetails(object, callback){
    
	var type = object.type;
	var intervalls = object.intervalls;
	var distance = object.distance;
	var intervallResult = object.intervallResult;
	var distanceResult = object.distanceResult
	var sport = object.sport;
    var output = "";
	
	if(type === 'distance'){
		var resultHtml = "No Results";
		if(distance.targetType === 'Kilometers'){
			//Check if there is a result in the received workout, if yes, we will print them out
			if(typeof(distanceResult) !== "undefined"){
				value = (distanceResult.completed) ? "Completed" : "Not Completed";
				resultHtml = value;
				if(distanceResult.value !== "0" && distanceResult.value !== 0){
					var timeObject = secondsToTime(distanceResult.value);
					hour = (timeObject.h > 0) ? (timeObject.h + " hour(s) ") : "";
					minute = (timeObject.m > 0) ? (timeObject.m + " minute(s) ") : "";
					second = (timeObject.s > 0) ? (timeObject.s + " second(s) ") : "";
					resultHtml = resultHtml + " in " + hour + minute + second;
				}	
			}
			
		
			if(distance.intensity === "0"){
				output = sport +' of ' + distance.maxValue + ' kilometers and ' + distance.minValue + ' meters <br>' + resultHtml ;
			}else{
				output = sport + ' of ' + distance.maxValue + ' kilometers and ' + distance.minValue + ' meters at an intensity of ' + 
					distance.intensity + ' %<br>' + resultHtml;
			}
		
		}
		else if(distance.targetType === 'Time'){
			
			if(typeof(distanceResult) !== "undefined"){
				value = (distanceResult.completed) ? "Completed" : "Not Completed";
				resultHtml = value;
				if(distanceResult.value !== "0" && distanceResult.value !== 0){
					resultHtml = resultHtml + " in " + (distanceResult.value/1000) + " km";
				}	
			}
			
			if(distance.intensity === "0"){
				output = sport + ' of ' + distance.maxValue + ' hour(s) and ' + distance.minValue + ' minutes <br>' + resultHtml ;
			}else{
				output = sport + ' of ' + distance.maxValue + ' hour(s) and ' + distance.minValue + ' minutes at an intensity of ' +
				distance.intensity + ' %<br>' + resultHtml;
			}
		
		}
		else{
		
		}
	}
	else if(type === 'intervall'){
		
		for(i = 0; i < intervalls.length; i++){
			
			//Intervall training without any intensity objective, requires special handling
			if(intervalls[i].intensityUnit === "0"){
				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed <br>" : "Not Completed <br>";	
				}
				
				output = output + '&nbsp;' + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + '<br> ' +resultHtml;
				

			} //Intervall training with a range, requires special handling
			else if(intervalls[i].intensityUnit === "min"){
				
				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed" : "Not Completed";	
					resultHtml = (intervallResult[i].value !== "0" && intervallResult[i].value !== 0) ? (resultHtml + " in " + intervallResult[i].value + intervallResult[i].unit + '<br>') : (resultHtml + '<br>');
				}
				
				var rangeHtml =   " from <span id='unitSeconds'>" + intervalls[i].intensityRange[0] + "</span> s to " + "<span id='unitSeconds'>" + intervalls[i].intensityRange[1] + "</span> s";
				output = output + '&nbsp;' + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + rangeHtml + '<br>' +	resultHtml;
			}
			else{
				
				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed" : "Not Completed";	
					resultHtml = (intervallResult[i].value !== "0" && intervallResult[i].value !== 0) ? (resultHtml + " in " + intervallResult[i].value + intervallResult[i].unit + '<br>') : (resultHtml+ '<br>');
				}
				
				output = output + '&nbsp;' + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + ' at ' + 
					intervalls[i].intensityValue + '&nbsp;' + intervalls[i].intensityUnit + '<br>' + resultHtml;		
			}
		
		}
		
		output = output + '&nbsp;Total intervalls: ' + (intervalls.length);
	}
	else{ // Other type 
	
	}
	
	callback(output);
	
}

//This function object like previously displayed, but it will remove any result
//and will display input field to enable modifications
function resultsEditable(object, callback){
    
	var type = object.type;
	var intervalls = object.intervalls;
	var distance = object.distance;
	var sport = object.sport;
    var intervallResult = object.intervallResult;
	var distanceResult = object.distanceResult
	var output = "";

	
	if(type === 'distance'){
		var resultHtml;
		if(distance.targetType === 'Kilometers'){
		
			if(distance.intensity === "0"){
				resultHtml = " Completed <input type=checkbox id='checkbox'> in <input type='text' value='0' id='hours' style='width:20; height: 20px;' /> hours, <input type='text' value='0' id='minutes' style='width:20; height: 20px;' /> minutes and <input type='text' value='0' id='seconds' style='width:20; height: 20px;' /> seconds";
				output = sport + ' of ' + distance.maxValue + ' kilometers and ' + distance.minValue + ' meters<br>' + resultHtml;
				
			}else{
				resultHtml = " Completed <input type=checkbox id='checkbox'> in <input type='text' value='0' id='hours' style='width:20; height: 20px;' /> hours, <input type='text' value='0' id='minutes' style='width:20; height: 20px;' /> minutes and <input type='text' value='0' id='seconds' style='width:20; height: 20px;' /> seconds";
				output = sport + ' of ' + distance.maxValue + ' kilometers and ' + distance.minValue + ' meters at an intensity of ' + 
					distance.intensity + ' %<br>' + resultHtml;
			}
		
		}
		else if(distance.targetType === 'Time'){
		
			if(distance.intensity === "0"){
				resultHtml = " Completed <input type=checkbox id='checkbox'> in <input type='text' id='km' value='0' style='width:20; height: 20px;' /> km, <input type='text' value='0' id='m' style='width:20; height: 20px;' /> m";
				output = sport + ' of ' + distance.maxValue + ' hour(s) and ' + distance.minValue + ' minutes<br>' + resultHtml;
			}else{
				resultHtml = " Completed <input type=checkbox id='checkbox'> in <input type='text' id='km' value='0' style='width:20; height: 20px;' /> km, <input type='text' value='0' id='m' style='width:20; height: 20px;' /> m";
				output = sport + ' of ' + distance.maxValue + ' hour(s) and ' + distance.minValue + ' minutes at an intensity of ' +
				distance.intensity + ' %<br>' + resultHtml;
			}
		
		}
		else{
			
		}
	}
	else if(type === 'intervall'){
		
		for(i = 0; i < intervalls.length; i++){
			
			//Intervall training without any intensity objective, requires special handling
			if(intervalls[i].intensityUnit === "0"){
				var resultHtml = "";
				if(intervalls[i].targetUnit === 'm'){
					resultHtml = " - Completed <input type=checkbox id=checkbox"+i+"> in <input type='text' id=text"+i+" value='0' style='width:20; height: 20px;' /> s";
				}
				else{
					resultHtml = " - Completed <input type=checkbox id=checkbox"+i+"> in <input type='text' id=text"+i+" value='0' style='width:20; height: 20px;' /> m";
				}
				output = output + '&nbsp;' + intervalls[i].targetValue + intervalls[i].targetUnit + resultHtml + '<br> ';
				
				//totalDistance = totalDistance + parseInt(intervalls[i].distance);

			} //Intervall training with a range, requires special handling
			else if(intervalls[i].intensityUnit === "min"){
				var resultHtml = " - Completed <input type=checkbox id=checkbox"+i+"> in <input type='text' id=text"+i+" value='0' style='width:20; height: 20px;' /> s";
				var rangeHtml =   " from <span id='unitSeconds'>" + intervalls[i].intensityRange[0] + "</span> s to " + "<span id='unitSeconds'>" + intervalls[i].intensityRange[1] + "</span> s";
				output = output + '&nbsp;' + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + rangeHtml + resultHtml + '<br>';
			}
			else{
				var resultHtml = "";
				if(intervalls[i].targetUnit === 'm'){
					resultHtml = " - Completed <input type=checkbox id=checkbox"+i+"> in <input type='text' value='0' id=text"+i+" style='width:20; height: 20px;' /> s";
				}
				else{
					resultHtml = " - Completed <input type=checkbox id=checkbox"+i+"> in <input type='text' value='0' id=text"+i+" style='width:20; height: 20px;' /> m";
				}
				output = output + '&nbsp;' + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + ' at '
					+ intervalls[i].intensityValue + '&nbsp;' + intervalls[i].intensityUnit + resultHtml + '<br>';		
			}
		
		}
		
		output = output + '&nbsp;Total intervalls: ' + (intervalls.length);
	}
	else{ // Other type 
	
	}	
	callback(output);	
}

function initToggleButton (object){


    //var resultArray = [];
	var result;
    var viewMode = document.getElementById("toggleEdit").innerHTML;
	if(viewMode === "(Save results)"){			
		//Create data
		if(object.type === "intervall"){
			
            result = [];
            for(i=0; i <object.intervalls.length;i++){	
				var unit;
				if(object.intervalls[i].targetUnit=== 'm'){
					unit = 's';
				}
				else{
					unit = 'm';
				}					
				var temp = {
					unit        : unit,
					value       : $('#text'+i.toString()).val(),
					completed   : $('#checkbox'+i.toString()).is(':checked')
				}
				result.push(temp);	
			}
				
			//document.getElementById('console').innerHTML = JSON.stringify(resultArray);
			//alert(JSON.stringify(resultArray));
			}
		else{ //In both cases we transform in 
			if(object.distance.targetType === 'Kilometers'){				
				//var totalSecond = (3600 * parseInt($('#hours').val())) + (60 * parseInt($('#minutes').val())) + parseInt($('#seconds').val());		
				result = {
					unit        : 's',
					value       : (3600 * parseInt($('#hours').val())) + (60 * parseInt($('#minutes').val())) + parseInt($('#seconds').val()),
					completed   : $('#checkbox'.toString()).is(':checked')
				}	
			}
			else if(object.distance.targetType === 'Time'){  		
				//var totalMeters = (1000 * parseInt($('#km').val())) + parseInt($('#m').val());		
				//alert($('#km').val() + "+" + $('#m').val() + "=" + totalMeters);
                result = {
					unit        : 'm',
					value       : (1000 * parseInt($('#km').val())) + parseInt($('#m').val()),
					completed   : $('#checkbox'.toString()).is(':checked')
				}
			}
			else{
				
			}
		}
			
        //Sending compiled data to update results in workout collection
        var theUrl = postResult + "/" + object._id;
        postJson(JSON.stringify(result), theUrl, function(success){
                
            if(success){
                (object.type === "intervall") ? object.intervallResult = result : object.distanceResult = result;
                renderDetails(object, function(output){
    		        document.getElementById('typeDetail').innerHTML = output;
			        document.getElementById('toggleEdit').innerHTML = "(Edit results)";
    		    });	                     
            }
            else{              
                renderDetails(object, function(output){
        	        document.getElementById('typeDetail').innerHTML = output;
			        document.getElementById('toggleEdit').innerHTML = "(Edit results)";
    		    }); 
            }
        });
            
            //document.getElementById('console').innerHTML = JSON.stringify(result);
			//alert(JSON.stringify(result));

	
	}
	else{
		resultsEditable(object, function(output){
			document.getElementById('typeDetail').innerHTML = output;
			document.getElementById('toggleEdit').innerHTML = "(Save results)";
		});
	}
}

//Takes seconds, and returns a document with hour, minute and seconds paramteres
function secondsToTime(secs){
    var hours = Math.floor(secs / (60 * 60));
   
	var divisor_for_minutes = secs % (60 * 60);
	var minutes = Math.floor(divisor_for_minutes / 60);
 
	var divisor_for_seconds = divisor_for_minutes % 60;
	var seconds = Math.ceil(divisor_for_seconds);
  
	var obj = {
		"h": hours,
		"m": minutes,
		"s": seconds
	};
	return obj;
}


function doubleMinutes(min){
    
    if (min > 10)
    {
        return  "0" + min;
    }
    else{
        return min;     
    }
}

 var postJson = function(theJson, theUrl, callback){
            
    $.ajax({
        url: theUrl,
        type: "POST",
        dataType: "json",
        data: theJson,
        contentType: "application/json",
        cache: false,
        timeout: 5000,
        complete: function() {
        //called when complete
            Notifier.info('Saving ...');
        },

        success: function(data) {
            //var res =jQuery.parseJSON(data);
            //callback('Sending: ' + data);
            if(data.success){
                Notifier.success(data.message);
                callback(data.success);
            }
            else{
                Notifier.error(data.message); 
                callback(data.success);
            }
        },

        error: function() {
            //callback('Operation failed');
            Notifier.error('Could not send data to server');
            callback(false);
        },
    });
    
}