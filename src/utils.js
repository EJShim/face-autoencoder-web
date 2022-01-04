import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import ViewInfo from '@imago/iwtk.js/dist/data/ViewInfo';
import MeshDataIO from '@imago/iwtk.js/dist/loader/MeshDataIO';
import MeshRenderingObject from '@imago/iwtk.js/dist/data/MeshRenderingObject'; 
import axios from 'axios';

//global variables?
const m_meshLoader = new MeshDataIO();

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