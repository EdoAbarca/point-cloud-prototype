from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from dotenv import load_dotenv
import open3d as o3d
from .utils.point_cloud import load_point_cloud, print_point_cloud_info, generate_cloud, plot_cloud
from .utils.mesh_3d import is_3d_mesh, load_3d_mesh, print_3d_mesh_info, plot_3d_mesh, create_delaunay_mesh, create_poisson_mesh, create_threshold_mesh
import matplotlib.pyplot as plt

load_dotenv()

class PointCloudView(APIView):
	def post(self, request):
		try:
			# Path a la nube de puntos
			file_path = request.data["filepath"]
			print(f"Cargando nube de punto desde: {file_path}")

			# Carga de nube de puntos, salta la primera fila (contiene metadatos)
			point_cloud = load_point_cloud(file_path)

			# Muestra de datos
			print_point_cloud_info(point_cloud)

			# Normaliza la intensidad
			intensidad = point_cloud[:, 3]
			intensidad_normalizada = (intensidad - intensidad.min()) / (
				intensidad.max() - intensidad.min()
			)

			# Aplica la paleta inferno
			cmap = plt.cm.inferno

			# Generación de nube de puntos
			cloud = generate_cloud(point_cloud)
			
			# Visualización de nube de puntos?
			#plot_cloud(file_path, cloud)
			
			# **Generación de mallas tridimensionales**
			# 1. **Triangulación Delaunay**
			# Generación de malla
			print("Generando malla con Triangulación Delaunay...")
			delaunay_mesh, delaunay_output = create_delaunay_mesh(cloud, file_path, alpha=1.0)

			# Muestra de información
			print_3d_mesh_info(delaunay_mesh)

			# Visualización
			plot_3d_mesh(delaunay_mesh, delaunay_output)

			# 2. **Reconstrucción por Poisson**
			print("Generando malla con Poisson...")
			poisson_mesh, poisson_output, densities = create_poisson_mesh(cloud, file_path, radius=0.025, max_nn=30, depth=9)

			# Muestra de información
			print_3d_mesh_info(poisson_mesh, densities)

			# Visualización
			plot_3d_mesh(poisson_mesh, poisson_output)

			# 3. **Algoritmos de Umbrales**
			print("Generando malla con Algoritmos de Umbrales...")
			threshold_mesh, threshold_output = create_threshold_mesh(point_cloud, file_path, intensidad_normalizada, threshold=0.5, alpha=1.0)

			# Muestra de información
			print_3d_mesh_info(threshold_mesh)

			# Visualización
			plot_3d_mesh(threshold_mesh, threshold_output)

			return Response(
				{
					"message": "Nube de puntos procesada y mallas generadas.",
					"outputs": {
						"delaunay": delaunay_output,
						"poisson": poisson_output,
						"threshold": threshold_output,
					},
				},
				status=status.HTTP_201_CREATED,
			)
			# return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
		except Exception as e:
			return Response("Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST)

	# Definir funcion para encapsular muestras de nube de puntos y no repetir codigo
	def get(self, request):

		# Path a la nube de puntos
		file_path = request.GET.get("filepath") or None

		#Si se especifica un archivo, el programa procede a cargarlo y visualizarlo
		if file_path:
			try:
				print(f"Cargando nube de punto desde: {file_path}")

				# Carga de información nube de puntos, salta la primera fila (contiene metadatos)
				point_cloud = load_point_cloud(file_path)

				# Muestra de datos
				print_point_cloud_info(point_cloud)

				# Generar nube de puntos
				cloud = generate_cloud(point_cloud)

				# Visualización
				plot_cloud(file_path, cloud)

				# Respuesta HTTP
				return Response(
					"Nube de puntos visualizada correctamente",
					#Retornar la nube de puntos
					status=status.HTTP_200_OK,
				)
			except Exception as e: # Excepción en caso de error
				return Response(
					"Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST
				)
		else:  # Caso contrario, se muestran todos los archivos de nube de puntos disponibles en el directorio
			try:
				routes = {
					key: value for key, value in os.environ.items() if "FARO" in key
				}
				# Se aplica la carga, muestra de datos y visualización a cada archivo
				for key, value in routes.items():
					print(f"{key}: {value}")
					point_cloud = load_point_cloud(value)
					print_point_cloud_info(point_cloud)
					cloud = generate_cloud(point_cloud)
					plot_cloud(value, point_cloud)
				return Response(
					"Nubes de puntos visualizada correctamente",
					status=status.HTTP_200_OK,
				)
			except Exception as e: # Excepción en caso de error
				return Response(
					"Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST
				)


class Mesh3DView(APIView):
	def get(self, request):
		# Path a la malla 3D
		file_path = request.GET.get("filepath") or None

		# Si se especifica un archivo, el programa procede a cargarlo y visualizarlo
		if file_path:
			try:
				print(f"Cargando malla 3D desde: {file_path}")

				# Carga de información malla 3D
				mesh = load_3d_mesh(file_path)

				# Muestra de datos
				print_3d_mesh_info(mesh)

				# Visualización
				plot_3d_mesh(file_path)

				# Respuesta HTTP
				return Response(
					"Malla 3D visualizada correctamente",
					status=status.HTTP_200_OK,
				)
			except Exception as e: # Excepción en caso de error
				return Response(
					"Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST
				)
		else:  # Caso contrario, se muestran todos los archivos de malla 3D disponibles en el directorio
			try:
				routes = {
					key: value for key, value in os.environ.items() if "FARO" in key and is_3d_mesh(value)
				}
				# Se aplica la carga, muestra de datos y visualización a cada archivo
				for key, value in routes.items():
					print(f"{key}: {value}")
					mesh = load_3d_mesh(value)
					print_3d_mesh_info(mesh)
					plot_3d_mesh(value)
				return Response(
					"Archivos de malla 3D visualizados correctamente",
					status=status.HTTP_200_OK,
				)
			except Exception as e:
				return Response(
					"Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST
				)
