import numpy as np
import open3d as o3d
import matplotlib.pyplot as plt

# Puntos de nube: Representación digital tridimensional compuesta por múltiples puntos coordenados (X, Y, Z), cada uno con atributos adicionales como color e intensidad. Estos datos se obtienen típicamente mediante escáneres láser 3D, LiDAR u otros sistemas de captura, y se utilizan en cartografía, modelado 3D, ingeniería inversa y análisis espacial.
# Atributos particulares: [x, y, z, intensidad, r, g, b]
# - x, y, z: Coordenadas espaciales en el sistema de referencia.
# - Intensidad: Valor de reflectancia o brillo del punto al impactar con una superficie.
# - r, g, b: Componentes de color rojo, verde y azul, respectivamente.

# Funciones de utilidad puntos de nube
def is_point_cloud(file_path):
	file_type = file_path.split(".")[-1]
	return file_type == "pts"

def load_point_cloud(file_path):
	return np.loadtxt(file_path, skiprows=1)

def print_point_cloud_info(point_cloud):
	# Lectura de datos
	x, y, z = (
		point_cloud[:, 0],
		point_cloud[:, 1],
		point_cloud[:, 2],
	)  # Coordenadas
	intensidad = point_cloud[:, 3]  # Intensidad
	r, g, b = (
		point_cloud[:, 4],
		point_cloud[:, 5],
		point_cloud[:, 6],
	)  # Colores

	# Análisis de datos
	print(f"Número de puntos: {point_cloud.shape[0]}")
	print(f"Ejemplo de fila:\n{point_cloud[:5]}")
	print(f"Rango X: {x.min()} a {x.max()}")
	print(f"Rango Y: {y.min()} a {y.max()}")
	print(f"Rango Z: {z.min()} a {z.max()}")

	print(f"Rango R: {r.min()} a {r.max()}")
	print(f"Rango G: {g.min()} a {g.max()}")
	print(f"Rango B: {b.min()} a {b.max()}")

	print(f"Rango intensidad: {intensidad.min()} a {intensidad.max()}")
	print(f"Media intensidad: {intensidad.mean():.2f}")
	print(f"Desviación estándar intensidad: {intensidad.std():.2f}")

def generate_cloud(point_cloud):

	# Gráfico de nube de puntos
	# Coordenadas x, y, z
	coordenadas = point_cloud[:, :3]

	# Crear objeto Open3D PointCloud
	cloud = o3d.geometry.PointCloud()
	cloud.points = o3d.utility.Vector3dVector(
		coordenadas
	)  

	# Normaliza la intensidad
	intensidad = point_cloud[:, 3]
	intensidad_normalizada = (intensidad - intensidad.min()) / (
		intensidad.max() - intensidad.min()
	)

	# Aplica la paleta inferno
	cmap = plt.cm.inferno
	colores_intensidad = cmap(intensidad_normalizada)[
		:, :3
	]  # Extrae solo los valores RGB

	# Asigna colores al gráfico
	cloud.colors = o3d.utility.Vector3dVector(colores_intensidad)

	# Se retorna la nube de puntos lista para visualización
	return cloud

	
def plot_cloud(cloud, file_path):

	# Visualización de nube de puntos
	o3d.visualization.draw_geometries(
		[cloud],
		window_name=f"Visualización con intensidad de nube de punto {file_path}",
	)