
//import {API_key} from './config.js';

// Store the API query variables
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });
  
// Function to determine marker size
function markerSize(magnitude) {
    return magnitude * 10000;
  };
  
  // Function to determine marker color by depth
  function chooseColor(depth){
    if (depth < 10) return "lightgreen";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "red";
  }

  function createFeatures(earthquakeData) {
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`Location: ${feature.properties.place} <br> Magnitude: ${feature.properties.mag} <br> Depth: ${feature.geometry.coordinates[2]}</br>`);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,

    // Point to layer used to alter markers
    pointToLayer: function(feature, latlng) {

        // Determine the style of markers based on properties
        let markers = {
          radius: markerSize(feature.properties.mag),
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          stroke: true,
          weight: 0.5
        }
        return L.circle(latlng,markers);
      }
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Create a tile layer

    let street = L.tileLayer(
       "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
     attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
 });

    //let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //})

   // Create layer for tectonic plates
    let tectonicPlates = new L.layerGroup();

    // Perform a GET request to the tectonicplatesURL
    d3.json(tectonicplatesUrl).then(function (plates) {

        // Console log the data retrieved 
        console.log(plates);
        L.geoJSON(plates, {
            color: "orange",
            weight: 2
        }).addTo(tectonicPlates);
    });
  
    // Create a baseMaps object
    let baseMaps = {
        "street": street
    };
  
    // Create an overlay object to hold our overlay
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Add legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];
    
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>"
  
    for (let i =0; i < depth.length; i++) {
      div.innerHTML += 
      '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
        depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
      }
    return div;
  };
  legend.addTo(myMap);
  }


