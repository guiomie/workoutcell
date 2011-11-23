var authToken = "empty";
var authId = "empty";
var userObject = "empty";
//Simply to help augment futur scalibility issues. Will need usergroup created in session info one day
var userGroup = "group1";  


  FB.init({
    appId  : globalAppid,
    status : true, // check login status
    cookie : true, // enable cookies to allow the server to access the session
    xfbml  : true, // parse XFBML
    channelURL : 'http://WWW.MYDOMAIN.COM/channel.html', // channel.html file
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
    var pictureTag = '<fb:profile-pic uid="' + authId + '" facebook-logo="false" linked="true" width="80" height="80" size="thumb"></fb:profile-pic>'; 
    var name = userObject.name;
    document.getElementById('profileLink').innerHTML =  name ;
    document.getElementById('xfbmlPic').innerHTML =  pictureTag ;
    FB.XFBML.parse(document.getElementById('xfbmlPic'));

    });
    


}