# 2. **Reconstrucción por Poisson**
print("Generando malla con Reconstrucción por Poisson...")
poisson_mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(cloud, depth=9)
poisson_mesh.compute_vertex_normals()
o3d.visualization.draw_geometries([poisson_mesh], window_name="Malla - Reconstrucción por Poisson")
output_poisson = file_path.replace(".pts", "_poisson.obj")
o3d.io.write_triangle_mesh(output_poisson, poisson_mesh)
print(f"Malla Poisson guardada en: {output_poisson}")

#Es solo el algoritmo, se tiene que adaptar...