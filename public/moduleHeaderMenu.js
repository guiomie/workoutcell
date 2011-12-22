


function initHeaderBar(){
    
    
$("#goToSearch").qtip({
    id: 'themeroller',
    content: $('.searchQtip'),
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
    
    var nameSearch = $.trim(document.getElementById("inputSearchUsers").value);
    
    var arrayOfName = nameSearch.split(" ");
    var theUrl = searchFullName + "/" + arrayOfName[0] + "/" + arrayOfName[1];
    
    if(arrayOfName.length === 2){ //fullname search
            $.ajax({
                url: theUrl,
                type: "GET",
                cache: false,
                timeout: 5000,
                complete: function() {
                    //called when complete 
                    Notifier.info('Searching ...');

                },
                success: function(data) {
                    //var res =jQuery.parseJSON(data);
                    //callback('Sending: ' + data);
                    if(data.success){
                        //Notifier.success();
                        renderSearchHtml(data.message, function(){
                            
                            $('#searchDialog').dialog('open');
                        });
                        //$('#searchDialog').dialog('open');
                        //return false;  
                    }
                    else{
                       Notifier.error(data.message); 
                      
                    }
                },

                error: function() {
                    //callback('Operation failed');
                    Notifier.error('Could not send data to server');
                     
                },
            });
    } //singe name search
    else if(arrayOfName.length === 1){
        
        
    }
    else{
        
    }
 
});   
        
//This will no nothing if result is empty, if not, it will process the array an xfbml it.
var renderSearchHtml = function(arrayResult, callback){
     
    if(arrayResult === []){
        callback();      
    }
    else{
       var overallHtml = "";
       for(i = 0; i < arrayResult.length; i++){
          var pictureTag = '<fb:profile-pic uid="' + arrayResult[i].fbid + '" facebook-logo="false" linked="true" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
          var name  = arrayResult[i].firstName + " " + arrayResult[i].lastName + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span id='addToCell' style='float: right;'> Add to your cell</span>";
          overallHtml = overallHtml + pictureTag + name;
       }
       document.getElementById('searchDialog').innerHTML = overallHtml;
       FB.XFBML.parse(document.getElementById('searchDialog'));
       callback();
    }  
}
    
    
// Dialog    		
$('#searchDialog').dialog({
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
    }

});   



}