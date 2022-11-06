<script setup>
import { ref } from "vue";
import { useMainStore } from "../store/main";
const store = useMainStore();

const distance = ref(5);
</script>

<template>
  <div class="my-2 bg-white w-[250px] p-4">
    <div class="text-slate-800 font-mid">
      <h4>Select a Walking Distance</h4>
    </div>
    <div class="flex-row">
      <div class="form-check">
        <input
          v-model="distance"
          :value="5"
          class="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault1"
          checked
        />
        <label
          class="form-check-label inline-block text-gray-800"
          for="flexRadioDefault1"
        >
          5 min
        </label>
      </div>
      <div class="form-check">
        <input
          v-model="distance"
          :value="10"
          class="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
          type="radio"
          name="flexRadioDefault"
          id="flexRadioDefault2"
        />
        <label
          class="form-check-label inline-block text-gray-800"
          for="flexRadioDefault2"
        >
          10 min
        </label>
      </div>
    </div>
    <button
      class="bg-emerald-700 my-2 p-4 w-full hover:bg-opacity-70"
      @click="store.distance = distance"
    >
      Submit
    </button>
  </div>
</template>

<style scoped>
label {
  margin-left: 1rem;
}
.input-container {
  background: white;
  padding: 0.5rem;
}
</style>
