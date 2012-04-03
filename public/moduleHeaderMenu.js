


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
                        //$('#searchDialog').dialog('open');
                        renderSearchHtml(data.message, arrayOfName, function(){
                            
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
    } //single name search
    else if(arrayOfName.length === 1){
        Notifier.error('Please enter the full name. ex: Lance Armstrong');
        
    }
    else{
        Notifier.error('Please enter the full name. ex: Lance Armstrong');
    }
 
});   
        
//This will no nothing if result is empty, if not, it will process the array an xfbml it.
var renderSearchHtml = function(arrayResult, fullname, callback){
     
    if(arrayResult.length === 0){
        document.getElementById('searchDialog').innerHTML = "No found results for " + fullname + ". Maybe there is a typo?<br><br><span style='font-size: 15px;'>Other users near you:</span>  <br><br> No one in your location";  
        callback();      
    }
    else{
       var overallHtml = "<table width='100%'>";
       for(i = 0; i < arrayResult.length; i++){
          var pictureTag = '<img src="http://graph.facebook.com/' +  arrayResult[i].fbid + '/picture" />'; 
          var name  = "<div style='font-size: 12px; float:left;'><div style='font-weight:bold'>" + arrayResult[i].firstName + " " + arrayResult[i].lastName + "</div><div>" + arrayResult[i].location + "</div>";
          var add = "<div id='addToCell" + arrayResult[i].fbid + "' style='float: right; cursor:pointer'> Add to your cell</div>";
          overallHtml = overallHtml + '<tr><td>' + pictureTag + '</td><td valign="middle">' + '</td><td valign="middle">' + name + '</td><td valign="middle"  width="99%">' + add + '</td></tr>';
       }
       document.getElementById('searchDialog').innerHTML = overallHtml + '</table><br><br><span style="font-size: 15px;">Other users near you:</span>  <br> No one in your location';
       //FB.XFBML.parse(document.getElementById('searchDialog'));
       
       //add click handlers to each add user
       for(i = 0; i < arrayResult.length; i++){
            var theUrl = "/notification/add/" + authId + "/joinMasterCell/" +  arrayResult[i].fbid;
            $('#addToCell' + arrayResult[i].fbid).live('click', function(){
                
                $.getJSON(theUrl, function(data) {
                    if(data.success){
                        $('#searchDialog').dialog('close');
                        Notifier.success(data.message);
                    }
                    else{
                        //something wrong
                        $('#searchDialog').dialog('close');
                        Notifier.success(data.message);
                    }   
                }); 
            });
       }
       callback();
    }  
}
    


}