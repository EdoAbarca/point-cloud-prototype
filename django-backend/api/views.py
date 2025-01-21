from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from dotenv import load_dotenv
import open3d as o3d
import numpy as np
import matplotlib.pyplot as plt

load_dotenv()

# Puntos de nube: Representación digital tridimensional compuesta por múltiples puntos coordenados (X, Y, Z), cada uno con atributos adicionales como color e intensidad. Estos datos se obtienen típicamente mediante escáneres láser 3D, LiDAR u otros sistemas de captura, y se utilizan en cartografía, modelado 3D, ingeniería inversa y análisis espacial.
# Atributos particulares: [x, y, z, intensidad, r, g, b]

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
            #print(f"Media intensidad: {intensidad.mean():.2f}")
            #print(f"Desviación estándar intensidad: {intensidad.std():.2f}")

            # Normaliza la coordenada Z
            #z_normalizada = (z - z.min()) / (z.max() - z.min())

            # Crea una paleta de colores basada en Z (gradiente azul -> rojo)
            #colores_z = np.zeros((point_cloud.shape[0], 3))  # Inicializa matriz RGB
            #colores_z[:, 0] = z_normalizada  # Rojo proporcional a Z
            #colores_z[:, 2] = 1 - z_normalizada  # Azul inversamente proporcional a Z

            # Gráfico de nube de puntos
            # Crear objeto Open3D PointCloud
            cloud = o3d.geometry.PointCloud()
            cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])  # Coordenadas x, y, z
            #cloud.colors = o3d.utility.Vector3dVector(colores_z)

            # Visualizar la nube de puntos
            #o3d.visualization.draw_geometries([cloud], window_name="Visualización con Z como color")

            # Normaliza la intensidad
            intensidad_normalizada = (intensidad - intensidad.min()) / (intensidad.max() - intensidad.min())

            # Aplica la paleta inferno
            cmap = plt.cm.inferno
            colores_intensidad = cmap(intensidad_normalizada)[:, :3]  # Extrae solo los valores RGB

            # Asigna colores al gráfico
            cloud.colors = o3d.utility.Vector3dVector(colores_intensidad)

            # Visualización
            #o3d.visualization.draw_geometries([cloud], window_name=f"Visualización con intensidad de nube de punto {file_path}")
            
            # **Generación de mallas tridimensionales**
            # 1. **Triangulación Delaunay**
            print("Generando malla con Triangulación Delaunay...")
            delaunay_mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(cloud, alpha=1.0)
            delaunay_mesh.compute_vertex_normals()
            o3d.visualization.draw_geometries([delaunay_mesh], window_name="Malla - Triangulación Delaunay")
            output_delaunay = file_path.replace(".pts", "_delaunay.obj")
            o3d.io.write_triangle_mesh(output_delaunay, delaunay_mesh)
            print(f"Malla Delaunay guardada en: {output_delaunay}")

            # 2. **Reconstrucción por Poisson**
            # Calcula las normales para la nube de puntos
            cloud.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))

            # Genera la malla con el algoritmo de Poisson
            poisson_mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(cloud, depth=9)
            poisson_mesh.compute_vertex_normals()
            o3d.visualization.draw_geometries([poisson_mesh], window_name="Malla - Reconstrucción por Poisson")
            output_poisson = file_path.replace(".pts", "_poisson.obj")
            o3d.io.write_triangle_mesh(output_poisson, poisson_mesh)
            print(f"Malla Poisson guardada en: {output_poisson}")

            # 3. **Algoritmos de Umbrales**
            print("Generando malla con Algoritmos de Umbrales...")
            threshold = 0.5  # Define un umbral basado en la intensidad
            mask = intensidad_normalizada > threshold
            filtered_points = point_cloud[mask]

            # Crear nube filtrada
            filtered_cloud = o3d.geometry.PointCloud()
            filtered_cloud.points = o3d.utility.Vector3dVector(filtered_points[:, :3])
            filtered_cloud.colors = o3d.utility.Vector3dVector(cmap(filtered_points[:, 3])[:, :3])

            # Crear malla Alpha Shape para puntos filtrados
            alpha_mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(filtered_cloud, alpha=1.0)
            alpha_mesh.compute_vertex_normals()
            o3d.visualization.draw_geometries([alpha_mesh], window_name="Malla - Umbral")
            output_alpha = file_path.replace(".pts", "_threshold.obj")
            o3d.io.write_triangle_mesh(output_alpha, alpha_mesh)
            print(f"Malla por Umbral guardada en: {output_alpha}")

            return Response({
                "message": "Nube de puntos procesada y mallas generadas.",
                "outputs": {
                    "delaunay": output_delaunay,
                    "poisson": output_poisson,
                    "threshold": output_alpha,
                }
            }, status=status.HTTP_201_CREATED)
            #return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
        except Exception as e:
            return Response("Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST)

    #Definir funcion para encapsular muestras de nube de puntos y no repetir codigo
    def get(self, request):
        # Path a la nube de puntos
        file_path = request.GET.get('filepath') or None
        if file_path:
            try:
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
            #print(f"Media intensidad: {intensidad.mean():.2f}")
            #print(f"Desviación estándar intensidad: {intensidad.std():.2f}")

            # Normaliza la coordenada Z
            #z_normalizada = (z - z.min()) / (z.max() - z.min())

            # Crea una paleta de colores basada en Z (gradiente azul -> rojo)
            #colores_z = np.zeros((point_cloud.shape[0], 3))  # Inicializa matriz RGB
            #colores_z[:, 0] = z_normalizada  # Rojo proporcional a Z
            #colores_z[:, 2] = 1 - z_normalizada  # Azul inversamente proporcional a Z

                # Gráfico de nube de puntos
                # Crear objeto Open3D PointCloud
                cloud = o3d.geometry.PointCloud()
                cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])  # Coordenadas x, y, z
            #cloud.colors = o3d.utility.Vector3dVector(colores_z)

            # Visualizar la nube de puntos
            #o3d.visualization.draw_geometries([cloud], window_name="Visualización con Z como color")

                # Normaliza la intensidad
                intensidad_normalizada = (intensidad - intensidad.min()) / (intensidad.max() - intensidad.min())

                # Aplica la paleta inferno
                cmap = plt.cm.inferno
                colores_intensidad = cmap(intensidad_normalizada)[:, :3]  # Extrae solo los valores RGB

                # Asigna colores al gráfico
                cloud.colors = o3d.utility.Vector3dVector(colores_intensidad)

                # Visualización
                o3d.visualization.draw_geometries([cloud], window_name=f"Visualización con intensidad de nube de punto {file_path}")
                return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
            except Exception as e:
                return Response("Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST)
        else: #Se muestran todos
            try:
                routes = {key: value for key, value in os.environ.items() if "FARO" in key}
                for key, value in routes.items():
                    print(f"{key}: {value}")
                    point_cloud = np.loadtxt(value, skiprows=1)
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

                    # Gráfico de nube de puntos
                    # Crear objeto Open3D PointCloud
                    cloud = o3d.geometry.PointCloud()
                    cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])  # Coordenadas x, y, z
                    #cloud.colors = o3d.utility.Vector3dVector(colores_z)
                
                    # Visualizar la nube de puntos
                    #o3d.visualization.draw_geometries([cloud], window_name="Visualización con Z como color")

                    # Normaliza la intensidad
                    intensidad_normalizada = (intensidad - intensidad.min()) / (intensidad.max() - intensidad.min())

                    # Aplica la paleta inferno
                    cmap = plt.cm.inferno
                    colores_intensidad = cmap(intensidad_normalizada)[:, :3]  # Extrae solo los valores RGB

                    # Asigna colores al gráfico
                    cloud.colors = o3d.utility.Vector3dVector(colores_intensidad)

                    # Visualización
                    o3d.visualization.draw_geometries([cloud], window_name=f"Visualización con intensidad de nube de punto {value}")
                return Response("Nube de puntos visualizada correctamente", status=status.HTTP_200_OK)
            except Exception as e:
                return Response("Exception: " + str(e), status=status.HTTP_400_BAD_REQUEST)