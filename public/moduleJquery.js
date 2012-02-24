panelState = 'largeCalendar';
p = 0;
var appStatus = {needsFetch: true, lastFetchedMonth: "none"};
//Data for ajax intervall content
var intervall = new Array();
var tempCell = new Array();
var tempIntDesc = [];
var selectedMap = "no map"; 
var x = "";
var y = "";
var s = "";
//Data for intervall list
var tempIntervall = [];
var minSlider = 0;
var maxSlider = 0;

var applicationVariables = {
    calendarFirstLoad   : true,
    calendarMode        : "user", //or cell
    currentCell         : "none",
    droppedWorkoutId    : "",
    timezone            : new Date().getTimezoneOffset()/60,
    feedPage            : 2,
    selectedElements    : 0,
    intervallInput      : [],
    intervallSliderUsed : false,
}

//Global functions, declared in jquery init
var updateCalendar;

$(document).ready(function(){
        
        
        
        $('#scrollbar1').tinyscrollbar();

		$('#fullcalendar').fullCalendar({
			// put your options and callbacks here
			height: 600,
			theme: true,
            editable: true,
            ignoreTimezone: false,
			eventClick: function(event) {	
				if (event.url) {
				//the launched function readjusts UI and send httprequest for view
				//UIreposition(event); //event.url, event.start, event.end, event._id);
				moveUI('View');
                
                $.getJSON(event.url, function(workout) {
                    initView(workout, event);       
                });
                
                return false;
			    }
            },     
            viewDisplay: function(view) {
                //Essential for first load, or calendar loads to fast without Fb authentication and cant find data
                if(applicationVariables.calendarFirstLoad){
                    setTimeout(function() {
                        updateCalendar();
                        updateUnreadNotifications();
                    }, 1000);
                    applicationVariables.calendarFirstLoad = false;
                }
                else{
                    updateCalendar();
                }
                
            },
            eventDragStart: function(event, jsEvent, ui, view) {    		
			    //var x = isElemOverDiv(ui, $('div.external-events'));
			    applicationVariables.droppedWorkoutId = event.refWorkout;			
			    $('#fullcalendar').fullCalendar('revertEvent', jsEvent);
			    		
		    },
            eventDragStop: function (event, jsEvent, ui, view ) {
              
            }
		});
        
        
        //Unread notifications
        
        
		$('#mainContent').corner();
		$('#xfbmlPic').corner();
        $('#cellMessageInput').corner("5px");

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

		
        //// !!!---------------App  Dialog	declarations ------------------///
        //
        //
        // !!!--------------------------------------------------------------///
        
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
        
        $('#inviteFriends').dialog({
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
                    
                    $.ajax({
                        url: inviteToCell + applicationVariables.currentCell + "/" + $('#cellTitle').html() + "/",
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify(getSelectedElements('friendPic', 'inviteFriendList')),
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
                    
                    document.getElementById('inviteFriendList').innerHTML = "";
                    applicationVariables.selectedElements = 0;
                    $(this).dialog("close"); 
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}
		});
    
        
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
        
        
        ///-----------------------------------------------------------------////
        //
        // ***** UNIT Conversition code when inputing distance workout *******
        //
        //-----------------------------------------------------------------////
        
        function qtipUnitHelperContent(){
            if($('#radioTime').is(':checked') === true ){
                timeToSec($('#bigInput').val(), $('#smallInput').val(), function(res){
                     //$('#bigInput').qtip({content: { text: res + ' seconds' }});
                    $('#bigInput').qtip({
                        content: {
                            text: res + ' minutes'
                        },
                        show: {
                            ready: true
                        },
                        style: {
                            widget: true 
                        },
                        position: {
                            my: 'right center',
                            at: 'left center'
                        },
                        
                        api: {
                            onShow: function() { 
                                setTimeout(this.hide, 1000); /// hide after a second
                            }
                        }
                    });   

                });
                //var qtip = jQuery('#bigInput').qtip('api');
                //qtip.show();
            }
            else{
                toMeters($('#bigInput').val(), $('#smallInput').val(), function(res){
                    //$('#bigInput').qtip({content: { text: res + ' meters or ' + (Math.round(1.609344*parseFloat(res/1000))*100)/100 + ' miles' }, show: true});
                    $('#bigInput').qtip({
                        content: {
                            text: res + ' meters (' + (Math.round(1.609344*parseFloat(res/1000)*100)/100) + ' miles)' 
                        },
                        show: {
                            ready: true
                        },
                        style: {
                            widget: true 
                        },
                        position: {
                            my: 'right center',
                            at: 'left center'
                        }
                    });
                });
            }  
        }
        
        //Event handlers for displaying a qtip with minute/meter coversion
        $('.qtipUnitHelper').bind('focus keypress change keydown keyup click', function(){
    		  qtipUnitHelperContent();
           
		});
        
        $('.qtipUnitHelper').bind('blur', function(){
            var qtip = jQuery('#bigInput').qtip('api');
            qtip.hide();
            
        });
        /*
        $('.qtipUnitHelper').keyup(function(){
        	  qtipUnitHelperContent();
            
		});*/
        
        //-------------------MAP RELATED JQUERY -----------------------------//
        //
        //
        //--------------------------------------------------------------------
        
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
			var polypathObject = google.maps.geometry.encoding.encodePath(poly.getPath());//.getArray();
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
                
                var object =  {
                 
                    markers : markersObject,
                    path : polypathObject
                    
                }
                
				var httpRequestUrl = restPost_newParcour + nameOfCourse + "/" + totalDistance; 

				//Essential to break circular reference, else stringify will fail
				clearMap();

				//Send to server via httppost			
                postJson(JSON.stringify(object), httpRequestUrl, function(){
                   //reinitialise maps and lcear ui
                   distance = 0;
                   markerArray = [];
                   lastAddedDistance = [];
                   $("#courseName").val('');
                   document.getElementById('distance').innerHTML = "0";
                   //populate dropdowns with new user data
                   refreshDropdown();
                });
			}

		});
        
        //To send a delete trace to server
        $('#unSaveTrace').click(function(){
           var parcourId = $("#dropdownMap").val();
           
           $.getJSON(deleteParcour + parcourId, function(data) {
                if(data.success){
                    Notifier.success(data.message);
                    refreshDropdown();
                    distance = 0;
                    markerArray = [];
                    lastAddedDistance = [];
                    $("#courseName").val('');
                    document.getElementById('distance').innerHTML = "0";
                }
                else{
                //something wrong
                    Notifier.error(data.message);
                }   
            });
           
           
            
        });
        
        //------------- Intervall interface logic -----------------------------
        //
        //---------------------------------------------------------------------
        
        var addIntervallInput = function(elementNumber){
            
        var html = '<div class="intervallInputElement" elementNumber="'+ elementNumber + '"><div style="float: left; width: 130px;" class="targetDiv"> <select class="metricType" element="0"><option value="m">meters</option>' 
            +'<option value="s">seconds</option></select><input type="text" class="metricValue" size="1" ></div><div class="metricDiv" style="float: left; width: 180px;"> <select class="targetType" element="0"><option value="none">none</option>'
            + '<option value="bpm">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select><span class="targetValue"></span></div>'
            + '<div style="float: left; width: 130px" class="descContainer"> <input type="text" class="intervallDescription" element="0" size="16" ></div><div class="removeIntervallIcon" style="float: left; width: 20px; cursor: pointer"><span class="ui-icon ui-icon-closethick"></span></div>'
            + '<div class="sliderIntervallContainer" style="margin-right: 200px; display: none; float:right;"></div></div>'    
           
            $('#intervallInputContainer').append(html);
            
            //kill any previous handler so theres no snowball effect
            $('.removeIntervallIcon').die();
            
            $('.removeIntervallIcon').click(function(){
                $(this).parent().remove();
		    });
            
            
            refreshSlider();
           
        }
        
        var refreshSlider = function(){
        
            $('.metricDiv').die();
            $('.targetType').die();
        
            $('.targetType').change(function(){

                var parent = $(this).closest('.metricDiv');
                var value = $(this).val();
                var sliderContainer = $(this).closest('.metricDiv').closest('.intervallInputElement').children('.sliderIntervallContainer');
                sliderContainer.show();
                
                $("#sliderIntervallIntensity").slider("destroy");
                $("#sliderIntervallIntensity").remove();
                
                sliderContainer.append('<div id="sliderIntervallIntensity" style="width:100px;"></div>');
                
                if(value === "bpm"){
    
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 5,
                        min: 0, max: 300, value: 150,
                        slide: function(event, ui){   
                             parent.children('.targetValue').html(ui.value);
                        },
                        stop: function(event, ui) { 
                            $(this).hide();
                        }
                     });
                     parent.children('.targetValue').html(150);
                     //createQtip(parent);
                     
                }
                else if(value === "watt"){
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 5,
                        min: 0, max: 600, value: 300,
                        slide: function(event, ui){ 
                             parent.children('.targetValue').html(ui.value);
                        },
                        stop: function(event, ui) { 
                            $(this).hide();
                        }
                     });
                     parent.children('.targetValue').html(300);
                     //createQtip(parent);
                }
                else if(value === "%"){
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 5,
                        min: 0, max: 100, value: 50,
                        slide: function(event, ui){ 
                             parent.children('.targetValue').html(ui.value);
                        },
                        stop: function(event, ui) { 
                            $(this).hide();
                        }
                     });
                     parent.children('.targetValue').html(50);
                     //createQtip(parent);
                }
                else if(value === "range"){
                    $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: true,
                        step: 5,
                        min: 0, max: 300,
                        values: [30, 60],
                        slide: function(event, ui){ 
                            var minValueHtml = '<span class="intervallMin" seconds="' + ui.values[0] + '">' + Math.floor(ui.values[0] / 60) +":" + (ui.values[0] - (Math.floor(ui.values[0] / 60) * 60)) + '</span>';
                            var maxValueHtml = '<span class="intervallMax" seconds="' + ui.values[1] + '">' + Math.floor(ui.values[1] / 60) +":" + (ui.values[1] - (Math.floor(ui.values[1] / 60) * 60)) + '</span>';
                            parent.children('.targetValue').html(minValueHtml + " - " + maxValueHtml + " min");

                        },
                        stop: function(event, ui) { 
                            if(!applicationVariables.intervallSliderUsed){
                                applicationVariables.intervallSliderUsed = true;
                            }
                            else{
                               applicationVariables.intervallSliderUsed = false;
                               $(this).hide(); 
                            }
                            
                        }
                    });
                    var minValueHtml = '<span class="intervallMin" seconds="' + 30 + '">' + Math.floor(30 / 60) +":" + (30 - (Math.floor(30 / 60) * 60)) + '</span>';
                    var maxValueHtml = '<span class="intervallMax" seconds="' + 105 + '">' + Math.floor(105 / 60) +":" + (105 - (Math.floor(105 / 60) * 60)) + '</span>';
                    parent.children('.targetValue').html(minValueHtml + " - " + maxValueHtml + " min");       
                }
                else{ //none
                   $("#sliderIntervallIntensity" ).slider({disabled: true});
                   sliderContainer.hide();
                   parent.children('.targetValue').html("");
                }
                
            });
        
        }
       
       refreshSlider();
        
        
        
        $('#addAnotherIntervall').click(function(){
            addIntervallInput(1);
            createIntervallModel();
            
        });

        
		 var createIntervallModel = function(elementNumber){
            
            //applicationVariables.intervallInput = [];
			
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

		

        ///// MAPPING NAVIGATION BUTTONS 
        $('#goToSocial').click(function(){
            applicationVariables.calendarMode = "user";
            applicationVariables.feedPage = 2;
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
            
            var droplistHtml = "<option value='none'>No Course</option>" ;
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
        updateCalendar = function (){
            
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
                //var contentObject = jQuery.parseJSON(receivedObject.content);
                //loadPolylines(contentObject.polylines);
                decodeToMap(data.path)
                loadMarkers(data.markers.latlng, data.markers.titles);
                document.getElementById('distance').innerHTML = data.distance;
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

        var grabNewCellInput = function(){
            
            var object = {
                name         : $("input[type=text][id=cellName]").val(),
                location     : $("#cellLocationSelect").val(),
	            description  : $("#cellDescription").val(),
                isPrivate    : $('#isCellOnInvite').is(':checked')
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
           $.getJSON('/cell/details/' + id, function(data) {
                if(data.success){
                    if(data.message === 'This cell is private'){
                        UILoadNewState('emptyView');
                        document.getElementById('emptyView').innerHTML = '<span style="font-family: impact; font-size: 20px;">This cell is invite only. Sorry.</span>';
                    }else{
                        applicationVariables.calendarMode = "cell";
                        applicationVariables.currentCell = id;
                        initCellView(data.message);
                        UILoadNewState('cellView');
                        updateCalendar();
                    }
                }
                else{
                    //something wrong
                    Notifier.success(data.message);
                }
           });
        });
        
        $('.cellLink').live('click',function(){
           var id = $(this).attr('refId');
           applicationVariables.calendarMode = "cell";
           applicationVariables.currentCell = id;
           initCellView(id);
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
        
        
        $('.cellNotificationMessage').live('click',function(){
           var id = $(this).attr('userId');
           applicationVariables.calendarMode = "user";
           initUsersProfile(id);
           UILoadNewState('profileView');
        });
        
        $('.cellMessage').live('click',function(){
            var id = $(this).attr('refId');
           applicationVariables.calendarMode = "cell";
           applicationVariables.currentCell = $(this).attr('refId');
           initCellView(id);
           UILoadNewState('cellView');
           updateCalendar();
        });
        
        $(".selectableinviteFriendList").live('click', function(){
            if($(this).attr('select') === "no"){
                $(this).attr('select', "yes"); 
                $(this).css('border', 'solid 4px #00A300');
                applicationVariables.selectedElements++;
            }
            else{
                $(this).attr('select', "no"); 
                $(this).css('border', 'solid 0px white');
                applicationVariables.selectedElements--;
            }
        });
        
         $('.cellNotificationNewWorkout').live('click',function(){
             initView(workout, event); 
         });
        
        $('#postCellComment').live('click', function(){
           
           var comment = $('#cellCommentInput').val();
           var cell = applicationVariables.currentCell;
           
           if(comment.length < 160 && comment !== "Post a comment ..." && comment.length > 10){
               $.getJSON(postCellComment + "/" + cell + "/" + comment , function(data) {
                    if(data.success){
                        initCellView(cell);
                        $('#cellCommentInput').val('Post a comment ...');
                        //UILoadNewStateNoAnimation('cellView');
                    }
                    else{
                        
                    }
               });
           }
           else{
               Notifier.error('Message too long or short or invalid.');
           }
        });
        
        /*
        $('.cellNotificationNewWorkout').live('click', function(){
           var workoutId = $(this).attr('workoutId');
           $.getJSON('/workout/' + workoutId, function(data) {
                initView(data)
                moveUI('View');
            });
        });*/
        
        var populateCellDropList = function(){
            
            //clear select
            $('#cellSelection option').each(function(index, option) {
                $(option).remove();
                droplistHtml = "<option value='yourself'>Yourself</option>";
                $(droplistHtml).appendTo("#cellSelection");
            });
            
            $.getJSON(getAllCell, function(data) {
                if(data.success){
                    if(data.message !== "You are not part of any cells."){
                        for(i = 0; i < data.message.length;i++){
                            droplistHtml = "<option value='" +  data.message[i].cellDetails + "'>"+ data.message[i].name+"</option>";
                            $(droplistHtml).appendTo("#cellSelection");
                        } 
                    }
                }
                else{
                //something wrong
 
                }   
            });  
        }
        
        var updateUnreadNotifications = function(){
            
            $.getJSON(getUnreadNotification, function(res) {
                
                if(res.message !== 0){
                    $("#goToSocial").qtip({
                        content: {
                            text: res.message + ' new notifications'
                        },
                        show: {
                            event: false, 
                            ready: true
                        },
                        position: {
                            my: 'left center', // Use the corner...
                            at: 'right center' // ...and opposite corner
                        },
                        hide: false,
                        style: {
                            widget: true 
                        }
                    }); 
                }
            });
            
        }
        
        
        function toMeters(km, m, callback){
            if(m === "" && km === ""){
                callback(0);
            }
            else if(km === ""){
                callback(parseInt(m)); 
            }
            else if(m === ""){
                callback((parseInt(km) * 1000)); 
            }
            else{
                callback((parseInt(km) * 1000) + parseInt(m)); 
            } 
        }
        
        function timeToSec(m, s, callback){
            if(s === "" && m === ""){
                callback(0);
            }
            else if(m === ""){
                 callback(parseInt(s));
            }
            else if(s === ""){
                 callback(60*parseInt(m)); 
            }
            else{
                 callback((60*parseInt(m)) + parseInt(s));
            }
              
            
        }
        
        //Menu in cell view
        $("#cellOptionsButton").qtip({
            content: {
                text: $("#viewCellOptionsContent").html()
            },
            show: {
                event: 'click', 
            },
            position: {
                my: 'left center', // Use the corner...
                at: 'right center' // ...and opposite corner
            },
            hide: {
                event: 'click', 
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
        
        $('#markRead').click(function(){
            $.getJSON(resetNotificationCount, function(res) {
               $("#goToSocial").qtip({hide: true});
            }); 
        });
        
        $('#getMoreNews').click(function(){
            $.getJSON(getNotfication + "/" + applicationVariables.feedPage, function(data) {
                if(data.success){
                    renderNotifications(data.message, false);
                    applicationVariables.feedPage++;
                }
                else{
                    //something wrong
                    Notifier.success(data.message);
                }   
            });   
        });
        
        
        //  !!!!!!-_-_-_-_-_- Drag and drop code -_-_-_-_-_- !!!!!!
        
        $('#Create').droppable({
    		accept: ".fc-event",
            drop: function( event, ui ) {
			    if(applicationVariables.droppedWorkoutId !== ""){
                    //alert(applicationVariables.droppedWorkoutId);
                    ui.draggable.draggable({ revert: true });
                    populateTemplate(applicationVariables.droppedWorkoutId);
                    applicationVariables.droppedWorkoutId = "";
			    }
                
			}
		});
        
        $('body').droppable({
        	accept: ".fc-event",
            drop: function( event, ui ) {
                ui.draggable.draggable({ revert: true });
                applicationVariables.droppedWorkoutId = "";
			}
		});


        initHeaderBar();
       
//END OF MODULE FUNCTIONS
});
