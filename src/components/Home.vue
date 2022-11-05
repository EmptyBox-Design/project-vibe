<script setup>
import { onMounted } from "vue";

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import pointsWithinPolygon from "@turf/points-within-polygon";

import * as turf from "@turf/turf";

import { useMainStore } from "../store/main";
const store = useMainStore();

// GLOBALS
let map = null;
// SELECTED COORDS FROM GEOCODER
let selectedCoords = [];
// MARKER CONTAINER
let selectedLocationMarker = {};

/**
 * @param {Array} coords latitude longitude coordinate pair
 * @return moves the scene camera to the given coordinate location
 */
function flyTo(coords) {
  map.flyTo({
    center: coords,
    zoom: 15,
    speed: 0.8,
    curve: 1.2,
    easing(t) {
      return t;
    },
  });
}

/**
 * Takes a polygon
 * @param {Array} pts coordinate array of points to search
 * @param {Array} search coordinate array of polygon to search within
 */
function getPointsWithinPolygon(pts, search) {
  var points = turf.points(pts);

  var searchWithin = turf.polygon(search);

  const ptsWithin = pointsWithinPolygon(points, searchWithin);

  return ptsWithin;
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
    if (selectedCoords.length > 0) {
      resetMapFilter();
      removeMapMarker();
    }
    selectedCoords = event.result.center;
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
  map.on("load", () => {});

  addGeocoder();
});
</script>

<template>
  <div id="map" class="absolute h-screen top-0 overflow-hidden"></div>

  <!-- Search Bar -->
  <div
    class="absolute navbar-height top-0 left-0 md:left-8 lg:left-8 w-full md:w-[50vw] lg:w-[50vw] p-4 rounded-lg max-h-[700px]"
  >
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
</style>
