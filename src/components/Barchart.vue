<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "../store/main";
const store = useMainStore();
const { barData } = storeToRefs(useMainStore());

let series = ref([
  {
    name: "bar-data",
    data: Object.values(store.barData),
  },
]);

watch(barData, () => {
  series.value = [
    {
      name: "bar-data",
      data: store.barArray,
    },
  ];
});
const chartOptions = {
  chart: {
    height: 150,
    width: 450,
    type: "bar",
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: "top", // top, center, bottom
      },
    },
  },
  tooltip: {
    enabled: false,
  },
  toolbar: {
    show: false,
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val;
    },
    offsetY: -20,
    style: {
      fontSize: "10px",
      colors: ["#304758"],
    },
  },
  xaxis: {
    categories: [
      "Entertainment",
      "Business",
      "Convenience Stores",
      "Retail",
      "Parking",
      "Food & Restaurants",
      "Religious Institution",
    ],
    labels: {
      style: {
        fontSize: "10px",
      },
    },
    position: "bottom",
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  colors: [
    function ({ value, seriesIndex, dataPointIndex, w }) {
      return store.colors[dataPointIndex];
    },
  ],
  grid: {
    yaxis: {
      lines: {
        show: false,
      },
    },
  },
  yaxis: {
    enabled: false,
    show: false,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      formatter: function (val) {
        return val;
      },
    },
  },
  title: {
    text: "Number of Businesses By Category",
    floating: true,
    offsetY: 330,
    align: "center",
    style: {
      color: "#444",
    },
  },
};
</script>

<template>
  <div id="barchart" class="border-1 rounded-lg">
    <div id="chart">
      <apexchart
        type="bar"
        height="230"
        width="500"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<style></style>
