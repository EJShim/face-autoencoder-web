import vtk
import glob





for plyfile in glob.glob("public/resources/*.ply"):
    reader = vtk.vtkPLYReader()
    reader.SetFileName(plyfile)
    
    writer = vtk.vtkXMLPolyDataWriter()
    writer.SetFileName(plyfile[:-3]+".vtp")
    writer.SetInputConnection(reader.GetOutputPort())
    writer.Update()