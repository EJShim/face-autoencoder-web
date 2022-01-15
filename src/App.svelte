<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readPolyData, makeActor, decoder, warmUp} from './utils';	
	import AnimatedBackground from './AnimatedBackground.svelte'
	import AnimatedBackground2 from './AnimatedBackground2.svelte'
	import AnimatedBackground3 from './AnimatedBackground3.svelte'
	import {sampleLatents} from './utils';
	let m_container;
	let m_genericRenderWindow = createGenericRenderWindow();
	let m_renderer = m_genericRenderWindow.getRenderer();
	let m_renderWindow = m_genericRenderWindow.getRenderWindow();
	let m_bWarmUp = false;
	
	let m_targetObject = null;
	let m_targetActor = null;
	let latentColor = `rgb(${12}, ${76}, ${0})`;
	let m_bControl = false;
	let m_bCalculate = false;

	let m_pillTop = "50%";
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
		m_targetActor.getProperty().setColor(239/255, 192/255, 80/255);
		m_targetActor.getProperty().setSpecular(true);		
		m_targetActor.getProperty().setSpecularPower(400);		
				
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await warmUp();		
		await decoder(m_targetObject);		
		m_renderer.addActor(m_targetActor);
		m_renderer.resetCamera();
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
	
	latentColor = `rgb(${128*(latentWeights[0]+latentWeights[3])}, ${128*(latentWeights[1]+latentWeights[3])}, ${128*(latentWeights[2]+latentWeights[3])})`;
	m_targetActor.getProperty().setAmbientColor(latentWeights[0], latentWeights[1], latentWeights[2]);

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
	m_pillLeft = `${x-50}px`
	m_pillTop =  `${y-50}px`


	//Calculate Latent
	latentFunction(x / m_windowInnerWidth, y/ m_windowInnerHeight)
}
</script>


<AnimatedBackground3/>
<svelte:window on:mousemove={e=>{onMouseMove(e)}}
				bind:innerWidth={m_windowInnerWidth}
				bind:innerHeight={m_windowInnerHeight}/>

<div class="renderer" bind:this={m_container}/>

{#if m_bWarmUp}	

	<div class="pill" 
		style="--pill-top:{m_pillTop}; 
			--pill-left:{m_pillLeft};
			--latent-color:{latentColor}"
		on:mousedown={e=>{m_bControl=true;}}
		on:mouseup={e=>{m_bControl=false;}}			
		/>
{/if}




<style lang="scss">
	

	.renderer{
		backdrop-filter: blur(15px);		
		width:100%;
		height:100%;
		position:absolute;
	}

	
	.pill{
		position : absolute;

		top : var(--pill-top);
		left : var(--pill-left);

		width : 100px;
		height : 100px;
		// background-color: var(--latent-color);

		border-radius: 50%;
		background: radial-gradient(circle at 30px 30px, #5cabff, #000);

	}

</style>