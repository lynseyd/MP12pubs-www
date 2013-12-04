

//-------✂---------------------------------------------
//  JSLint info - can remove for production
//
/*jslint browser: true*/
/*global $, jQuery, navigator, alert, google*/
"use strict";
//-------✂---------------------------------------------


(function () {



    // Reusable variables under UCC namespace
    //-------✂---------------------------------------------
    var UCC = (function () {

        var lat = 0,
            lon = 0,
            newLat = 0,
            newLon = 0,
            requestedIndex,
            requestedCode,
            requestedFacilityType,
            campusLocations = [],
            facilities = [],
            ThePubs = [],
            mapMarkers = [],
            userLocation = '';


        return {
            lat: lat,
            lon: lon,
            newLat: newLon,
            newLon: newLon,
            requestedIndex: requestedIndex,
            requestedCode: requestedCode,
            requestedFacilityType: requestedFacilityType,
            campusLocations: campusLocations,
            facilities: facilities,
            ThePubs: ThePubs,
            mapMarkers: mapMarkers,
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









    // Google map XML location parsing
    //-------✂---------------------------------------------
    function LocationItem() {
        var title,
            longitude,
            latitude,
            code,
            link,
            description,
            icon;
    }
    //-------✂---------------------------------------------
    function xmlLocationParser(data) {

        var locationGroup = [],
            xml = data;

        $(xml).find("entry").each(function () {

            var newLocationItem = new LocationItem();

            newLocationItem.title = $(this).find("title").text();
            newLocationItem.longitude = $(this).find("longitude").text();
            newLocationItem.latitude = $(this).find("latitude").text();
            newLocationItem.code = $(this).find("code").text();
            newLocationItem.link = $(this).find("link").text();
            newLocationItem.description = $(this).find("description").text();
            newLocationItem.icon = $(this).find("icon").text();
            locationGroup.push(newLocationItem);

        });

        //If there's some locations in the array then replace the global array with this one
        if (locationGroup.length) {
            UCC.campusLocations = locationGroup;
        }
    }
    //-------✂---------------------------------------------
    function getXMLLocations() {

        $.ajax({
            type: "GET",
            url: "xml/locations.xml",
            dataType: "xml",
            success: xmlLocationParser
        });

    }
    //-------✂---------------------------------------------












    // Student services XML parser
    //-------✂---------------------------------------------
    function ThePubsItem() {
        var title,
            latitude,
            longitude,
            address,
            hours,
            contact,
            code,
            link,
            description,
            icon;
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
            newThePubsItem.address = $(this).find("address").text();
            newThePubsItem.hours = $(this).find("hours").text();
            newThePubsItem.contact = $(this).find("contact").text();
            newThePubsItem.code = $(this).find("code").text();
            newThePubsItem.link = $(this).find("link").text();
            newThePubsItem.description = $(this).find("description").text();
            newThePubsItem.icon = $(this).find("icon").text();

            ThePubsGroup.push(newThePubsItem);
        });

        if (ThePubsGroup.length) {
            //Put the list in alphabetical order
            //ThePubsGroup.sort(SortByTitle);
            //Save it to the UCC array
            UCC.ThePubs = ThePubsGroup;
        }

        //Now update the list
        if (UCC.ThePubs.length) {
            for (i = 0; i < (UCC.ThePubs).length; i += 1) {
                $("#ThePubsList").append('<li data-theme="c">'
                    + '<a href="#ThePubsDetailsPage"><h3>'
                    + UCC.ThePubs[i].title
                    + '</h3><p>'
                    //+ 'Open until 21:00'//Needs improvement
                    + '</p></a></li>');
            }
            $("#ThePubsList").listview('refresh');
        }

    }
    //-------✂---------------------------------------------
    function getXMLThePubs() {
        //
        //  Chrome requires this to be running on a server for it to pull in the XML
        //
        $.ajax({
            type: "GET",
            url: "xml/12pubs.xml",
            dataType: "xml",
            success: xmlThePubsParser
        });

    }
    //-------✂---------------------------------------------







    //-------✂------------------------------------------------------------------------------------------
    //------ Maps ----------------------------------------------------------------------------------------
    //-------✂------------------------------------------------------------------------------------------









    //-------✂---------------------------------------------
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







    // Create static map image for headers
    //-------✂---------------------------------------------
    function mapStaticImg(mapElement, lat, lon, zoom) {

        var height = 124,
            width = $(window).width(),
            scale = (window.devicePixelRatio > 1) ? 2 : 1,
            mapImgUrl =  'http://maps.googleapis.com/maps/api/staticmap';

        mapImgUrl += '?center=' + lat + ',' + lon;
        mapImgUrl += '&zoom=' + zoom;
        mapImgUrl += '&size=' + width + 'x' + height;
        mapImgUrl += '&scale=' + scale;
        mapImgUrl += '&maptype=roadmap';
        mapImgUrl += '&markers=color:0xD31A39%7C' + lat + ',' + lon;
        mapImgUrl += '&sensor=false';

        //Set the src of the img element to the new static google map
        mapElement.find('img').attr('src', mapImgUrl);

    }
    //-------✂---------------------------------------------







    //Returns string with distance in metres from users location, if available. Else returns 500m
    //-------✂---------------------------------------------
    function getUserLocation() {
        //If geo is available save user location in the UCC variables
        if (navigator.geolocation !== undefined) {
            navigator.geolocation.getCurrentPosition(function (position) {
                UCC.userLocation = (position.coords.latitude + ',' + position.coords.longitude);
            });
        }
    }
    //-------✂---------------------------------------------






    //Gets distance in metres from users location, if available.
    //Updates the supplied element with the actual distance, else sets it to 500m
    //-------✂---------------------------------------------
    function getWalkingDistance(destinationLatLon, distanceContainer) {

        if ((UCC.userLocation.length) && (distanceContainer.length)) {
            var directionsService = new google.maps.DirectionsService(),
                distance,
                request = {
                    origin: UCC.userLocation,
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
    //Gets distance in metres from users location, if available.
    //Updates the supplied element with the actual distance, else sets it to 500m
    //-------✂---------------------------------------------
    function setWalkingDistanceText(destinationLatLon, i) {

        if (UCC.userLocation.length) {
            var directionsService = new google.maps.DirectionsService(),
                distance,
                request = {
                    origin: UCC.userLocation,
                    destination: destinationLatLon,
                    travelMode: google.maps.DirectionsTravelMode.WALKING
                };

            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {

                    distance = response.routes[0].legs[0].distance.text;
                    UCC.facilities[i].distance = distance;
                    // alert('yeow!');

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

        // Pausing here to let the xml be read. OK for demo, probably not OK for production... 100ms works, using 1000ms to be safe...
        //
        //Show splash screen and fade out
        window.setTimeout(function () {
            $.mobile.changePage(($("#Homepage")), {
                transition: "none",
                reverse: false,
                changeHash: false
            });
        }, 3000);

    });
    //-------✂---------------------------------------------


    //-------✂---------------------------------------------
    $('#Homepage').live('pageinit', function (event) {

        //Save the users location when they first open the app

        getUserLocation();

        getXMLLocations();

    });
    //-------✂---------------------------------------------







    // Map
    //-------✂---------------------------------------------
    $("#PubMap").live('pageshow', function () {
        //Define page start lat|lon coordinates
        UCC.newLat = 53.3419119;
        UCC.newLon = -6.2614364;
        //UCC.newLat = 51.89295;
        //UCC.newLon = -8.49237;
        //
        getUserLocation();

        var myLatlng = new google.maps.LatLng(UCC.newLat, UCC.newLon),
            map = mapInit($(this).find('.mapCanvas'), myLatlng, 17),
            allBounds = new google.maps.LatLngBounds(),
            searchBounds,
            locationLatlng,
            yourLatLon,
            contentString,
            infowindow = new google.maps.InfoWindow(),
            marker,
            i,
            searchStr;

        function addMarkerInfoWindow(marker, map, i) {
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent('<h4>'
                    + UCC.campusLocations[i].title + '</h4>' + '<p>'
                    //+ UCC.campusLocations[i].description
                    + '</p>' + '<a href="'
                    + UCC.campusLocations[i].link + '">More information</a>');
                infowindow.open(map, this);
            });
        }

        window.setTimeout(function () {
            if (UCC.campusLocations.length) {
                //Make sure the marker array is empty so it will keep the same index as the campusLocation array
                UCC.mapMarkers.length = 0;
                //Loop through the locations and plot them on the map
                for (i = 0; i < (UCC.campusLocations).length; i += 1) {
                    // Map Coordinates
                    locationLatlng = new google.maps.LatLng(UCC.campusLocations[i].latitude, UCC.campusLocations[i].longitude);
                    // Marker point
                    marker = new google.maps.Marker({
                        position: locationLatlng,
                        map: map,
                        title: UCC.campusLocations[i].title
                    });
                    //Save them all for hiding or removal
                    UCC.mapMarkers.push(marker);
                    //Add to bounds
                    allBounds.extend(locationLatlng);
                    map.fitBounds(allBounds);
                    //Assign infowindow popups to each pointer
                    addMarkerInfoWindow(marker, map, i);
                }
            } else {
                getXMLLocations();
            }
        }, 1000);




        // This is needed to set the zoom after fitbounds,
        google.maps.event.addListener(map, 'zoom_changed', function () {
            var zoomChangeBoundsListener =
                google.maps.event.addListener(map, 'bounds_changed', function (event) {
                    if (this.getZoom() > 18 && this.initialZoom === true) {
                        // Change max/min zoom here
                        this.setZoom(18);
                        this.initialZoom = false;
                    }
                    google.maps.event.removeListener(zoomChangeBoundsListener);
                });
        });




        $('#txtMapSearch').on('change keyup', function () {
            //when user enters search param,
            //compare text in textbox to the titles and codes in the array of locations
            //for each location set invisible if no match or visible again if positive match
            //if textbox is empty then show all
            searchStr = $('#txtMapSearch').val().toLowerCase();
            searchBounds = new google.maps.LatLngBounds();//start with empty array

            if (searchStr.length) {
                for (i = 0; i < (UCC.campusLocations).length; i += 1) {
                    if ((UCC.campusLocations[i].title.toLowerCase().indexOf(searchStr) === -1) && (UCC.campusLocations[i].code.toLowerCase().indexOf(searchStr) === -1)) {
                        UCC.mapMarkers[i].setVisible(false);
                    } else {
                        UCC.mapMarkers[i].setVisible(true);
                        map.initialZoom = true;
                        searchBounds.extend(UCC.mapMarkers[i].position);
                    }
                }
                if (!searchBounds.isEmpty()) {
                    map.fitBounds(searchBounds);
                }
            } else {
                for (i = 0; i < (UCC.campusLocations).length; i += 1) {
                    UCC.mapMarkers[i].setVisible(true);
                    map.fitBounds(allBounds);
                }
            }
        });



        // This activates the location finder if the little target button is clicked
        $('.locate-me-btn').on('click, tap', function () {
            //If geo is available
            if (navigator.geolocation !== undefined) {
                //
                //Set up location icon/marker
                //
                var yourLoc = new google.maps.MarkerImage('img/common/yourLoc.png',
                              new google.maps.Size(44, 44),
                              new google.maps.Point(0, 0),
                              new google.maps.Point(22, 22));
                //
                //Get current location and if it's available then plot it on the map
                //
                navigator.geolocation.getCurrentPosition(function (position) {
                    yourLatLon = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    marker = new google.maps.Marker({
                        icon: yourLoc,
                        position: yourLatLon,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: "You are here"
                    });
                    //Pan the map to the users location
                    map.panTo(yourLatLon);
                });
            } else {
                alert("Geolocation services are not supported by your browser.");
            }
        });
    });
    //-------✂---------------------------------------------
















    // Student Services page
    //-------✂---------------------------------------------
    $('#ThePubs').live('pageinit', function (event) {
        //Get the content from ThePubs.xml
        getXMLThePubs();

        $('#ThePubsList').on('click', 'a', function () {
            // This is the index of the element that more info is wanted for
            // Save this index in a UCC variable so the app knows what XML entry to load
            UCC.requestedIndex = $(this).closest('li').index();
        });
    });
    //-------✂---------------------------------------------





    // Student Services page
    //-------✂---------------------------------------------
    $('#ThePubsDetailsPage').live('pageshow', function (event) {


        getUserLocation();
        // Take index from UCC.requestedIndex
        // Update page content with UCC.ThePubs[i]
        if (UCC.ThePubs[UCC.requestedIndex] === undefined) {
            // If page is refreshed and has no selected index, bounce to the list page
            $.mobile.changePage(($("#ThePubs")), {reverse: false, changeHash: false });
        } else {

            var tempLat = UCC.ThePubs[UCC.requestedIndex].latitude,
                tempLon = UCC.ThePubs[UCC.requestedIndex].longitude,
                myLatlng = new google.maps.LatLng(tempLat, tempLon),
                map = mapInit($(this).find('.mapCanvas'), myLatlng, 17),
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: " "
                });



            // Populate the relevant sections of the details page
            // If the opening hours or the contact details don't exist then hide the titles
            $(this).find("h1").html(UCC.ThePubs[UCC.requestedIndex].title);
            $(this).find("#stuServicesTitle").html(UCC.ThePubs[UCC.requestedIndex].title + '<span class="sub-head"></span>');
            // Send the sub-head element to the function because it takes a sec to calculate the distance, so need to update it afterwards
            getWalkingDistance((tempLat + ',' + tempLon), $(this).find(".sub-head"));

            // Opening hours
            if (UCC.ThePubs[UCC.requestedIndex].hours.length) {
                $(this).find(".open-hours").html(UCC.ThePubs[UCC.requestedIndex].hours);
                $(this).find(".open-hours").show().prev('h3').show();
            } else {
                $(this).find(".open-hours").html('');
                $(this).find(".open-hours").hide().prev('h3').hide();
            }

            //Contact details
            if (UCC.ThePubs[UCC.requestedIndex].contact.length) {
                $(this).find(".phone-list").html(UCC.ThePubs[UCC.requestedIndex].contact);
                $(this).find(".phone-list").show().prev('h3').show();
            } else {
                $(this).find(".phone-list").html('');
                $(this).find(".phone-list").hide().prev('h3').hide();
            }

            // Address
            if (UCC.ThePubs[UCC.requestedIndex].address.length) {
                $(this).find(".dept-address").html(UCC.ThePubs[UCC.requestedIndex].address);
            } else {
                $(this).find(".dept-address").html('');
            }

            //pub-description
            if (UCC.ThePubs[UCC.requestedIndex].description.length) {
                $(this).find(".pub-description").html(UCC.ThePubs[UCC.requestedIndex].description);
                $(this).find(".pub-description").show().prev('h3').show();
            } else {
                $(this).find(".pub-description").html('');
                $(this).find(".pub-description").hide().prev('h3').hide();
            }

        }
    });
    //-------✂---------------------------------------------




    // Student Services page full map
    //-------✂---------------------------------------------
    $('#ThePubsDetailsPageFullMap').live('pageshow', function (event) {

        if (UCC.ThePubs[UCC.requestedIndex] === undefined) {
            // If page is refreshed and has no selected index, bounce to the list page
            $.mobile.changePage(($("#ThePubs")), {reverse: false, changeHash: false });
        } else {
            //Define page start lat|lon coordinates come from global variables set in previous page
            // Map Coordinates
            var myLatlng = new google.maps.LatLng(UCC.ThePubs[UCC.requestedIndex].latitude, UCC.ThePubs[UCC.requestedIndex].longitude),
                map = mapInit($(this).find('.mapCanvas'), myLatlng, 17),
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: "UCC"
                });
        }
    });
    //-------✂---------------------------------------------






}());





