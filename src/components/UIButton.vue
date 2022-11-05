<template>
<form>
    <h1>Please select a walking radius</h1>
    <div class = "radio__container">    
        <label>
          <input type="radio" name="question1" @click="onClick"/>
          <span>5 miles</span>
        </label>
        <label>
          <input type="radio" name="question1" @click="onClick"/>
          <span>10 miles</span>
        </label>
    </div>
    <div class="apply">
      <button class="btn" @click = "onClick" >Supply</button>
    </div>
  </form>
  </template>
  
  <script>
  
  </script>
  
  <style lang="css" scoped src='./UIButton.css'/>