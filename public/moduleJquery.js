panelState = 'largeCalendar';
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
    calendarFirstLoad   : true,
    calendarMode        : "user", //or cell
    currentCell         : "none"
}


$(document).ready(function(){
        
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
        
        autoOpen: false,
    
        
        $('#createCellDialog').dialog({
    		autoOpen: false,
			width  : 400,
            height : 400,
            resizable: false,
            draggable: false,
            modal: true,
            position: {
                my: "center",
                at: "center",
                of: window
            },
			buttons: {
				"Ok": function() { 
					postJson(JSON.stringify(grabNewCellInput()), postCell, function(){
                        intiSocialView(false, false, true);
                    });
                    $(this).dialog("close"); 
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}
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
			orientation: "horizontal",
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
					var str = "<div style='height: 20px;'><div style='float: left;'>" +target+"m @"+ intensityWorth + " " + intensityMetric + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right;'></div></div>";
                    if(document.getElementById('lbl_intensity').innerHTML === "Metric <br> disabled"){
                        str = "<div style='height: 20px;'><div style='float: left;'>" + target + "m" + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length + "' style='float: right;'></div></div>";
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
			        var str = "<div style='height: 20px;'><div style='float: left;'>" + target+"s @"+ intensityWorth + " " + intensityMetric + "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right;'></div></div>";
                    if(document.getElementById('lbl_intensity').innerHTML === "Metric <br> disabled"){
                        str = "<div style='height: 20px;'><div style='float: left;'>" + target+"s"+ "</div><div class='ui-icon ui-icon-pin-w' id='qtipIntervall" + tempIntervall.length +"' style='float: right;'></div></div>";
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
		
            if($('#cellSelection').val() === 'yourself'){
                postWorkout(event);
            }
            else{
                postCellWorkout(event);
            }
        
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
						height: "500px", 
						width: "500px", 
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

        ///// MAPPING NAVIGATION BUTTONS 
        $('#goToSocial').click(function(){
            applicationVariables.calendarMode = "user";
            moveUI('Social'); 
            
        });
        
        $('#goToMap').click(function(){
            applicationVariables.calendarMode = "user";
            refreshDropdown();
            moveUI('Map'); 
            
        });
        
        $('#goToPlanner').click(function(){
            applicationVariables.calendarMode = "user";
            populateCellDropList();
            refreshDropdown();
            moveUI('Create'); 
            
        });
        
        //This is to add a button to the calendar
        function addCalButton(where, text, id) {
            var my_button = '<span class="fc-header-space"></span>' +
                    '<span id="' + id + '" class="cal-button"><span class="ui-icon ui-icon-arrow-4-diag"></span></span>';
            $("td.fc-header-" + where).append(my_button);
            $("#" + id).button();
        }
        
        addCalButton("right", "Hello", "enlargeCalendar");
        
        $('#enlargeCalendar').live('click', function(){
            moveUI('largeCalendar'); 
            
        });

		//Simple function to an object that you can put in the calendar
		
        
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
            
            var url;
            var d = $('#fullcalendar').fullCalendar('getDate');
                //alert(d);
                
            var month = d.getMonth() + 1;
            var year = d.getFullYear();
            var theGetUrl = 

            $('#fullcalendar').fullCalendar( 'removeEvents' );
            
            if(applicationVariables.calendarMode === "cell"){
                url = "/cell/event/" + year + "/" + month + "/" + applicationVariables.currentCell;
            }
            else{  //Users calendar data
                url = "/event/" + year + "/" + month + "/" + authId;    
            }
            
            $.getJSON(url, function(data) {
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
        
        /*
        //unelegant way of loading dropdown with latest parcours
        $("#dropdownMap").mouseover(function() {
           
           refreshDropdown();
           
        });
        
        
        $("#parcourSelection").mouseover(function() {
           
           refreshDropdown();
           
        });*/
    

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
        
        var grabNewCellInput = function(){
            
            var object = {
                name         : $("input[type=text][id=cellName]").val(),
                location     : $("#cellLocationSelect").val(),
	            description  : $("#cellDescription").val(),      
            }
            return object;
            
        }
        
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
        
        $('#createCell').click(function(){
            $('#createCellDialog').dialog('open');  
            
        });
        
        $('.cellCard').live('click',function(){
           var id = $(this).attr('refId');
           var owner = $(this).attr('owner');
           applicationVariables.calendarMode = "cell";
           applicationVariables.currentCell = $(this).attr('refId');
           initCellView(id, owner);
           UILoadNewState('cellView');
           updateCalendar();
            
        });
        
        //Button found on profile snippet, click on profile mini pic
        $('.btn_viewProfile').live('click',function(){
           var id = $(this).attr('userid');
           applicationVariables.calendarMode = "user";
           initUsersProfile(id);
           UILoadNewState('profileView');
           $('#friendPic' + id).qtip("api").destroy();
            
        });
        
        var populateCellDropList = function(){
            $.getJSON(getAllCell, function(data) {
                if(data.success){
                    for(i = 0; i < data.message.length;i++){
                        droplistHtml = "<option value='" +  data.message[i].cellDetails + "'>"+ data.message[i].name+"</option>";
                        $(droplistHtml).appendTo("#cellSelection");
                    } 
                }
                else{
                //something wrong
 
                }   
            });  
        }

        initHeaderBar();
       
//END OF MODULE FUNCTIONS
});
