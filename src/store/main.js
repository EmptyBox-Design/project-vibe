import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({}),
  getters: {},
  actions: {
    async getPlutoLotsByPointRadius(lat, lng, radius) {
      const endpoint = `https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/MAPPLUTO/FeatureServer/0/query?where=1%3D1&geometry=${lat}%2C${lng}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${radius}&units=esriSRUnit_Meter&outSR=4326&f=json&outFields=YearBuilt,Latitude,Longitude,BBL,LotArea,CD,Borough`;

      const response = await fetch(endpoint, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      const collection = {
        type: "FeatureCollection",
        features: data.features.map((d) => {
          return {
            type: "Feature",
            properties: d.attributes,
            geometry: {
              type: "Polygon",
              coordinates: d.geometry.rings,
            },
          };
        }),
      };

      return collection;
    },
  },
});
