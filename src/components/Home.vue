<script setup>
import { onMounted } from "vue";
import UIButton from './UIButton.vue'

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import cityDataSource from "../data/sourceData-light.json";
// import pointsWithinPolygon from "@turf/points-within-polygon";

import * as turf from "@turf/turf";

import { useMainStore } from "../store/main";
const store = useMainStore();

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

async function submit() {
  const coords = [-73.991381456669, 40.74592118535034];
  const testCallback = await store.CallIsochrone(coords, 10);
  console.log(testCallback);
  map.getSource("iso").setData(testCallback);
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
  addGeocoder();

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/kpfui/ckn9c157p02a618rzglws1mum",
    zoom: 10,
    center: [-73.997378, 40.730909],
  });
  map.on("load", () => {
    map.addSource("cityData", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map.addLayer({
      id: "businesses",
      type: "circle",
      source: "cityData",
      paint: paintOption,
    });

    map.addSource("iso", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map.addLayer(
      {
        id: "isoLayer",
        type: "line",
        source: "iso",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 2,
        },
      },
      "poi-label"
    );

    map.on("click", "businesses", (e) => {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const descriptionRoot = e.features[0];
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;

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
</script>

<template>
  <div id="map" class="absolute h-screen top-0 overflow-hidden"></div>

  <!-- Search Bar -->
  <div
    class="absolute navbar-height top-0 left-0 md:left-8 lg:left-8 w-full md:w-[50vw] lg:w-[50vw] p-4 rounded-lg max-h-[700px]"
  >
    <div class="flex__container">
      <div id="search-container" class="grow dark:bg-gray-800"></div>
      <UIButton></UIButton>
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

.flex__container{
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
