<script setup>
import { onMounted } from "vue";

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import { useMainStore } from "../store/main";
const store = useMainStore();

// GLOBALS
let map = null;
// map hover
let hoverID = null;
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

async function addLotsByRadius(coords) {
  const [lat, lng] = coords;
  const lots = await store.getPlutoLotsByPointRadius(lat, lng, 200);
  map.getSource("lot-source").setData(lots);
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

    addMapMarker(selectedCoords);
    addLotsByRadius(selectedCoords);
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

function addLotLayer() {
  map.addSource("lot-source", {
    type: "geojson",
    generateId: true,
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "lots",
    type: "fill",
    source: "lot-source",
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ],
    },
  });

  // POLYGON MOUSE OVER LISTENER
  map.on("mousemove", "lots", (e) => {
    if (e.features.length > 0) {
      if (hoverID !== null) {
        map.setFeatureState(
          { source: "lot-source", id: hoverID },
          { hover: false }
        );
      }

      hoverID = e.features[0].id;

      map.setFeatureState(
        { source: "lot-source", id: hoverID },
        { hover: true }
      );
    }
  });

  // POLYGON MOUSE LEAVE LISTENER
  map.on("mouseleave", "lots", () => {
    if (hoverID !== null) {
      map.setFeatureState(
        { source: "lot-source", id: hoverID },
        { hover: false }
      );
    }
    hoverID = null;
  });
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
    addLotLayer();
  });
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
