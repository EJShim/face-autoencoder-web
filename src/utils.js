import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ViewInfo from '@imago/iwtk.js/dist/data/ViewInfo';
import MeshDataIO from '@imago/iwtk.js/dist/loader/MeshDataIO';
import MeshRenderingObject from '@imago/iwtk.js/dist/data/MeshRenderingObject'; 
import axios from 'axios';
import * as ort from 'onnxruntime-web'


//global variables?
const m_meshLoader = new MeshDataIO();
const m_sampleLatents = [[-0.3565,  0.1575,  1.0918,  2.4775,  2.2573, -0.1390, -1.3193,  3.0594,
                            -0.9858,  0.7706, -0.0137,  2.7787,  2.6453,  1.1211,  0.4391, -0.9247],
                        [-2.2181,  1.3984,  0.3352,  1.9815, -2.0877,  0.9447,  1.8893, -0.9952,
                            -0.3084, -0.0416, -0.4527,  1.8579,  2.5294,  4.0021,  0.2990, -1.0654],
                        [ 1.0405,  0.9194,  1.9217, -1.2535,  0.7970, -1.7441,  3.7671, -0.8281,
                            1.4710, -0.5767, -0.9464, -2.3008, -2.1810,  1.7609, -3.3695, -1.5451],
                        [ 1.0568, -2.5039, -2.0869,  1.4479,  0.4336, -2.8037,  2.4863, -1.1014,
                            0.6378, -2.5953, -0.3835,  2.7578,  1.5824, -2.3905,  0.2244, -0.0916]];

export const createGenericRenderWindow = () => {
    
    
    let genericRenderWindow = vtkGenericRenderWindow.newInstance();
        const viewInfo = new ViewInfo(
            'main',
            '3D',
            false,
            genericRenderWindow
        );
        viewInfo.update();
        genericRenderWindow.getRenderer().setBackground(0, 0, 0, 0);        

        const renderer = genericRenderWindow.getRenderer();

        //modify camera callback?
        const manipulators = genericRenderWindow
            .getInteractor()
            .getInteractorStyle()
            .getMouseManipulators();
        for (let i = 0; i < manipulators.length; i++) {
            if (
                manipulators[i].isA(
                    'vtkMouseCameraTrackballRotateManipulator'
                )
            ) {
                renderer.getActiveCamera().onModified(() => {
                    const bds = renderer.computeVisiblePropBounds();
                    const cen = [
                        (bds[0] + bds[1]) * 0.5,
                        (bds[2] + bds[3]) * 0.5,
                        (bds[4] + bds[5]) * 0.5,
                    ];
                    manipulators[i].setCenter(cen[0], cen[1], cen[2]);
                });
            }
        }


    return genericRenderWindow;
}


export const readMesh = async (path)=>{


    
    const response = await axios.get(path);
    
    const file = new File([response.data], 'sample_1.vtp');
    await m_meshLoader.openLocalFile(file);

    const renderingObject = new MeshRenderingObject();        
    renderingObject.setCppMeshData(m_meshLoader.cppMeshData);
    renderingObject._VertexColorOn = true;
    renderingObject.updateActor();


    return renderingObject;
    
}

export const decoder = async(renderingobject) =>{
    const m_session = await ort.InferenceSession.create('resources/spiralnetDecoder.onnx');
    console.log("Decoder Initialized");                        


    console.log(new Float32Array(m_sampleLatents[2]))
    const dummy_tensor = new ort.Tensor('float32', new Float32Array(m_sampleLatents[3]) , [1, 16]);
    const pred = await m_session.run({input:dummy_tensor});
    const output = pred.output;


    console.log(renderingobject._PolyData.getNumberOfPoints());

    // console.log("Decoder Output : ", output,  output.data);
    const data = output.data;    
    for(let i=0 ; i<data.length ; i+=3){        
        let position = [ data[i], data[i+1], data[i+2] ];
        renderingobject._PolyData.getPoints().setPoint(i/3, position[0], position[1], position[2]);        
    }
    
    renderingobject._PolyData.modified();
    renderingobject.updateActor();
    

}