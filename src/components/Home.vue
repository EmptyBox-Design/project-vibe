<script setup>
import { onMounted } from "vue";

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import cityDataSource from "../data/cleanedBusinessData.json";

import pointsWithinPolygon from "@turf/points-within-polygon";
import * as turf from "@turf/turf";

import { useMainStore } from "../store/main";
const store = useMainStore();

// GLOBALS
let map = null;
// MARKER CONTAINER
let selectedLocationMarker = {};
// MARKER CATEGORY AND COLOR
const markerCategoryAndColor = {
  Entertainment: "#f94144",
  Business: "#f3722c",
  "Convenience Stores": "#f8961e",
  Retail: "#f9844a",
  Parking: "#f9c74f",
  "Food & Restaurants": "#001d3d",
  "Religious Institution": "#577590",
  Others: "#7d8597",
};

// PAINT OPTION
const paintOption = {
  // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
  "circle-color": [
    "match",
    ["get", "Business_Type"],
    "Entertainment",
    markerCategoryAndColor["Entertainment"],
    "Business",
    markerCategoryAndColor["Business"],
    "Convenience Stores",
    markerCategoryAndColor["Convenience Stores"],
    "Retail",
    markerCategoryAndColor["Retail"],
    "Parking",
    markerCategoryAndColor["Parking"],
    "Food & Restaurants",
    markerCategoryAndColor["Food & Restaurants"],
    "Religious Institution",
    markerCategoryAndColor["Religious Institution"],
    /* other */ markerCategoryAndColor["Others"],
  ],
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
  // var points = turf.points(pts);
  var searchWithin = turf.polygon(search);

  // const ptsWithin = pointsWithinPolygon(points, searchWithin);

  const ptsWithin = pointsWithinPolygon(pts, searchWithin);
  console.log(ptsWithin);
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
  store.selectedCoords = [];
}

function removeMapMarker() {
  if (selectedLocationMarker) selectedLocationMarker.remove();
}

async function submit() {
  const distance = 10;
  const isochroneResponse = await store.CallIsochrone(
    store.selectedCoords,
    distance
  );

  // SET ISOCHRONE AS POLYGON
  map.getSource("iso").setData(isochroneResponse);

  const queriedPoints = getPointsWithinPolygon(cityDataSource, [
    isochroneResponse["features"][0]["geometry"]["coordinates"],
  ]);
  map.getSource("cityData").setData(queriedPoints);
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
    if (store.selectedCoords.length > 0) {
      resetMapFilter();
      if (selectedLocationMarker) removeMapMarker();
    }
    store.selectedCoords = event.result.center;
    addMapMarker(store.selectedCoords);
    submit();
    flyTo(store.selectedCoords);
  });
  geocoder.on("clear", () => {
    resetMapFilter();
    if (selectedLocationMarker) removeMapMarker();
  });
  geocoder.on("error", () => {
    resetMapFilter();
    if (selectedLocationMarker) removeMapMarker();
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
      const descriptionRoot = e.features[0]["properties"];
      const businessName = descriptionRoot["Business Name"]
        ? `<h1 style='background-color:${
            markerCategoryAndColor[descriptionRoot["Business_Type"]]
          }'><b>${descriptionRoot["Business Name"]}</b></h1>`
        : "N/A";
      const Industry = descriptionRoot["Industry"]
        ? `<h1>Industry: ${descriptionRoot["Industry"]}</h1>`
        : "";
      const BusinessType = descriptionRoot["Business_Type"]
        ? `<h1>Business Type: ${descriptionRoot["Business_Type"]}</h1>`
        : "";
      const BusinessAddress = descriptionRoot["BusinessAddress"]
        ? `<span style='color:grey;text-align:right'>Business Type: ${descriptionRoot["BusinessAddress"]}</span>`
        : "";

      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(businessName + businessName2 + businessContact)
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
  <!-- Search Bar -->
  <div id="map" class="absolute h-screen top-0 overflow-hidden"></div>
  <div
    class="absolute navbar-height top-0 left-0 md:left-8 lg:left-8 w-full md:w-[50vw] lg:w-[50vw] p-4 rounded-lg max-h-[700px]"
  >
    <h2 class="text-slate-900 font-bold text-2xl">Project Vibe</h2>
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
</style>