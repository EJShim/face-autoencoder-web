import vtk


reader = vtk.vtkXMLPolyDataReader()
reader.SetFileName("public/resources/sample_1.vtp")


normalGen = vtk.vtkPolyDataNormals()
normalGen.SplittingOff()
normalGen.SetInputConnection(reader.GetOutputPort())

writer = vtk.vtkXMLPolyDataWriter()
writer.SetInputConnection(normalGen.GetOutputPort())
writer.SetFileName('public/resources/sample_1_norm.vtp')
writer.Update()