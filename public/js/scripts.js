/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();



// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "off"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "off"}
            ]
        }

    ];


    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions


    var options = {
        center: {lat: 42.3770, lng: -71.1256}, // Cambridge
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 13,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});


/**
 * Adds marker for place to map.
 */
function addMarker(place)
{
    // configure marker
    var marker = new MarkerWithLabel(
    {
        position: {lat: parseFloat(place.latitude), lng: parseFloat(place.longitude)},
        map: map,
        labelContent: place.place_name,
        icon: {
            url: "img/news.png",
            size: null,
            origin: null,
            anchor: null,
            scaledSize: new google.maps.Size(35,35)
        },
        labelAnchor: new google.maps.Point(10,0)
    })
 
    var infoWindow = new google.maps.InfoWindow();
 
    markers.push(marker);
 
 
    google.maps.event.addListener(marker, 'click', function(){
        showInfo(marker);
 
        $.getJSON("articles.php", {geo: place.postal_code})    
 
        .done(function(data, textStatus, jqXHR) 
        {	
        	// Build up html for info window
            var content = "<ul>"
            for (i = 0; i < data.length; i++)
            {
                content += "<li><a href=\"" + data[i].link + "\">" + data[i].title + "</a></li>";
            }
            content += "</ul>"
            if (data.length == 0)
            {
                content = "No news availible"
            }
            showInfo(marker, content);
        })
 
        .fail(function(jqXHR, textStatus, errorThrown) 
        {
            // log error to browser's console
            console.log(errorThrown.toString());
        });
 
    })
}

/**
 * Configures application.
 */
function configure()
{
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

 
    google.maps.event.addListener(map, "dragend", function() {
        update();
    });


   
    google.maps.event.addListener(map, "dragstart", function() {
        removeMarkers();
    });

    
    $("#q").typeahead({
        autoselect: true,
        highlight: true,
        minLength: 1
    },
    {
        source: search,
        templates: {suggestion: _.template("<p><%- place_name %>, <%- admin_name1 %></p>")
        }
    });

    
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // update UI
        update();
    });

  
    $("#q").focus(function(eventData) {
        hideInfo();
    });

    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

   
    $("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo()
{
    info.close();
}

/**
 * Removes markers from map.
 */
function removeMarkers()
{
    _.each(markers, function(marker){
        marker.setMap(null);
    });
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb)
{
    // get places matching query (asynchronously)
    var parameters = {
        geo: query
    };
    $.getJSON("search.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // call typeahead's callback with search results (i.e., places)
        cb(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
}

/**
 * Shows info window at marker with content.
 */
function showInfo(marker, content)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) === "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='img/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";

    // set info window's content
    info.setContent(div);

    // open info window (if not already open)
    info.open(map, marker);
}

/**
 * Updates UI's markers.
 */
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON("update.php", parameters)
    .done(function(data, textStatus, jqXHR) {

        // remove old markers from map
        removeMarkers();

        // add new markers to map
        for (var i = 0; i < data.length; i++)
        {
            addMarker(data[i]);
        }
     })
     .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
};