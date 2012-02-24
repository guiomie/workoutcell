var postWorkout = function(event) {
    
  
        var selectedSport = $('#sportSelection').val();
        //var parcourId = $("#parcourSelection").val();
	    var parcourId = {

			id     :  $("#parcourSelection").val(),
			name   :  $('#parcourSelection :selected').text()

		};
		var postUrl = "/workout/" + authId;
		var workout;
		var eventObject;
		var toPostPackage = {

			workout  : "null",
			event    : "null" 

		};
		//Getting dates
		var basicStartDate = $("#datepicker").datepicker( "getDate" );
		basicStartDate.setMinutes($('#timepickerStart').datetimepicker('getDate').getMinutes());
		basicStartDate.setHours($('#timepickerStart').datetimepicker('getDate').getHours());

        
		var basicEndDate = $("#datepicker").datepicker( "getDate" );
		basicEndDate.setMinutes($('#timepickerStop').datetimepicker('getDate').getMinutes());
		basicEndDate.setHours($('#timepickerStop').datetimepicker('getDate').getHours());		
		//Select info from opened accordion and create JS object / JSON 
		//returns index of accordion
		var activeAccordion = $( "#accordion" ).accordion( "option", "active" );
		//interval training
        var varDescription = "none";
        if($('#descriptionInput').val() !== 'Event description (optional)'){
            varDescription = $('#descriptionInput').val();
		}
        else{
            
        }

		//Intervall Training
		if(activeAccordion === 1){
			//updateCalendarData(eventObject);
			//alert(JSON.stringify(intervall));
            createIntervallModel();
			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);

			workout = {
			sport       : selectedSport,
			type        : "intervall",
			intervalls  : applicationVariables.intervallInput, 
			description : varDescription,
			cell        : tempCell,
			parcour     : parcourId,
			results     : "not entered"
			}

			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;

            //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + JSON.stringify(toPostPackage) ;
            //alert(JSON.stringify(workout));
            postJson(JSON.stringify(toPostPackage), postworkout, function(message){
            
                //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + message;
                updateCalendar();
            });
		}
		//distance training
		else if(activeAccordion === 0){
			//alert(document.getElementById('intervallList').selectedIndex);
			//alert(JSON.stringify(intervall));
			var distanceType = $('input[type=radio][name=radio3]:checked + label').text();
			var minInputValue = $("input[type=text][id=smallInput]").val();
			var maxInputValue = $("input[type=text][id=bigInput]").val();
			var intensityValue = document.getElementById('intensityHtml2').innerHTML;

			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);

			createSingleDistance(distanceType, minInputValue, maxInputValue, intensityValue, function(distanceObject){

				workout = {
					sport       : selectedSport,
					type        : "distance",
					distance    : distanceObject,
					description : varDescription,
					cell        : tempCell,
					parcour     : parcourId,
					results     : "not entered"
				}

			});

			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;

			//FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + JSON.stringify(toPostPackage) ;
            
            //Sends hhtt post to the postworkout url defined in restUrl.js
            postJson(JSON.stringify(toPostPackage), postworkout, function(message){
                
                //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + message;
                updateCalendar();
            });
            
		}
		//nothing happens
		else{


		}
        
        //Reinitializing the fields
		//empty intervall array so it doesnt accumulate
        initPostFields();

}

var postCellWorkout = function(event) {
    
  
        var selectedSport = $('#sportSelection').val();
        var cellId =  $('#cellSelection').val();
        
        var parcourId = {

			id     :  $("#parcourSelection").val(),
			name   :  $('#parcourSelection :selected').text()

		};
		var postUrl = postcellworkout + cellId + "/" + authId;
		var workout;
		var eventObject;
		var toPostPackage = {

			workout  : "null",
			event    : "null" 

		};
		//Getting dates
		var basicStartDate = $("#datepicker").datepicker( "getDate" );
		basicStartDate.setMinutes($('#timepickerStart').datetimepicker('getDate').getMinutes());
		basicStartDate.setHours($('#timepickerStart').datetimepicker('getDate').getHours());

		var basicEndDate = $("#datepicker").datepicker( "getDate" );
		basicEndDate.setMinutes($('#timepickerStop').datetimepicker('getDate').getMinutes());
		basicEndDate.setHours($('#timepickerStop').datetimepicker('getDate').getHours());		
		//Select info from opened accordion and create JS object / JSON 
		//returns index of accordion
		var activeAccordion = $( "#accordion" ).accordion( "option", "active" );
		//interval training
        var varDescription = "none";
        if($('#descriptionInput').val() !== 'Event description (optional)'){
            varDescription = $('#descriptionInput').val();
		}
        else{
            
        }

		//Intervall Training
		if(activeAccordion === 1){
			//updateCalendarData(eventObject);
			//alert(JSON.stringify(intervall));

			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);

			workout = {
			sport       : selectedSport,
			type        : "intervall",
			intervalls  : intervall, 
			description : varDescription,
			cell        : tempCell,
			parcour     : parcourId,
			results     : "not entered"
			}

			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;

            //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + JSON.stringify(toPostPackage) ;
            //alert(JSON.stringify(workout));
            postJson(JSON.stringify(toPostPackage), postUrl, function(message){
            
                //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + message;
                updateCalendar();
            });
		}
		//distance training
		else if(activeAccordion === 0){
			//alert(document.getElementById('intervallList').selectedIndex);
			//alert(JSON.stringify(intervall));
			var distanceType = $('input[type=radio][name=radio3]:checked + label').text();
			var minInputValue = $("input[type=text][id=smallInput]").val();
			var maxInputValue = $("input[type=text][id=bigInput]").val();
			var intensityValue = document.getElementById('intensityHtml2').innerHTML;

			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);

			createSingleDistance(distanceType, minInputValue, maxInputValue, intensityValue, function(distanceObject){

				workout = {
					sport       : selectedSport,
					type        : "distance",
					distance    : distanceObject,
					description : varDescription,
					cell        : tempCell,
					parcour     : parcourId,
					results     : "not entered"
				}

			});

			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;

			//FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + JSON.stringify(toPostPackage) ;
            
            //Sends hhtt post to the postworkout url defined in restUrl.js
            postJson(JSON.stringify(toPostPackage), postUrl, function(message){
                
                //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + message;
                updateCalendar();
            });
            
		}
		//nothing happens
		else{


		}
        
		//empty intervall array so it doesnt accumulate
		initPostFields(); 
        
}


//Simple function to an object that you can put in the calendar
function createEvent(debut, fin, fullDay, titre, adresse, sport){
	var coleur = "#CCFFCC";
	if(sport === 'Bike'){
		coleur = "#CCCCCC";
	}
	else if(sport === 'Swim'){
		coleur = "#99CCFF";
	}
	else{   //Run
		coleur = "#CC9966";
	}

	var singleEvent = {
	//id      : Number,  Not needed for now
	title   : titre,
	allDay  : fullDay,
	start   : debut,
	end     : fin,
	url     : adresse,
	color   : coleur
	}

	return singleEvent;
}

function createTitleCalendar(debut){

	var type = $('#sportSelection').val();
	return type;

}

function createIntervallArray(inputName, callback){
	$("select[name='" + inputName + "']").length;

}

function createSingleIntervall(laDistance, laTime, leIntensity, callback){
	
	var object = {

		distance: laDistance,
		time: laTime,
		intensity: leIntensity

	}

	callback(object);
}

function createSingleDistance(leTargetType, theMinValue, theMaxValue, theIntensity, callback){


	var object = {

		targetType  : leTargetType,
		minValue    : theMinValue,
		maxValue    : theMaxValue,
		intensity   : theIntensity

	}

	callback(object);

}

function getSelectedParcour(selectId, callback){

    document.getElementById().innerHTML = $("#" + selectId).val();

}

function initPostFields(){
    
    intervall = new Array();
	tempIntervall = [];
    cell = new Array();
	//document.getElementById('intervallList').length = 0;
	document.getElementById('overview').innerHTML = " "; 

    $('#descriptionInput').attr('value', '');
    $('#datepicker').attr('value', '');
    $('#timepickerStop').attr('value', '');
    $('#timepickerStart').attr('value', '');
    $('#bigInput').attr('value', '');
    $('#smallInput').attr('value', '');
    $('#unitInput').attr('value', '');
    $('#intervallDescInput').attr('value', '');
    
}

function populateTemplate(workoutId){

    $.getJSON('/workout/' + workoutId, function(workoutObject) {
        
        $("#sportSelection").val(workoutObject.sport);
        
        if(workoutObject.description !== "none"){
            $('#description').val("Description<br>" + workoutObject.description);
        }
        
        
        if(workoutObject.type === 'distance'){
 
            if(workoutObject.distance.targetType === 'Time'){
                //Bug requiring to click twice
                $('#radioTime').click();
                $('#radioTime').click();
            }
            else if(workoutObject.distance.targetType === 'Kilometers'){
                $('#radioKiloMeters').click();
                $('#radioKiloMeters').click();
            }
            else{
                
            }
            $("#accordion").accordion("activate", 0);
            $("#bigInput").val(workoutObject.distance.maxValue);
            $("#smallInput").val(workoutObject.distance.minValue);
            $("#intensityHtml2").html(workoutObject.distance.intensity);
            $("#descriptionInput").val(workoutObject.description);
        }
        else if(workoutObject.type === 'intervall'){
            
            for(i=0; i < workoutObject.intervalls.length; i++){
                
                if(workoutObject.intervalls[i].intensityUnit === "range"){
                    var obj = workoutObject.intervalls[i];
                    addIntervallInput("range", "", obj.targetUnit, obj.targetValue, obj.description, obj.intensityRange[0], obj.intensityRange[1]);
                }
                else if(workoutObject.intervalls[i].intensityUnit === "none"){
                    var obj = workoutObject.intervalls[i];
                    addIntervallInput("none", "", obj.targetUnit, obj.targetValue, obj.description, "", "");
                }
                else{
                    var obj = workoutObject.intervalls[i];
                    addIntervallInput(obj.intensityUnit, obj.intensityValue, obj.targetUnit, obj.targetValue, obj.description, "", "");
                }
                
            }
            
            $("#accordion").accordion("activate", 1);
            
        }
        else{
            
        }
 
    });

}

var createIntervallModel = function(callback){
            
    applicationVariables.intervallInput = [];
	
    //var count = $('#intervallInputContainer > .intervallInputElement').length;
    //alert(count);
    
    //for(i = 0; i < count; i++){
    $('.intervallInputElement').each(function(i){
        
        var parent = $(this); //$(".intervallInputElement[elementnumber="+i+"]");
        //alert(JSON.stringify(parent.html()));
        if(parent.children('.metricDiv').children('.targetType').val() === "range"){

            var intervallObject = {
                targetUnit     : parent.children('.targetDiv').children('.metricType').val(),
                targetValue    : parent.children('.targetDiv').children('.metricValue').val(),
                intensityUnit  : parent.children('.metricDiv').children('.targetType').val(),
                intensityValue : "", 
                intensityRange : [parent.children('.metricDiv').children('.targetValue').children('.intervallMin').attr('seconds'), parent.children('.metricDiv').children('.targetValue').children('.intervallMax').attr('seconds')] ,
                description    : parent.children('.descContainer').children('.intervallDescription').val()
            }
            applicationVariables.intervallInput.push(intervallObject);
        }
        else{
        
            var intervallObject = {
                targetUnit     : parent.children('.targetDiv').children('.metricType').val(),
                targetValue    : parent.children('.targetDiv').children('.metricValue').val(),
                intensityUnit  : parent.children('.metricDiv').children('.targetType').val(),
                intensityValue : parent.children('.metricDiv').children('.targetValue').html(), 
                intensityRange : "",
                description    : parent.children('.descContainer').children('.intervallDescription').val()
            }
            
            applicationVariables.intervallInput.push(intervallObject);
        }
    });

}
