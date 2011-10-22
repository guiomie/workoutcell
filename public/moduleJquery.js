$(document).ready(function(){
		panelState = 'Create';
		p = 0;
		var intervall = new Array();
		var tempCell = new Array();
		
		
		$('#fullcalendar').fullCalendar({
			// put your options and callbacks here
			height: 600,
			theme: true,
			eventClick: function(event) {	
				if (event.url) {
				//the launched function readjusts UI and send httprequest for view
				UIreposition(event.url);
				return false;
			}
    }
		});
		
		$('#mainContent').corner();
		$('#profilePic').corner();
		
		//Date picker is ISO 8601
		$.datepicker.setDefaults({ dateFormat: 'yy-mm-dd' });
	    $( "#datepicker" ).datepicker();
		$('#timepickerStart').timepicker({timeFormat: 'hh:mm'});
		$('#timepickerStop').timepicker({});
		
		/* To redo later, intent is to block entry of over time smaller then start time
		$('#timepickerStop').click(function(){
		var time = $('#timepickerStart').datetimepicker('getDate');
		var hours = time.getHours();
		$('#timepickerStop').timepicker({ hourMin: 5});
		//alert(hours);
		}); */
		
		$( "#radio, #radio1, #radio2, #radio3,#radio4" ).buttonset();
		$( "#accordion" ).accordion({ autoHeight: false });
		
		var buttons = $('#push, #check, #clearMap, #saveMap, #addIntervall, #removeIntervall').button();
		
		// Dialog			
		$('#dialog').dialog({
			autoOpen: false,
			width: 600,
			buttons: {
				"Ok": function() { 
					$(this).dialog("close"); 
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}
		});
				
		// Dialog Link
		$('#dialog_link').click(function(){
			$('#dialog').dialog('open');
			return false;
		});
		
		
		$( "#sliderIntensity" ).slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 100,
			value: 40,
			slide: function( event, ui ) {
				document.getElementById('intensityHtml').innerHTML = ui.value;
			}
		});
		
		$( "#sliderIntensity2" ).slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 100,
			value: 40,
			slide: function( event, ui ) {	
				document.getElementById('intensityHtml2').innerHTML = ui.value;
			}
		});
		
		// Event for when press delete icon
		$('#deleteTrace').click(function(){
			clearMap();
		});
		
		// Event for when press delete icon
		$('#bikeTrace').click(function(){
			if(bikeLayer.getMap() === null){
				bikeLayer.setMap(map);
			}
			else{
				bikeLayer.setMap(null);
			}
		});
		
		$('#saveTrace').click(function(){
			
			//generate json format
			//poly is a global variable declared in moduleGmap
			//Essential to brake circular reference, else stringify will fail
			poly.setMap(null);
			var polyPath = poly.getPath().b; 
			var markers = markerArray; 
			var nameOfCourse = $("input[type=text][id=courseName]").val();
			var totalDistance = document.getElementById('distance').innerHTML;
			
			
			if(polyPath.length === 0 || markerArray.length === 0 || nameOfCourse === "" ){
			
			alert("Missing data Entry. Create course or make sure a name is entered");
			
			}else
			{
				var newParcour = {
			
					name         : nameOfCourse,
					markerArray  : markers,
					distance     : totalDistance,
					pathArray    : polyPath

				}
			
				var httpRequestUrl = restPost_newParcour; 
				//Clear UI
				document.getElementById('distance').innerHTML = "0";
				$("input[type=text][id=courseName]").val("");
				document.getElementById('traceLabel').innerHTML = "Map saved";
				//Essential to brake circular reference, else stringify will fail
				clearMap();
				//TO IMPLEMENT *************
				//Send to server via httppost
				document.getElementById('map_option').innerHTML = JSON.stringify(newParcour);
				
				
			}
			
			//Message box creates bug in UI
			//alert(JSON.stringify(newParcour) + " @ " + httpRequestUrl);
			

			/*THIS CODE WORKS TO PUT COORDINATES BACK IN MAP 
			
			//var obj = jQuery.parseJSON(polyPath);
			
			var polyOptions = {
				strokeColor: '#000000',
				strokeOpacity: 1.0,
				strokeWeight: 3
			}	
			
			var insertedPoly = new google.maps.Polyline(polyOptions);
			//insertedPoly.setPath(obj);
			
			for(i=0;i < polyPath.length;i++){
			
			var path = poly.getPath();
			path.push(polyPath[i]);
			insertedPoly.setPath(path);
			}
			alert(JSON.stringify(insertedPoly));
			insertedPoly.setMap(map); */
			
			
			//when successfully sent, delete map data
			
		});
		
		 $('#addIntervall').click(function(){
		
			var target = $("input[type=text][id=unitInput]").val();
			var option = $('input[type=radio][name=radio2]:checked').attr('id');
			if(target !== ""){
				if (option === 'radioMeters'){
					if($("#intensityHtml").text() === '0' || $("#intensityHtml").text() === 'n/a'){
						$("select[name='intervallList']").append(new Option(target + "m", 'a'));
						createSingleIntervall(target, "null", "null", function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
					else{
						var output = target + "m @ " + $("#intensityHtml").text() + "%";
						$("select[name='intervallList']").append(new Option(output, 'a'));
						createSingleIntervall(target, "null", $("#intensityHtml").text(), function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
				}
				else if(option === 'radioSeconds'){
			
					if($("#intensityHtml").text() === '0' || $("#intensityHtml").text() === 'n/a'){
						$("select[name='intervallList']").append(new Option(target + "s", 'a'));
						createSingleIntervall("null", target, "null", function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
					else{
						var output = target + "s @ " + $("#intensityHtml").text() + "%";
						$("select[name='intervallList']").append(new Option(output, 'a'));
						createSingleIntervall("null", target, $("#intensityHtml").text(), function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
				}
				else{
				
				}
			}
		});
		
		$('#removeIntervall').click(function(){
		
		//delete in global array
		//get index value to delete proper value in array
			var index = document.getElementById('intervallList').selectedIndex;
			$("select[name='intervallList'] :selected").remove();
			//Update intervall array
			intervall.splice(index,1);
		});
		
		//You can only enter numerical number in the field with this event
		$("input[type=text][id=unitInput]").keydown(function(event) {
			// Allow only backspace and delete
			if ( event.keyCode == 46 || event.keyCode == 8 ) {
				// let it happen, don't do anything
			}
			else {
				// Ensure that it is a number and stop the keypress
				if (event.keyCode < 48 || event.keyCode > 57 ) {
					event.preventDefault(); 
				}   
			}
		});
		
		//hover states on the static widgets
		$('#dialog_link, ul#icons li').hover(
			function() { $(this).addClass('ui-state-hover'); }, 
			function() { $(this).removeClass('ui-state-hover'); }
		);
		
		//Button pushed in Distance type
		$("#radio3").click(function(event) { 
			var option = $('input[type=radio][name=radio3]:checked').attr('id');
			if (option == 'radioKiloMeters'){
				document.getElementById('typeDistance').innerHTML = " km";
			}else{
				document.getElementById('typeDistance').innerHTML = " (hh:ss)";
			}
		});
		
		//Data validation and compilation before submitting to server
		$("#push").click(function(event) {
		var selectedSport = $('input[type=radio][name=radio1]:checked + label').text();
		var parcourId = $("#parcourSelection").val();
		var postUrl = "/workout/" + authId + "/" + selectedSport;
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
		
		
		//Intervall Training
		if(activeAccordion === 1){
			//updateCalendarData(eventObject);
			//alert(JSON.stringify(intervall));
			
			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);
			
			workout = {
			sport       : selectedSport,
			type        : "intervall",
			intervalls  : intervall, 
			description : "none",
			cell        : tempCell,
			parcour     : parcourId,
			results     : "not entered"
			}
			
			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;
			alert(JSON.stringify(toPostPackage));			
			
		}
		//distance training
		else if(activeAccordion === 0){
			//alert(document.getElementById('intervallList').selectedIndex);
			//alert(JSON.stringify(intervall));
			var distanceType = document.getElementById('typeDistance').innerHTML;
			var distanceInputValue = $("input[type=text][id=distanceInput]").val();
			var intensityValue = document.getElementById('intensityHtml2').innerHTML;
			
			eventObject = createEvent(basicStartDate, basicEndDate, false, createTitleCalendar(basicStartDate), "ServerSideCreated", selectedSport);
			
			createSingleDistance(distanceType, distanceInputValue, intensityValue, function(distanceObject){
			
				workout = {
					sport       : selectedSport,
					type        : "distance",
					distance    : distanceObject,
					description : "none",
					cell        : tempCell,
					parcour     : parcourId,
					results     : "not entered"
				}

			});
			
			toPostPackage.workout = workout;
			toPostPackage.event = eventObject;
			alert(JSON.stringify(toPostPackage));
			
		}
		//nothing happens
		else{
		
		
		}
		
		
		//Test by putting json right in calendar
		
		//According to type of training select proper httprequest url (swim, bike, run)
		
		//empty intervall array so it doesnt accumulate
		intervall = new Array();
		cell = new Array();
		document.getElementById('intervallList').length = 0;
		
		});
		
		//Modification of UI based on user selection
		//rather complex, watch out for any modifications
		$("#radio4").click(function(event) { 
			var target = $(event.target);
			if (target.text() == 'View'){
				//this if statement blocks reloading of widget if already selected
				if(panelState !== 'View'){
					
					// Change calendar size
					$("#fullcalendar").animate({ 
						height: "500px", 
						width: "500px", 
					}, 1000, function(){
						//resize calendar, seems to be a glitch
						$('#fullcalendar').fullCalendar('render');
						}
					);
					//Transit between user panel functionality 
					$("#" + panelState).hide("slide", {}, 1000, function(){
				
						$("#View").show("slide", {}, 1000);
						panelState = 'View';
					});	
				}
			}
			else if(target.text() == 'Create'){
				//Block re-rendering of widget if already choosen
				if(panelState !== 'Create'){					
					// Change calendar size
					$("#fullcalendar").animate({ 
						height: "600px", 
						width: "800px", 
					}, 1000, function(){
						//resize calendar, seems to be a glitch
						$('#fullcalendar').fullCalendar('render');
						}
					);
					//Transit between user panel functionality
					$("#" + panelState).hide("slide", {}, 1000, function(){
				
						$("#Create").show("slide", {}, 1000);
						panelState = 'Create';
					});
				}
			}
			else if(target.text() == 'Map'){
				//Block re-rendering of widget if already choosen
				if(panelState !== 'Map'){					
					// Change calendar size
					$("#fullcalendar").animate({ 
						height: "500px", 
						width: "500px", 
					}, 1000, function(){
						//resize calendar, seems to be a glitch
						$('#fullcalendar').fullCalendar('render');
						}
					);
					//Transit between user panel functionality
					$("#" + panelState).hide("slide", {}, 1000, function(){
						$("#Map").show("slide", {}, 1000, function(){
							//initializes map after MAP div is properly centered, sinon bug
							if(map === undefined){
								initialize();
							}
						});
						panelState = 'Map';
					});
				}
			}
			else{
			
			
			}
			/*
			*/
		}); 
		
		
		
		/* Definitions of custom made functions, location is here to ease rest of general code */
		
		function UIreposition(url){

			if(panelState !== 'View'){	
				// Change calendar size
				$("#fullcalendar").animate({ 
				height: "500px", 
				width: "500px", 
				}, 1000, function(){
					//resize calendar, seems to be a glitch
					$('#fullcalendar').fullCalendar('render');
					}
				);
				//Transit between user panel functionality 
				$("#" + panelState).hide("slide", {}, 1000, function(){
					$("#View").show("slide", {}, 1000);
					panelState = 'View';
					
				});	
			}
			
			document.getElementById('View').innerHTML = " HttpRequest to " + url;
			//httprequest to get training via event.url
			
			//template generator for json received via httprequest
			
		} //end of function UIreposition
		
		
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
		
			var type = $('input[type=radio][name=radio1]:checked + label').text();;
			return type;
		
		}
		
		function updateCalendarData(event){
		
		//gets the user data
		//this will actually not be a new array but = httget 
		var events = new Array(); 
		events[0] = event;
		$('#fullcalendar').fullCalendar( 'addEventSource', events )
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
		
		function createSingleDistance(leTargetType, theValue, theIntensity, callback){
			

			var object = {
				
				targetType  : leTargetType,
				value       : theValue,
				intensity   : theIntensity
				
			}

			callback(object);
		
		}
		
		function getSelectedParcour(selectId, callback){
		
		document.getElementById().innerHTML = $("#" + selectId).val();
		
		}
		

			
});
