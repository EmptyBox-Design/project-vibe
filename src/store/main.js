
import { defineStore } from 'pinia'

export const useMainStore = defineStore("main", {
  state: () => ({
    isochrone: [],
    barData: [1, 2, 3, 4, 5, 6, 7]
  }),
  getters: {},
  actions: {
    async CallIsochrone(coordinates, contour_minutes) {
      const [lat, lng] = coordinates
      const access_token = 'pk.eyJ1IjoibmFuYW1pc2FudGFjcnV6IiwiYSI6ImNsYTQ3aGJjMTB4dXYzcG8zdHN0bnZ5NGwifQ.s-VMNIIk8D2A3qpDcY4Ygg'
      const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${lat}%2C${lng}?contours_minutes=${contour_minutes}&access_token=${access_token}`
      const response = await fetch(url)

      this.isochrone = await response.json()
      console.log("response", this.isochrone)

      return this.isochrone
    }
  },

});
