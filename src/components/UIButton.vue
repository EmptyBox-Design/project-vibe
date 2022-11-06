<script setup>
import { useMainStore } from "../store/main";
const store = useMainStore();

const emits = defineEmits(["reset", "submit"]);

function updateDistance(val) {
  store.distance = val;
}
</script>

<template>
  <div class="my-2 bg-white w-[250px] p-4">
    <div class="text-slate-800 font-mid">
      <h4>Select a Walking Distance</h4>
    </div>
    <div class="flex-row">
      <div class="form-check">
        <input
          @input="updateDistance(5)"
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
          @input="updateDistance(10)"
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
    <div class="flex">
      <button
        @click="$emit('submit')"
        class="bg-emerald-700 m-2 p-4 w-full hover:bg-opacity-70 rounded-lg"
      >
        Submit
      </button>
      <button
        @click="$emit('reset')"
        class="border-2 border-rose-500 m-2 p-4 w-full hover:bg-rose-500 hover:text-white text-slate-700 rounded-lg"
      >
        Reset
      </button>
    </div>
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
