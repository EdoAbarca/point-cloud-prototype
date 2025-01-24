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
    """
    Crea una malla tridimensional utilizando el algoritmo de triangulación de Delaunay
    a partir de una nube de puntos.

    Parámetros
    ----------
    cloud : o3d.geometry.PointCloud
        La nube de puntos de entrada para generar la malla.
    file_path : str
        La ruta del archivo de la nube de puntos de entrada. La malla generada se guardará
        en esta ubicación con "_delaunay.obj" añadido al nombre.
    alpha : float, opcional
        Valor de alpha para el algoritmo de forma alpha utilizado en la triangulación de Delaunay.
        Un valor menor crea una malla más ajustada alrededor de los puntos. El valor predeterminado es 1.0.

    Retorna
    -------
    tuple
        Una tupla que contiene:
        - delaunay_mesh (o3d.geometry.TriangleMesh): La malla generada mediante triangulación de Delaunay.
        - output_delaunay (str): La ruta del archivo donde se guardó la malla.

    Notas
    -----
    - El comando `o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape` genera una malla 3D a partir 
      de una nube de puntos usando el algoritmo de forma alpha. Este algoritmo conecta puntos cercanos en la nube, 
      creando triángulos en función del parámetro alpha. Un valor alpha mayor crea una malla más laxa (menos
	  ajustada a los detalles y contornos específicos de los datos originales), mientras que un valor menor crea
	  una malla más ajustada y detallada.
    - Antes de ejecutar `delaunay_mesh.compute_vertex_normals()`, la malla generada carece de información sobre 
      las normales de los vértices, lo que significa que las propiedades visuales, como iluminación y sombreados, 
      no se renderizan correctamente. Este comando calcula las normales para cada vértice, mejorando así la 
      representación visual de la malla.
    - La malla se guarda en formato .obj con un nombre modificado basado en la ruta del archivo de entrada.
    """
    delaunay_mesh = (o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(cloud, alpha=alpha))
    delaunay_mesh.compute_vertex_normals()
    # o3d.visualization.draw_geometries(
    #     [delaunay_mesh], window_name="Malla - Triangulación Delaunay"
    # )
    output_delaunay = file_path.replace(".pts", "_delaunay.obj")
    o3d.io.write_triangle_mesh(output_delaunay, delaunay_mesh)
    print(f"Malla Delaunay guardada en: {output_delaunay}")
    return delaunay_mesh, output_delaunay



def create_poisson_mesh(cloud, file_path, radius=0.1, max_nn=30, depth=9):
	"""
    Crea una malla tridimensional utilizando el algoritmo de reconstrucción por Poisson
    a partir de una nube de puntos.

    Parámetros
    ----------
    cloud : o3d.geometry.PointCloud
        La nube de puntos de entrada para generar la malla.
    file_path : str
        La ruta del archivo de la nube de puntos de entrada. La malla generada se guardará
        en esta ubicación con "_poisson.obj" añadido al nombre.
    radius : float, opcional
        El radio de búsqueda en el cálculo de las normales. Valores menores restringen
        la búsqueda a vecinos más cercanos. El valor predeterminado es 0.1.
    max_nn : int, opcional
        Número máximo de vecinos considerados en el cálculo de las normales. El valor
        predeterminado es 30.
    depth : int, opcional
        La profundidad de la octree utilizada en la reconstrucción de Poisson. Este parámetro
        controla el nivel de detalle de la malla generada. El valor predeterminado es 9.

    Retorna
    -------
    tuple
        Una tupla que contiene:
        - poisson_mesh (o3d.geometry.TriangleMesh): La malla generada mediante el algoritmo de Poisson.
        - output_poisson (str): La ruta del archivo donde se guardó la malla.
        - densities (numpy.ndarray): Las densidades calculadas en cada vértice de la malla.

    Notas
    -----
    - Antes de generar la malla, se calculan las normales de la nube de puntos utilizando 
      `cloud.estimate_normals()`. Esto es esencial para que el algoritmo de Poisson funcione 
      correctamente, ya que requiere normales bien definidas.
    - El comando `o3d.geometry.TriangleMesh.create_from_point_cloud_poisson` genera una malla
      detallada basada en un modelo implícito de la superficie. El parámetro `depth` controla el
      nivel de detalle -> un valor más alto produce una malla más detallada pero también más pesada.
    - El cálculo de las normales con `poisson_mesh.compute_vertex_normals()` mejora la visualización
      de la malla generada al definir propiedades como iluminación y sombreado.
    - El archivo resultante se guarda en formato .obj con un nombre modificado basado en la ruta del archivo de entrada.
    """
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
	#o3d.visualization.draw_geometries(
	#	[poisson_mesh], window_name="Malla - Reconstrucción por Poisson"
	#)
	output_poisson = file_path.replace(".pts", "_poisson.obj")
	o3d.io.write_triangle_mesh(output_poisson, poisson_mesh)
	print(f"Malla Poisson guardada en: {output_poisson}")
	return poisson_mesh, output_poisson, densities


def create_threshold_mesh(point_cloud, file_path, normalized_intensity, threshold = 0.5, alpha=1.0):
	"""
    Genera una malla tridimensional aplicando un filtro de umbrales a una nube de puntos.
    La malla resultante se crea a partir de puntos que cumplen un criterio de intensidad.

    Parámetros
    ----------
    point_cloud : numpy.ndarray
        Nube de puntos original en formato de array. Debe incluir coordenadas (x, y, z) e intensidad.
    file_path : str
        Ruta del archivo de la nube de puntos original. La malla generada se guardará en esta ubicación 
        con "_threshold.obj" añadido al nombre.
    normalized_intensity : numpy.ndarray
        Intensidades normalizadas asociadas a la nube de puntos, usadas para aplicar el filtro de umbral.
    threshold : float, opcional
        Valor umbral para filtrar los puntos de la nube. Solo se incluirán puntos cuya intensidad sea
        mayor que este valor. El valor predeterminado es 0.5.
    alpha : float, opcional
        Parámetro de la forma alpha utilizado para la generación de la malla. Controla cuán ajustada es
        la malla a los puntos. Valores más bajos producen mallas más detalladas. El valor predeterminado
        es 1.0.

    Retorna
    -------
    tuple
        Una tupla que contiene:
        - threshold_mesh (o3d.geometry.TriangleMesh): La malla generada para los puntos filtrados.
        - threshold_output (str): Ruta del archivo donde se guardó la malla generada.

    Notas
    -----
    - El filtrado de puntos se realiza mediante un valor de umbral aplicado a las intensidades normalizadas.
      Solo los puntos cuya intensidad sea mayor al valor definido se consideran para la malla.
    - Se utiliza la paleta de colores "inferno" para asignar colores a los puntos filtrados. Esto facilita
      la visualización de las intensidades.
    - El comando `o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape` genera una malla 3D
      para los puntos filtrados. El parámetro `alpha` controla la densidad y ajuste de la malla generada.
    - El cálculo de las normales con `threshold_mesh.compute_vertex_normals()` define las propiedades de
      iluminación y sombreado de la malla para mejorar su visualización.
    - El archivo resultante se guarda en formato .obj, con un nombre modificado basado en la ruta de entrada.
    """
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
	#o3d.visualization.draw_geometries(
	#	[threshold_mesh], window_name="Malla - Umbral"
	#)
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