$(document).ready(function(){
		panelState = 'Create';
		p = 0;
		var appStatus = {needsFetch: true, lastFetchedMonth: "none"};
        var intervall = new Array();
		var tempCell = new Array();
		var selectedMap = "no map"; 

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
            },     
            viewDisplay: function(view) {
                
                updateCalendar();
                
            }
		});
		
		$('#mainContent').corner();
		$('#profilePic').corner();
		
        $("#targetType").click(function(){
            
            if( $("#targetType").text() === "%"){
                document.getElementById('targetType').innerHTML = "watt";
                $( "#sliderIntensity" ).slider({min: 0, max: 600 });
            }
            else if($("#targetType").text() === "watt"){
                document.getElementById('targetType').innerHTML = "bpm";
                $( "#sliderIntensity" ).slider({min: 0, max: 300 });
                
            }
            else if($("#targetType").text() === "bpm"){
                
                $("#sliderIntensity" ).slider( "destroy" );
                $("#sliderIntensity" ).slider({ 
                    orientation: "vertical", 
                    range: true, 
                    min: 0, max: 300, 
                    values: [30, 60],
                    slide: function( event, ui ) {  
				        document.getElementById('targetType').innerHTML = "min: " + Math.floor(ui.values[0] / 60) +":" + (ui.values[0] - (Math.floor(ui.values[0] / 60) * 60));
			            document.getElementById('intensityHtml').innerHTML = "max: " + Math.floor(ui.values[1] / 60) +":" + (ui.values[1] - (Math.floor(ui.values[1] / 60) * 60));
                    } 
                });
                document.getElementById('targetType').innerHTML = "min: " + Math.floor(30 / 60) +":" + (30 - (Math.floor(30 / 60) * 60));
    		    document.getElementById('intensityHtml').innerHTML = "max: " + Math.floor(60 / 60) +":" + (60 - (Math.floor(60 / 60) * 60));
                
            }
            else{ //time intervall
                document.getElementById('targetType').innerHTML = "%";
                $("#sliderIntensity" ).slider( "destroy" );
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
                document.getElementById('intensityHtml').innerHTML = 40;
            }
            
        });
        
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
		

        //Behavior of when the map is clicked
        $("#dropdownMap").click(function() { 
            

            
        }); 
        
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
		
        
        // Remove last added segment on map trace
    	$('#undoTrace').click(function(){
			undoLast();
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
			var polypathObject = poly.getPath().getArray();
			var markersObject;             
    		var nameOfCourse = $("input[type=text][id=courseName]").val();
			var totalDistance = document.getElementById('distance').innerHTML;
            
            markertTitleArray(markerArray, function(titleArray){
               
               markerLatLngArray(markerArray, function(latArray){
               
                    markersObject = { titles: titleArray, latlng: latArray };
               });
            });
            			
			if(polypathObject.length === 0 || markerArray.length === 0 || nameOfCourse === "" ){
			
			    //alert("Missing data Entry. Create course or make sure a name is entered");
			    Notifier.error("Please fill in all required inputs");
			}
            else{
                var object = { markers: markersObject, polylines: polypathObject};
				var content = JSON.stringify(object);

				var httpRequestUrl = restPost_newParcour + nameOfCourse + "/" + totalDistance; 

				//Essential to break circular reference, else stringify will fail
				clearMap();

				//Send to server via httppost			
                postJson(content, httpRequestUrl, function(){
                   //reinitialise maps and lcear ui
                   distance = 0;
                   markerArray = [];
                   lastAddedDistance = [];
                   $("#courseName").val('');
                   document.getElementById('distance').innerHTML = "0";
                   //populate dropdowns with new user data
                   refreshDropdown();
                });
				//alert(JSON.stringify(newParcour));
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
						createSingleIntervall(target, 0, 0, function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
					else{
						var output = target + "m @ " + $("#intensityHtml").text() + "%";
						$("select[name='intervallList']").append(new Option(output, 'a'));
						createSingleIntervall(target, 0, $("#intensityHtml").text(), function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
				}
				else if(option === 'radioSeconds'){
			
					if($("#intensityHtml").text() === '0' || $("#intensityHtml").text() === 'n/a'){
						$("select[name='intervallList']").append(new Option(target + "s", 'a'));
						createSingleIntervall(0, target, 0, function(singleIntervall){
							intervall.push(singleIntervall);
						});
					}
					else{
						var output = target + "s @ " + $("#intensityHtml").text() + "%";
						$("select[name='intervallList']").append(new Option(output, 'a'));
						createSingleIntervall(0, target, $("#intensityHtml").text(), function(singleIntervall){
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
				document.getElementById('bigLabel').innerHTML = " km";
				document.getElementById('smallLabel').innerHTML = " m";
			}else{
				document.getElementById('bigLabel').innerHTML = "hour";
				document.getElementById('smallLabel').innerHTML = "min";
			}
		});
		
		//Data validation and compilation before submitting to server
		$("#push").click(function(event) {
		var selectedSport = $('input[type=radio][name=radio1]:checked + label').text();
    	//var parcourId = $("#parcourSelection").val();
		var parcourId = {
		
			id     :  $("#parcourSelection").val(),
			name   :  $('#parcourSelection :selected').text()
		
		};
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
			
            //FOR DEBUG***** document.getElementById("console").innerHTML = document.getElementById('console').innerHTML + '<br>' + JSON.stringify(toPostPackage) ;
            
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
					description : "none",
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
			
            $.getJSON(url, function(data) {
                     document.getElementById('View').innerHTML = JSON.stringify(data); 
            });
            
		
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
        
        //Will take a JSON for string argumen (array of maps) and will populate drop list
        var populateDroplist = function(dropdownName, string){
            
            //Clear old guy
            $('#' + dropdownName)
                .find('option')
                .remove()
                .end()
                //.append('<option value="whatever">text</option>')
                //.val('whatever')
            ;
            
            var droplistHtml = "<option> </option>" ;
            var array = {};
            var obj = jQuery.parseJSON(string);
            $(droplistHtml).appendTo("#" + dropdownName);
  
            for(i = 0; i < obj.length;i++){
                droplistHtml = "<option value='" +  obj[i].realId + "'>"+ obj[i].name+"</option>";
                $(droplistHtml).appendTo("#" + dropdownName);
            } 
        }
        
         function getJson(url, callback){

            $.get(url, function(data){
                callback(data);   
            }, "json");
        }
        
        
        //To send a json use this, make sure received json follows convention
        //convention on param with success: true or false and the message: "blabla"
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
                         callback();
                    }
                    else{
                       Notifier.error(data.message); 
                       callback();
                    }
                },

                error: function() {
                    //callback('Operation failed');
                    Notifier.error('Could not send data to server');
                     callback();
                },
            });
    
        }
        
        //will remove everything in the calendar then
        //takes the current displayed month and go gets the data
        function updateCalendar(){
            
            var d = $('#fullcalendar').fullCalendar('getDate');
                //alert(d);
                
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var theGetUrl = "/event/" + year + "/" + month + "/" + authId

            $('#fullcalendar').fullCalendar( 'removeEvents' );
            
            $.getJSON(theGetUrl, function(data) {
                if(data.success){
                    $('#fullcalendar').fullCalendar( 'addEventSource', data.message );  
                }
                else{
                //something wrong
                Notifier.success(data.message);
                }   
            }); 
            
        }

        var refreshDropdown = function(){
         
            getJson(getParcourList, function(data){
               
               //will populate dropdown with parcour list
               populateDroplist("dropdownMap", data);
               populateDroplist("parcourSelection", data);
               
            });  
        }
        
        //unelegant way of loading dropdown with latest parcours
        $("#dropdownMap").mouseover(function() {
           
           refreshDropdown();
           
        });
        
        $("#parcourSelection").mouseover(function() {
           
           refreshDropdown();
           
        });
        

        $("#dropdownMap").change(function() { 
            
            var url = getParcour + $(this).val();
            $.get(url, function(data){
                clearMap();
                var receivedObject = jQuery.parseJSON(data);
                var contentObject = jQuery.parseJSON(receivedObject.content);
                
                loadPolylines(contentObject.polylines);
                
                loadMarkers(contentObject.markers.latlng, contentObject.markers.titles);
                document.getElementById('distance').innerHTML = receivedObject.distance;
                //document.getElementById('console').innerHTML = JSON.stringify(contentObject.polylines);
                
                
                
            }, "json");
            
        }); 
        

        
//END OF MODULE FUNCTIONS
});
