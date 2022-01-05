import vtk


reader = vtk.vtkXMLPolyDataReader()
reader.SetFileName("public/resources/sample_1.vtp")

transform = vtk.vtkTransform()
transform.Scale(100, 100, 100)
transformPoly = vtk.vtkTransformPolyDataFilter()
transformPoly.SetInputConnection(reader.GetOutputPort())
transformPoly.SetTransform(transform)

normalGen = vtk.vtkPolyDataNormals()
normalGen.SplittingOff()
normalGen.SetInputConnection(transformPoly.GetOutputPort())

writer = vtk.vtkXMLPolyDataWriter()
writer.SetInputConnection(normalGen.GetOutputPort())
writer.SetFileName('public/resources/sample_1_norm.vtp')
writer.Update()