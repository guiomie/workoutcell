

//Required to keep status on what type of view we are in
//var viewMode = "view";
var startDate;
var endDate;

//This function is called to initialised, or reload a workout view
function initView(workoutObject, event) {
    
    var start = event.start;
    var end = event.end;
    var eventId = event._id;
    
    var now = new Date();
    jQuery.timeago.settings.allowFuture = true;
    
    if(now<start){
        document.getElementById('viewDate').innerHTML = jQuery.timeago(start);  
    }
    else{
        document.getElementById('viewDate').innerHTML = jQuery.timeago(end);
    }

    //Reinitialisation of coach based widget
    $('#toggleEdit').show();
    
    if(typeof(workoutObject.parcour) !== "undefined" ){
		$('#showWhere').show();
        var img = $("<img />").attr('src', workoutObject.parcour.staticUrl);
        
        $("#staticMapPicture").empty();
        $("#mapInformation").empty();
        
        $("#staticMapPicture").append(img);
        $("#mapInformation").html(workoutObject.parcour.name + " - " + workoutObject.parcour.distance + ' km');
        
        $('#showWhere').die();
        $('#showWhere').qtip({
            content: $('#courseMap').html(),
            position: {
                my: 'top center', // Use the corner...
                at: 'bottom center' // ...and opposite corner
            },
            style: {
                widget: true 
            }
        });
   
	}
    else{
        $('#showWhere').hide();
    }
    
    $.getJSON(isCoach + workoutObject.cell.cellId + "/" + authId , function(data) {
        if(data.success){
            if(data.message){
                $('#viewUsersResult').show();
                $('#viewUsersResult')
                    .find('option')
                    .remove()
                    .end()
                ;
                
                //Fill dropdown with usrs joinning the workout
                var droplistHtml = "<option value='none'>View athletes results...</option>" ;
                $(droplistHtml).appendTo("#viewUsersResult");
                
                for(i = 0; i < workoutObject.cell.participants.length; i++){
                    droplistHtml = "<option value='" +  workoutObject.cell.participants[i].fbid + "'>"+ workoutObject.cell.participants[i].fullName+"</option>";
                    $(droplistHtml).appendTo("#viewUsersResult");
                }
                
                //Add a listener that will load selected users result
                $('#viewUsersResult').die();
                $('#viewUsersResult').live('change', function(){
                     
                     var id = $(this).val();
                     //alert(id);
                     if(id === "none"){
                         
                     }
                     else{
                         
                        $('#toggleEdit').hide();
                         
                        $.getJSON(getCoachWorkout + workoutObject._id + "/" + id + "/" +workoutObject.cell.cellId , function(data) {
                            renderDetails(data, function(output){
                            	document.getElementById('typeDetail').innerHTML = output;
                                if(workoutObject.type === "intervall"){
                                    loadDynamicQtip(workoutObject.intervalls.length, workoutObject.intervalls);
                                    
                                    $('.intervallUnit').die();   
                                    $('.intervallUnit').qtip({
                                        content: {
                                            attr: 'description'
                                        },
                                        position: {
                                            my: 'left center', // Use the corner...
                                            at: 'right center' // ...and opposite corner
                                        },
                                        style: {
                                            widget: true 
                                        }
                                    });
                                }
                    	    });                             
                        });
                     }
                 });
    
            }
            else{
                $('#viewUsersResult').hide();  
            }
        }
        else{
        //something wrong
            $('#viewUsersResult').hide(); 
        } 
        
        //Init or (reinit) the handlers for the click
        $('#workoutMessageInput').die();
        $('#workoutMessageInput').attr('workoutid', workoutObject._id);
        
        
    });
    
    //Empty descriptiom, then look if there is one
    document.getElementById('descFbId').innerHTML = "";
    $('#qtipLocationDesc').die();
    
	if(workoutObject.description !== "none"){
        var descPictureTag;
        var name = "Your description: ";
        if(workoutObject.cell.creator != undefined){
             descPictureTag = '­­<fb:profile-pic uid="' + workoutObject.cell.creator.fbid 
             + '" facebook-logo="false" linked="true" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
            name = workoutObject.cell.creator.fullName +"'s description: ";
        }
        else{
            descPictureTag = '­­<fb:profile-pic uid="'+ authId 
             + '" facebook-logo="false" linked="true" width="50" height="50" size="thumb" ></fb:profile-pic>';
        }
        document.getElementById('descFbId').innerHTML =  descPictureTag ;
        FB.XFBML.parse(document.getElementById('descFbId'), function(){
            $('#qtipLocationDesc').qtip({
                content: name + workoutObject.description,
                position: {
                    my: 'left center', // Use the corner...
                    at: 'right center' // ...and opposite corner
                },
                show: {
                  ready: true
                },
                hide: false,
                style: {
                    widget : true,
                    classes: 'ui-tooltip-rounded ui-tooltip-shadow',
                    width  : '300px'
                }
            }); 
        });
 
		//document.getElementById('description').innerHTML = "Description <br><div style='font-size: 12px;'>" + workoutObject.description + "</div>";
	}
    
    if(workoutObject.feed.length > 0){
        
        renderWorkoutMessages(workoutObject.feed, function(html){
        
            document.getElementById('comments').innerHTML = html;
            
            $('.removeWorkoutComment').die();
            $('.removeWorkoutComment').live('click', function(){
                var parent = $(this).parent().parent();
                $.getJSON(removeWorkoutComment + workoutObject._id + "/" + parent.attr('messageId'), function(data) {
                    if(data.success){
                         parent.remove();
                         if(workoutObject.feed.length === 1){
                            document.getElementById('comments').innerHTML = "<br> No Comments yet ..."   
                        }
                    }
                    else{
                        
                    }
                });
            });
        });  
    }
    else{
        document.getElementById('comments').innerHTML = "<br> No Comments yet ..."; 
    }
    
    
    //Add layout for users in workoutcell
    fillWorkoutMembers(workoutObject.cell.participants);

    //Treat display for cell based workout id needed
    if(workoutObject.cell.participants.length === 0 || typeof(workoutObject.cell.participants) === "undefined"){
       $('#joinWorkout').hide();
        $('#quitWorkout').hide();
        $('#deleteWorkout').show();
        $('#toggleEdit').show();
    }
    else{
        $('#joinWorkout').show();
        $('#quitWorkout').hide();
        $('#deleteWorkout').hide();
        $('#toggleEdit').hide();
        
        for(i = 0; i < workoutObject.cell.participants.length; i++){
            if(workoutObject.cell.participants[i].fbid === parseInt(authId)){
                $('#joinWorkout').hide();
                $('#quitWorkout').show();
                $('#deleteWorkout').hide();
                $('#toggleEdit').show();
            }
        }
 
    }
    
    
	//Input are type of workout and intervall of distance parameters, if the other one is ""
	renderDetails(workoutObject, function(output){
		document.getElementById('typeDetail').innerHTML = output;
        if(workoutObject.type === "intervall"){
            loadDynamicQtip(workoutObject.intervalls.length, workoutObject.intervalls);
            
            $('.intervallUnit').die();   
            $('.intervallUnit').qtip({
                content: {
                    attr: 'description'
                },
                position: {
                    my: 'left center', // Use the corner...
                    at: 'right center' // ...and opposite corner
                },
                style: {
                    widget: true 
                }
            });

            
        }
	});

    $('#toggleEdit').unbind('click').click(function(){
        initToggleButton(workoutObject);
    });
    /*
	renderCell(fetched.workout.cell, function(output){
	
		//document.getElementById('cell').innerHTML = output;
	
	});*/
    
    //LOADING ALL QTIPS FOR THE PAGE
     
        
    $("#viewOptions").qtip({
        id: 'themeroller',
        content: {
            text: $('#viewOptionsContent').html() 
        },
        show: {
            event: 'click', 
            ready: false 
        },
        hide: {
            event: 'click'
        },
        style: {
           widget: true 
        },
        position: {
           my: 'top center',
           at: 'bottom center'
        },
        events: {
            render: function(event, api) {
                api.elements.tooltip.click(api.hide);
            }
        }
    });

    //Show timing in a qtip
    $('#iconShowTime').qtip({
        content: {
            text: "From " + (start.getHours()) + ":" + ((start.getMinutes() < 10) ? ("0" + start.getMinutes()) : start.getMinutes()) +
                  " to " + (end.getHours()) + ":" + ((end.getMinutes() < 10) ? ("0" + end.getMinutes()) : end.getMinutes())
        },
        position: {
            my: 'top center',
            at:'bottom center'
        },
        style: {
            widget: true 
        }
    });
    
    //On load attach handler to delete button
    $("#deleteWorkout").die();
    $("#deleteWorkout").live("click",function(){
        
        concatenateStrings([deleteWorkout, "/", start.getFullYear(), "/", start.getMonth(),
        "/", workoutObject._id, "/", eventId], function(url){
            $.get(url, function(data){
                if(data.success){
                    Notifier.success(data.message);
                    moveUI('Create');
                }
                else{
                    Notifier.error(data.message);       
                }
            }, "json");
        });
    });
    
    $("#quitWorkout").die();
    $("#quitWorkout").live('click', function(){
        var url = quitWorkout + start.getFullYear() + "/" + start.getMonth() + "/" + workoutObject._id + "/" + eventId;
        
        $.get(url, function(data){
            if(data.success){
                applicationVariables.calendarMode = "user";
                moveUI('Social'); 
            }
            else{
            //something wrong
                Notifier.success(data.message);
            }   
        }, "json");           
    });
    
    $("#joinWorkout").die();
    $("#joinWorkout").live('click', function(){
        var url = joinWorkoutCell;
        var toPostPackage = { event: ""};
        toPostPackage.event = event;

        postJson(JSON.stringify(toPostPackage), url, function(message){
            $.getJSON(event.url, function(workout) {
                initView(workout, event);       
            });
            updateCalendar();
        });          
    });
}


//This fonction will render intervall objects or distance objects
//It will check if the specific result document is either undefined or empty
//The callback returns the the formatted HTML
function renderDetails(object, callback){
    
	var type = object.type;
	var intervalls = object.intervalls;
	var distance = object.distance;
	var intervallResult = object.intervallResult;
	var distanceResult = object.distanceResult;
	var sport = object.sport;
    var description = object.description;
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

			if(distance.intensity === 0){
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
        var quantityHtml = "";
		for(i = 0; i < intervalls.length; i++){
            
            if(intervalls[i].quantity > 1){
                quantityHtml = "<div style='float: left'> &nbsp;&nbsp; X &nbsp;" + intervalls[i].quantity + '</div>';
            }
            
			//Intervall training without any intensity objective, requires special handling
			if(intervalls[i].intensityUnit === "none"){
				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed <br>" : "Not Completed <br>";	
				}
                

				output = output + "<div class='intervallUnit' description='" + intervalls[i].description + "' style='height: 20px; cursor: default; font-size: 12px;'><div style='float: left'>" + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit +
                     "</div>" + quantityHtml + "</div><div style='font-size: 10px; background-color: #e2f1d5;'>" + resultHtml + "</div>";


			} //Intervall training with a range, requires special handling
			else if(intervalls[i].intensityUnit === "range"){

				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed" : "Not Completed";	
					resultHtml = (intervallResult[i].value !== "0" && intervallResult[i].value !== 0) ? (resultHtml + " in " + intervallResult[i].value + intervallResult[i].unit + '<br>') : (resultHtml + '<br>');
				}

				var rangeHtml =   " from <span id='unitSeconds'>" + intervalls[i].intensityRange[0] + "</span> s to " + "<span id='unitSeconds'>" + intervalls[i].intensityRange[1] + "</span> s";
				output = output + "<div class='intervallUnit' description='" + intervalls[i].description + "' style='height: 20px; cursor: default; font-size: 12px;'><div style='float: left'>" + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + rangeHtml + 
                    "</div>" + quantityHtml + "</div><div style='font-size: 10px; background-color: #e2f1d5;'>" +	resultHtml + "</div>";
			}
			else{

				var resultHtml = "";
				if(intervallResult.length !== 0){
					resultHtml =  (intervallResult[i].completed) ? "Completed" : "Not Completed";	
					resultHtml = (intervallResult[i].value !== "0" && intervallResult[i].value !== 0) ? (resultHtml + " in " + intervallResult[i].value + intervallResult[i].unit + '<br>') : (resultHtml+ '<br>');
				}

				output = output + "<div class='intervallUnit' description='" + intervalls[i].description + "' style='height: 20px;  cursor: default; font-size: 12px;'><div style='float: left'>" + intervalls[i].targetValue + '&nbsp;' + intervalls[i].targetUnit + ' at ' + 
					intervalls[i].intensityValue + '&nbsp;' + intervalls[i].intensityUnit + 
                    "</div>" + quantityHtml + "</div><div style='font-size: 10px; background-color: #e2f1d5;'>"+ resultHtml + "</div>";		
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
			else if(intervalls[i].intensityUnit === "range"){
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
                    
                    $('.intervallUnit').die();   
        
                    $('.intervallUnit').qtip({
                        content: {
                            attr: 'description'
                        },
                        position: {
                            my: 'left center', // Use the corner...
                            at: 'right center' // ...and opposite corner
                        },
                        style: {
                            widget: true 
                        }
                    });

    		    });	                     
            }
            else{              
                renderDetails(object, function(output){
        	        document.getElementById('typeDetail').innerHTML = output;
			        document.getElementById('toggleEdit').innerHTML = "(Edit results)";
                    
                    $('.intervallUnit').die();   
        
                    $('.intervallUnit').qtip({
                        content: {
                            attr: 'description'
                        },
                        position: {
                            my: 'left center', // Use the corner...
                            at: 'right center' // ...and opposite corner
                        },
                        style: {
                            widget: true 
                        }
                    });

                    
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

var loadDynamicQtip = function(a, descTable){
    for(i = 0; i < a; i++){  
        $("#qtipIntervallView" + i).qtip({
            content: {
                text: descTable[i].description
                },
            show: {
                event: 'click', 
                ready: false 
                },
            hide: 'click'
        });  
    }
}

//adding stuff to an array seems to be to long, so added async to block execution
var concatenateStrings = function(array, callback){
    var str = "";
    if($.isArray(array)){
        for(i=0; i < array.length;i++){
            str = str + array[i];
        }  
        callback(str);
    }
       
}

function UIrepositionCreate(){
    $("#fullcalendar").animate({ 
    	height: "600px", 
		width: "800px", 
	}, 1000, function(){
		//resize calendar, seems to be a glitch
		$('#fullcalendar').fullCalendar('render');
	});
	//Transit between user panel functionality
	$("#" + panelState).hide("slide", {}, 1000, function(){
		$("#Create").show("slide", {}, 1000);
		panelState = 'Create';
	});   
}


var fillWorkoutMembers = function(arrayResult){
    
    if(RealTypeOf(arrayResult) !== "array" || arrayResult.length === 0){
        document.getElementById('workoutCellMembers').innerHTML = 'Yourself';     
    }
    else{
        var overallHtml = "";
        for(i = 0; i < arrayResult.length; i++){
            overallHtml = overallHtml + '<div class="btn_viewProfile" userid="' + arrayResult[i].fbid + '">' + arrayResult[i].fullName + '</div>';
        }
        
        document.getElementById('workoutCellMembers').innerHTML = overallHtml;

    }  
              
    $("#showCell").qtip({
        content: {
            text: $('#workoutCellMembers').html(),
        },
        show: {
            event: 'click', 
            ready: false 
        },
        hide: {
            event: 'click',
            inactive: 1000
        },
        style: {
            widget: true 
        }
    });  
          
}

var renderWorkoutMessages = function(messageArray, callback){
    
    var html = "";
    
    for(i = 0; i < messageArray.length; i++){
        
        if(messageArray[i].senderId === parseInt(authId)){
            html = "<div style='float: left; margin-top: 3px;'><span class='ui-icon ui-icon-close removeWorkoutComment' style='float: right'></span></div></div>" + html;
        }
        else{
            html = '</div>' + html;    
        }        
        
        html = "<div class='workoutMessage'  senderId='" + messageArray[i].senderId + "' messageId='" + messageArray[i]._id + "'><div style='width: 400px; float: left; ' >" +
            messageArray[i].sender + " says: " + messageArray[i].message + "</div>" + html;

    }
    callback(html); 

}
