var map;
var poly;
var distance = 0;
var markerArray = [];
var bikeLayer = null;
var lastAddedDistance = [];
var markerString = "";

function initialize() {
	
	bikeLayer = new google.maps.BicyclingLayer();
	var latlng = new google.maps.LatLng(applicationVariables.profile.location.latlng.lat, applicationVariables.profile.location.latlng.lng);
	var myOptions = {
		zoom: 14,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
	
	//Polyline option setters
	var polyOptions = {
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	}
    
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);
	
	// Add a listener for the click event
	google.maps.event.addListener(map, 'click', addLatLng);
}

function addLatLng(event) {

	var path = poly.getPath();

	// Because path is an MVCArray, we can simply append a new coordinate
	// and it will automatically appear
	path.push(event.latLng);

	updateDistance(poly);
  
  // Add a new marker at the new plotted point on the polyline.
  var marker = new google.maps.Marker({
    position: event.latLng,
    title: Math.round(distance) + ' meters',
    map: map
  });
  
  markerArray.push(marker);
}

function updateDistance(poly){
	polypath = poly.getPath();
	
	if(polypath.getLength() !== 1){
		var latLngB = polypath.getAt(polypath.getLength() - 1);
		var latLngA = polypath.getAt(polypath.getLength() - 2);
		var theDistance = google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
        lastAddedDistance.push(Math.round(theDistance*100)/100000);
        distance = distance + theDistance;
		document.getElementById('distance').innerHTML = Math.round(distance*100)/100000;
		
	}
	
}

function undoLast(){
 
    //Delete last stroke
    var tempoPathArray = poly.getPath();
    tempoPathArray.removeAt(tempoPathArray.getLength()-1);
    poly.setPath(tempoPathArray);  
    //Delete last marker in global var and on map
    markerArray[markerArray.length-1].setMap(null);
    markerArray.pop();
    //Adjust distance and the pop deletes last element and returns it
    if(lastAddedDistance.length === 1){
       clearMap(); 
    }
    else{
        var adjustedDistance = document.getElementById('distance').innerHTML - lastAddedDistance.pop();;
        document.getElementById('distance').innerHTML = Math.round(adjustedDistance*10000)/10000;
    }

}

function clearMap(){
	// remove poly from map
	poly.setMap(null);
	//delete poly
	poly = null;
	
	// recreate poly
	var polyOptions = {
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	}	
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);
	distance = 0;
	document.getElementById('distance').innerHTML = Math.round(distance);		
	
	//clear markers on map
	if (markerArray) {
		for (i in markerArray) {
			markerArray[i].setMap(null);
		}
	}
	//empty array of distances
    lastAddedDistance = [];
    
}

function markertTitleArray(array, callback){
    var callbackArray = [];
    
    for(i=0; i < array.length; i++){      
        callbackArray.push(array[i].getTitle());           
    }
    
    callback(callbackArray);         
}

//This will create proper converted array for database
//It will also create the marker stirng part of the static image
function markerLatLngArray(array, callback){
    var callbackArray = [];
    markerString = "&markers=label:S%7C" + array[0].getPosition().lat() + "," + array[0].getPosition().lng()
    + "&markers=label:F%7C" + array[array.length-1].getPosition().lat() + "," + array[array.length-1].getPosition().lng();
    
    for(i=0; i < array.length; i++){
        callbackArray.push({ lat: array[i].getPosition().lat(), lng: array[i].getPosition().lng()});
    }
    callback(callbackArray);
}


function loadPolylines(arrayPath){
    var path = new google.maps.MVCArray();
    var polyOptions = {
    	strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	}
    
    $.each(arrayPath, function(key, val) {
            path.push(new google.maps.LatLng(val.Pa, val.Qa));
    })
    
    poly = new google.maps.Polyline(polyOptions);
    poly.setPath(path);
    poly.setMap(map);
 
}

function decodeToMap(string){
    
    var polyOptions = {
        strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	}
    
    poly = new google.maps.Polyline(polyOptions);
    poly.setPath(google.maps.geometry.encoding.decodePath(string));
    poly.setMap(map);
}

function loadMarkers(arrayLatLng, arrayTitle){

    //alert(arrayLatLng + " : " + arrayTitle);
    for(i = 0; i < arrayLatLng.length; i++){
        var pos = new google.maps.LatLng(arrayLatLng[i].lat, arrayLatLng[i].lng);
        
        var marker = new google.maps.Marker({
            position: pos,
            title: JSON.stringify(arrayTitle[i]),
            map: map
        });
        markerArray.push(marker);   
        
    }

}

//This will verify if the passed lat lng passed are instantiated
//If not, it will use a geocoding to return new valur
function setUsersLatLng(location, callback){

    if(location.latlng.lat !== 0){
        callback('Already instantiated');    
    }
    else{
        var geocoder = new google.maps.Geocoder();
        
        geocoder.geocode( { 'address': location.name}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            //In this case it creates a marker, but you can get the lat and lng from the location.LatLng
            //alert(JSON.stringify(results));
            callback({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});
          } else {
            //alert("Geocode was not successful for the following reason: " + status + ' sent: ' + location.name);
            callback('Failed');
          }
        });
    }
    
    
}