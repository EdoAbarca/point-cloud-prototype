'''
#POSIBLES FUNCIONES PARA EL PROCESAMIENTO DE NUBES DE PUNTOS
#Eliminacion de outliers

cl, ind = cloud.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
cloud = cloud.select_by_index(ind)

# Reducción de intensidad (Voxel Downsampling)
voxel_cloud = cloud.voxel_down_sample(voxel_size=0.05)

# Recalcular normales
cloud.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30))

# Segmentación (regiones clave)
plane_model, inliers = cloud.segment_plane(distance_threshold=0.01, ransac_n=3, num_iterations=1000)
plane_cloud = cloud.select_by_index(inliers)

'''