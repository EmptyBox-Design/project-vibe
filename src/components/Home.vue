<script setup>
import { onMounted } from "vue";

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import cityDataSource from "../data/sourceData-light.json";

// GLOBALS
let map = null;
// SELECTED COORDS FROM GEOCODER
let selectedCoords = [];
// MARKER CONTAINER
let selectedLocationMarker = {};

// PAINT OPTION
const paintOption = {
  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  "circle-color": [
    "match",
    ["get", "Industry"],
    "Garage",
    "#fbb03b",
    "Tobacco Retail Dealer",
    "#e55e5e",
    /* other */ "#091283",
  ],
  // "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  "circle-radius": {
    base: 1.75,
    stops: [
      [12, 2],
      [22, 180],
    ],
  },
};

/**
 * @param {Array} coords latitude longitude coordinate pair
 * @return moves the scene camera to the given coordinate location
 */
function flyTo(coords) {
  map.flyTo({
    center: coords,
    zoom: 12,
    speed: 1,
    curve: 1.2,
    easing(t) {
      return t;
    },
  });
}

/**
 * Adds Map marker to the map given set of coordinates
 * @param {Array} coords Lat/Lng
 */
function addMapMarker(coords) {
  selectedLocationMarker = new mapboxgl.Marker().setLngLat(coords).addTo(map);
}

function resetMapFilter() {
  selectedCoords = [];
}

function removeMapMarker() {
  selectedLocationMarker.remove();
}

function addGeocoder() {
  const geocoder = new MapboxGeocoder({
    accessToken: import.meta.env.VITE_MAPBOX_API_TOKEN,
    mapboxgl: mapboxgl,
    marker: false,
  });
  /**
   * GEOCODER EVENT HANDLERS
   */
  geocoder.on("result", (event) => {
    selectedCoords = event.result.center;
    // filterByRadius(selectedCoords, searchRadius);
    addMapMarker(selectedCoords);
    flyTo(selectedCoords);
  });
  geocoder.on("clear", () => {
    resetMapFilter();
    removeMapMarker();
  });
  geocoder.on("error", () => {
    resetMapFilter();
    removeMapMarker();
  });

  geocoder.addTo("#search-container");
}

/**
 * MOUNTED
 */
onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/kpfui/ckn9c157p02a618rzglws1mum",
    zoom: 10,
    center: [-73.997378, 40.730909],
  });

  map.on("load", () => {
    addGeocoder();
    map.addSource("cityData", {
      type: "geojson",
      data: cityDataSource,
    });
    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", "businesses", (e) => {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const descriptionRoot = e.features[0];
      const description =
        "Name: " + descriptionRoot["properties"]["Business Name"];

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on("mouseenter", "businesses", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "businesses", () => {
      map.getCanvas().style.cursor = "";
    });
  });
});
// FILTER
function filterBy(Industry) {
  const filters = ["==", "Industry", Industry];
  if (map.getLayer("businesses")) {
    map.removeLayer("businesses");
  }
  map.addLayer({
    id: "businesses",
    type: "circle",
    source: "cityData",
    // filter: ["has", "point_count"],
    filter: filters,
    paint: paintOption,
  });
}
</script>

<template>
  <div id="map" class="absolute h-screen top-0 overflow-hidden"></div>

  <!-- Search Bar -->
  <div
    class="absolute navbar-height top-0 left-0 md:left-8 lg:left-8 w-full md:w-[50vw] lg:w-[50vw] p-4 rounded-lg max-h-[700px]"
  >
    <div class="selection-div">
      PoC: Filter by Industry
      <button @click="filterBy('Garage')">Garage</button>
      <button @click="filterBy('Tobacco Retail Dealer')">
        Tobacco Retail Dealer
      </button>
    </div>

    <div class="relative">
      <div class="flex my-2">
        <div id="search-container" class="grow dark:bg-gray-800"></div>
      </div>
    </div>
  </div>
</template>

<style>
.mapboxgl-ctrl-geocoder {
  width: 100%;
  min-width: 100%;
  box-shadow: none;
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
}
.mapboxgl-ctrl-geocoder,
.mapboxgl-ctrl-geocoder--icon,
.mapboxgl-ctrl-geocoder--input {
  height: 100%;
}
.mapboxgl-ctrl-geocoder--icon {
  top: -1px;
}
.mapboxgl-popup {
  max-width: 400px;
  font: 12px/20px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
.mapboxgl-popup-content {
  color: black !important;
}
.selection-div {
  position: absolute;
  min-width: 200px;
  right: 0;
  top: 0;
  background-color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  color: black;
}
.selection-div button {
  background-color: rgba(123, 123, 123, 0.6);
}
.selection-div button:last-child {
  background-color: rgba(134, 12, 132, 0.6);
}
</style>
