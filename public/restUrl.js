//This document will outline all the server side rest commands and their parameters

//This function will be used for futur scalibility issues. Where collections might become too big for number of users, so it will go threw this
//algorithm to spit out new collection based on user and usergroup


//upload new parcous - POST
var restPost_newParcour = "/parcour/" + authId + "/";
var getParcourList = "/parcour/list/" + authId;
var postworkout = "/workout/" + authId;
var getParcour = "/parcour/";

//Instantiated variables with this function

var initGlobalVar = function(){
    
    restPost_newParcour = "/parcour/" + authId + "/";
    getParcourList = "/parcour/list/" + authId;
    postworkout = "/workout/" + authId;
    getParcour = "/parcour/";
    
}