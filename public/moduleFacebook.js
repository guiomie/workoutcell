var authToken = "empty";
var authId = "empty";
var userObject = "empty";
//Simply to help augment futur scalibility issues. Will need usergroup created in session info one day
var userGroup = "group1";  



  FB.init({
    appId  : 277924085557007,   //Prod: 114525048657436
    status : true, // check login status
    cookie : true, // enable cookies to allow the server to access the session
    xfbml  : true, // parse XFBML
    channelURL : 'http://workoutcelld.guiomie.c9.io/view/channel', // Prod: http://workoutcell.no.de/view/channel
    oauth  : true // enable OAuth 2.0
  });
  
  FB.getLoginStatus(function(response) {
    if (response.authResponse) {
      authToken = response.authResponse.accessToken;
      authId = response.authResponse.userID;
	  //alert(authId);
      initPage();
    }
  });


function initPage(){
    
    FB.api('/me', function(response) {
    initGlobalVar();
    userObject = response;
    //var pictureTag = '<fb:profile-pic uid="' + authId + '" facebook-logo="false" linked="true" width="50" height="50" size="thumb" ></fb:profile-pic>'; 
    var pictureTag= '<img src="http://graph.facebook.com/' + authId + '/picture" />';
    //var name = userObject.name;
    var first = userObject.first_name;
    var last = userObject.last_name;
    document.getElementById('firstName').innerHTML =  first;
    document.getElementById('lastName').innerHTML =  last ;
    document.getElementById('xfbmlPic').innerHTML =  pictureTag ;
    //FB.XFBML.parse(document.getElementById('xfbmlPic'));
    $('#xfbpic').corner();
    });
    
}


function inviteFriends(invitesLeft){
    
    var text = "You can invite " + invitesLeft + " facebook friends to workoutcell";
    
    FB.ui({method: 'apprequests', message: text}, function(){
        
    });   
    
    
}