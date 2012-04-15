
var executeSearch;

function initHeaderBar(){
    
/*    
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
*/        
      
$('#searchIconButton').live('click', function(){
    
    $('#moreSearchResults').hide();
    $('#moreSearchResults').attr('page', 1);
    executeSearch(1);

});

executeSearch = function(page){
    var nameSearch = $.trim(document.getElementById("inputSearchUsers").value);
    var theUrl;
    var arrayOfName = nameSearch.split(" ");
    
    if($('#radio41').attr('checked') === 'checked'){
        if(arrayOfName.length === 1){
            theUrl = seachSingleName  + arrayOfName[0] + "/" + page;
        }
        else{
            theUrl = searchFullName + "/" + arrayOfName[0] + "/" + arrayOfName[1];   
        }
    }
    else{
        theUrl = searchByLocation  + arrayOfName[0] + "/" + page;
    }
    
    if(arrayOfName.length >= 1){ //fullname search
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

                        renderSearchHtml(data.message, arrayOfName, function(){
                            if(data.message.length > 4){
                                $('#moreSearchResults').show();   
                            }
                            else{
                                $('#moreSearchResults').hide();
                            }
                            
                            //$('#searchDialog').dialog('open');
                        });

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
} 
   
        
//This will no nothing if result is empty, if not, it will process the array an xfbml it.
var renderSearchHtml = function(arrayResult, fullname, callback){
     
     
    if(arrayResult.length === 0){
        document.getElementById('searchResultContainer').innerHTML = "No results found for " + fullname + ". Maybe there is a typo?<br>";  
        callback();      
    }
    else{
       var overallHtml = "<table width='100%'>";
       for(i = 0; i < arrayResult.length; i++){
          var pictureTag = '<img src="http://graph.facebook.com/' +  arrayResult[i].fbid + '/picture" />'; 
          var name  = "<div style='font-size: 12px; float:left;'><div style='font-weight:bold'>" + arrayResult[i].firstName + " " + arrayResult[i].lastName + "</div><div>" + arrayResult[i].location.name + "</div>";
          var add = "<div id='addToCell" + arrayResult[i].fbid + "' style='float: right; cursor:pointer'> Add to your cell</div>";
          overallHtml = overallHtml + '<tr class="intervallUnit"><td>' + pictureTag + '</td><td valign="middle">' + '</td><td valign="middle">' + name + '</td><td valign="middle"  width="99%">' + add + '</td></tr>';
       }
       document.getElementById('searchResultContainer').innerHTML = overallHtml + '</table>';
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