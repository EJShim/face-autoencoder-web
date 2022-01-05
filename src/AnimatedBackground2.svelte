<div class="wrap">
    {#each Array(144) as _,i}
        <div class="c"/>
    {/each}
</div>


<style lang="scss">
    $total: 144;
    $time: 4;
    $height: 400;
    $percent: .69444%;  
    $dotSize: .9;

    
    

    .wrap {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: black;
        overflow-y: hidden;
        
    }

    .c {
        position: relative;
        height: $height+px;
        width: $percent;
        margin-top: -$height+px;
        animation: drop $time+s infinite ease-in;
    &:after {
        content: "";
        position: absolute;
        width: $dotSize+vw;
        height: $dotSize+vw;
        border-radius: 50%;
        left: 50%;
        bottom: -($dotSize/2)+vw;
        margin-left: -($dotSize/2)+vw;
    }
    }

    @for $i from 1 through $total {
        $hue: (300/$total) * 70;
        .c:nth-child(#{$i}){
            left: ($i - 1) * $percent;
            background-image: linear-gradient( to bottom, black, hsla($hue, 100%, 50%, .8));
            animation-delay: random($total) * ($time/$total) * -1s;
            &:after {
            background: hsla($hue, 100%, 50%, 1);
            }
        }
    }

    @keyframes drop {
    80% {
        opacity: 1;
    }
    100% {
        transform: translate3d(0, 150vh, 0);
        opacity: 0;
    }
    }

</style>