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

#Es solo el algoritmo, se tiene que adaptar...