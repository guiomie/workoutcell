var intiSocialView = function(friendList, notificationList, cellTree){
    
    if(friendList){
        $.getJSON(getFriendCell, function(data) {
            if(data.success){
                renderFriendList(data.message, 'friendList');   
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        }); 
    }
    if(notificationList){
        $.getJSON(getNotfication + "/1", function(data) {
            if(data.success){
                renderNotifications(data.message, true);   
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        });  
    }
    if(cellTree){
        $.getJSON(getAllCell, function(data) {
            if(data.success){
                renderCellList(data.message);   
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        });   
    }

}

//Set second parameter to false if you want to reinitialize the whole feed
var renderNotifications = function(arrayNotification, reInit){
    
    if(reInit){
        document.getElementById('notificationList').innerHTML = "";
    }
    
    if(arrayNotification.length === 0){
        document.getElementById('notificationList').innerHTML =   document.getElementById('notificationList').innerHTML + " <br> No pending notifications";     
    }
    
    for(i = arrayNotification.length; i > 0; i--){
    
        if(arrayNotification[i - 1].type === "joinMasterCell"){
            createFriendRequestElement(arrayNotification[i - 1]);  
        }
        else if(arrayNotification[i - 1].type === "newCellWorkout"){
            createCellWorkoutElement(arrayNotification[i - 1]);
        }
        else if(arrayNotification[i - 1].type === "newCellMessage"){
            createCellMessageElement(arrayNotification[i - 1]);
        }
        else if(arrayNotification[i - 1].type === "joinedWorkoutCell"){
            createCellMessageElement(arrayNotification[i - 1]);
        }
        else if(arrayNotification[i - 1].type === "cellInvite"){
            createCellInviteElement(arrayNotification[i - 1]);
        }
        else{
            
        }
    }
    
    //Notification list interactive behavior
    
    $('.notificationUnit').die();
    $('.notificationUnit').live('mouseenter', function() {
        $(this).find(".removeNotification").show();

    });
    
    $('.notificationUnit').live('mouseleave', function() {
        $(this).find(".removeNotification").hide();

    });
    
    $('.removeNotification').die();
    $('.removeNotification').live('click', function(){
       var parent = $(this).parent().parent();
       
       $.getJSON(removeUserNotification + parent.attr('notificationid') , function(data) {
            if(data.success){
                parent.remove();
            }
            else{
                Notifier.error(data.message);
            }
        });
        
    });
    
    
       
}


var renderFriendList = function(arrayResult, locationId){
     
    if(RealTypeOf(arrayResult) !== "array"){
        document.getElementById(locationId).innerHTML = arrayResult;     
    }
    else{
       var overallHtml = "";
       for(i = 0; i < arrayResult.length; i++){
          var pictureTag = '<div select="no" userid="'+ arrayResult[i] +'" class="selectable' + locationId + '"  id="friendPic'+ locationId + i + '" style="margin-left: 3px; cursor: pointer; float:left;"><img src="http://graph.facebook.com/' + arrayResult[i] + '/picture" />'; 
          overallHtml = overallHtml + pictureTag + '</div>';
       }
       document.getElementById(locationId).innerHTML = overallHtml;
       for(i = 0; i < arrayResult.length; i++){
           $("#friendPic"+ locationId + i).qtip({
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
                hide: {
                    event: 'click',
                    inactive: 1000
                },
                style: {
                    widget: true 
                }
            });   
       }
       
       FB.XFBML.parse(document.getElementById(locationId));

    }  
}

var renderCellList = function(arrayResult){

    if(RealTypeOf(arrayResult) !== "array"){
        document.getElementById('cellList').innerHTML = arrayResult;     
    }
    else{
        var overallHtml = "";
        for(i = 0; i < arrayResult.length; i++){
            overallHtml = overallHtml + createCellListElement(arrayResult[i]);
        }
        document.getElementById('cellList').innerHTML = overallHtml;
        
        for(i = 0; i < arrayResult.length; i++){
            
            $("#cell" + arrayResult[i].cellDetails).qtip({
                content: {
                    text: "Created by " + arrayResult[i].owner.name + "<br> Located in " + arrayResult[i].location
                },
                style: {
                    widget: true 
                }
            }); 
            
            $("#cell" + arrayResult[i].cellDetails).corner("5px");
        }
        
    }    
}

var createFriendRequestElement = function(object){
 
    var html = '<div class="friendRequestNotification" refId="' + object.refId + '" >' + object.message + '<span class="ui-icon ui-icon-close" style="float: right"></span>' +
    '<span class="ui-icon ui-icon-check" style="float: right"></span></div>';
 
    document.getElementById('notificationList').innerHTML =  document.getElementById('notificationList').innerHTML + html;
    
    $('.friendRequestNotification').die();
    $('.friendRequestNotification').live('click', function(){
        var theUrl;
        var target = $(event.target);
        
        if(target.hasClass('ui-icon-close')){
            theUrl = "/notification/joinMasterCell/" + authId +"/" +  $(this).attr('refId') + "/decline";           
        }
        else if(target.hasClass('ui-icon-check')){
            theUrl = "/notification/joinMasterCell/" + authId +"/" +  $(this).attr('refId') + "/accept"; 
        }
        else{
            
        }
        
        $.getJSON(theUrl, function(data) {
            if(data.success){
                intiSocialView(true, true, true);
                Notifier.success(data.message);
            }
            else{
                //something wrong
                Notifier.error(data.message);
            }   
        }); 
        
    }); 
 
}

var createCellWorkoutElement = function(object){
    var strDate = new Date(object.date).toDateString();
    var viewprofile = '<div class="notificationUnit" style="overflow: hidden;" notificationId="' + object._id + '"><div class="cellLink" refId="' + object.refOId + '" style="cursor: pointer; float: left; width: 300px;" title="'+strDate+'" >' + 
        object.message + '</div><div style="float: right; margin-top: 1px;"><span class="ui-icon ui-icon-close removeNotification" style="float: left; display: none;"></span></div></div>';
    document.getElementById('notificationList').innerHTML = document.getElementById('notificationList').innerHTML + viewprofile;
    
}

var createCellMessageElement = function(object){
    
    var strDate = new Date(object.date).toDateString();
    var viewprofile = '<div class="notificationUnit" style="overflow: hidden;" notificationId="' + object._id + '"><div class="cellMessage" refId="' + object.refId + '" style="cursor: pointer; float: left;  width: 300px;" title="'+strDate+'">' + 
    object.message + '</div><div style="float: right; margin-top: 1px;"><span class="ui-icon ui-icon-close removeNotification" style="float: left; display: none;"></span></div></div>';
    document.getElementById('notificationList').innerHTML = document.getElementById('notificationList').innerHTML + viewprofile  ;
    
}


var createCellListElement = function(object){
    
    var html = "<div class='cellCard' refId='" + object.cellDetails + "' style='float:left; margin-bottom: 3px; cursor: pointer; padding:3px 6px; margin-right: 5px; background-color:#C7E5AE; font-size: 12px;' id='cell" +
    object.cellDetails + "' owner='" + object.owner  + "'>" + object.name + "</div>";
    
    return html;
    
}


var  createCellInviteElement = function(object){
    
    var html = '<div class="cellnotification"  notificationid="' + object.refOId + '">' + object.message + '<span class="ui-icon ui-icon-close"  style="float: right"></span>' +
    '<span class="ui-icon ui-icon-check" style="float: right"></span></div>';
 
    document.getElementById('notificationList').innerHTML = document.getElementById('notificationList').innerHTML + html;
    
    
    $('.cellnotification').die();
    $('.cellnotification').live('click', function(event){
        var theUrl;
        var target = $(event.target);
        
        if(target.hasClass('ui-icon-close')){  
            theUrl = "/notification/cell/invite/" + $(this).attr('notificationid') + "/decline"; 
            
        }
        else if(target.hasClass('ui-icon-check')){
            theUrl = "/notification/cell/invite/" + $(this).attr('notificationid') + "/accept";  
        }
        else{
            //Do nothing
        }

        //Send request to seerver        
        $.getJSON(theUrl, function(data) {
            if(data.success){
                intiSocialView(true, true, true);
                Notifier.success(data.message);
            }
            else{
                //something wrong
                Notifier.error(data.message);
            }   
        }); 
    }); 
    
}


/////!!!!------------------CELL VIEIWING CODE ------------------------ !!!!!!!!! 
//
//
//
////!!!!-------------------------------------------------------------------!!!!!!

var initCellView = function(object){
    
    //reinitialises view
    $('#cellOptionsButton').hide();
    $("#inviteInCell").die();
    
    fillCellView(object); 
   
    //Load cell creators toolbox
    if(object.owner.id === parseInt(authId)){
        $('#cellOptionsButton').show();
        
        //initialise button
        $("#inviteInCell").die();
        $("#inviteInCell").live("click",function(){
            
            
            $.getJSON(getFriendCell, function(data) {
                if(data.success){
                    renderFriendList(data.message, 'inviteFriendList');
                    $('#inviteFriends').dialog('open');
                }
                else{
                    //something wrong
                    Notifier.success(data.message);
                }   
            });
        });
        
    } 
   
}

var fillCellView = function(object){
   
    document.getElementById('cellTitle').innerHTML = object.name;
    document.getElementById('cellLocation').innerHTML = object.location;
    //document.getElementById('cellInfo').innerHTML = '<img src="http://graph.facebook.com/' +  object.owner.id + '/picture" />';// object.description;
    var description; 
    if(object.isCoach){
        description = '<div>' + object.owner.name + ': ' + object.description + '</div><div style="float: right;"> -Coach of the cell</div>';
        if(object.owner.id.toString() === authId){
            description = '<div>Your description: ' + object.description + '</div><div style="float: right;"> -Coach of the cell</div>';
        }
        
        //document.getElementById('cellCreator').innerHTML = "<span class='profileLink' profileId='" + object.owner.id + "'>Created by: " + object.owner.name + "</span>";
    }
    else{
        description = '<div>' + object.owner.name + ': ' + object.description + '</div><div style="float: right;"> -Creator of the cell</div>';
        if(object.owner.id.toString() === authId){
            description = '<div>Your description: ' + object.description + '</div><div style="float: right;">-Creator of the cell</div>';
        }
        //document.getElementById('cellCreator').innerHTML = "<span class='profileLink' profileId='" + object.owner.id + "'>Coach : " + object.owner.name + "</span>";    
    }
    
    $('#fbpicCellCreator').attr('src', "");
    $('#fbpicCellCreator').attr('src', "http://graph.facebook.com/" +  object.owner.id + "/picture"); 
    
    $('#fbpicCellCreator').one('load', function() { //Set something to run when it finishes loading
          //alert('creator instantiation');
          $('#cellInfo').qtip({
            content: description,
            position: {
                my: 'left center', // Use the corner...
                at: 'right center' // ...and opposite corner
            },
            show: {
              ready: true
            },
            hide: false,
            style: {
                widget : true,
                classes: 'ui-tooltip-rounded ui-tooltip-shadow',
                width  : '300px'
            }
        });
    });
        
    renderCellMemberList(object.members);
    renderCellNotifications(object.notification);
    
    $('#cellToggleName').die();
    $('#cellToggleName').live('click', function(){
        
        var url = "";
        if(document.getElementById('cellToggleName').innerHTML === 'Quit cell'){
            url = quitCell + object._id;
            
        }
        else{
            url = joinCell + object._id;      
        }
        
        $.getJSON(url, function(data) {
            if(data.success){
                 intiSocialView(true, true, true);
                 UILoadNewState('Social');
            }
            else{
                //something wrong
                Notifier.success(data.message);
            }   
        });

    });
    
}

//Renders the list of users for a cell, and the button to quit or join the cell
var renderCellMemberList = function(arrayResult){
     
    if(RealTypeOf(arrayResult) !== "array"){
        document.getElementById('cellMemberList').innerHTML = arrayResult;     
    }
    else{
       var overallHtml = "";
       //Set to Join cell, and if user in cell, will be changed in loop
       document.getElementById('cellToggleName').innerHTML = 'Join cell';
       for(i = 0; i < arrayResult.length; i++){

          if(arrayResult[i].fbid.toString() == authId){
              document.getElementById('cellToggleName').innerHTML = 'Quit cell';
          }

          //var pictureTag = '<span id="friendPic' + i + '" style="padding-left: 3px; cursor: pointer;"><fb:profile-pic uid="' + arrayResult[i].fbid + '" facebook-logo="false" linked="false" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
          var pictureTag = '<span id="friendPic' + i + '" style="padding-left: 3px; cursor: pointer;"><img src="http://graph.facebook.com/' + arrayResult[i].fbid + '/picture" />'; 
          
          overallHtml = overallHtml + pictureTag + '</span>';
       }
       document.getElementById('cellMemberList').innerHTML = overallHtml;
       for(i = 0; i < arrayResult.length; i++){
           $("#friendPic" + i).qtip({
                content: {
                    text: 'Loading data...',
                    ajax: {
                        url: "/user/snippet/" + arrayResult[i].fbid
                    }
                },
                show: {
                    event: 'click', 
                    ready: false 
                },
                hide: {
                    event: 'click',
                    inactive: 1000
                },
                style: {
                    widget: true 
                }
            });   
       }
       
       FB.XFBML.parse(document.getElementById('cellMemberList'));

    }  
}

var renderCellNotifications = function(array){
    
    document.getElementById('notificationCellList').innerHTML = "";
    
    if(array.length === 0 ){
        document.getElementById('notificationCellList').innerHTML = "No notifications";
    }
    
    for(i = 0; i < array.length; i++){       
        var strDate = new Date(array[i].date).toDateString();
        if(array[i].type === 'newCellWorkout'){
            document.getElementById('notificationCellList').innerHTML = '<div title="'+strDate+'" class="cellNotificationNewWorkout" workoutId ="' + array[i].refId + '">' +
            array[i].message + '</div>' + document.getElementById('notificationCellList').innerHTML;
        }
        else if(array[i].type === 'newCellMessage'){
            var buttonRemove = "";
            if(array[i].refId === authId){
             buttonRemove = '<div style="float: left;"><span class="ui-icon ui-icon-close removeCellComment" ' + 'id="' + array[i]._id + '"></span></div>';   
            }
            document.getElementById('notificationCellList').innerHTML = '<div title="'+strDate+'" class="cellNotificationMessage" userId ="' + array[i].refId + '" style="width: 330px; float:left;">' +
            array[i].message + '</div>' + buttonRemove + document.getElementById('notificationCellList').innerHTML;
        }
        else{
        }
    }
    
    $('.removeCellComment').die();
    $('.removeCellComment').live('click', function(){
        var theUrl = deleteCellMessage + applicationVariables.currentCell + "/" + $(this).attr('id');
        $.getJSON(theUrl, function(data) {
            if(data.success){
                Notifier.success(data.message);
                
                $.getJSON('/cell/details/' + applicationVariables.currentCell, function(data) {
                    if(data.success){
                        if(data.message === 'This cell is private'){
                            UILoadNewState('emptyView');
                            document.getElementById('emptyView').innerHTML = '<span style="font-family: impact; font-size: 20px;">This cell is invite only. Sorry.</span>';
                        }else{
                            initCellView(data.message);
                        }
                    }
                    else{
                        //something wrong
                        Notifier.error(data.message);
                    }
                });     
            }
            else{
                Notifier.error(data.message);
            } 
        });
    });
}

//!!!!!!!-----------------------Profile view loading  -------------------------//
//    When you are visiting someones profile
//
// !!!!!!---------------------------------------------------------------------//
var initUsersProfile = function(targetId){
    
    $.getJSON("/user/profile/" + targetId, function(data) {
        if(data.success){
            renderProfileView(data.message, targetId);   
        }
        else{
            //something wrong
            Notifier.success(data.message);
        }   
    });

}

var renderProfileView = function(object, userId){

    
    if(RealTypeOf(object.friends) !== "array" ){
        document.getElementById('cellView').innerHTML = "You are not friends on workoutcell. <br> <div id='addToCellFromView" +
            userId + "' style='cursor:pointer'> Add to your Workoutcell</div>";

        $('#addToCellFromView' + userId).live('click', function(){
            var theUrl = "/notification/" + authId + "/joinMasterCell/" +  userId;    
            $.getJSON(theUrl, function(data) {
                if(data.success){
                    Notifier.success(data.message);
                }
                else{
                    Notifier.success(data.message);
                } 
                intiSocialView(true, true, true);
                UILoadNewState('Social');
            }); 
        });
        
    }
    else{
        document.getElementById('profileUserName').innerHTML = object.profile.firstName + " " + object.profile.lastName;
        if(typeof object.profile.location != "undefined"){
            document.getElementById('profileUserLocation').innerHTML =  object.profile.location;
        }
        var d = new Date(object.profile.joinDate);
        
        document.getElementById('joindate').innerHTML =  'Joined: ' + d.toLocaleDateString();
    
        var pictureTag = '<img src="http://graph.facebook.com/' + userId + '/picture?type=normal" />'; //'<fb:profile-pic uid="' + userId + '" facebook-logo="false" linked="true" width="100" height="100" size="thumb" ></fb:profile-pic>'; 
    
        document.getElementById('usersFbPic').innerHTML =  pictureTag ;
        FB.XFBML.parse(document.getElementById('usersFbPic'));
        FB.XFBML.parse(document.getElementById('profileUserName'));
        renderProfileCellList(object.cell);
        renderProfileFriendList(object.friends);
    }
    
}



var renderProfileCellList = function(arrayResult){

    if(RealTypeOf(arrayResult) !== "array"){
        document.getElementById('cellProfileList').innerHTML = arrayResult;     
    }
    else{
        var overallHtml = "";
        for(i = 0; i < arrayResult.length; i++){
            overallHtml = overallHtml + createCellListElement(arrayResult[i]);
        }
        document.getElementById('cellProfileList').innerHTML = overallHtml;
        
        for(i = 0; i < arrayResult.length; i++){
            
            $("#cell" + arrayResult[i].cellDetails).qtip({
                content: {
                    text: "Created by " + arrayResult[i].owner.name + "<br> Located in " + arrayResult[i].location
                },
                style: {
                    widget: true 
                }
            }); 
            
            $("#cell" + arrayResult[i].cellDetails).corner("5px");
        }
        
    }    
}

var renderProfileFriendList = function(arrayResult){
     
    if(RealTypeOf(arrayResult) !== "array"){
        document.getElementById('friendProfileList').innerHTML = arrayResult;     
    }
    else{
       var overallHtml = "";
       for(i = 0; i < arrayResult.length; i++){
          //var pictureTag = '<span id="friendPic' + arrayResult[i] + '" style="padding-left: 3px; cursor: pointer;"><fb:profile-pic uid="' + arrayResult[i] + '" facebook-logo="false" linked="false" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
          var pictureTag = '<span id="friendPic' + arrayResult[i] + '" style="padding-left: 3px; cursor: pointer;"><img src="http://graph.facebook.com/' + arrayResult[i] + '/picture" />'; 
          overallHtml = overallHtml + pictureTag + '</span>';
       }
       document.getElementById('friendProfileList').innerHTML = overallHtml;
       for(i = 0; i < arrayResult.length; i++){
           $("#friendPic" + arrayResult[i]).qtip({
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
                hide: {
                    event: 'click',
                    inactive: 1000
                },
                style: {
                    widget: true 
                }
            });   
       }
       
       FB.XFBML.parse(document.getElementById('friendProfileList'));

    }  
}

var getSelectedElements = function(prefix, element){
    
    var returnArray = [];
    var addedToList = 0;
    for(i=0; i <100 ; i++){
        
        if($('#' + prefix + element + i).attr('select') === "yes"){
            returnArray.push(parseInt($('#friendPic' + element + i).attr('userid'))); 
            addedToList++;
            if(addedToList === applicationVariables.selectedElements){
               break; 
            }
        }
    }
    
    return returnArray;
   // id="friendPic'+ locationId + arrayResult[i]   

}

//Taken from http://joncom.be/code/realtypeof/
function RealTypeOf(v) {
  if (typeof(v) == "object") {
    if (v === null) return "null";
    if (v.constructor == (new Array).constructor) return "array";
    if (v.constructor == (new Date).constructor) return "date";
    if (v.constructor == (new RegExp).constructor) return "regex";
    return "object";
  }
  return typeof(v);
}


