<script setup>
import { onMounted } from "vue";
import UIButton from "./UIButton.vue";

// MAPBOX
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// MAPBOX GEOCODER LIBRARY
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import cityDataSource from "../data/data.json";

import pointsWithinPolygon from "@turf/points-within-polygon";

import Barchart from "./Barchart.vue";

import * as turf from "@turf/turf";

import { useMainStore } from "../store/main";
const store = useMainStore();

// GLOBALS
let map = null;
// MARKER CONTAINER
let selectedLocationMarker = {};
let geocoder = null;

// PAINT OPTION
const paintOption = {
  "circle-color": [
    "match",
    ["get", "Business_Type"],
    "Entertainment",
    store.mapColors["Entertainment"],
    "Business",
    store.mapColors["Business"],
    "Convenience Stores",
    store.mapColors["Convenience Stores"],
    "Retail",
    store.mapColors["Retail"],
    "Parking",
    store.mapColors["Parking"],
    "Food & Restaurants",
    store.mapColors["Food & Restaurants"],
    "Religious Institution",
    store.mapColors["Religious Institution"],
    /* other */ store.mapColors["Others"],
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
function updateBarChart(queriedPoints) {
  store.barData = {
    Entertainment: 0,
    Business: 0,
    "Convenience Stores": 0,
    Retail: 0,
    Parking: 0,
    "Food & Restaurants": 0,
    "Religious Institution": 0,
  };

  queriedPoints.features.forEach((d) => {
    store.barData[d.properties.Business_Type] += 1;
  });

  store.barData = Object.assign({}, store.barData);
}
/**
 * Takes a polygon
 * @param {Array} pts coordinate array of points to search
 * @param {Array} search coordinate array of polygon to search within
 */
function getPointsWithinPolygon(pts, search) {
  var searchWithin = turf.polygon(search);

  const ptsWithin = pointsWithinPolygon(pts, searchWithin);

  updateBarChart(ptsWithin);
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
  map.getSource("iso").setData({
    type: "FeatureCollection",
    features: [],
  });
  map.getSource("cityData").setData({
    type: "FeatureCollection",
    features: [],
  });

  store.barData = Object.assign(
    {},
    {
      Entertainment: 0,
      Business: 0,
      "Convenience Stores": 0,
      Retail: 0,
      Parking: 0,
      "Food & Restaurants": 0,
      "Religious Institution": 0,
    }
  );

  if (selectedLocationMarker) removeMapMarker();

  document.getElementsByClassName(
    "mapboxgl-ctrl-geocoder--input"
  )[0].innerText = "";
}

function removeMapMarker() {
  if (selectedLocationMarker) selectedLocationMarker.remove();
}

async function submit() {
  const isochroneResponse = await store.CallIsochrone(store.selectedCoords);

  // SET ISOCHRONE AS POLYGON
  map.getSource("iso").setData(isochroneResponse);

  const queriedPoints = getPointsWithinPolygon(cityDataSource, [
    isochroneResponse["features"][0]["geometry"]["coordinates"],
  ]);

  map.getSource("cityData").setData(queriedPoints);

  flyTo(store.selectedCoords);
}

function addGeocoder() {
  geocoder = new MapboxGeocoder({
    accessToken: import.meta.env.VITE_MAPBOX_API_TOKEN,
    mapboxgl: mapboxgl,
    marker: false,
  });
  /**
   * GEOCODER EVENT HANDLERS
   */
  geocoder.on("result", async (event) => {
    if (store.selectedCoords.length > 0) {
      resetMapFilter();
    }
    store.selectedCoords = event.result.center;

    addMapMarker(store.selectedCoords);
  });
  geocoder.on("clear", () => {
    resetMapFilter();
  });
  geocoder.on("error", () => {
    resetMapFilter();
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
        ? `<h1 style='color:${
            store.mapColors[descriptionRoot["Business_Type"]]
          }'><b>${descriptionRoot["Business Name"]}</b></h1>`
        : "N/A";
      const businessName2 = descriptionRoot["Business Name 2"]
        ? `<h1>${descriptionRoot["Business Name 2"]}</h1>`
        : "";
      const businessContact = descriptionRoot["Contact Phone Number"]
        ? `<span>📞 ${descriptionRoot["Contact Phone Number"]}</span>`
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
    class="absolute navbar-height top-0 left-0 md:left-8 lg:left-8 w-full md:w-[50vw] lg:w-[50vw] p-4 rounded-lg max-h-[700px] select-none pointer-events-none"
  >
    <div class="flex flex-col justify-around select-none">
      <h2 class="text-slate-900 font-bold text-2xl">Project Vibe</h2>
      <div class="relative">
        <div class="flex my-2">
          <div id="search-container" class="grow dark:bg-gray-800"></div>
        </div>
      </div>
      <UIButton
        class="pointer-events-auto"
        @reset="resetMapFilter"
        @submit="submit"
      ></UIButton>
    </div>
  </div>

  <div class="absolute flex justify-center w-[100vw] bottom-2 p-2">
    <Barchart class="h-[230px] bg-white" />
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
