# **Generación de mallas tridimensionales**
# 1. **Triangulación Delaunay**
print("Generando malla con Triangulación Delaunay...")
delaunay_mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(cloud, alpha=1.0)
delaunay_mesh.compute_vertex_normals()
o3d.visualization.draw_geometries([delaunay_mesh], window_name="Malla - Triangulación Delaunay")
output_delaunay = file_path.replace(".pts", "_delaunay.obj")
o3d.io.write_triangle_mesh(output_delaunay, delaunay_mesh)
print(f"Malla Delaunay guardada en: {output_delaunay}")

#Es solo el algoritmo, se tiene que adaptar...