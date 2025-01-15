import open3d as o3d
import numpy as np

def load_and_visualize_pts(file_path):
    # Cargar el archivo .pts
    print(f"Cargando nube de punto desde: {file_path}")
    point_cloud = np.loadtxt(file_path, skiprows=1)  # Salta la primera fila (puede contener metadatos)
    
    # Crear objeto Open3D PointCloud
    cloud = o3d.geometry.PointCloud()
    cloud.points = o3d.utility.Vector3dVector(point_cloud[:, :3])  # Solo las columnas x, y, z
    
    # Visualizar la nube de puntos
    o3d.visualization.draw_geometries([cloud], window_name="Visualización de nube de punto")

# Ruta al archivo .pts
file_path = "ruta/a/tu/archivo_simplificado.pts"
load_and_visualize_pts(file_path)