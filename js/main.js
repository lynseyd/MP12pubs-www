

//-------✂---------------------------------------------
//  JSLint info - can remove for production
//
/*jslint browser: true*/
/*global $, jQuery, navigator, alert, google*/
"use strict";
//-------✂---------------------------------------------

(function () {

    // Reusable variables under twelvePubs namespace
    //-------✂---------------------------------------------
    var twelvePubs = (function () {

        var lat = 0,
            lon = 0,
            requestedIndex,
            ThePubs = [],
            userLocation = '';


        return {
            lat: lat,
            lon: lon,
            requestedIndex: requestedIndex,
            ThePubs: ThePubs,
            userLocation: userLocation
        };

    }());
    //-------✂---------------------------------------------

    // Set jquery mobile defaults
    //-------✂---------------------------------------------
    $(document).bind("mobileinit", function () {
        $.mobile.defaultPageTransition = 'none';
        //Enables full screen on iphone
        window.top.scrollTo(0, 1);
    });
    //-------✂---------------------------------------------

    // Sort an array alphabetically
    //-------✂---------------------------------------------
    function SortByTitle(a, b) {
        var aName = a.title.toLowerCase(),
            bName = b.title.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }
    //-------✂---------------------------------------------




    //-------✂------------------------------------------------------------------------------------------
    //------ XML ----------------------------------------------------------------------------------------
    //-------✂------------------------------------------------------------------------------------------
    function ThePubsItem() {
        var title,
            latitude,
            longitude,
            description;
    }
    //-------✂---------------------------------------------
    function xmlThePubsParser(data) {

        var ThePubsGroup = [],
            xml = data,
            i;

        $(xml).find("entry").each(function () {

            var newThePubsItem = new ThePubsItem();

            newThePubsItem.title = $(this).find("title").text();
            newThePubsItem.longitude = $(this).find("longitude").text();
            newThePubsItem.latitude = $(this).find("latitude").text();
            newThePubsItem.description = $(this).find("description").text();

            ThePubsGroup.push(newThePubsItem);
        });
        if (ThePubsGroup.length) {
            //Put the list in alphabetical order
            //ThePubsGroup.sort(SortByTitle);
            //Save it to the twelvePubs array
            twelvePubs.ThePubs = ThePubsGroup;
        }
        //Now update the list
        if (twelvePubs.ThePubs.length) {
            for (i = 0; i < (twelvePubs.ThePubs).length; i += 1) {
                $("#ThePubsList").append('<li data-theme="c">'
                    + '<a href="#ThePubsDetailsPage"><h3>'
                    + twelvePubs.ThePubs[i].title
                    + '</h3><p>'
                    + '</p></a></li>');
            }
        }
    }
    //-------✂---------------------------------------------
    function getXMLThePubs() {
        //  Chrome requires this to be running on a server for it to pull in the XML
        $.ajax({
            type: "GET",
            url: "xml/12pubs.xml",
            dataType: "xml",
            success: xmlThePubsParser
        });
    }




    //-------✂------------------------------------------------------------------------------------------
    //------ Maps ----------------------------------------------------------------------------------------
    //-------✂------------------------------------------------------------------------------------------
    function mapInit(mapElement, myLatlng, myZoom) {

        //Limit the height of the map depending on device screen height, so you can still scroll the page!
        if (mapElement.hasClass('full-map')) {
            mapElement.css('height', ($(window).height() / 1.2));
        }
        if (mapElement.hasClass('half-map')) {
            mapElement.css('height', ($(window).height() / 2));
        }
        // Convert jQuery object to javascript object for google map.
        var jsMapElement = mapElement[0],
            mapOptions = {
                zoom: myZoom,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            map = new google.maps.Map(jsMapElement, mapOptions);

        return map;
    }
    //-------✂---------------------------------------------






    //Returns string with distance in metres from users location, if available.
    //-------✂---------------------------------------------
    function getUserLocation() {
        //If geo is available save user location in the twelvePubs variables
        if (navigator.geolocation !== undefined) {
            navigator.geolocation.getCurrentPosition(function (position) {
                twelvePubs.userLocation = (position.coords.latitude + ',' + position.coords.longitude);
            });
        }
    }
    //-------✂---------------------------------------------
    //Gets distance in metres from users location, if available
    //-------✂------------------------------------------------
    function getWalkingDistance(destinationLatLon, distanceContainer) {

        if ((twelvePubs.userLocation.length) && (distanceContainer.length)) {
            var directionsService = new google.maps.DirectionsService(),
                distance,
                request = {
                    origin: twelvePubs.userLocation,
                    destination: destinationLatLon,
                    travelMode: google.maps.DirectionsTravelMode.WALKING
                };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    distance = 'Distance: ' + response.routes[0].legs[0].distance.value + 'm';
                    distanceContainer.html(distance);
                }
            });
        } else {
            distanceContainer.html('');
        }
    }
    //-------✂---------------------------------------------
    //Updates the supplied element with the actual distance
    //-------✂---------------------------------------------
    function setWalkingDistanceText(destinationLatLon, i) {

        if (twelvePubs.userLocation.length) {
            var directionsService = new google.maps.DirectionsService(),
                distance,
                request = {
                    origin: twelvePubs.userLocation,
                    destination: destinationLatLon,
                    travelMode: google.maps.DirectionsTravelMode.WALKING
                };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    distance = response.routes[0].legs[0].distance.text;
                    twelvePubs.facilities[i].distance = distance;
                }
            });
        }
    }
    //-------✂---------------------------------------------




    //-------✂------------------------------------------------------------------------------------------
    //------ jQ Mobile Pages ---------------------------------------------------------------------------
    //-------✂------------------------------------------------------------------------------------------




    //-------✂---------------------------------------------
    $('#SplashPage').live('pageshow', function (event) {
        getXMLThePubs();
        //Show splash screen and fade out
        window.setTimeout(function () {
            $.mobile.changePage(($("#Homepage")), {
                transition: "none",
                reverse: false,
                changeHash: false
            });
        }, 2000);

    });
    //-------✂---------------------------------------------




    // List page
    //-------✂---------------------------------------------
    $('#Homepage').live('pageinit', function (event) {
        //Save the users location when they first open the app
        getUserLocation();
        //Get the content from ThePubs.xml if none exists
        if (twelvePubs.ThePubs.length === 0) {getXMLThePubs(); }

        window.setTimeout(function () {
            $("#ThePubsList").listview('refresh');
        }, 100);

        //Select a pub action
        $('#ThePubsList').on('click', 'a', function () {
            // This is the index of the element that more info is wanted for
            // Save this index in a twelvePubs twelvePubs.variable so the app knows what XML entry to load
            twelvePubs.requestedIndex = $(this).closest('li').index();
        });
    });
    //-------✂---------------------------------------------




    // Details page
    //-------✂---------------------------------------------
    $('#ThePubsDetailsPage').live('pageshow', function (event) {

        // Take index from twelvePubs.requestedIndex
        // Update page content with twelvePubs.ThePubs[i]
        if (twelvePubs.ThePubs[twelvePubs.requestedIndex] === undefined) {
            // If page is refreshed and has no selected index, bounce to the list page
            $.mobile.changePage(($("#Homepage")), {reverse: false, changeHash: false });
        } else {
            var tempLat = twelvePubs.ThePubs[twelvePubs.requestedIndex].latitude,
                tempLon = twelvePubs.ThePubs[twelvePubs.requestedIndex].longitude,
                myLatlng = new google.maps.LatLng(tempLat, tempLon),
                map = mapInit($(this).find('.mapCanvas'), myLatlng, 17),
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: " "
                });
            // Populate the relevant sections of the details page
            $(this).find("h1").html(twelvePubs.ThePubs[twelvePubs.requestedIndex].title);
            $(this).find("#pubTitle").html(twelvePubs.ThePubs[twelvePubs.requestedIndex].title + '<span class="sub-head"></span>');
            // Send the sub-head element to the function because it takes a sec to calculate the distance, so need to update it afterwards
            getWalkingDistance((tempLat + ',' + tempLon), $(this).find(".sub-head"));
            //pub-description
            if (twelvePubs.ThePubs[twelvePubs.requestedIndex].description.length) {
                $(this).find(".pub-description").html(twelvePubs.ThePubs[twelvePubs.requestedIndex].description);
                $(this).find(".pub-description").show().prev('h3').show();
            } else {
                $(this).find(".pub-description").html('');
                $(this).find(".pub-description").hide().prev('h3').hide();
            }
        }
    });
    //-------✂---------------------------------------------
}());