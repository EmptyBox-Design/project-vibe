import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    isochrone: [],
    barData: {
      Entertainment: 0,
      Business: 0,
      "Convenience Stores": 0,
      Retail: 0,
      Parking: 0,
      "Food & Restaurants": 0,
      "Religious Institution": 0,
    },
    mapColors: {
      Entertainment: "#F8504D",
      Business: "#90d743",
      "Convenience Stores": "#5ec962",
      Retail: "#31688e",
      Parking: "#443983",
      "Food & Restaurants": "#440154",
      "Religious Institution": "#577590",
      Others: "#7d8597",
    },
    distance: 5,
    selectedCoords: [],
  }),
  getters: {
    barArray() {
      return Object.values(this.barData);
    },
    colors() {
      const colors = Object.values(this.mapColors);
      colors.splice(-1);
      return colors;
    },
  },
  actions: {
    async CallIsochrone(coordinates) {
      const [lat, lng] = coordinates;
      const access_token =
        "pk.eyJ1IjoibmFuYW1pc2FudGFjcnV6IiwiYSI6ImNsYTQ3aGJjMTB4dXYzcG8zdHN0bnZ5NGwifQ.s-VMNIIk8D2A3qpDcY4Ygg";
      const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${lat}%2C${lng}?contours_minutes=${this.distance}&access_token=${access_token}`;
      const response = await fetch(url);

      this.isochrone = await response.json();

      return this.isochrone;
    },
  },
});
