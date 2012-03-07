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
var addIntervallInput;

$(document).ready(function(){

        $('#scrollbar1').tinyscrollbar();
        
        //----Jcalendar initialisation ----------------------//
        //
        //
        //--------------------------------------------------//
        
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
                $('#drophere').show();
			    		
		    },
            eventDragStop: function (event, jsEvent, ui, view ) {
                $('#drophere').hide();
            }
		});

        //--------------------------------------------------------
        //      Rounded corner initialisation
        //--------------------------------------------------------
        
		$('#mainContent').corner();
		$('#xfbmlPic').corner();
        $('#cellMessageInput').corner("5px");
        
        
        //--------------------------------------------------------
        //       Carousel initiation (jcarousel)  
        //       http://sorgalla.com/projects/jcarousel/
        //--------------------------------------------------------
        
        $('#mycarousel').jcarousel();
        
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
			width  : 550,
            height : 500,
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
            var staticMap = "http://maps.googleapis.com/maps/api/staticmap?size=300x300&sensor=false&path=weight:3%7Ccolor:red%7Cenc:" + polypathObject;
            //Transform the golbal variable of marker to a non circular json 
            markertTitleArray(markerArray, function(titleArray){
               
               markerLatLngArray(markerArray, function(latArray){
               
                    markersObject = { titles: titleArray, latlng: latArray };
                    staticMap = staticMap + markerString;
               });
            });
            
            if(nameOfCourse === 'Save course as ...' || nameOfCourse === ' '){
                nameOfCourse = "MyCourse" + $('#dropdownMap option').length;  
            }
            			
			if(polypathObject.length === 0 || markerArray.length === 0 || nameOfCourse === "" ){

			    //alert("Missing data Entry. Create course or make sure a name is entered");
			    Notifier.error("Please fill in all required inputs");
			}
            else{
                
                var object =  {
                 
                    markers   : markersObject,
                    path      : polypathObject,
                    staticUrl : staticMap
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
                   markerString = "";
                   $("#courseName").val('Save course as ...');
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
        
        
        $("#dropdownMap").change(function() { 
            
            var url = getParcour + $(this).val();
            $.get(url, function(data){
                clearMap();
                distance = 0;
                markerArray = [];
                decodeToMap(data.path)
                loadMarkers(data.markers.latlng, data.markers.titles);
                document.getElementById('distance').innerHTML = data.distance;
                
            }, "json");

        }); 
        
        
        //------------- Intervall interface logic -----------------------------
        //
        //---------------------------------------------------------------------
        

        
        
        addIntervallInput = function(metricType, metricValue, targetType, targetValue, intervallDescription, quantity, minSec, maxSec){
            
            var firstOption = '<select class="metricType" element="0"><option value="m">meters</option><option value="s">seconds</option><option value="min">minutes</option></select>';
            var secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm">rpm</option><option value="kmh">km/h</option><option value="bpm">bpm</option><option value="range">range</option><option value="%" >%</option><option value="watt">watt</option></select>';
            var theMetricValue = metricValue;
            
            var quantityValue = quantity;
            
            if(quantity === ""){
               quantityValue = 1; 
            }
            
            
            if(targetType === "m"){
                firstOption =  '<select class="metricType" element="0"><option value="m" selected="selected">meters</option><option value="s">seconds</option><option value="min">minutes</option></select>';   
            }
            if(targetType === "min"){
                firstOption =  '<select class="metricType" element="0"><option value="m">meters</option><option value="s">seconds</option><option value="min" selected="selected">minutes</option></select>';   
            }
            else{
                firstOption =  '<select class="metricType" element="0"><option value="m" >meters</option><option value="s" selected="selected">seconds</option><option value="min">minutes</option></select>';
            }
            
            
            if(metricType === "%"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm">rpm</option><option value="kmh">km/h</option><option value="bpm">bpm</option><option value="range">range</option><option value="%" selected="selected">%</option><option value="watt">watt</option></select>'
            }
            else if(metricType === "range"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="bpm">bpm</option><option value="range" selected="selected">range</option><option value="%">%</option><option value="watt">watt</option></select>'
                minValueHtml = '<span class="intervallMin" seconds="' + minSec + '">' + Math.floor(minSec / 60) +":" + (minSec - (Math.floor(minSec / 60) * 60)) + '</span>';
                maxValueHtml = '<span class="intervallMax" seconds="' + maxSec + '">' + Math.floor(maxSec / 60) +":" + (maxSec - (Math.floor(maxSec / 60) * 60)) + '</span>';
                theMetricValue = minValueHtml + " - " + maxValueHtml + " min";
            }
            else if(metricType === "watt"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm">rpm</option><option value="kmh">km/h</option><option value="bpm">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt" selected="selected">watt</option></select>'       
            }
            else if(metricType === "bpm"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm">rpm</option><option value="kmh">km/h</option><option value="bpm" selected="selected">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select>'
            }
            else if(metricType === "rpm"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm" selected="selected">rpm</option><option value="kmh">km/h</option><option value="bpm" >bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select>'
            }
            else if(metricType === "kmh"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie">calories</option><option value="rpm">rpm</option><option value="kmh"  selected="selected">km/h</option><option value="bpm">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select>'
            }
            else if(metricType === "calorie"){
                secondOption = '<select class="targetType" element="0"><option value="none">none</option><option value="calorie"  selected="selected">calories</option><option value="rpm">rpm</option><option value="kmh">km/h</option><option value="bpm">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select>'
            }
            else{
                //secondOption = '<select class="targetType" element="0"><option value="none" selected="selected">none</option><option value="bpm">bpm</option><option value="range">range</option><option value="%">%</option><option value="watt">watt</option></select>'
            }


        
            var html = '<div class="intervallInputElement"><div style="float: left; width: 150px;" class="targetDiv">'+ firstOption +'<input type="text" class="metricValue" size="1" value="' + targetValue +'">&nbsp;<input type="text" class="quantityValue" size="1" value="' + quantityValue +'"></div><div class="metricDiv" style="float: left; width: 180px;">' + 
                secondOption +'<span class="targetValue">' + theMetricValue + '</span></div><div style="float: left; width: 110px" class="descContainer"> <input type="text" class="intervallDescription" element="0" size="13" value="' + intervallDescription + '"></div><div class="removeIntervallIcon"' + 
                'style="float: left; width: 20px; cursor: pointer"><span class="ui-icon ui-icon-closethick"></span></div><div class="sliderIntervallContainer" style="margin-right: 200px; display: none; float:right;"></div></div>'    
           
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
                else if(value === "calorie"){
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 50,
                        min: 0, max: 1200, value: 500,
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
                else if(value === "rpm"){
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 5,
                        min: 0, max: 120, value: 50,
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
                else if(value === "kmh"){
                     $("#sliderIntervallIntensity" ).slider({
                        disabled: false, range: "min",
                        step: 5,
                        min: 0, max: 70, value: 20,
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
        
        //addIntervallInput("bpm", "200", "m", "100", "totototot", "", "");
        //addIntervallInput("range", "200", "m", "100", "totototot", "30", "120");
        //addIntervallInput("%", "70", "s", "100", "totototot", "", "");
        
        $('#addAnotherIntervall').click(function(){
            addIntervallInput("", "", "", "", "", "", "");
            //addIntervallInput();
            //createIntervallModel();
            
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
                droplistHtml = "<option value='" +  obj[i].realId + "' distance='" +obj[i].distance + "'  staticUrl='"+ obj[i].staticUrl +"'>"+ obj[i].name+"</option>";
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
         
        $('.cellMessage').live('click',function(){
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
                        var id = $(this).attr('refId');
                        $.getJSON('/cell/details/' + cell, function(data) {
                            if(data.success){
                                if(data.message === 'This cell is private'){
                                    UILoadNewState('emptyView');
                                    document.getElementById('emptyView').innerHTML = '<span style="font-family: impact; font-size: 20px;">This cell is invite only. Sorry.</span>';
                                    $('#cellCommentInput').val('Post a comment ...');
                                }else{
                                    applicationVariables.calendarMode = "cell";
                                    initCellView(data.message);
                                    //UILoadNewState('cellView');
                                    //updateCalendar();
                                    $('#cellCommentInput').val('Post a comment ...');
                                }
                            }
                            else{
                                //something wrong
                                Notifier.success(data.message);
                                $('#cellCommentInput').val('Post a comment ...');
                            }
                        });
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
            });
            
            //Add back basic
            droplistHtml = "<option value='yourself'>Yourself</option>";
            $(droplistHtml).appendTo("#cellSelection");
            
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
        
        $('#descriptionInput').focus(function(){
            if($(this).val() == "Enter a description for this workout"){
                $(this).val("");
             }
        });
        $('#descriptionInput').blur(function(){
              if($(this).val() == "" || $(this).val() == "Enter a description for this workout"){
                  $(this).val("Enter a description for this workout");
              }
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
                    $('#drophere').hide();
			    }
                
			}
		});
        
        $('body').droppable({
        	accept: ".fc-event",
            drop: function( event, ui ) {
                ui.draggable.draggable({ revert: true });
                applicationVariables.droppedWorkoutId = "";
                $('#drophere').hide();
			}
		});


        initHeaderBar();
       
//END OF MODULE FUNCTIONS
});
