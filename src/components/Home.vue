<script setup>
import { onMounted } from 'vue';

// MAPBOX
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// GLOBALS
let map;

/**
 * MOUNTED
 */
onMounted(() => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia3BmdWkiLCJhIjoiY2p6MWcxMXl4MDFlbTNsbDc1bnp6N3FjYSJ9.66qFOXwI661MOPOf7x96yA'
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kpfui/ckn9c157p02a618rzglws1mum',
    zoom: 10,
    center: [-73.997378, 40.730909]
  })
  map.on('load', () => {
    console.log('map loaded')

    /**
     * TODO:
     * 
     * Add pluto dataset
     * 
     * Add polygon listener
     */
  })
})



</script>

<template>
  <div id="map" class="absolute h-screen w-screen top-0 left-0 overflow-hidden"></div>
</template>

<style>

</style>
