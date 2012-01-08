$(document).ready(function(){
        panelState = 'Create';
		p = 0;
		var appStatus = {needsFetch: true, lastFetchedMonth: "none"};
        //Data for ajax intervall content
        var intervall = new Array();
		var tempCell = new Array();
        var tempIntDesc = [];
		var selectedMap = "no map"; 
        //Data for intervall list
        var tempIntervall = [];
        var minSlider = 0;
        var maxSlider = 0;
        var applicationVariables = {
            calendarFirstLoad   : true
        }
        $('#scrollbar1').tinyscrollbar();

		$('#fullcalendar').fullCalendar({
			// put your options and callbacks here
			height: 600,
			theme: true,
			eventClick: function(event) {	
				if (event.url) {
				//the launched function readjusts UI and send httprequest for view
				UIreposition(event); //event.url, event.start, event.end, event._id);
				return false;
			    }
            },     
            viewDisplay: function(view) {
                //Essential for first load, or calendar loads to fast without Fb authentication and cant find data
                if(applicationVariables.calendarFirstLoad){
                    setTimeout(function() {
                        updateCalendar();
                    }, 1000);
                    applicationVariables.calendarFirstLoad = false;
                }
                else{
                    updateCalendar();
                }
                
            }
		});
        
		$('#mainContent').corner();
		$('#xfbmlPic').corner();

        $("#swapIntensity").click(function(){
            
            if( $("#targetType").text() === "%"){
                document.getElementById('targetType').innerHTML = "watt";
                $( "#sliderIntensity" ).slider({min: 0, max: 600, step: 10 });
            }
            else if($("#targetType").text() === "watt"){
                document.getElementById('targetType').innerHTML = "bpm";
                $( "#sliderIntensity" ).slider({min: 0, max: 300, step: 5 });
                
            }
            else if($("#targetType").text() === "bpm"){
                
                $("#sliderIntensity" ).slider( "destroy" );
                $("#sliderIntensity" ).slider({ 
                    //orientation: "vertical",
                    disabled: true
                });
                var maskedZero = "<FONT COLOR=WHITE> 0 </FONT>";
                document.getElementById('lbl_intensity').innerHTML = "Metric <br> disabled";
                document.getElementById('targetType').innerHTML = maskedZero;
    		    document.getElementById('intensityHtml').innerHTML = maskedZero;
                
            }
            else if(document.getElementById('lbl_intensity').innerHTML === "Metric <br> disabled"){
                
                $("#sliderIntensity" ).slider( "destroy" );
                $("#sliderIntensity" ).slider({ 
                    //orientation: "vertical", 
                    disabled: false,
                    range: true, 
                    step: 5,
                    min: 0, max: 300, 
                    values: [30, 60],
                    slide: function( event, ui ) {  

                        document.getElementById('targetType').innerHTML = "min";
			            document.getElementById('intensityHtml').innerHTML =Math.floor(ui.values[0] / 60) +":" + (ui.values[0] - (Math.floor(ui.values[0] / 60) * 60))+ "-" + Math.floor(ui.values[1] / 60) +":" + (ui.values[1] - (Math.floor(ui.values[1] / 60) * 60));
                        minSlider = ui.values[0];
                        maxSlider = ui.values[1];
                    } 
                });
                document.getElementById('lbl_intensity').innerHTML = "Range";
                document.getElementById('targetType').innerHTML = "min";
    		    document.getElementById('intensityHtml').innerHTML = Math.floor(30 / 60) + ":" + (30 - (Math.floor(30 / 60) * 60)) + "-" + Math.floor(60 / 60) +":" + (60 - (Math.floor(60 / 60) * 60));
                
            }
            else{ //time intervall
                document.getElementById('targetType').innerHTML = "%";
                $("#sliderIntensity" ).slider( "destroy" );
                $( "#sliderIntensity" ).slider({
    		        //orientation: "vertical",
			        range: "min",
                    step: 5,
		        	min: 0,
			        max: 100,
			        value: 40,
			        slide: function( event, ui ) {
				        document.getElementById('intensityHtml').innerHTML = ui.value;
			        }
		        });
                document.getElementById('intensityHtml').innerHTML = 40;
                document.getElementById('lbl_intensity').innerHTML = "Intensity";
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
			//orientation: "horizontal",
			range: "min",
            step: 5,
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
            step: 5,
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

		});
        
        //To send a delete trace to server
        $('#unSaveTrace').click(function(){
           
           
           
            
        });

		 $('#addIntervalli').click(function(){

			var target = $("input[type=text][id=unitInput]").val();
			var option = $('input[type=radio][name=radio2]:checked').attr('id');
			var intervallDescription = $("#intervallDescInput").val();
            var intensityMetric = document.getElementById('targetType').innerHTML;
            var intensityWorth = document.getElementById('intensityHtml').innerHTML;     
            var intensityTime = [];    
                if (option === 'radioMeters'){
					var str = "<div><div style='float: left'>" +target+"m @"+ intensityWorth + " " + intensityMetric + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right'></div></div>";
                    if(document.getElementById('lbl_intensity').innerHTML === "Metric <br> disabled"){
                        str = "<div><div style='float: left'>" + target + "m" + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length + "' style='float: right'></div></div>";
                        intensityMetric = 0;
                        intensityWorth = 0;
                    }
                    if(document.getElementById('targetType').innerHTML === "min"){
                        intensityWorth = 0;    
                    }
                    tempIntervall.push(str);
                    tempIntDesc.push(intervallDescription);
                    
                    printArray(tempIntervall, function(html){
                        //document.getElementById('overview').innerHTML = "";
                        document.getElementById('overview').innerHTML = html;
                        $("#scrollbar1").tinyscrollbar_update();
                        loadDynamicQtip((tempIntervall.length - 1),  tempIntDesc);
                    });
                    
                    intensityTime.push(minSlider);
                    intensityTime.push(maxSlider);

                    var intervallObject = {
                        targetUnit     : "m",
                        targetValue    : target,
                        intensityUnit  : intensityMetric,
                        intensityValue : intensityWorth, 
                        intensityRange : intensityTime,
                        description    : intervallDescription
                    }
                    
                    intervall.push(intervallObject);

				}
				else if(option === 'radioSeconds'){
			        var str = "<div><div style='float: left'>" + target+"s @"+ intensityWorth + " " + intensityMetric + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right'></div></div>";
                    if(document.getElementById('lbl_intensity').innerHTML === "Metric <br> disabled"){
                        str = "<div><div style='float: left'>" + target+"s"+ "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right'></div></div>";
                        intensityMetric = 0;
                        intensityWorth = 0;
                    }
                    if(document.getElementById('targetType').innerHTML === "min"){
                        intensityWorth = 0;    
                    }
                    tempIntervall.push(str);
                    tempIntDesc.push(intervallDescription);
                    
                    printArray(tempIntervall, function(html){
                        document.getElementById('overview').innerHTML = html;
                        $("#scrollbar1").tinyscrollbar_update();
                        loadDynamicQtip((tempIntervall.length - 1), tempIntDesc);
                    });
                    
                    intensityTime.push(minSlider);
                    intensityTime.push(maxSlider);

                    var intervallObject = {
                        targetUnit     : "s",
                        targetValue    : target,
                        intensityUnit  : intensityMetric,
                        intensityValue : intensityWorth, 
                        intensityRange : intensityTime,
                        description    : intervallDescription
                    }
                    
                    intervall.push(intervallObject);

				}
				else{

				}
                //alert(JSON.stringify(intervall));
                //minSlider = 0;
                //maxSlider = 0;
		});

		$('#removeIntervalli').click(function(){

		//delete in global array and temp array
		//get index value to delete proper value in array
			//var index = document.getElementById('intervallList').selectedIndex;
			//$("select[name='intervallList'] :selected").remove();
			//Update intervall array
			tempIntervall.pop();
            intervall.pop();
            tempIntDesc.pop();
            printArray(tempIntervall, function(html){
                document.getElementById('overview').innerHTML = html;
                $("#scrollbar1").tinyscrollbar_update();
                loadDynamicQtip((tempIntervall.length - 1),  tempIntDesc);
            });
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
        var varDescription = "none";
        if($('#descriptionInput').val() !== 'Enter Description'){
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
        
		//empty intervall array so it doesnt accumulate
		intervall = new Array();
		tempIntervall = [];
        cell = new Array();
		document.getElementById('intervallList').length = 0;
		document.getElementById('overview').innerHTML = " ";
		});

		//Modification of UI based on user selection
		//rather complex, watch out for any modifications
		$("#radio4").click(function(event) { 
			var target = $(event.target);
			if (target.text() == 'Social'){
				//this if statement blocks reloading of widget if already selected
				if(panelState !== 'Social'){
                    intiSocialView(true, true, true);
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

						$("#Social").show("slide", {}, 1000);
						panelState = 'Social';
                        //Load users social view

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

		function UIreposition(event){
            
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

            $.getJSON(event.url, function(workout) {
                     //document.getElementById('View').innerHTML = JSON.stringify(data);                
                     //In moduleView.js
                     initView(workout, event);       
            });

		} //end of function UIreposition
        
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
            
            var droplistHtml = "<option value='none'>No parcour </option>" ;
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
        
        
        var timeStringToSeconds = function(string, callback){
            var splittedArray = string.split(":");
            callback((parseInt(splittedArray[0]) * 60) + parseInt(splittedArray[1]));
        }

        var printArray = function(array, callback){
            var finalHtml ="";
            if(array.length === 0){
                callback(finalHtml);
            }
            else{
                for(i = 0; i < array.length; i++){
                    finalHtml = finalHtml + array[i]; 
                    
                    
    
                }
                callback(finalHtml);
            }
        }
        
        
        $('#descriptionButton').qtip({
            content: {
               text: "<textarea rows='5' cols='20' id='descriptionInput'>Enter Description</textarea>" 
            },
            show: {
               event: 'click', 
               ready: false 
            },
            hide: 'click',
            style: {
                widget: true 
            }    
        });
        
        $("#intervallDesc").qtip({
            content: {
                text: "<textarea rows='5' cols='20' id='intervallDescInput'>Enter the description of this single intervall (not required) </textarea>" 
            },
            show: {
                event: 'click', 
                ready: false 
            },
            hide: 'click',
            style: {
                widget: true 
            }
        });
        
        
        var loadDynamicQtip = function(a, descTable){
            for(i = 0; i <= a; i++){  
                $("#qtipIntervall" + i).qtip({
                    content: {
                        text: descTable[i]
                    },
                    show: {
                        event: 'click', 
                        ready: false 
                    },
                    hide: 'click',
                    style: {
                        widget: true 
                    }
                });  
            }
        }
        

        initHeaderBar();
       
//END OF MODULE FUNCTIONS
});
