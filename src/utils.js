import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ViewInfo from '@imago/iwtk.js/dist/data/ViewInfo';
import MeshDataIO from '@imago/iwtk.js/dist/loader/MeshDataIO';
import MeshRenderingObject from '@imago/iwtk.js/dist/data/MeshRenderingObject'; 
import axios from 'axios';
import * as ort from 'onnxruntime-web'


//global variables?
const m_meshLoader = new MeshDataIO();
export const sampleLatents = [[ 2.7622, -2.2852,  2.3655,  1.2294, -1.8817,  2.0528,  1.7541, -0.1315,
                            -3.4645,  2.9667,  2.5833,  0.3329,  4.4528,  0.0312,  2.8146,  0.7895],
                        [ 1.9867, -0.3162,  3.4118, -0.6602, -1.1517,  0.5038,  1.2648, -0.4614,
                            -1.8139,  4.6501,  0.4611,  1.2268,  3.8348, -2.5931,  3.2938,  1.0686],
                        [-1.2091,  0.4990,  0.6193,  2.6189, -3.0905, -1.2833,  1.6822, -0.7626,
                            -5.0616,  3.3977, -0.3486, -1.4750,  6.0732,  2.5065,  3.4132,  1.0382],
                        [ 2.4245, -4.3261,  1.5485,  3.4660, -2.5159,  3.9251,  1.6547,  1.0180,
                            -2.3387,  2.5968, -0.0481, -1.3488,  4.5446,  0.5115,  2.5426,  2.2390]];

let m_session = null;

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

export const warmUp = async ()=>{
    m_session = await ort.InferenceSession.create('resources/spiralnetDecoder.onnx');
}

export const decoder = async(renderingobject, latent = new Float32Array(sampleLatents[3]) ) =>{    
    const input_tensor = new ort.Tensor('float32', latent  , [1, 16]);
    const pred = await m_session.run({input:input_tensor});
    const output = pred.output;

    //Update polydata
    const data = output.data;    
    for(let i=0 ; i<data.length ; i+=3){                
        renderingobject._PolyData.getPoints().setPoint(i/3, data[i], data[i+1], data[i+2]);        
    }
    
    renderingobject._PolyData.modified();
    renderingobject.updateActor();
    

}