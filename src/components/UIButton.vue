<template>
  <form>
    <h1>Please select a walking radius</h1>
    <div class="radio__container">
      <label>
        <input type="radio" name="question1" @click="onClick" />
        <span>5 miles</span>
      </label>
      <label>
        <input type="radio" name="question1" @click="onClick" />
        <span>10 miles</span>
      </label>
    </div>
    <div class="apply">
      <button class="btn" @click="onClick">Supply</button>
    </div>
  </form>
</template>

<script></script>

<style scoped>
body {
  padding: 5em;
  font: 14px/32px "Polaris";
}

h1 {
  font-size: 14px;
  font-weight: 600;
  color: rgb(78, 78, 78);
  padding: 4px 0 4px 12px;
  margin: 0;
  border-bottom: 1px solid #d9d9d9;
  background-color: #f7f7f7;
}

form {
  display: flex;
  flex-direction: column;
  float: left;
  width: 250px;
  border-radius: 2rem;
  transition: 0.25s ease;
}

.radio__container {
  display: flex;
  flex-direction: column;
}

label {
  padding-left: 1rem;
  font-size: 0.875rem;
  padding-top: 0.75rem;
  display: block;
  background-color: #ffffff;
  color: #000;
  cursor: pointer;
  height: 3rem;
  float: left;
  width: auto;
}

label:hover {
  background-color: #e8e8e8;
  transition: 0.3s;
}

input {
  margin: 4px 8px 0 0;
}

input:before {
  background-color: #e8e8e8;
}

.apply {
  float: left;
  width: 100%;
  height: 60px;
  background-color: #f7f7f7;
  border-radius: 0 0 4px 4px;
}

.btn {
  font: "Polaris";
  font-size: 1rem;
  float: left;
  height: 32px;
  margin: 12px 12px;
  padding: 0 16px;
  color: #000;
  background: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  box-shadow: 0 0 0 0 rgba(0, 170, 238, 1);
  cursor: pointer;
  outline: none;
}

.btn:hover {
  background-color: #a0a0a0;
  transition: 0.3s;
}
</style>
