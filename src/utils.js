import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';

import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import axios from 'axios';
// import * as ort from 'onnxruntime-web'


//global variables?
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
    // const viewInfo = new ViewInfo(
    //     'main',
    //     '3D',
    //     false,
    //     genericRenderWindow
    // );
    // viewInfo.update();
    

    // const renderer = genericRenderWindow.getRenderer();

    // //modify camera callback?
    // const manipulators = genericRenderWindow
    //     .getInteractor()
    //     .getInteractorStyle()
    //     .getMouseManipulators();
    // for (let i = 0; i < manipulators.length; i++) {
    //     if (
    //         manipulators[i].isA(
    //             'vtkMouseCameraTrackballRotateManipulator'
    //         )
    //     ) {
    //         renderer.getActiveCamera().onModified(() => {
    //             const bds = renderer.computeVisiblePropBounds();
    //             const cen = [
    //                 (bds[0] + bds[1]) * 0.5,
    //                 (bds[2] + bds[3]) * 0.5,
    //                 (bds[4] + bds[5]) * 0.5,
    //             ];
    //             manipulators[i].setCenter(cen[0], cen[1], cen[2]);
    //         });
    //     }
    // }

    genericRenderWindow.getRenderer().setBackground(0, 0, 0, 0);        


    return genericRenderWindow;
}



const readArrayBuffer = async (file) =>{
    return new Promise((resolve, reject)=>{
        const filreader = new FileReader();
        filreader.onload = ()=>{
            resolve(filreader.result);
        }

        filreader.readAsArrayBuffer(file)
    })
}

export const readPolyData = async(path) =>{    
    let filename = path.split("/");
    filename = filename[ filename.length-1 ];
    let ext = filename.split(".")
    ext = ext[ext.length -1];
    

    const response = await axios.get(path);    
    const file = new File([response.data], filename);
    const arrayBuffer = await readArrayBuffer(file);

    let reader;
    if(ext === "vtp")
        reader = vtkXMLPolyDataReader.newInstance();
    else if(ext === "ply")
        reader = vtkPLYReader.newInstance();
    reader.parseAsArrayBuffer(arrayBuffer);
    reader.update();


    // const renderingObject = await readMesh(path);
    return reader.getOutputData();
}

export const makeActor = (polydata)=>{
    const mapper = vtkMapper.newInstance();
    mapper.setInputData(polydata);

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    return actor;
}

export const warmUp = async ()=>{

    const sessionOption = { 
        executionProviders: ['wasm'] ,
        graphOptimizationLevel: "disabled"
        // extra: {
        //     session: {
        //         set_denormal_as_zero: "0",
        //         disable_prepacking: "0"
        //     },
        //         optimization: {
        //         enable_gelu_approximation: "0"
        //     }
        // }
    };


    m_session = await ort.InferenceSession.create('resources/spiralnetDecoder.onnx', sessionOption);
}

export const decoder = async(polydata, latent = new Float32Array(sampleLatents[0]) ) =>{    
    const input_tensor = new ort.Tensor('float32', latent  , [1, 16]);
    const pred = await m_session.run({input:input_tensor});
    const output = pred.output;

    // Update polydata
    const data = output.data;    
    // console.log(input_tensor.data)
    // console.log(data)
    for(let i=0 ; i<data.length ; i+=3){                
        polydata.getPoints().setPoint(i/3, data[i], data[i+1], data[i+2]);        
    }
    polydata.modified();    
}