<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readMesh, decoder} from './utils';	
	let m_container;
	let m_genericRenderWindow = createGenericRenderWindow();
	let m_renderer = m_genericRenderWindow.getRenderer();
	let m_renderWindow = m_genericRenderWindow.getRenderWindow();

	onMount(async ()=>{
		console.log(m_container);

		m_genericRenderWindow.setContainer(m_container);
		m_genericRenderWindow.resize();


		//read sample mesh
		const renderingObject = await readMesh('resources/sample_1.vtp');

		
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await decoder(renderingObject);
		renderingObject.addToRenderer(m_renderer);
		m_renderer.resetCamera();
		m_renderWindow.render();

		
	});	
</script>


<div class="renderer" bind:this={m_container}>

</div>

<div class="controllerArea">

</div>


<style>

	.renderer{
		background: linear-gradient(to bottom, #9cecfb, #65c7f7, #0052d4); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
		width:80%;
		height:100%;
		position:absolute;
	}

	.controllerArea{
		position:absolute;
		left:80%;
		background-color: burlywood;
		width:20%;
		height:100%;
	}

</style>