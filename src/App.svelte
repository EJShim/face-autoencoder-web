<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readMesh, decoder, warmUp} from './utils';	
	import {sampleLatents} from './utils';
	let m_container;
	let m_genericRenderWindow = createGenericRenderWindow();
	let m_renderer = m_genericRenderWindow.getRenderer();
	let m_renderWindow = m_genericRenderWindow.getRenderWindow();
	let m_bWarmUp = false;
	let m_bCalculating = false;
	let m_targetObject = null;

	onMount(async ()=>{		
		m_genericRenderWindow.setContainer(m_container);
		m_genericRenderWindow.resize();


		//read sample mesh
		m_targetObject = await readMesh('resources/sample_1.vtp');
		m_targetObject.getProperty().setColor(.8, .7, .3)
		m_targetObject.updateActor();

		
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await warmUp();
		m_bWarmUp = true;
		await decoder(m_targetObject);
		m_targetObject.addToRenderer(m_renderer);
		m_renderer.resetCamera();
		m_renderWindow.render();

		
	});	

const onMouseMove = async (e)=>{

	// if(m_bCalculating) return;

	m_bCalculating = true;
	let rect = e.target.getBoundingClientRect();
	let x = e.clientX - rect.left; //x position within the element.
	let y = e.clientY - rect.top;  //y position within the element.

	x = x / rect.width;
	y = y / rect.height

	let latentWeights = [
		1 - Math.sqrt( Math.pow(x,2) + Math.pow(y,2) ) ,
		1 - Math.sqrt( Math.pow(x,2) + Math.pow(1-y,2) ),
		1 - Math.sqrt( Math.pow(1-x,2) + Math.pow(y,2) ),
		1 - Math.sqrt( Math.pow(1-x,2) + Math.pow(1-y,2) )
	]


	let outputLatent = new Float32Array(16);	
	for(let i in sampleLatents){
		for(let j in outputLatent){
			let weight = latentWeights[i];
			// if(weight > 1) weight = 1
			outputLatent[j] +=  sampleLatents[i][j] * weight;
		}
	}

	// console.log(outputLatent)

	// console.log(outputLatent);
	await decoder(m_targetObject, outputLatent);
	m_renderWindow.render();

	m_bCalculating = false;

	
}
</script>


<div class="renderer" bind:this={m_container}>

</div>

<div class="controllerArea">
	{#if {m_bWarmUp}}
		<div class="controller" on:mousemove={e=>{onMouseMove(e)}}></div>
	{/if}

</div>


<style>

	.renderer{
		background: linear-gradient(to bottom, rgb(44, 125, 158) , rgb(135, 206, 235)); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
		width:calc(100% - 250px);
		height:100%;
		position:absolute;
	}

	.controllerArea{
		position:absolute;
		left:calc(100% - 250px);
		background-color: burlywood;
		width:250px;
		height:100%;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.controller{
		width : 200px;
		height : 200px;
		background-color: chocolate;
	}

</style>