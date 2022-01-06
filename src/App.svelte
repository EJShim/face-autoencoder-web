<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readPolyData, makeActor, decoder, warmUp} from './utils';	
	import AnimatedBackground from './AnimatedBackground.svelte'
	import AnimatedBackground2 from './AnimatedBackground2.svelte'
	import AnimatedBackground3 from './AnimatedBackground3.svelte'
	import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
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

	onMount(async ()=>{		
		m_genericRenderWindow.setContainer(m_container);
		m_genericRenderWindow.resize();


		//read sample mesh
		m_targetObject = await readPolyData('resources/sample_1_norm.vtp');

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
		m_targetActor.getProperty().setSpecularColor(.2, .2, .2);
		m_targetActor.getProperty().setSpecularPower(300);		
				
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await warmUp();		
		await decoder(m_targetObject);		
		m_renderer.addActor(m_targetActor);
		m_renderer.resetCamera();
		m_renderer.getActiveCamera().translate(10, 0, 0);
		// console.log(m_renderer.getActiveCamera());
		m_renderWindow.render();


		m_bWarmUp = true;

		
	});	

const startControl = ()=>{
	m_bControl = true;
}

const endControl = ()=>{
	m_bControl = false;
}

const onMouseMove = async (e)=>{

	if(!m_bControl) return;
	if(m_bCalculate) return;
	m_bCalculate = true;
	
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
	];
	
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
</script>


<AnimatedBackground1/>

<div class="renderer" bind:this={m_container}/>

{#if m_bWarmUp}
	<div 
		class="controller" 
		style="--latent-color:{latentColor}"
		on:mousedown={e=>{startControl()}}
		on:touchstart={e=>{startControl()}}
		on:mousemove={e=>{onMouseMove(e)}}
		on:touch={e=>{onMouseMove(e)}}
		on:mouseup={e=>{endControl()}}
		
		on>		
		Click & Drag Here (Latent Space)
	</div>
{/if}




<style lang="scss">


	.renderer{
		backdrop-filter: blur(15px);
		// background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
		// background: linear-gradient(to bottom, rgb(44, 125, 158) , rgb(135, 206, 235)); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
		// background-color: rgba(#000, 0.5);
		width:100%;
		height:100%;
		position:absolute;
	}

	

	.controller{

		position : absolute;

		top : calc(50% - 150px);
		left : calc(100% - 320px);

		width : 300px;
		height : 300px;
		background-color:var(--latent-color);
		color : white;

		display: flex;
		align-items: center;
		justify-content: center;

		box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
		user-select: none;
	}

</style>