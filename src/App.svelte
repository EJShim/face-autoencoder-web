<script>
	import {onMount} from 'svelte';
	import {createGenericRenderWindow, readMesh, decoder, warmUp} from './utils';	
	let m_container;
	let m_genericRenderWindow = createGenericRenderWindow();
	let m_renderer = m_genericRenderWindow.getRenderer();
	let m_renderWindow = m_genericRenderWindow.getRenderWindow();
	let m_bWarmUp = false;

	onMount(async ()=>{		
		m_genericRenderWindow.setContainer(m_container);
		m_genericRenderWindow.resize();


		//read sample mesh
		const renderingObject = await readMesh('resources/sample_1.vtp');

		
		m_renderer.getActiveCamera().setPosition(0, 0, 100);
		m_renderer.getActiveCamera().setViewUp(0, 1, 0);
		

		await warmUp();
		m_bWarmUp = true;
		await decoder(renderingObject);
		renderingObject.addToRenderer(m_renderer);
		m_renderer.resetCamera();
		m_renderWindow.render();

		
	});	
</script>


<div class="renderer" bind:this={m_container}>

</div>

<div class="controllerArea">
	{#if {m_bWarmUp}}
		<div class="controller"/>		
	{/if}

</div>


<style>

	.renderer{
		background: linear-gradient(to bottom, #9cecfb, #65c7f7, #0052d4); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
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