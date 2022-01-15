<script>
export let top;
export let left;
export let color;

</script>

<div class="capsule" 
    style="--pill-top:{top}; 
        --pill-left:{left};"
        on:mousedown
        on:mouseup
>
<div class="pink pill-cap cap-bottom"></div>
<div class="pink pill pill-bottom"></div>
<div class="blue pill-cap cap-top"></div>
<div class="blue pill pill-top"></div>
<div class="blue pill-cap cap-middle"></div>
<div class="highlight-circle"></div>
<div class="highlight-rect"></div>
<div class="lighting"></div>

</div>




<style lange="scss">

.capsule{
		position : absolute;

		top : var(--pill-top);
		left : var(--pill-left);

		/* width : 100px;
		height : 100px;		 */

        background-color: red;
	}


.blue {
  background-color: #0011ff;
}

.pink {
  background-color: #ff000d;
}

.pill-cap {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 35px;
}

.cap-top {
  top: -47px;
  left: 47px;
}

.cap-middle {
  top: -10px;
  left: 10px;
}

.cap-bottom {
  top: 50px;
  left: -50px;
}

.pill {
  position: absolute;
  margin: 0;
  -ms-transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -o-transform: rotate(45deg);
  transform: rotate(45deg);
}

.pill-top {
  top: -23px;
  left: 27px;
  width: 70px;
  height: 60px;
}

.pill-bottom {
  top: 15px;
  left: -20px;
  width: 70px;
  height: 80px;
}

.highlight-circle {
  position: absolute;
  width: 15px;
  height: 15px;
  top: 65px;
  left: -35px;  
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.6);
}

.highlight-rect {
  position: absolute;
  width: 70px;
  height: 15px;
  top: -10px;
  left: 12.5px;
  border-radius: 15px;
  -ms-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
  background-color: rgba(255, 255, 255, 0.6);
}

.lighting {
  position: absolute;
  width: 162.5px;
  height: 15px;
  top: 50px;
  left: -30px;
  border-radius: 25px;
  -ms-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
  background-color: rgba(67, 119, 155, 0.2);
}

</style>