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
        on:touchstart
        on:touchend
>
<div class="pink pill-cap cap-bottom"></div>
<div class="pink pill pill-bottom"></div>
<div class="blue pill-cap cap-top" style="--latent-color:{color}"/>
<div class="blue pill pill-top" style="--latent-color:{color}"/>
<div class="blue pill-cap cap-middle" style="--latent-color:{color}"/>
<div class="highlight-circle"></div>
<div class="highlight-rect"></div>
<div class="lighting"></div>

</div>




<style lange="scss">

.capsule{
		position : absolute;

		top : var(--pill-top);
		left : var(--pill-left);
	    
	}


.blue {
  background-color: var(--latent-color);
}

.pink {
  background-color: #ff000d;
}

.pill-cap {
  position: absolute;
  width: 35px;
  height: 35px;
  border-radius: 17px;
}

.cap-top {
  top: -23px;
  left: 23px;
}

.cap-middle {
  top: -5px;
  left: 5px;
}

.cap-bottom {
  top: 25px;
  left: -25px;
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
  top: -11px;
  left: 13px;
  width: 35px;
  height: 30px;
}

.pill-bottom {
  top: 7px;
  left: -10px;
  width: 35px;
  height: 40px;
}

.highlight-circle {
  position: absolute;
  width: 7px;
  height: 7px;
  top: 32px;
  left: -17px;  
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.6);
}

.highlight-rect {
  position: absolute;
  width: 35px;
  height: 7px;
  top: -5px;
  left: 6px;
  border-radius: 7px;
  -ms-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
  background-color: rgba(255, 255, 255, 0.6);
}

.lighting {
  position: absolute;
  width: 81px;
  height: 7px;
  top: 25px;
  left: -15px;
  border-radius: 12px;
  -ms-transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  transform: rotate(-45deg);
  background-color: rgba(67, 119, 155, 0.2);
}

</style>