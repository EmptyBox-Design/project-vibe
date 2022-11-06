<script setup>
import { useMainStore } from "../store/main"
const store = useMainStore()

const series = [{
  name: 'Inflation',
  data: store.barData
}]

const colors = ['#A300D6', '#5C4742', '#662E9B', '#D7263D', '#449DD1', '#2B908F', '#F86624'];

let index = 0;

const chartOptions = {
  chart: {
    height: 150,
    width: 450,
    type: 'bar',
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: 'top', // top, center, bottom
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val;
    },
    offsetY: -20,
    style: {
      fontSize: '10px',
      colors: ["#304758"]
    },
  },

  xaxis: {
    categories: ["Entertainment", "Business", "Convenience Stores", "Retail", "Parking", "Food & Restaurants", "Religious Institution"],
    labels: {
      style: {
        fontSize: '10px'
      }
    },
    position: 'bottom',
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    crosshairs: {
      fill: {
        type: 'gradient',
        gradient: {
          colorFrom: '#D8E3F0',
          colorTo: '#BED1E6',
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        }
      }
    },
    tooltip: {
      enabled: false,
    }
  },
  colors: [function ({ _, seriesIndex }) {
    if (index < colors.length) {
      const color = colors[index]
      index += 1
      return color
    } 
    else{
      return colors[0]
    }
  }],
  yaxis: {
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
      formatter: function (val) {
        return val;
      }
    }
  },
  title: {
    text: 'Number of Businesses By Category',
    floating: true,
    offsetY: 330,
    align: 'center',
    style: {
      color: '#444'
    }
  }
}

</script>


<template>
  <div id="barchart" class="border-1 rounded-lg">
    <div id="chart">
      <apexchart type="bar" height="230" width="500" :options="chartOptions" :series="series"></apexchart>
    </div>
  </div>
</template>


<style>

</style>