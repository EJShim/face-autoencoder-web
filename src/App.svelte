<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readPolyData, makeActor, decoder, warmUp} from './utils';	
	import AnimatedBackground from './AnimatedBackground.svelte'
	import AnimatedBackground2 from './AnimatedBackground2.svelte'
	import AnimatedBackground3 from './AnimatedBackground3.svelte'
	import Pill from './components/Pill.svelte';
	import {sampleLatents} from './utils';
	let m_container;
	let m_genericRenderWindow = createGenericRenderWindow();
	let m_renderer = m_genericRenderWindow.getRenderer();
	let m_renderWindow = m_genericRenderWindow.getRenderWindow();
	let m_bWarmUp = false;
	
	let m_targetObject = null;
	let m_targetActor = null;
	let latentColor = `rgb(${0}, ${0}, ${255})`;
	let m_bControl = false;
	let m_bCalculate = false;

	let m_pillTop = "10%";
	let m_pillLeft = '50%';
	let m_windowInnerWidth, m_windowInnerHeight;


	onMount(async ()=>{		
		m_genericRenderWindow.setContainer(m_container);
		m_genericRenderWindow.resize();


		//read sample mesh
		m_targetObject = await readPolyData('resources/sample_1_norm.vtp');
		// m_targetObject.getPointData().removeArray("Normals");
		// let colors = new Int8Array(m_targetObject.getNumberOfPoints());						
		// for(let pid in colors){
		// 	const position = m_targetObject.getPoints().getPoint(pid);
		// 	if(position[0] > 0) colors[pid] = 1;
		// }
		// let scalars = vtkDataArray.newInstance({values:colors});
		
		// m_targetObject.getPointData().setScalars(scalars);

		
		m_targetActor = makeActor(m_targetObject);
		m_targetActor.getProperty().setColor(.87, .66, .1);
		m_targetActor.getProperty().setSpecular(true);		
		m_targetActor.getProperty().setSpecularPower(400);		
				
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await warmUp();		
		await decoder(m_targetObject);		
		m_renderer.addActor(m_targetActor);
		m_renderer.resetCamera();
		m_renderer.getActiveCamera().zoom(0.7);
		// m_renderer.getActiveCamera().translate(10, 0, 0);
		// console.log(m_renderer.getActiveCamera());
		m_renderWindow.render();


		m_bWarmUp = true;

		
	});	


const latentFunction = async (x, y)=>{
	
	if(m_bCalculate) return;
	m_bCalculate = true;

	let latentWeights = [
		1 - Math.sqrt( Math.pow(x,2) + Math.pow(y,2) ) ,
		1 - Math.sqrt( Math.pow(x,2) + Math.pow(1-y,2) ),
		1 - Math.sqrt( Math.pow(1-x,2) + Math.pow(y,2) ),
		1 - Math.sqrt( Math.pow(1-x,2) + Math.pow(1-y,2) )
	];
	
	for(let i in latentWeights){
		if(latentWeights[i] < 0) latentWeights[i] = 0
		if(latentWeights[i] > 1) latentWeights[i] = 1
	}
	
	latentColor = `rgb(${255*(latentWeights[0])}, ${0}, ${255*(latentWeights[2])})`;
	// m_targetActor.getProperty().setColor((1-x)/1.4, x/1.4, .4);

	let outputLatent = new Float32Array(16);	
	for(let i in sampleLatents){
		for(let j in outputLatent){
			let weight = latentWeights[i];
			// if(weight > 1) weight = 1
			outputLatent[j] +=  sampleLatents[i][j] * weight;
		}
	}
	
	await decoder(m_targetObject, outputLatent);
	m_targetActor.getMapper().modified();
	m_renderWindow.render();	

	m_bCalculate = false;

	
}



const onMouseMove = (e)=>{
	if(!m_bControl) return;
	let x = e.clientX;
	let y = e.clientY;

	if(x > m_windowInnerWidth || y > m_windowInnerHeight) return;
	

	//Move Pill
	m_pillLeft = `${x-15}px`
	m_pillTop =  `${y-15}px`


	//Calculate Latent
	latentFunction(x / m_windowInnerWidth, y/ m_windowInnerHeight);
}

const onTouchMove = (e)=>{
	if(!m_bControl) return;

	let touch = e.touches[0];
	
	let x = touch.pageX;
	let y = touch.pageY;


	if(x > m_windowInnerWidth || y > m_windowInnerHeight) return;
	

	//Move Pill
	m_pillLeft = `${x-30}px`
	m_pillTop =  `${y-30}px`


	//Calculate Latent
	latentFunction(x / m_windowInnerWidth, y/ m_windowInnerHeight);
	
}
</script>


<AnimatedBackground2/>
<svelte:window on:mousemove={e=>{onMouseMove(e)}}
				on:touchmove={e=>{onTouchMove(e)}}	
				on:mouseup={e=>{m_bControl=false;}}		
				on:touchend={e=>{m_bControl=false;}}													
				bind:innerWidth={m_windowInnerWidth}
				bind:innerHeight={m_windowInnerHeight}/>

<div class="renderer" bind:this={m_container}/>

{#if m_bWarmUp}		

	<Pill top={m_pillTop} 
			left={m_pillLeft}
			color={latentColor}
			on:mousedown={e=>{m_bControl=true;}}	
			on:touchstart={e=>{m_bControl=true;}}			
			on:mouseup={e=>{m_bControl=false;}}	
			on:touchend={e=>{m_bControl=false;}}/>


{/if}




<style lang="scss">
	

	.renderer{
		backdrop-filter: blur(15px);		
		width:100%;
		height:100%;
		position:absolute;
	}

</style>