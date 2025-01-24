import open3d as o3d
import matplotlib.pyplot as plt

# Mallas tridimensionales: Representación digital de una superficie 3D compuesta por vértices, aristas y caras, típicamente en forma de triángulos o polígonos. Estas mallas se utilizan en gráficos por computadora, modelado 3D, simulaciones físicas y análisis estructural.
# Atributos particulares:
# - Vértices: Puntos en el espacio 3D que definen la geometría de la malla.
# - Aristas: Líneas que conectan pares de vértices.
# - Caras: Superficies planas delimitadas por aristas, usualmente triangulares.
# - Normales: Vectores perpendiculares a las caras o vértices, utilizados para cálculos de iluminación y sombreado.
# - Texturas: Imágenes aplicadas a la superficie de la malla para añadir detalles visuales.

#Funciones de utilidad mallas 3D
def is_3d_mesh(file_path):
	file_type = file_path.split(".")[-1]
	return file_type == "obj"


def load_3d_mesh(file_path):
	if not is_3d_mesh(file_path):
		raise ValueError("Unsupported file format")
	mesh = o3d.io.read_triangle_mesh(file_path)
	if not mesh.has_vertices():
		raise ValueError("Failed to load mesh or mesh is empty")
	return mesh


def mesh_3d_info(mesh):
	info = {
		"vertices": len(mesh.vertices),
		"triangles": len(mesh.triangles),
		"edges": len(mesh.edges) if hasattr(mesh, 'edges') else "N/A",
		"vertex_normals": len(mesh.vertex_normals),
		"triangle_normals": len(mesh.triangle_normals),
	}
	return info


def plot_3d_mesh(mesh):
	if not mesh.has_vertices():
		raise ValueError("Mesh has no vertices to plot")
	o3d.visualization.draw_geometries([mesh], window_name="3D Mesh")


def create_delaunay_mesh(cloud, file_path, alpha=1.0):
	delaunay_mesh = (o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(cloud, alpha=alpha))#1.0
	delaunay_mesh.compute_vertex_normals()
	#o3d.visualization.draw_geometries(
	#	[delaunay_mesh], window_name="Malla - Triangulación Delaunay"
	#)
	output_delaunay = file_path.replace(".pts", "_delaunay.obj")
	o3d.io.write_triangle_mesh(output_delaunay, delaunay_mesh)
	print(f"Malla Delaunay guardada en: {output_delaunay}")
	return delaunay_mesh, output_delaunay


def create_poisson_mesh(cloud, file_path, radius=0.1, max_nn=30, depth=9):
	# Calcula las normales para la nube de puntos
	cloud.estimate_normals(
		search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=radius, max_nn=max_nn)
	)

	# Genera la malla con el algoritmo de Poisson
	poisson_mesh, densities = (
		o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
			cloud, depth=depth
		)
	)
	poisson_mesh.compute_vertex_normals()
	o3d.visualization.draw_geometries(
		[poisson_mesh], window_name="Malla - Reconstrucción por Poisson"
	)
	output_poisson = file_path.replace(".pts", "_poisson.obj")
	o3d.io.write_triangle_mesh(output_poisson, poisson_mesh)
	print(f"Malla Poisson guardada en: {output_poisson}")
	return poisson_mesh, output_poisson, densities


def create_threshold_mesh(point_cloud, file_path, normalized_intensity, threshold = 0.5, alpha=1.0):
	print("Generando malla con Algoritmos de Umbrales...")
	#threshold = 0.5  # Define un umbral basado en la intensidad
	mask = normalized_intensity > threshold
	filtered_points = point_cloud[mask]
	
	# Aplica la paleta inferno
	cmap = plt.cm.inferno

	# Crear nube filtrada
	filtered_cloud = o3d.geometry.PointCloud()
	filtered_cloud.points = o3d.utility.Vector3dVector(filtered_points[:, :3])
	filtered_cloud.colors = o3d.utility.Vector3dVector(
		cmap(filtered_points[:, 3])[:, :3]
	)

	# Crear malla Alpha Shape para puntos filtrados
	threshold_mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(
		filtered_cloud, alpha=alpha
	)
	threshold_mesh.compute_vertex_normals()
	o3d.visualization.draw_geometries(
		[threshold_mesh], window_name="Malla - Umbral"
	)
	threshold_output = file_path.replace(".pts", "_threshold.obj")
	o3d.io.write_triangle_mesh(threshold_output, threshold_mesh)
	print(f"Malla por Umbral guardada en: {threshold_output}")
	return threshold_mesh, threshold_output

# Propuesta lectura de datos a testear ASAP
# def mesh_3d_info(mesh):
   # vertices = np.asarray(mesh.vertices)
   # aristas = np.asarray(mesh.edges)
   # caras = np.asarray(mesh.triangles)

    # Análisis de datos
    #info = {
    #    "numero_vertices": vertices.shape[0],
    #    "numero_aristas": aristas.shape[0],
    #    "numero_caras": caras.shape[0],
    #    "rango_x": (vertices[:, 0].min(), vertices[:, 0].max()),
    #    "rango_y": (vertices[:, 1].min(), vertices[:, 1].max()),
    #    "rango_z": (vertices[:, 2].min(), vertices[:, 2].max()),
    #}
	#return info