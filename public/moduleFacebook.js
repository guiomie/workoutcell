var authToken = "empty";
var authId = "empty";
var userObject = "empty";
//Simply to help augment futur scalibility issues. Will need usergroup created in session info one day
var userGroup = "group1";  
  FB.init({
    appId  : '277924085557007',
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
	  alert(authId);
      initPage();
    }
  });
  
  function initPage(){
    
    FB.api('/me', function(response) {
    
    userObject = response;
    var pictureTag = '<fb:profile-pic uid="' + authId + '" facebook-logo="false" linked="true" width="100" height="100" size="thumb"></fb:profile-pic>'; 
    var name = userObject.name;
    htmlText = pictureTag + ' ' + name + ', welcome to your Workoutcell profile';
    document.getElementById('fastProfile').innerHTML =  htmlText ;
    FB.XFBML.parse(document.getElementById('fastProfile'));
    
    });
    
 
  }