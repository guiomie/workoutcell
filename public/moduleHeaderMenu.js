


function initHeaderBar(){
    
    
$("#goToSearch").qtip({
    id: 'themeroller',
    content: {
        text: $('#searchQtip').html() 
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
    }
});
        
        
$('#searchIconButton').live('click', function(){
    $('#searchDialog').dialog('open');
    return false;  
});    
        
    
    
    
// Dialog    		
$('#searchDialog').dialog({
	autoOpen: false,
	width  : 600,
    height : 600,
    resizable: false,
    draggable: false,
    modal: true,
	buttons: {
		"Ok": function() { 
			$(this).dialog("close"); 
		}, 
		"Cancel": function() { 
			$(this).dialog("close"); 
		} 
	}
});    



}