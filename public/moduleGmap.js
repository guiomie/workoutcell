var map;
var poly;
var distance = 0;
var markerArray = [];
var bikeLayer = null;
var lastAddedDistance = [];

function initialize() {
	
	bikeLayer = new google.maps.BicyclingLayer();
	var latlng = new google.maps.LatLng(45.50, -75.64);
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
