import { defineStore } from 'pinia'

export const useMainStore = defineStore("main", {
  state: () => ({
    isochrone: []
  }),
  getters: {},
  actions: {
    async CallIsochrone(coordinates, contour_minutes) {
      const [lat, lng] = coordinates
      const access_token = 'pk.eyJ1Ijoic2FuZHJhY2FpIiwiYSI6ImNsYTQ3aGFodTBhYjk0MnBjZ3YwbnJzNHYifQ.f0HC7hF6RhTQ2JcVDtfnRA'
      const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${lat}%2C${lng}?contours_minutes=${contour_minutes}&access_token=${access_token}`
      const response = await fetch(url)

      this.isochrone = await response.json()
      console.log("reponse", this.isochrone)
      
      return this.isochrone
    }
  },
});
