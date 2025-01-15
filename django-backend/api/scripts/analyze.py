import numpy as np
from matplotlib import cm  # Para manejar mapas de colores

def analyze_point_cloud(filepath):
    print(f"Cargando nube de punto desde: {filepath}")
    point_cloud = np.loadtxt(filepath, skiprows=1)  # Salta la primera fila (puede contener metadatos)
    
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