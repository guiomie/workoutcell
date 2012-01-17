var moveUI = function(newUI) { 

	if (newUI == 'Social'){
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
                
                if(panelState !== "largeCalendar"){
                    $("#" + panelState).hide("slide", {}, 1000, function(){
    			        $("#Social").show("slide", {}, 1000);
				        panelState = 'Social';
			        });	
			    }
                else{
                    $("#Social").show("slide", {}, 1000);
    			    panelState = 'Social';    
                }
			});			
		}
	}
    else if(newUI == 'Create'){
		//Block re-rendering of widget if already choosen
		if(panelState !== 'Create'){					
			// Change calendar size
			$("#fullcalendar").animate({ 
				height: "500px", 
				width: "500px", 
			}, 1000, function(){
			    //resize calendar, seems to be a glitch
			    $('#fullcalendar').fullCalendar('render');
                if(panelState !== "largeCalendar"){
                    $("#" + panelState).hide("slide", {}, 1000, function(){
    		            $("#Create").show("slide", {}, 1000);
			            panelState = 'Create';
		            });
		        }
                else{
                    $("#Create").show("slide", {}, 1000);
    		        panelState = 'Create';    
                }
		  });
	    }
	}
	else if(newUI == 'Map'){
		//Block re-rendering of widget if already choosen
		if(panelState !== 'Map'){					
			// Change calendar size
			$("#fullcalendar").animate({ 
				height: "500px", 
				width: "500px", 
			}, 1000, function(){
				//resize calendar, seems to be a glitch
				$('#fullcalendar').fullCalendar('render');
                //Transit between user panel functionality
			    if(panelState !== "largeCalendar"){
                    $("#" + panelState).hide("slide", {}, 1000, function(){
				        $("#Map").show("slide", {}, 1000, function(){
					        if(map === undefined){
						        initialize();
					        }
				        });
				        panelState = 'Map';
			        });
			    }
                else{
                    $("#Map").show("slide", {}, 1000, function(){
					    if(map === undefined){
				            initialize();
					    }
			        });
				    panelState = 'Map';
                }
		    });
		}
	}
    else if(newUI == 'largeCalendar'){
        if(panelState !== 'largeCalendar'){
            if(panelState !== "largeCalendar"){
			    //Transit between user panel functionality
			    $("#" + panelState).hide("slide", {}, 1000, function(){
                    $("#fullcalendar").animate({ 
        		        height: "500px", 
				        width: "1000px", 
			        }, 1000, function(){
				    //resize calendar, seems to be a glitch
				        $('#fullcalendar').fullCalendar('render');
			        });
				    panelState = 'largeCalendar';
			    });
            }
        }
        
    }
	else{

	}
			/*
			*/
} 



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
		});
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
			width: "900px", 
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

        
function UILoadNewState(newState){

    //Transit between user panel functionality
	$("#" + panelState).hide("slide", {}, 1000, function(){

		$("#" + newState).show("slide", {}, 1000);
		panelState = newState;
	});   
}