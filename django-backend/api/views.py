from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import open3d as o3d
import numpy as np
import matplotlib.pyplot as plt

# Puntos de nube: Colección de puntos en un espacio tridimensional, normalmente incluidos con intensidad y color
# Dimensión : [x, y, z, intensidad, r, g, b]

class PointCloudView(APIView):
    def post(self, request):
        try:  
            # Path a la nube de puntos
            file_path = request.data['filepath']
            print(f"Cargando nube de punto desde: {file_path}")

            # carga de nube de puntos, salta la primera fila (puede contener metadatos)
            #metadata = np.loadtxt(file_path, max_rows=1, dtype=str)
            #print(f"Metadata: {metadata}") #=> Numero de puntos
            point_cloud = np.loadtxt(file_path, skiprows=1)

            #Captura de datos
            x, y, z = point_cloud[:, 0], point_cloud[:, 1], point_cloud[:, 2]  # Coordenadas
            intensidad = point_cloud[:, 3]  # Intensidad
            r, g, b = point_cloud[:, 4], point_cloud[:, 5], point_cloud[:, 6]  # Colores
            
            #Análisis de datos
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

            # Normaliza la coordenada Z
            z_normalizada = (z - z.min()) / (z.max() - z.min())

            # Crea una paleta de colores basada en Z (gradiente azul -> rojo)
            colores_z = np.zeros((point_cloud.shape[0], 3))  # Inicializa matriz RGB
            colores_z[:, 0] = z_normalizada  # Rojo proporcional a Z
            colores_z[:, 2] = 1 - z_normalizada  # Azul inversamente proporcional a Z

            # Asigna colores al gráfico
            # Gráfico de nube de puntos
            # Crear objeto Open3D PointCloud
            cloud = o3d.geometry.PointCloud()
            cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])  # Coordenadas x, y, z
            cloud.colors = o3d.utility.Vector3dVector(colores_z)

            # Visualizar la nube de puntos
            o3d.visualization.draw_geometries([cloud], window_name="Visualización con Z como color")

            # Normaliza la intensidad
            intensidad_normalizada = (intensidad - intensidad.min()) / (intensidad.max() - intensidad.min())

            # Aplica la paleta viridis
            cmap = plt.cm.viridis
            colores_intensidad = cmap(intensidad_normalizada)[:, :3]  # Extrae solo los valores RGB

            # Asigna colores al gráfico
            cloud.colors = o3d.utility.Vector3dVector(colores_intensidad)

            # Visualización
            o3d.visualization.draw_geometries([cloud], window_name="Visualización con intensidad")
            
            #o3d.visualization.draw_geometries(
            #    [cloud], window_name=f"Visualización de nube de punto {file_path}")
            return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
            
            '''
            # Path a la nube de puntos
            file_path = request.data['filepath']
            print(f"Cargando nube de punto desde: {file_path}")

            # Carga de nube de puntos
            point_cloud = np.loadtxt(file_path, skiprows=1)

            # Extraemos coordenadas y valores de intensidad
            x, y, z = point_cloud[:, 0], point_cloud[:, 1], point_cloud[:, 2]
            intensidad = point_cloud[:, 3]  # Columna de intensidad

            # valores reales observados:
            rango_real = (intensidad.min(), intensidad.max())  # (-2047, 2033)
            intensidad_normalizada = (intensidad - rango_real[0]) / (rango_real[1] - rango_real[0])
            # Creamos colores usando un mapa de colores similar al de tu imagen
            # 'jet' da una transición de azul a rojo similar a tu visualización
            colors = cm.jet(intensidad_normalizada)[:, :3]  # Tomamos solo RGB, descartamos alpha

            # Crear objeto Open3D PointCloud
            cloud = o3d.geometry.PointCloud()
            cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])
            cloud.colors = o3d.utility.Vector3dVector(colors)  # Asignamos los colores

            # Información adicional para entender mejor los datos
            print(f"Estadísticas de intensidad:")
            print(f"  Mínimo: {intensidad.min():.2f}")
            print(f"  Máximo: {intensidad.max():.2f}")
            print(f"  Media: {intensidad.mean():.2f}")
            print(f"  Desviación estándar: {intensidad.std():.2f}")

            # Visualizar la nube de puntos
            o3d.visualization.draw_geometries(
                [cloud], 
                window_name="Visualización de nube de punto coloreada por intensidad",
                width=800,  # Ancho de la ventana
                height=600  # Alto de la ventana
            )

            # Opcional: Guardar la visualización en un archivo
            # o3d.io.write_point_cloud("nube_coloreada.ply", cloud)
            '''
            #return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
        except Exception as e:
            return Response("Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST)
