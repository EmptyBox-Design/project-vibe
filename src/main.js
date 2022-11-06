import { createApp } from "vue";

// TAILWIND
import "./style/index.css";

// APP ROOT
import App from "./App.vue";

import VueApexCharts from 'vue3-apexcharts'

import { createPinia } from "pinia";
const pinia = createPinia();

// CREATE APP
const app = createApp(App);

app.use(pinia);
app.use(VueApexCharts);
app.mount("#app");
