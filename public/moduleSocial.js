var intiSocialView = function(friendList, notificationList, cellTree){
    
    if(friendList){
        $.getJSON(getFriendCell, function(data) {
            if(data.success){
                renderFriendList(data.message);   
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        }); 
    }
    if(notificationList){
        $.getJSON(getNotfication, function(data) {
            if(data.success){
                renderNotifications(data.message);   
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        });  
    }

}

var renderNotifications = function(arrayNotification){
    
    document.getElementById('notificationList').innerHTML = "";
    
    if(arrayNotification.length === 0){
        document.getElementById('notificationList').innerHTML = "No pending notifications";     
    }
    
    for(i = 0; i < arrayNotification.length; i++){
    
        if(arrayNotification[i].type === "joinMasterCell"){
            createFriendRequestElement(arrayNotification[i]);  
        }        
    }
       
}


var renderFriendList = function(arrayResult){
     
    if(arrayResult === []){
        callback();      
    }
    else{
       var overallHtml = "";
       for(i = 0; i < arrayResult.length; i++){
          var pictureTag = '<span id="friendPic' + i + '" style="padding-left: 3px; cursor: pointer;"><fb:profile-pic uid="' + arrayResult[i] + '" facebook-logo="false" linked="false" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
          overallHtml = overallHtml + pictureTag + '</span>';
       }
       document.getElementById('friendList').innerHTML = overallHtml;
       for(i = 0; i < arrayResult.length; i++){
           $("#friendPic" + i).qtip({
                content: {
                    text: 'Loading data...',
                    ajax: {
                        url: "/user/snippet/" + arrayResult[i]
                    }
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
       
       FB.XFBML.parse(document.getElementById('friendList'));

    }  
}

var createFriendRequestElement = function(object){
 
    var html = '<div id="singlenotification" >' + object.message + '<span id="declineFriend' + object.refId + '" class="ui-icon ui-icon-close" style="float: right"></span>' +
    '<span id="acceptFriend' + object.refId + '" class="ui-icon ui-icon-check" style="float: right"></span></div>';
 
    document.getElementById('notificationList').innerHTML = document.getElementById('notificationList').innerHTML + html;
    
    $('#acceptFriend' + object.refId).live('click', function(){
        var theUrl = "/notification/joinMasterCell/" + authId +"/" + object.refId + "/accept";
        $.getJSON(theUrl, function(data) {
            if(data.success){
                intiSocialView(true, true, false);
                Notifier.success(data.message);
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        }); 
    });

    $('#declineFriend' + object.refId).live('click', function(){
        var theUrl = "/notification/joinMasterCell/" + authId +"/" + object.refId + "/decline";
        $.getJSON(theUrl, function(data) {
            if(data.success){
                intiSocialView(true, true, false);
                Notifier.success(data.message);
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        }); 
    });

 
}


