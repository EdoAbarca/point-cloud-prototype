# Prototipo de Nube de Puntos
## Introducción

Las nubes de puntos son un conjunto de datos tridimensionales capturados mediante sensores especializados, como los sensores LiDAR. Estos dispositivos emiten pulsos de luz láser infrarroja (generalmente invisible para el ojo humano) hacia el entorno. Cuando estos pulsos chocan con un objeto, parte de la luz se refleja y regresa al sensor, permitiendo capturar información precisa sobre la forma y características del entorno.

Por cada pulso láser emitido y recibido, se registra un punto con las siguientes propiedades:

 - Coordenadas X, Y, Z: Representan la posición tridimensional del punto en el espacio.
 - Intensidad de retorno: Indica la cantidad de luz que regresó al sensor. Esta métrica proporciona información sobre la reflectividad de la superficie del objeto, ayudando a identificar materiales o texturas.
 - Color: Valores RGB (rojo, verde y azul).

## Aplicaciones

Las nubes de puntos tienen un amplio rango de aplicaciones en diferentes sectores, gracias a su capacidad para capturar datos tridimensionales precisos. Algunas de las aplicaciones más relevantes incluyen:

### 1. **Inspección estructural y mantenimiento**
- **Verificación del estado de maquinaria:** Utilizando las nubes de puntos, es posible identificar deformaciones, desgastes o daños en componentes mecánicos, como turbinas, engranajes o tuberías. Por ejemplo, en la industria de generación de energía, se pueden escanear turbinas para detectar fisuras o anomalías en su estructura.
- **Detección de objetos invasores:** Los sensores pueden identificar elementos extraños que interfieran con el funcionamiento de equipos o sistemas. Por ejemplo, en sistemas ferroviarios, las nubes de puntos permiten detectar ramas, rocas u otros obstáculos en las vías.
- **Evaluación de estructuras arquitectónicas:** Las nubes de puntos son útiles para determinar deformaciones en edificios, puentes o monumentos históricos. Por ejemplo, pueden emplearse para monitorear el desgaste en columnas de un edificio histórico debido al paso del tiempo.

### 2. **Ingeniería inversa**
Las nubes de puntos permiten recrear modelos tridimensionales precisos de objetos físicos, lo que es útil en la fabricación de piezas de repuesto o en la optimización de diseños existentes. Por ejemplo, una pieza dañada de maquinaria pesada puede ser escaneada para replicarla mediante impresión 3D o técnicas de mecanizado.

### 3. **Construcción y diseño urbano**
- **Modelado 3D de terrenos y edificios:** Las nubes de puntos permiten crear modelos digitales de terrenos para planificar proyectos de construcción, carreteras o sistemas de drenaje.
- **Gestión del espacio urbano:** Ayudan a identificar zonas de riesgo, como áreas propensas a inundaciones, o a planificar la distribución de servicios públicos en una ciudad.

### 4. **Industria del entretenimiento**
En cine y videojuegos, las nubes de puntos se emplean para capturar escenarios reales y transformarlos en entornos virtuales realistas. Por ejemplo, en la producción de películas, se escanean locaciones para recrearlas digitalmente con alto nivel de detalle.

### 5. **Autonomía y navegación**
- **Vehículos autónomos:** Los sensores LiDAR generan nubes de puntos en tiempo real para detectar obstáculos, calcular distancias y navegar de forma segura en entornos complejos. Por ejemplo, un coche autónomo utiliza nubes de puntos para identificar peatones, señales de tráfico y otros vehículos.
- **Robótica:** En robots industriales o drones, las nubes de puntos se utilizan para planificar rutas y realizar tareas de precisión, como inspección de líneas eléctricas o monitoreo agrícola.

### 6. **Minería y exploración**
- **Exploración de minas:** Las nubes de puntos permiten mapear túneles y cavernas para planificar operaciones de extracción de manera segura.
- **Gestión de recursos naturales:** Ayudan a analizar el terreno y determinar áreas óptimas para la extracción de minerales o estudios geológicos.

### 7. **Medicina y salud**
- **Impresión 3D de prótesis:** Se pueden escanear partes del cuerpo humano para diseñar prótesis personalizadas que se ajusten perfectamente al paciente.
- **Monitoreo de movimiento:** En kinesiología y rehabilitación, las nubes de puntos se emplean para capturar movimientos corporales y analizar patrones de marcha o ejercicios terapéuticos.

## Detalle técnico
- Arquitectura: Monolítica de 2 capas.
- Frontend: Vite + React js + SWC + Tailwind CSS + Three.js
- Backend: Django + RestFramework + Open3D

## Cómo inicializar y utilizar la aplicación

### Prerrequisitos
- Docker
- Docker Compose
- Make (opcional, pero recomendado)

### Métodos de ejecución

#### Opción 1: Usando Makefile (Recomendado)

El proyecto incluye un Makefile con comandos útiles para gestionar los servicios Docker. Para ver todos los comandos disponibles:

```bash
make help
```

**Comandos principales:**

```bash
# Iniciar la aplicación (construye e inicia los servicios)
make up

# Iniciar en segundo plano
make up-d

# Detener los servicios
make stop

# Reiniciar los servicios
make restart

# Eliminar completamente los servicios
make down

# Limpiar todo (servicios, volúmenes, imágenes)
make clean

# Ver logs en tiempo real
make logs-f

# Ver estado de los contenedores
make status
```

#### Opción 2: Usando Docker Compose directamente

```bash
# Iniciar los servicios
docker compose up --build

# Iniciar en segundo plano
docker compose up --build -d

# Detener los servicios
docker compose stop

# Eliminar los servicios
docker compose down
```

### Acceso a la aplicación

Una vez que los servicios estén ejecutándose:

- **Frontend (React)**: http://localhost:5173
- **Backend (Django API)**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin (si está configurado)

### Comandos útiles de desarrollo

```bash
# Ver logs del backend solamente
make logs-backend

# Ver logs del frontend solamente
make logs-frontend

# Acceder al contenedor del backend
make shell-backend

# Acceder al contenedor del frontend
make shell-frontend

# Reconstruir las imágenes
make build
```

### Estructura de la aplicación

La aplicación está containerizada con Docker Compose y consta de:

- **Frontend**: Servidor de desarrollo Vite con React en puerto 5173
- **Backend**: Servidor de desarrollo Django en puerto 8000
- **Volúmenes**: Configurados para desarrollo con hot-reload

### Solución de problemas

Si encuentras problemas:

1. **Limpiar completamente y reiniciar**:
   ```bash
   make clean
   make up
   ```

2. **Ver logs para diagnosticar**:
   ```bash
   make logs-f
   ```

3. **Verificar estado de contenedores**:
   ```bash
   make status
   ```

## CI/CD con Jenkins

El proyecto incluye un servicio de Jenkins integrado en Docker Compose y un `Jenkinsfile` para automatización de CI/CD que utiliza los comandos del Makefile para mantener consistencia entre desarrollo local y pipelines de Jenkins.

### Inicio rápido con Jenkins

#### 1. Iniciar Jenkins

```bash
# Iniciar solo Jenkins
make jenkins-up

# O iniciar todos los servicios incluyendo Jenkins
make up
```

Jenkins estará disponible en: **http://localhost:8080**

#### 2. Configuración inicial

```bash
# Obtener la contraseña inicial de administrador
make jenkins-pass
```

Copia la contraseña y úsala en la interfaz web de Jenkins para completar la configuración inicial.

#### 3. Instalar plugins recomendados

En el setup wizard de Jenkins, selecciona "Install suggested plugins". Esto incluirá:
- Git plugin
- Docker plugin  
- Pipeline plugin
- Blue Ocean (opcional, pero recomendado para mejor UI)

### Comandos Jenkins disponibles

```bash
make jenkins-up       # Iniciar Jenkins
make jenkins-stop     # Detener Jenkins
make jenkins-restart  # Reiniciar Jenkins
make jenkins-logs     # Ver logs en tiempo real
make jenkins-pass     # Obtener contraseña inicial
make jenkins-shell    # Acceder al contenedor
```

### Configuración de Jenkins

#### Opción 1: Jenkins integrado en Docker Compose (Recomendado)

El servicio de Jenkins usa una **imagen personalizada** (`jenkins/Dockerfile`) que incluye:
- ✅ **Docker CLI y Docker Compose**: Para ejecutar comandos del pipeline
- ✅ **Make**: Para ejecutar comandos del Makefile
- ✅ **Plugins preinstalados**: Git, Pipeline, Docker Workflow, Blue Ocean, etc.
- **Puerto 8080**: Interfaz web
- **Puerto 50000**: Agentes Jenkins (JNLP)
- **Volumen persistente**: Los datos se guardan en `jenkins_home`
- **Acceso a Docker**: Socket compartido con el host (`/var/run/docker.sock`)
- **Workspace montado**: Acceso directo al código del proyecto en `/workspace`

> 📝 **Nota**: La primera vez que inicies Jenkins, se construirá la imagen personalizada. Esto puede tomar algunos minutos.

#### Opción 2: Jenkins local standalone

Si prefieres Jenkins fuera de Docker Compose:

```bash
# Ejecutar Jenkins en Docker
docker run -d -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts

# Obtener contraseña inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Crear Pipeline Job en Jenkins

1. **Accede a Jenkins**: http://localhost:8080

2. **Crea un nuevo Pipeline Job**:
   - Clic en "New Item" → "Pipeline" → Nombre: `point-cloud-prototype`

3. **Configurar el repositorio**:
   - Pipeline → "Pipeline script from SCM"
   - SCM: **Git**
   - Repository URL: `https://github.com/EdoAbarca/point-cloud-prototype.git`
   - Branch: `*/main` o `*/14-jenkinsfile`
   - Script Path: `Jenkinsfile`

4. **Guardar y ejecutar**:
   - Save → "Build Now"

### Pipeline Stages

El Jenkinsfile define las siguientes etapas:

1. **Checkout**: Verificación del código fuente y estructura del proyecto
2. **Build**: Construcción de imágenes Docker (`make build`)
3. **Test**: Ejecución de pruebas backend y frontend en paralelo
4. **Lint**: Análisis de código backend y frontend en paralelo
5. **Integration Test**: Verificación de servicios funcionando
6. **Deploy**: Despliegue condicional (solo en ramas main/master/tags)

### Simulación de Pipeline (Desarrollo)

Para probar el pipeline localmente sin Jenkins:

```bash
# Ejecutar simulación del pipeline
./test-jenkins-pipeline.sh
```

### Comandos Pipeline disponibles

El pipeline utiliza estos comandos del Makefile:

```bash
make build          # Construcción de imágenes
make test-backend    # Pruebas Django
make test-frontend   # Pruebas frontend (placeholder)
make lint-backend    # Linting Python (pendiente configurar)
make lint-frontend   # Linting ESLint
make up-d            # Iniciar servicios en background
make status          # Estado de contenedores
make down            # Limpiar servicios
```

### Arquitectura Jenkins + Docker Compose

El servicio de Jenkins está configurado con:

- **Privilegios de root**: Para ejecutar comandos Docker dentro del contenedor
- **Socket Docker compartido**: `/var/run/docker.sock` permite a Jenkins controlar Docker del host
- **Workspace montado**: El proyecto está disponible en `/workspace` dentro de Jenkins
- **Red compartida**: Jenkins puede comunicarse con frontend y backend
- **Volumen persistente**: Configuración y jobs se guardan en `jenkins_home`

### Configuración de Job en Jenkins

1. **Crear nuevo Pipeline Job**:
   - New Item → Pipeline
   - Nombre: `point-cloud-prototype`

2. **Configurar SCM**:
   - Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/EdoAbarca/point-cloud-prototype.git`
   - Branch: `*/main` (o la rama deseada)

3. **Variables de entorno opcionales**:
   ```bash
   COMPOSE_PROJECT_NAME=point-cloud-prototype
   DOCKER_BUILDKIT=1
   COMPOSE_DOCKER_CLI_BUILD=1
   ```

4. **Triggers**:
   - GitHub hook trigger (para builds automáticos)
   - Poll SCM: `H/5 * * * *` (verificar cambios cada 5 min)

### Resolución de problemas comunes

**Jenkins:**
- **No arranca**: Verificar que puerto 8080 esté disponible
- **No puede acceder a Docker**: Verificar permisos de `/var/run/docker.sock`
- **Jobs fallan**: Asegurarse que Jenkins tiene acceso a los comandos `make` y `docker compose`
- **Pérdida de configuración**: Verificar que el volumen `jenkins_home` esté configurado

**Tests y Build:**
- **Tests del backend fallan**: Normal en desarrollo, requiere configuración de DB de test
- **Linting del frontend falla**: Revisar y corregir errores de ESLint mostrados
- **Servicios no responden**: Verificar puertos 8000 y 5173 disponibles
- **Docker build lento**: Usar `COMPOSE_BAKE=true` para mejor rendimiento

### Acceso a servicios

Cuando todos los servicios están ejecutándose:
- **Jenkins**: http://localhost:8080
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

## Características

### US-01: Carga de Archivos de Nube de Puntos
- Carga de archivos `.pts` con validación automática
- Extracción automática de metadatos (número de puntos, límites espaciales, intensidad)
- Gestión de archivos a través de API REST
- Interfaz de usuario para subir y listar archivos

### US-02: Visualización Interactiva de Nubes de Puntos (NEW)
La aplicación ahora incluye un visor 3D interactivo con las siguientes funcionalidades:

#### Controles de Interacción
- **Rotación**: Click izquierdo + arrastrar para rotar la vista
- **Zoom**: Rueda del mouse o pinch para acercar/alejar
- **Pan**: Click derecho + arrastrar para desplazar la cámara
- **Reset**: Botón "Reset View" o tecla `R` para restaurar la vista por defecto

#### Características Técnicas
- **Renderizado con Three.js**: Utiliza React Three Fiber para renderizado optimizado
- **OrbitControls**: Controles suaves con damping para mejor experiencia de usuario
- **Sampling inteligente**: Carga un subconjunto de puntos (50%) para mejor rendimiento
- **FPS Counter**: Contador de frames por segundo para monitorear rendimiento
- **Visualización de colores**: Muestra los colores RGB originales de cada punto
- **Responsive**: Funciona en desktop y dispositivos móviles

#### Cómo Usar la Visualización
1. Navega a "Visualizar nube de puntos" desde la página principal
2. Haz clic en "View Details" en cualquier nube de puntos de la lista
3. El visor 3D se abrirá en un modal mostrando:
   - Vista 3D interactiva de la nube de puntos
   - Información de controles en pantalla
   - Contador de FPS
   - Metadatos del archivo (límites espaciales, fecha de carga, etc.)

#### API Endpoint
- **GET** `/api/point_cloud/{id}/data`: Obtiene los datos de visualización
  - Query parameter `sample`: Factor de muestreo opcional (ej. 0.5 para 50% de puntos)
  - Retorna posiciones [x, y, z] y colores [r, g, b] en formato JSON

### US-03: Generación de Mallas 3D con Triangulación de Delaunay (NEW)
La aplicación ahora soporta la generación automática de mallas 3D a partir de nubes de puntos utilizando el algoritmo de Delaunay (Alpha Shapes).

#### Características Principales
- **Algoritmo Delaunay**: Genera mallas tridimensionales mediante triangulación de Delaunay con Alpha Shapes
- **Parámetro Alpha ajustable**: Control sobre la densidad de la malla (valores entre 0.1 y 5.0)
  - **Alpha bajo (0.1 - 0.5)**: Malla más ajustada y detallada
  - **Alpha medio (1.0)**: Balance entre detalle y cobertura (predeterminado)
  - **Alpha alto (2.0 - 5.0)**: Malla más laxa, cubre mayor superficie
- **Visualización dual**: Alterna entre vista de nube de puntos y malla generada
- **Indicadores de progreso**: Loading spinner durante el procesamiento
- **Estadísticas de malla**: Número de vértices, triángulos y tiempo de procesamiento
- **Regeneración**: Permite regenerar la malla con diferentes parámetros alpha

#### Cómo Usar la Generación de Mallas

##### Desde la Vista de Biblioteca (PointsView)
1. Navega a "Visualizar nube de puntos"
2. Haz clic en "View Details" en cualquier nube de puntos
3. En el modal de detalles:
   - Ajusta el valor **Alpha** según el nivel de detalle deseado
   - Haz clic en "**Generate Mesh**" para iniciar la triangulación
   - El proceso mostrará un spinner con estado "Generating..."
   - Una vez completado, aparecerá una notificación con las estadísticas de la malla
4. Para visualizar la malla generada:
   - Haz clic en el botón "**Mesh View**" (habilitado después de generar)
   - Alterna entre "Point Cloud" y "Mesh View" según necesites

##### Desde la Tarjeta de Nube de Puntos
Cada tarjeta de nube de puntos en la biblioteca incluye:
- Botón "**Generate Mesh**" si no existe malla
- Botón "**View Mesh**" si ya fue generada
- Indicador de estado durante la generación

#### Detalles Técnicos

##### Backend (Django + Open3D)
**Endpoints API:**
- **POST** `/api/point_cloud/{id}/triangulate`: Genera la malla Delaunay
  ```json
  {
    "alpha": 1.0  // Opcional, default 1.0
  }
  ```
  Respuesta:
  ```json
  {
    "message": "Mesh generated successfully",
    "data": {
      "mesh_file": "cube_delaunay.obj",
      "metadata": {
        "algorithm": "delaunay",
        "alpha": 1.0,
        "vertices": 1234,
        "triangles": 5678,
        "processing_time": 2.5,
        "generated_at": "2024-11-18 14:30:00"
      }
    }
  }
  ```

- **GET** `/api/point_cloud/{id}/mesh`: Obtiene los datos de la malla para visualización
  ```json
  {
    "message": "Mesh data retrieved successfully",
    "name": "cube",
    "metadata": {...},
    "data": {
      "vertices": [[x, y, z], ...],
      "triangles": [[v1, v2, v3], ...],
      "colors": [[r, g, b], ...]
    }
  }
  ```

**Algoritmo:**
- Utiliza `Open3D` para la triangulación: `o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape()`
- Calcula normales de vértices automáticamente para iluminación correcta
- Guarda la malla en formato `.obj` en `media/pointclouds/`
- Almacena metadatos en el campo `mesh_metadata` del modelo `PointCloud`

**Validaciones:**
- ✅ Mínimo 4 puntos requeridos para triangulación 3D
- ✅ Parámetro alpha debe ser > 0
- ✅ Verifica que la malla generada tenga vértices y triángulos
- ✅ Manejo de errores con mensajes descriptivos

##### Frontend (React + Three.js)
**Componentes nuevos:**
- `MeshViewer.jsx`: Visor 3D especializado para mallas
  - Renderiza geometría con `THREE.BufferGeometry` y `THREE.Uint32Array` para índices
  - Utiliza `meshPhongMaterial` con `vertexColors` para colores por vértice
  - Iluminación con `ambientLight` y `directionalLight` para mejor visualización
  - Soporte para `DoubleSide` rendering (ambas caras de los triángulos)

**Estados de UI:**
- 🔵 **Generando**: Spinner y botón deshabilitado durante procesamiento
- ✅ **Generada**: Botón "View Mesh" habilitado, switch entre vistas
- ❌ **Error**: Mensaje de error descriptivo con opción de reintentar

### US-04: Reconstrucción de Superficies con Algoritmo de Poisson (NEW)
La aplicación ahora incluye soporte para reconstrucción de superficies cerradas y suaves mediante el algoritmo de Poisson, ideal para representar objetos sólidos con topología watertight.

#### Características Principales
- **Algoritmo Poisson**: Genera mallas cerradas mediante reconstrucción de superficies con Poisson
- **Estimación automática de normales**: Calcula normales de la nube de puntos antes de la reconstrucción
- **Parámetros ajustables**:
  - **Depth (5-12)**: Profundidad del octree, controla el nivel de detalle (predeterminado: 9)
    - **Depth bajo (5-7)**: Malla más gruesa, procesamiento rápido
    - **Depth medio (8-9)**: Balance entre detalle y rendimiento (recomendado)
    - **Depth alto (10-12)**: Malla muy detallada, procesamiento más lento
  - **Radius (0.01-1.0)**: Radio de búsqueda para estimación de normales (predeterminado: 0.1)
  - **Max NN (10-100)**: Máximo de vecinos cercanos considerados (predeterminado: 30)
- **Mallas watertight**: Garantiza superficies cerradas sin huecos
- **Visualización integrada**: Mismo visor 3D que Delaunay, con soporte para normales
- **Selección de algoritmo**: Elige entre Delaunay y Poisson en la misma interfaz

#### Cómo Usar la Reconstrucción Poisson

##### Desde la Vista de Biblioteca (PointsView)
1. Navega a "Visualizar nube de puntos"
2. Haz clic en "View Details" en cualquier nube de puntos
3. En el modal de detalles:
   - Selecciona "**Poisson**" en el selector de algoritmo
   - Ajusta los parámetros según necesites:
     - **Depth**: Mayor valor = más detalle (puede ser más lento)
     - **Radius**: Radio de búsqueda para calcular normales
     - **Max NN**: Número de vecinos considerados
   - Haz clic en "**Generate Mesh**" para iniciar la reconstrucción
   - El proceso mostrará un spinner con estado "Generating..."
   - Una vez completado, aparecerá una notificación con las estadísticas de la malla
4. Para visualizar la malla generada:
   - Haz clic en el botón "**Mesh View**" (habilitado después de generar)
   - Alterna entre "Point Cloud" y "Mesh View" según necesites

##### Comparación entre Delaunay y Poisson
| Característica | Delaunay (Alpha Shapes) | Poisson Surface Reconstruction |
|---------------|------------------------|--------------------------------|
| **Tipo de malla** | Abierta, puede tener huecos | Cerrada, watertight |
| **Mejor para** | Formas complejas, datos ruidosos | Objetos sólidos, superficies suaves |
| **Parámetros** | Alpha (densidad) | Depth, Radius, Max NN |
| **Tiempo de procesamiento** | Rápido (O(n log n)) | Moderado (depende de depth) |
| **Estimación de normales** | Automática post-generación | Requerida pre-generación |
| **Topología** | Puede tener discontinuidades | Siempre continua |

#### Detalles Técnicos

##### Backend (Django + Open3D)
**Endpoints API:**
- **POST** `/api/point_cloud/{id}/reconstruct_poisson`: Genera la malla Poisson
  ```json
  {
    "depth": 9,      // Opcional, default 9 (rango: 5-12)
    "radius": 0.1,   // Opcional, default 0.1
    "max_nn": 30     // Opcional, default 30
  }
  ```
  Respuesta:
  ```json
  {
    "message": "Poisson mesh generated successfully",
    "data": {
      "mesh_file": "sphere_poisson.obj",
      "vertices": 5234,
      "triangles": 10468,
      "processing_time": 3.2,
      "algorithm": "poisson",
      "depth": 9,
      "radius": 0.1,
      "max_nn": 30,
      "has_normals": true
    }
  }
  ```

**Algoritmo:**
1. Carga la nube de puntos con Open3D: `o3d.io.read_point_cloud()`
2. Estima normales: `cloud.estimate_normals(search_param=KDTreeSearchParamHybrid(radius, max_nn))`
3. Reconstrucción Poisson: `o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(cloud, depth)`
4. Calcula normales de vértices: `poisson_mesh.compute_vertex_normals()`
5. Guarda malla en formato `.obj`: `o3d.io.write_triangle_mesh(output_path, mesh)`

**Validaciones:**
- ✅ Mínimo 100 puntos requeridos para reconstrucción Poisson
- ✅ Parámetros depth, radius, max_nn validados en backend
- ✅ Verifica que la malla tenga normales calculadas
- ✅ Manejo de errores con mensajes descriptivos (normales faltantes, puntos insuficientes)

##### Frontend (React + Three.js)
**Componentes modificados:**
- `PointsView.jsx`: Interfaz actualizada con selector de algoritmo
  - Muestra parámetros Delaunay (Alpha) o Poisson (Depth, Radius, Max NN) según selección
  - Estado unificado para generación de mallas de ambos algoritmos
  - Display de metadata de algoritmo usado en la malla generada

**Flujo de UI:**
1. Usuario selecciona algoritmo desde dropdown ("Delaunay" / "Poisson")
2. Parámetros específicos aparecen dinámicamente según algoritmo
3. Llamada a endpoint apropiado (`/triangulate` o `/reconstruct_poisson`)
4. Misma lógica de visualización para ambos tipos de malla
5. Metadata muestra algoritmo usado: "Mesh Algorithm: poisson"

#### Ejemplos de Uso

##### Generar malla Delaunay con alpha predeterminado (1.0)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/triangulate \
  -H "Content-Type: application/json" \
  -d '{}'
```

##### Generar malla Delaunay con alpha personalizado (0.5 - más detallada)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/triangulate \
  -H "Content-Type: application/json" \
  -d '{"alpha": 0.5}'
```

##### Generar malla Poisson con parámetros predeterminados
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/reconstruct_poisson \
  -H "Content-Type: application/json" \
  -d '{}'
```

##### Generar malla Poisson con alto detalle (depth=10)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/reconstruct_poisson \
  -H "Content-Type: application/json" \
  -d '{"depth": 10, "radius": 0.05, "max_nn": 50}'
```

##### Generar malla Poisson con procesamiento rápido (depth=7)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/reconstruct_poisson \
  -H "Content-Type: application/json" \
  -d '{"depth": 7, "radius": 0.15, "max_nn": 20}'
```

##### Obtener datos de malla para visualización
```bash
curl http://localhost:8000/api/point_cloud/1/mesh
```

#### Pruebas

##### Backend Tests (pytest)
```bash
# Ejecutar todos los tests de backend
make dev-test-backend

# Tests de triangulación Delaunay incluyen:
# - test_triangulate_point_cloud_success
# - test_triangulate_with_custom_alpha
# - test_triangulate_with_invalid_alpha
# - test_get_mesh_data_success
# - test_regenerate_mesh_overwrites_previous

# Tests de reconstrucción Poisson incluyen:
# - test_poisson_reconstruction_success
# - test_poisson_with_default_parameters
# - test_poisson_with_custom_depth
# - test_poisson_with_invalid_depth
# - test_poisson_with_invalid_radius
# - test_poisson_creates_watertight_mesh
# - test_poisson_performance_acceptable
# - test_compare_poisson_with_delaunay
```

##### Frontend Tests (Vitest)
```bash
# Ejecutar tests del frontend
make dev-test-frontend

# Tests del MeshViewer incluyen:
# - Renderizado de estado de carga
# - Fetch y display de datos de malla
# - Manejo de errores (404, network)
# - Display de metadatos de malla

# Tests de PointsView incluyen:
# - displays algorithm selector with Delaunay and Poisson options
# - shows Poisson parameters when Poisson algorithm is selected
# - shows Alpha parameter when Delaunay algorithm is selected
# - generates Poisson mesh successfully
# - generates Delaunay mesh successfully
# - handles mesh generation error
# - displays mesh metadata when mesh is generated
```

#### Rendimiento y Optimización
- ⚡ **Procesamiento asíncrono**: No bloquea la UI durante generación
- 📊 **Métricas de tiempo**: Tracking automático del tiempo de procesamiento
- 🎯 **Algoritmos optimizados**: 
  - Delaunay Alpha Shapes: O(n log n) para mallas grandes
  - Poisson: Complejidad depende del parámetro depth
- 💾 **Persistencia**: Mallas generadas se guardan en disco y base de datos
- 🔄 **Caché**: Regeneración solo si se solicita explícitamente
- 🧮 **Estimación de normales eficiente**: KDTree híbrido para búsqueda rápida de vecinos

#### Limitaciones Conocidas

##### Delaunay (Alpha Shapes)
- Funciona mejor con distribuciones uniformes de puntos
- Puntos muy espaciados pueden generar triángulos grandes no deseados
- Alpha muy bajo puede resultar en mallas fragmentadas
- Alpha muy alto puede cubrir huecos que deberían estar vacíos
- Puede generar mallas no cerradas (con huecos)

##### Poisson Surface Reconstruction
- Requiere mínimo 100 puntos para funcionar correctamente
- Depth alto (>10) puede ser muy lento para nubes grandes
- Puede suavizar detalles finos si depth es muy bajo
- Genera mallas más pesadas (más triángulos) que Delaunay
- Requiere estimación de normales (añade tiempo de procesamiento)

##### General
- Recomendado para nubes de puntos < 100,000 puntos por rendimiento
- Procesamiento síncrono puede causar timeout en nubes muy grandes
- Visualización de mallas muy grandes puede ser lenta en navegador

### US-05: Generación de Mallas con Algoritmo de Umbral (Threshold) (NEW)
La aplicación ahora incluye soporte para generación de mallas basada en filtrado por densidad, ideal para eliminar puntos ruidosos o dispersos antes de crear la malla.

#### Características Principales
- **Algoritmo Threshold**: Filtra puntos mediante análisis de densidad antes de generar la malla
- **Eliminación automática de ruido**: Remueve puntos dispersos y aislados
- **Parámetros ajustables**:
  - **Threshold (0-2)**: Valor de umbral para filtrado por densidad (predeterminado: 0.5)
    - **Threshold bajo (0-0.5)**: Retiene más puntos, menos filtrado
    - **Threshold medio (0.5-1.0)**: Balance entre limpieza y detalle (recomendado)
    - **Threshold alto (1.0-2.0)**: Filtrado agresivo, elimina más puntos dispersos
  - **Alpha (0.1-5.0)**: Parámetro de forma alpha para generación de malla (predeterminado: 1.0)
- **Estadísticas de filtrado**: Muestra cantidad de puntos originales, filtrados y removidos
- **Control por slider**: Interfaz intuitiva con slider para ajuste de threshold
- **Visualización integrada**: Mismo visor 3D con soporte para alternar entre modos
- **Selección de algoritmo**: Elige entre Delaunay, Poisson y Threshold en la misma interfaz

#### Cómo Usar el Threshold Mesh

##### Desde la Vista de Biblioteca (PointsView)
1. Navega a "Visualizar nube de puntos"
2. Haz clic en "View Details" en cualquier nube de puntos
3. En el modal de detalles:
   - Selecciona "**Threshold**" en el selector de algoritmo
   - Ajusta los parámetros según necesites:
     - **Threshold**: Arrastra el slider para ajustar el nivel de filtrado
       - Valores bajos mantienen más puntos
       - Valores altos filtran más agresivamente
     - **Alpha**: Controla la densidad de la malla resultante
   - Haz clic en "**Generate Mesh**" para iniciar el proceso
   - El proceso mostrará un spinner con estado "Generating..."
   - Una vez completado, aparecerá una notificación con:
     - Estadísticas de vértices y triángulos
     - Puntos originales y filtrados
     - Porcentaje de puntos removidos
4. Para visualizar la malla generada:
   - Haz clic en el botón "**Mesh View**" (habilitado después de generar)
   - Alterna entre "Point Cloud" y "Mesh View" según necesites
   - La vista de detalles muestra estadísticas de filtrado

##### Comparación entre los Tres Algoritmos
| Característica | Delaunay (Alpha Shapes) | Poisson Surface | Threshold Mesh |
|---------------|------------------------|-----------------|----------------|
| **Tipo de malla** | Abierta, puede tener huecos | Cerrada, watertight | Abierta, filtrada |
| **Mejor para** | Formas complejas | Objetos sólidos | Datos con ruido |
| **Pre-procesamiento** | Ninguno | Estimación de normales | Filtrado por densidad |
| **Parámetros** | Alpha | Depth, Radius, Max NN | Threshold, Alpha |
| **Tiempo** | Rápido | Moderado | Moderado |
| **Topología** | Discontinuidades posibles | Siempre continua | Discontinuidades posibles |
| **Uso ideal** | Modelado general | Superficies suaves | Limpieza de datos |

#### Detalles Técnicos

##### Backend (Django + Open3D)
**Endpoints API:**
- **POST** `/api/point_cloud/{id}/threshold`: Genera la malla con filtrado threshold
  ```json
  {
    "threshold": 0.5,  // Opcional, default 0.5 (rango: 0-2)
    "alpha": 1.0       // Opcional, default 1.0
  }
  ```
  Respuesta:
  ```json
  {
    "message": "Threshold mesh generated successfully",
    "data": {
      "mesh_file": "sphere_threshold.obj",
      "vertices": 3500,
      "triangles": 7000,
      "processing_time": 2.5,
      "algorithm": "threshold",
      "threshold": 0.5,
      "alpha": 1.0,
      "filtering_stats": {
        "points_original": 24000,
        "points_filtered": 18000,
        "points_removed": 6000,
        "removal_percentage": 25.0
      }
    }
  }
  ```

**Algoritmo:**
1. Carga la nube de puntos con Open3D: `o3d.io.read_point_cloud()`
2. Calcula el tamaño de voxel basado en bounding box (1% de la dimensión mayor)
3. Realiza voxel downsampling: `cloud.voxel_down_sample(voxel_size)`
4. Calcula distancias a vecinos más cercanos: `compute_nearest_neighbor_distance()`
5. Filtra puntos basándose en umbral de densidad
6. Genera malla con Alpha Shapes: `create_from_point_cloud_alpha_shape()`
7. Calcula normales de vértices: `threshold_mesh.compute_vertex_normals()`
8. Guarda malla en formato `.obj`: `o3d.io.write_triangle_mesh()`

**Validaciones:**
- ✅ Threshold entre 0 y 2
- ✅ Alpha mayor que 0
- ✅ Mínimo 10 puntos requeridos
- ✅ Verificación de puntos suficientes después del filtrado (mínimo 4)
- ✅ Manejo de errores con mensajes descriptivos

##### Frontend (React + Three.js)
**Componentes modificados:**
- `PointsView.jsx`: Interfaz actualizada con selector de tres algoritmos
  - Slider para threshold con visualización del valor actual
  - Input numérico para alpha
  - Muestra estadísticas de filtrado en la notificación de éxito
  - Display de metadata específica de threshold en vista de detalles

**Flujo de UI:**
1. Usuario selecciona "Threshold" desde dropdown
2. Aparecen controles específicos: slider de threshold y input de alpha
3. Usuario ajusta parámetros en tiempo real
4. Llamada a endpoint `/api/point_cloud/{id}/threshold`
5. Notificación muestra estadísticas completas de filtrado
6. Metadata en vista de detalles incluye:
   - Puntos filtrados / puntos originales
   - Porcentaje de puntos removidos

#### Ejemplos de Uso

##### Generar malla threshold con parámetros predeterminados
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/threshold \
  -H "Content-Type: application/json" \
  -d '{}'
```

##### Generar malla threshold con filtrado ligero (threshold bajo)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/threshold \
  -H "Content-Type: application/json" \
  -d '{"threshold": 0.2, "alpha": 1.0}'
```

##### Generar malla threshold con filtrado agresivo (threshold alto)
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/threshold \
  -H "Content-Type: application/json" \
  -d '{"threshold": 1.5, "alpha": 1.0}'
```

##### Generar malla threshold con alpha personalizado para mayor detalle
```bash
curl -X POST http://localhost:8000/api/point_cloud/1/threshold \
  -H "Content-Type: application/json" \
  -d '{"threshold": 0.8, "alpha": 0.5}'
```

#### Pruebas

##### Backend Tests (pytest)
```bash
# Ejecutar todos los tests de backend
make dev-test-backend

# Tests de threshold mesh incluyen:
# - test_threshold_mesh_success
# - test_threshold_with_default_parameters
# - test_threshold_with_low_threshold
# - test_threshold_with_high_threshold
# - test_threshold_with_invalid_threshold_negative
# - test_threshold_with_invalid_threshold_too_high
# - test_threshold_with_invalid_alpha
# - test_threshold_removes_sparse_points
# - test_threshold_different_alpha_values
# - test_threshold_mesh_file_created
# - test_threshold_performance_acceptable
# - test_threshold_replaces_previous_mesh
# - test_compare_threshold_with_different_values
```

##### Frontend Tests (Vitest)
```bash
# Ejecutar tests del frontend
make dev-test-frontend

# Tests de threshold mesh incluyen:
# - displays threshold algorithm option in algorithm selector
# - shows threshold parameter controls when threshold algorithm is selected
# - successfully generates threshold mesh with default parameters
# - allows adjusting threshold parameter via slider
# - generates threshold mesh with custom parameters
# - displays threshold mesh metadata including filtering statistics
# - switches to mesh view after successful threshold mesh generation
```

#### Casos de Uso Recomendados

##### Cuándo usar Threshold Mesh
- **Datos con ruido**: Cuando la nube de puntos contiene puntos dispersos o outliers
- **Escaneos de baja calidad**: Para limpiar datos de sensores con precisión variable
- **Preparación de datos**: Como paso previo antes de aplicar otros algoritmos
- **Simplificación**: Para reducir la complejidad de nubes de puntos muy densas

##### Cuándo NO usar Threshold Mesh
- **Datos limpios y uniformes**: Use Delaunay directamente para mejor rendimiento
- **Superficies cerradas requeridas**: Use Poisson para garantizar topología watertight
- **Preservación de todos los detalles**: El filtrado puede eliminar características finas

#### Limitaciones Conocidas

##### Threshold Mesh
- El filtrado puede eliminar detalles finos o características pequeñas
- Threshold muy alto puede dejar muy pocos puntos para generar malla
- No garantiza superficies cerradas (puede tener huecos)
- El criterio de densidad puede no ser óptimo para todas las distribuciones de puntos
- Requiere ajuste manual del parámetro threshold según los datos

### US-06: Visualización Interactiva de Mallas 3D Generadas (NEW)
La aplicación ahora permite visualizar y alternar entre la nube de puntos original y las mallas 3D generadas con cualquiera de los tres algoritmos disponibles.

#### Características Principales
- **Visualización dual**: Alterna entre vista de nube de puntos y malla generada
- **Soporte multi-algoritmo**: Visualiza mallas generadas con Delaunay, Poisson o Threshold
- **Renderizado optimizado**: Utiliza `THREE.BufferGeometry` para rendering eficiente
- **Controles de cámara**: OrbitControls interactivos (rotar, zoom, pan)
- **Iluminación avanzada**: Utiliza Phong shading con luces direccionales y ambientales
- **Información en tiempo real**: Panel de metadata con estadísticas de la malla
- **Visualización inmediata**: Muestra la malla automáticamente después de generarla
- **Gestión de múltiples mallas**: Permite cargar y alternar entre diferentes mallas sin interferencias
- **Manejo de errores**: Mensajes claros cuando la malla no existe o falla al cargar
- **FPS Counter**: Monitoreo de rendimiento en tiempo real

#### Cómo Usar la Visualización de Mallas

##### Visualizar una Malla Existente
1. Navega a "Visualizar nube de puntos"
2. Identifica nubes de puntos que tengan malla generada (botón "View Mesh" habilitado)
3. Haz clic en "View Details" o "View Mesh" en la tarjeta
4. En el modal de detalles:
   - Verás dos botones de toggle: **"Point Cloud"** y **"Mesh View"**
   - Haz clic en "**Mesh View**" para visualizar la malla generada
   - El visor 3D mostrará la malla con colores, iluminación y controles interactivos

##### Alternar entre Vistas
1. Dentro del modal de detalles:
   - **Point Cloud**: Muestra la nube de puntos original
   - **Mesh View**: Muestra la malla 3D generada
2. Los botones de toggle están siempre visibles en la parte superior
3. El botón activo se resalta en azul
4. El botón "Mesh View" está deshabilitado si no existe malla generada

##### Controles Interactivos en el Visor de Mallas
- **Rotar**: Click izquierdo + arrastrar
- **Zoom**: Rueda del mouse o pinch (touchpad/móvil)
- **Pan**: Click derecho + arrastrar o dos dedos (touchpad)
- **Reset View**: Botón "Reset View" para volver a la vista inicial
- **Back**: Botón "Back" para cerrar el visor

##### Generar y Visualizar Inmediatamente
1. Abre el modal de detalles de una nube de puntos
2. Selecciona un algoritmo (Delaunay, Poisson o Threshold)
3. Ajusta parámetros según necesites
4. Haz clic en "**Generate Mesh**"
5. **Automáticamente**: Al completar la generación, la vista cambia a "Mesh View"
6. Puedes regresar a "Point Cloud" para comparar con el original

##### Trabajar con Múltiples Mallas
1. Genera mallas para diferentes nubes de puntos
2. Abre el modal de cualquier nube con malla generada
3. Alterna entre vistas independientemente
4. Cierra el modal y abre otro - cada uno mantiene su propia malla
5. Las mallas no interfieren entre sí, incluso si están abiertas simultáneamente

#### Detalles Técnicos

##### Componente MeshViewer
**Ubicación**: `react-frontend/src/components/MeshViewer.jsx`

**Características técnicas:**
- **Renderizado con BufferGeometry**: Utiliza `THREE.BufferGeometry` para eficiencia
- **Índices de triángulos**: `Uint32Array` para mallas grandes (>65k vértices)
- **Material Phong**: `meshPhongMaterial` con `vertexColors` y `DoubleSide` rendering
- **Iluminación**: 
  - Luz ambiental (intensidad 0.5) para iluminación base
  - Dos luces direccionales para profundidad y detalle
- **Cálculo automático de normales**: `geometry.computeVertexNormals()` para iluminación correcta
- **Posicionamiento de cámara**: Automático basado en `boundingSphere` de la geometría
- **FPS Counter**: Contador de frames por segundo para monitoreo de rendimiento
- **Grid Helper**: Rejilla de referencia en el plano XY
- **Axes Helper**: Ejes coordenados (X: rojo, Y: verde, Z: azul)

**Props del componente:**
```jsx
<MeshViewer 
  pointCloudId={number}  // ID de la nube de puntos
  onError={function}     // Callback para errores
  onBack={function}      // Callback para botón "Back"
/>
```

**Estados de carga:**
- **Loading**: Spinner animado con mensaje "Loading mesh..."
- **Error**: Icono de error con mensaje descriptivo y botón "Back to Library"
- **Success**: Renderizado del visor 3D con controles

##### Backend API
**Endpoint**: `GET /api/point_cloud/{id}/mesh`

**Respuesta exitosa:**
```json
{
  "message": "Mesh data retrieved successfully",
  "name": "cube",
  "algorithm": "delaunay",
  "data": {
    "vertices": [[x1, y1, z1], [x2, y2, z2], ...],
    "triangles": [[i1, i2, i3], [i4, i5, i6], ...],
    "colors": [[r1, g1, b1], [r2, g2, b2], ...],
    "normals": [[nx1, ny1, nz1], [nx2, ny2, nz2], ...],
    "num_vertices": 1234,
    "num_triangles": 5678
  },
  "metadata": {
    "algorithm": "delaunay",
    "alpha": 1.0,
    "vertices": 1234,
    "triangles": 5678,
    "processing_time": 2.5
  }
}
```

**Códigos de error:**
- **404 Not Found**: No existe malla generada para ese point cloud
- **404 Not Found**: Point cloud no existe
- **500 Internal Server Error**: Error al cargar o procesar la malla

##### Integración con PointsView
**Ubicación**: `react-frontend/src/views/PointsView.jsx`

**Lógica de toggle:**
1. Estado `viewMode` controla la vista actual: `'cloud'` o `'mesh'`
2. Por defecto inicia en `'cloud'` al abrir el modal
3. Al generar malla exitosamente, cambia automáticamente a `'mesh'`
4. Los botones de toggle permiten cambiar entre vistas manualmente
5. El botón "Mesh View" está deshabilitado si `!selectedCloud.mesh_file`
6. Al cerrar el modal, `viewMode` se resetea a `'cloud'`

**Renderizado condicional:**
```jsx
{viewMode === 'cloud' ? (
  <PointCloudViewer pointCloudId={selectedCloud.id} onError={setError} />
) : (
  <MeshViewer pointCloudId={selectedCloud.id} onError={setError} />
)}
```

##### Panel de Información de Malla
Ubicado en `MeshViewer.jsx`, muestra:
- **Algoritmo**: Delaunay, Poisson o Threshold
- **Vertices**: Conteo de vértices formateado (ej. "1,234")
- **Triangles**: Conteo de triángulos formateado (ej. "5,678")
- **Alpha**: Parámetro alpha (solo Delaunay y Threshold)
- **Processing Time**: Tiempo de generación en segundos

Para algoritmo Threshold, muestra información adicional:
- **Threshold**: Valor de umbral usado
- **Points Filtered**: Cantidad de puntos después del filtrado
- **Points Removed**: Cantidad y porcentaje de puntos eliminados

#### Pruebas

##### Frontend Tests (Vitest)
**Archivo**: `react-frontend/src/test/PointsView.test.jsx`

**Tests de toggle (nuevo en US-06):**
```javascript
describe('View Toggle Functionality (US-06)', () => {
  // Tests incluyen:
  - displays toggle buttons for point cloud and mesh views
  - starts with point cloud view by default
  - toggles from point cloud to mesh view when mesh exists
  - toggles back from mesh to point cloud view
  - disables mesh view button when no mesh has been generated
  - shows alert when trying to toggle to mesh view without generated mesh
  - displays mesh immediately after generation without page reload
  - maintains toggle state when switching between multiple point clouds
})
```

**Archivo**: `react-frontend/src/test/MeshViewer.test.jsx`

**Tests de componente:**
```javascript
describe('MeshViewer', () => {
  // Tests incluyen:
  - renders loading state initially
  - fetches and displays mesh data successfully
  - displays error when mesh is not found
  - handles network errors gracefully
  - calls onError callback when error occurs
  - displays mesh metadata correctly
})
```

**Ejecutar tests:**
```bash
# Todos los tests del frontend
make dev-test-frontend

# Tests en modo watch (desarrollo)
make dev-test-frontend-watch

# Tests con coverage
make dev-test-frontend-coverage
```

##### Backend Tests (pytest)
**Archivo**: `django-backend/api/tests.py`

**Tests de endpoint de malla:**
```python
class PointCloudTriangulateTestCase(TestCase):
    # Tests incluyen:
    def test_get_mesh_data_success(self):
        # Verifica que se pueden obtener datos de malla después de generarla
    
    def test_get_mesh_data_without_generation(self):
        # Verifica error 404 cuando no existe malla
    
    def test_get_mesh_data_invalid_id(self):
        # Verifica error 404 con ID inválido
    
    def test_regenerate_mesh_overwrites_previous(self):
        # Verifica que regenerar reemplaza la malla anterior
```

**Ejecutar tests:**
```bash
# Todos los tests del backend
make dev-test-backend

# Tests con coverage
make dev-test-backend-coverage

# Tests específicos
cd django-backend
python manage.py test api.tests.PointCloudTriangulateTestCase
```

#### Casos de Uso

##### Caso 1: Visualizar Malla Recién Generada
1. Usuario sube una nube de puntos
2. Selecciona algoritmo y ajusta parámetros
3. Genera la malla
4. **Automáticamente** la vista cambia a "Mesh View"
5. Ve la malla renderizada con iluminación y colores
6. Puede rotar, hacer zoom y explorar la malla

##### Caso 2: Comparar Nube de Puntos vs Malla
1. Usuario tiene una nube con malla generada
2. Abre el modal en vista "Point Cloud"
3. Observa la nube de puntos original
4. Hace clic en "Mesh View"
5. Compara visualmente la malla generada vs los puntos originales
6. Alterna entre vistas para análisis comparativo

##### Caso 3: Regenerar Malla con Nuevos Parámetros
1. Usuario visualiza malla existente
2. No está satisfecho con el resultado
3. Cambia a "Point Cloud" view
4. Ajusta parámetros del algoritmo
5. Regenera la malla con "Regenerate Mesh"
6. Vista cambia automáticamente a "Mesh View" con nueva malla

##### Caso 4: Trabajar con Múltiples Mallas
1. Usuario tiene varias nubes de puntos con mallas
2. Abre la primera nube, visualiza su malla
3. Cierra el modal
4. Abre la segunda nube, visualiza su malla
5. Cada malla se carga y renderiza independientemente
6. No hay interferencia entre visualizaciones

#### Manejo de Errores

##### Malla No Encontrada
**Escenario**: Usuario intenta ver malla que no ha sido generada
**Mensaje**: "Mesh not found. Please generate the mesh first."
**Acción**: Botón "Back to Library" para volver a la lista

##### Error de Red
**Escenario**: Falla la conexión al backend
**Mensaje**: "Failed to fetch mesh data: [error details]"
**Acción**: Botón "Back to Library" y mensaje de error descriptivo

##### Point Cloud Inexistente
**Escenario**: ID de nube de puntos no válido
**Mensaje**: "Point cloud not found"
**Acción**: Error 404 con redirección a biblioteca

##### Error de Renderización
**Escenario**: Datos de malla corruptos o incompletos
**Efecto**: No se renderiza la geometría
**Mensaje**: Error en consola, malla no visible
**Prevención**: Validaciones en backend aseguran datos correctos

#### Optimizaciones de Rendimiento

##### BufferGeometry
- Utiliza arrays tipados (`Float32Array`, `Uint32Array`) para eficiencia de memoria
- Reduce overhead de objetos JavaScript comparado con `Geometry` legacy
- Soporta mallas grandes (>100k triángulos) sin problemas

##### Índices de Triángulos
- `Uint32Array` para índices permite hasta ~4 mil millones de vértices
- Reduce duplicación de vértices compartidos entre triángulos
- Mejora performance de renderizado WebGL

##### Cálculo de Normales
- Normales calculadas una sola vez al cargar la geometría
- `computeVertexNormals()` para iluminación suave
- No se recalculan en cada frame

##### Camera Positioning
- Cámara se posiciona automáticamente basándose en `boundingSphere`
- No requiere ajuste manual por parte del usuario
- Garantiza que toda la malla sea visible al inicio

##### FPS Monitoring
- Contador actualizado cada segundo (no cada frame)
- Permite detectar problemas de performance
- Útil para debugging y optimización

#### Limitaciones Conocidas

##### Rendering de Mallas Muy Grandes
- Mallas con >500k triángulos pueden causar lag en navegadores
- Recomendado: simplificar mallas grandes antes de visualizar
- Solución futura: Level of Detail (LOD) automático

##### Colores de Vértices
- Requiere que la malla tenga datos de color en cada vértice
- Algunos algoritmos pueden no preservar colores originales
- Fallback: color sólido si no hay datos de color

##### Memoria del Navegador
- Cargar múltiples mallas grandes simultáneamente consume RAM
- Recomendado: cerrar modales no utilizados
- Solución futura: liberación automática de memoria

##### Dispositivos Móviles
- Controles táctiles pueden ser menos precisos que mouse
- Mallas muy grandes pueden causar lag en dispositivos antiguos
- Recomendado: generar mallas con menos detalle para móviles

### US-07: Controles Avanzados de Interacción 3D para Mallas (NEW)
La aplicación ahora incluye controles avanzados de cámara e interacción mejorados para la visualización de mallas 3D, permitiendo una inspección detallada de la calidad de las superficies generadas.

#### Características Principales
- **Controles de cámara completos**: Rotación, zoom y pan suaves e intuitivos
- **Botón de reseteo de vista**: Restaura la cámara a la posición y orientación inicial
- **Toggle de visibilidad**: Alterna entre malla, nube de puntos y vista combinada
- **Controles de helpers**: Muestra/oculta grid y ejes coordenados
- **Atajos de teclado**: Controles rápidos para todas las funciones principales
- **OrbitControls mejorados**: Configuración optimizada para mejor experiencia de usuario
- **Vista responsiva**: Funciona consistentemente en desktop y dispositivos móviles
- **Performance optimizado**: Mantiene 60 FPS para mallas típicas (<1M caras)

#### Controles Interactivos

##### Controles de Cámara
| Acción | Mouse/Trackpad | Teclado | Móvil |
|--------|---------------|---------|-------|
| **Rotar** | Click izquierdo + arrastrar | - | Un dedo + arrastrar |
| **Zoom** | Rueda del mouse | - | Pinch (dos dedos) |
| **Pan** | Click derecho + arrastrar | - | Dos dedos + arrastrar |
| **Reset View** | Botón "Reset View" | `R` | Botón "Reset View" |

##### Modos de Visualización
| Modo | Descripción | Atajo |
|------|-------------|-------|
| **Mesh** | Muestra solo la malla 3D | `M` |
| **Points** | Muestra solo la nube de puntos (30% sample) | `P` |
| **Both** | Muestra malla y nube de puntos simultáneamente | `B` |

##### Helpers Visuales
| Helper | Descripción | Atajo |
|--------|-------------|-------|
| **Grid** | Rejilla de referencia en el plano XY | `G` |
| **Axes** | Ejes coordenados (X: rojo, Y: verde, Z: azul) | `A` |

#### Cómo Usar los Controles Avanzados

##### Inspección Básica de Mallas
1. Abre una malla en el visor 3D
2. **Rotar**: Click izquierdo + arrastrar para examinar desde diferentes ángulos
3. **Zoom**: Rueda del mouse para acercar/alejar a áreas específicas
4. **Pan**: Click derecho + arrastrar para reposicionar la vista
5. **Reset**: Presiona `R` o botón "Reset View" para volver a vista inicial

##### Comparación Malla vs Puntos Originales
1. Abre una malla generada en el visor
2. Por defecto se muestra en modo "**Mesh**"
3. Haz clic en "**Points**" o presiona `P` para ver la nube de puntos original
4. Haz clic en "**Both**" o presiona `B` para ver ambas superposiciones
5. Compara visualmente la fidelidad de la reconstrucción
6. Alterna entre modos para análisis detallado

##### Uso de Helpers para Referencia Espacial
1. El **Grid** ayuda a entender la escala y orientación
2. Los **Axes** muestran las direcciones X, Y, Z
3. Presiona `G` para toggle del grid
4. Presiona `A` para toggle de los ejes
5. Útil para identificar orientación de objetos escaneados

##### Atajos de Teclado Rápidos
- `R`: Reset view (restaura cámara)
- `M`: Modo Mesh (solo malla)
- `P`: Modo Points (solo puntos)
- `B`: Modo Both (ambos)
- `G`: Toggle grid
- `A`: Toggle axes

#### Detalles Técnicos

##### OrbitControls Mejorados
**Configuración en MeshViewer.jsx:**
```jsx
<OrbitControls
  ref={controlsRef}
  enableDamping={true}         // Movimientos suaves con inercia
  dampingFactor={0.05}         // Factor de damping (más bajo = más suave)
  rotateSpeed={0.5}            // Velocidad de rotación
  zoomSpeed={0.8}              // Velocidad de zoom
  enablePan={true}             // Habilita pan
  enableZoom={true}            // Habilita zoom
  enableRotate={true}          // Habilita rotación
  minDistance={0.5}            // Distancia mínima de cámara
  maxDistance={100}            // Distancia máxima de cámara
/>
```

##### Estados de Vista
**Componente gestiona tres estados de visualización:**
```javascript
const [viewMode, setViewMode] = useState('mesh');  // 'mesh', 'pointcloud', 'both'
const [showGrid, setShowGrid] = useState(true);
const [showAxes, setShowAxes] = useState(true);
```

##### Renderizado Condicional
```jsx
{/* Renderiza Mesh si viewMode === 'mesh' o 'both' */}
{(viewMode === 'mesh' || viewMode === 'both') && (
  <MeshRenderer vertices={...} triangles={...} colors={...} />
)}

{/* Renderiza Point Cloud si viewMode === 'pointcloud' o 'both' */}
{(viewMode === 'pointcloud' || viewMode === 'both') && pointCloudData && (
  <PointCloudRenderer positions={...} colors={...} />
)}

{/* Helpers condicionales */}
{showGrid && <gridHelper args={[10, 10, '#3f3f46', '#27272a']} />}
{showAxes && <axesHelper args={[1]} />}
```

##### Manejo de Eventos de Teclado
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    switch (e.key.toLowerCase()) {
      case 'r': handleResetView(); break;
      case 'm': setViewMode('mesh'); break;
      case 'p': setViewMode('pointcloud'); break;
      case 'b': setViewMode('both'); break;
      case 'g': toggleGrid(); break;
      case 'a': toggleAxes(); break;
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

##### Panel de Controles
El panel de controles muestra:
- **Display Mode**: Botones para Mesh / Points / Both
- **Helpers**: Toggle para Grid y Axes
- **Reset View**: Botón para resetear cámara
- **Back**: Botón para cerrar el visor
- **Shortcuts**: Ayuda con atajos de teclado

#### Pruebas

##### Frontend Tests (Vitest)
**Archivo**: `react-frontend/src/test/MeshViewer.test.jsx`

**Tests de US-07:**
```javascript
describe('MeshViewer - US-07: Advanced 3D Interaction Controls', () => {
  it('displays reset view button')
  it('displays view mode toggle buttons')
  it('toggles view mode when clicking buttons')
  it('displays helper toggle buttons for grid and axes')
  it('toggles grid visibility when clicking grid button')
  it('displays keyboard shortcuts help')
  it('handles keyboard shortcuts for view mode')
  it('calls onBack when back button is clicked')
  it('fetches both mesh and point cloud data on mount')
  it('gracefully handles missing point cloud data')
})
```

**Ejecutar tests:**
```bash
# Tests específicos de MeshViewer
cd react-frontend
npm test -- MeshViewer.test.jsx

# Todos los tests del frontend
make dev-test-frontend
```

##### Tests de Interacción Manual
1. **Test de Rotación**:
   - Abrir visor de mallas
   - Click izquierdo + arrastrar en varias direcciones
   - Verificar rotación suave sin saltos
   
2. **Test de Zoom**:
   - Rueda del mouse hacia adelante/atrás
   - Verificar zoom suave sin distorsión
   - Verificar límites min/max distance
   
3. **Test de Pan**:
   - Click derecho + arrastrar
   - Verificar movimiento lateral suave
   
4. **Test de Reset View**:
   - Rotar, zoom y pan a posición aleatoria
   - Presionar `R` o botón "Reset View"
   - Verificar que vuelve a posición inicial
   
5. **Test de Toggle de Vistas**:
   - Alternar entre Mesh / Points / Both
   - Verificar que cada modo renderiza correctamente
   - Verificar que botones deshabilitados funcionan correctamente
   
6. **Test de Helpers**:
   - Toggle grid on/off con `G`
   - Toggle axes on/off con `A`
   - Verificar que aparecen/desaparecen correctamente

#### Casos de Uso

##### Caso 1: Inspección de Calidad de Malla
**Objetivo**: Evaluar si la malla generada captura bien la geometría original

1. Genera una malla con algoritmo Delaunay (alpha = 1.0)
2. Abre el visor en modo "**Mesh**"
3. Rota la malla para examinar desde todos los ángulos
4. Zoom in para inspeccionar detalles finos
5. Presiona `P` para ver los puntos originales
6. Presiona `B` para ver ambos superpuestos
7. Evalúa visualmente la fidelidad de la reconstrucción
8. Si no es satisfactorio, ajusta parámetros y regenera

##### Caso 2: Comparación de Algoritmos
**Objetivo**: Decidir qué algoritmo funciona mejor para un dataset

1. Genera malla con Delaunay (alpha = 1.0)
2. Visualiza y examina con controles de cámara
3. Toma nota mental de áreas problemáticas
4. Cierra visor y regenera con Poisson (depth = 9)
5. Compara visualmente ambas reconstrucciones
6. Regenera con Threshold si hay mucho ruido
7. Selecciona el algoritmo que mejor preserve la geometría

##### Caso 3: Preparación de Datos para Exportación
**Objetivo**: Verificar que la malla está lista para uso en otra aplicación

1. Abre malla en visor
2. Zoom in para verificar que no hay huecos
3. Rota 360° para verificar cobertura completa
4. Presiona `B` para comparar con puntos originales
5. Verifica que grid y axes están correctamente orientados
6. Confirma que escala es apropiada
7. Exporta malla si pasa validación visual

##### Caso 4: Presentación o Demostración
**Objetivo**: Mostrar las capacidades de la aplicación a stakeholders

1. Carga una nube de puntos de ejemplo (e.g., sphere.pts)
2. Genera malla con parámetros predeterminados
3. Abre visor en modo "**Both**" para mostrar punto vs malla
4. Usa controles de rotación para mostrar desde varios ángulos
5. Toggle entre modos para demostrar capacidad de visualización dual
6. Usa `R` para reset entre demostraciones
7. Explica shortcuts para mostrar facilidad de uso

#### Optimizaciones de Rendimiento

##### Sampling de Nube de Puntos
- Carga solo 30% de puntos originales (`?sample=0.3`)
- Reduce carga de memoria sin pérdida visual significativa
- Mejora FPS en modo "Both"

##### Damping en OrbitControls
- `dampingFactor=0.05` proporciona movimiento suave
- Reduce sacudidas y mejora experiencia de usuario
- No impacta performance negativamente

##### Renderizado Condicional
- Solo renderiza geometrías visibles según `viewMode`
- Grid y axes solo se renderizan si están habilitados
- Reduce trabajo de GPU innecesario

##### Límites de Distancia de Cámara
- `minDistance=0.5` previene zoom excesivo
- `maxDistance=100` previene pérdida de contexto
- Mantiene malla visible en todo momento

#### Limitaciones Conocidas

##### Modo "Both" con Mallas Grandes
- Renderizar malla + puntos simultáneamente puede causar lag
- Recomendado: usar solo para mallas <100k triángulos
- Solución futura: downsampling automático

##### Atajos de Teclado en Móviles
- No hay teclado físico en dispositivos móviles
- Usuarios deben usar botones en pantalla
- Los controles táctiles funcionan correctamente

##### Point Cloud Data Ausente
- Si falla la carga de punto cloud, modos "Points" y "Both" se deshabilitan
- Fallback: solo modo "Mesh" disponible
- Mensaje visual indica que puntos no están disponibles

##### Reset View con OrbitControls
- Reset restablece a posición inicial de OrbitControls
- No restaura posición calculada por `boundingSphere`
- Puede requerir ajuste manual después de reset

### US-08: Registro de Usuarios
La aplicación incluye un sistema completo de registro de usuarios con validación robusta y seguridad mejorada.

#### Características Principales
- **Registro seguro de usuarios**: Formulario de registro con validación completa
- **Validación de contraseñas**: Requisitos de seguridad aplicados en frontend y backend
- **Hash de contraseñas**: Almacenamiento seguro usando algoritmos de Django
- **Validación de email**: Formato correcto y unicidad verificada
- **Manejo de errores**: Mensajes claros para problemas de validación
- **Loading states**: Indicadores visuales durante operaciones asíncronas
- **Auto-login**: Redirección automática después de registro exitoso con tokens JWT

### US-09: Autenticación de Usuarios (NEW)
La aplicación ahora incluye un sistema completo de autenticación que permite a los usuarios registrados iniciar sesión de forma segura para acceder y gestionar sus nubes de puntos y mallas 3D.

#### Características Principales
- **Login seguro**: Formulario de inicio de sesión con validación de credenciales
- **Autenticación JWT**: Tokens de acceso y refresh para sesiones seguras
- **Validación de cuentas activas**: Sistema previene login de cuentas inactivas
- **Protección contra ataques**: Mensajes genéricos para credenciales inválidas
- **Sesión persistente**: Tokens almacenados en localStorage para mantener sesión
- **Manejo de errores**: Mensajes claros y específicos según tipo de error
- **Loading states**: Indicadores visuales durante autenticación
- **Redirección automática**: Usuario redirigido a dashboard tras login exitoso

#### Cómo Usar el Sistema de Autenticación

##### Registro de Nuevo Usuario
1. Navega a `/register` o haz clic en "Create account" desde cualquier vista
2. Completa el formulario de registro:
   - **Email**: Ingresa un email válido (será usado como username)
   - **Password**: Ingresa una contraseña segura (mínimo 8 caracteres, letras y números)
   - **Confirm Password**: Reingresa la contraseña para confirmar
3. Haz clic en "**Create account**"
4. Si el registro es exitoso:
   - Los tokens JWT se almacenan en `localStorage`
   - Redirección automática a la biblioteca de nubes de puntos (`/points`)
5. Si hay errores:
   - Mensajes claros indican qué necesita corregirse
   - Corrige los errores y vuelve a intentar

##### Inicio de Sesión
1. Navega a `/login` o haz clic en "Sign in" desde el registro
2. Ingresa tus credenciales:
   - **Email**: Tu email registrado
   - **Password**: Tu contraseña
3. Haz clic en "**Sign in**"
4. Si las credenciales son correctas:
   - Tokens JWT almacenados en `localStorage`
   - Redirección a `/points`
5. Si las credenciales son incorrectas:
   - Mensaje de error: "Invalid email or password"

#### Detalles Técnicos

##### Backend (Django + JWT)

**Endpoints API:**

###### POST `/api/auth/register` - Registro de Usuario
Crea una nueva cuenta de usuario con validación completa.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Éxito - 201 CREATED):**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

**Response (Error - 400 BAD REQUEST):**
```json
{
  "message": "Email already registered",
  "data": null
}
```

**Validaciones:**
- ✅ Email válido (formato correcto)
- ✅ Email único (no duplicados)
- ✅ Contraseña presente
- ✅ Contraseña mínimo 8 caracteres
- ✅ Contraseña no muy común
- ✅ Contraseña no totalmente numérica
- ✅ Contraseña no similar al email

###### POST `/api/auth/login` - Inicio de Sesión
Autentica un usuario existente y devuelve tokens JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (Éxito - 200 OK):**
```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

**Response (Error - 401 UNAUTHORIZED):**
```json
{
  "message": "Invalid email or password",
  "data": null
}
```

**Response (Error - 403 FORBIDDEN - Cuenta Inactiva):**
```json
{
  "message": "Account is inactive. Please contact support.",
  "data": null
}
```

**Validaciones:**
- ✅ Email y password requeridos
- ✅ Credenciales válidas contra base de datos
- ✅ Cuenta debe estar activa (`is_active=True`)
- ✅ Email case-insensitive (convierte a minúsculas)
- ✅ Genera tokens JWT válidos
- ✅ Actualiza `last_login` del usuario

**Seguridad:**
- 🔒 Mensaje genérico para credenciales inválidas (previene enumeración)
- 🔒 No expone si email existe o no en sistema
- 🔒 Verifica estado activo de cuenta antes de emitir tokens
- 🔒 Contraseñas nunca expuestas en logs o respuestas
- 🔒 Autenticación usando `django.contrib.auth.authenticate`

**Configuración JWT:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

**Modelo de Usuario:**
- Utiliza `django.contrib.auth.models.User` estándar
- `username` = email (en minúsculas)
- `email` = email del usuario
- `password` = hash seguro (pbkdf2_sha256)

**Seguridad:**
- Contraseñas hasheadas con `pbkdf2_sha256` (Django default)
- Validación con `django.contrib.auth.password_validation`
- Email convertido a minúsculas para consistencia
- Tokens JWT firmados con SECRET_KEY
- CORS configurado para frontend autorizado

##### Frontend (React + JWT)

**Componentes:**
- `RegisterView.jsx`: Formulario completo de registro
- `LoginView.jsx`: Formulario de inicio de sesión

**Validación en Frontend:**
```javascript
// Email validation
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation
if (password.length < 8) {
  return 'Password must be at least 8 characters long';
}
if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
  return 'Password must contain at least one letter and one number';
}
```

**Manejo de Tokens:**
```javascript
// Después de registro/login exitoso
localStorage.setItem('access_token', data.data.tokens.access);
localStorage.setItem('refresh_token', data.data.tokens.refresh);
localStorage.setItem('user_email', data.data.email);
localStorage.setItem('user_id', data.data.id);
```

**Estados de UI:**
- 🔵 **Loading**: Spinner durante request, botón deshabilitado
- ✅ **Success**: Tokens guardados, redirección automática
- ❌ **Error**: Mensaje de error descriptivo con opción de reintentar

**Características de UX:**
- Validación en tiempo real
- Mensajes de error claros y específicos
- Loading indicators durante operaciones asíncronas
- Links de navegación entre login y registro
- Diseño responsive (móvil y desktop)
- Tema oscuro (zinc-900) consistente con la aplicación

#### Pruebas

##### Backend Tests (pytest-django)
**Archivo**: `django-backend/api/tests_auth.py`

**Tests de Registro:**
```python
def test_successful_registration()
def test_duplicate_email_registration()
def test_invalid_email_format()
def test_missing_email()
def test_missing_password()
def test_weak_password_too_short()
def test_weak_password_common()
def test_weak_password_numeric_only()
def test_email_case_insensitive()
def test_password_is_hashed()
```

**Tests de Login:**
```python
def test_successful_login()
def test_invalid_password()
def test_nonexistent_user()
def test_missing_email()
def test_missing_password()
def test_case_insensitive_email_login()
def test_inactive_user_login()
def test_jwt_tokens_are_valid()
```

**Ejecutar tests:**
```bash
# Backend tests
make dev-test-backend

# Solo tests de autenticación
cd django-backend
source .venv/bin/activate
python manage.py test api.tests_auth
```

##### Frontend Tests (Vitest)
**Archivos**: 
- `react-frontend/src/test/RegisterView.test.jsx`
- `react-frontend/src/test/LoginView.test.jsx`

**Tests de Registro:**
```javascript
it('renders registration form correctly')
it('validates required fields')
it('validates email format')
it('validates password length')
it('validates password complexity')
it('validates password confirmation match')
it('submits form successfully and navigates')
it('displays error message when registration fails')
it('displays loading state during submission')
it('handles network errors gracefully')
it('navigates to login page when clicking sign in link')
it('displays password validation errors from backend')
```

**Tests de Login:**
```javascript
it('renders login form correctly')
it('validates required fields')
it('submits form successfully and navigates')
it('displays error message when login fails')
it('displays loading state during submission')
it('handles network errors gracefully')
it('navigates to register page when clicking create account link')
```

**Ejecutar tests:**
```bash
# Frontend tests
make dev-test-frontend

# Solo tests de autenticación
cd react-frontend
npm test -- RegisterView.test.jsx
npm test -- LoginView.test.jsx
```

#### Casos de Uso

##### Caso 1: Nuevo Usuario se Registra
1. Usuario visita la aplicación por primera vez
2. Hace clic en "Create account" o navega a `/register`
3. Completa el formulario:
   - Email: `newuser@example.com`
   - Password: `SecurePass123!`
   - Confirm: `SecurePass123!`
4. Sistema valida en frontend antes de enviar
5. Backend crea usuario y devuelve tokens JWT
6. Usuario es redirigido automáticamente a `/points`
7. Puede empezar a cargar y visualizar nubes de puntos

##### Caso 2: Usuario Intenta Registrarse con Email Existente
1. Usuario intenta registrarse
2. Ingresa email ya registrado: `existing@example.com`
3. Frontend valida formato (OK)
4. Backend detecta duplicado
5. Sistema muestra: "Email already registered"
6. Usuario puede:
   - Intentar con otro email
   - Ir a login si ya tiene cuenta

##### Caso 3: Usuario Ingresa Contraseña Débil
1. Usuario completa formulario de registro
2. Ingresa contraseña: `pass`
3. Frontend valida inmediatamente:
   - Error: "Password must be at least 8 characters long"
4. Usuario corrige a: `password123`
5. Frontend valida:
   - Formato OK (8+ chars, letras + números)
6. Backend valida adicionalmente:
   - Error: "This password is too common"
7. Usuario debe elegir contraseña más segura
8. Ingresa: `MyUniquePass2024!`
9. Registro exitoso

##### Caso 4: Usuario Inicia Sesión
1. Usuario registrado visita `/login`
2. Ingresa credenciales:
   - Email: `user@example.com`
   - Password: `MySecurePass123!`
3. Sistema autentica con Django
4. Backend verifica:
   - Credenciales correctas
   - Cuenta activa (`is_active=True`)
5. Tokens JWT generados y almacenados en localStorage
6. Redirección automática a `/points`
7. Usuario puede acceder a funcionalidades protegidas

##### Caso 5: Usuario Intenta Login con Cuenta Inactiva
1. Administrador desactiva cuenta de usuario por alguna razón
2. Usuario intenta iniciar sesión
3. Ingresa credenciales correctas
4. Backend valida credenciales (OK)
5. Backend detecta `is_active=False`
6. Sistema responde: "Account is inactive. Please contact support."
7. Usuario recibe HTTP 403 FORBIDDEN
8. Usuario debe contactar soporte para reactivar cuenta

##### Caso 6: Usuario Ingresa Credenciales Incorrectas
1. Usuario intenta iniciar sesión
2. Ingresa email correcto pero contraseña incorrecta
3. Sistema responde: "Invalid email or password"
4. Usuario no puede determinar si email o password es incorrecto (seguridad)
5. Usuario puede:
   - Reintentar con credenciales correctas
   - Usar "forgot password" (feature futura)

##### Caso 7: Usuario Intenta Login con Email No Registrado
1. Usuario intenta iniciar sesión
2. Ingresa email que no existe en base de datos
3. Sistema responde: "Invalid email or password"
4. Mismo mensaje que password incorrecta (previene enumeración de usuarios)
5. Usuario puede:
   - Verificar email es correcto
   - Registrarse si no tiene cuenta

#### Seguridad

##### Implementada
- ✅ Contraseñas hasheadas con pbkdf2_sha256
- ✅ Validación de contraseñas en múltiples niveles
- ✅ Tokens JWT con expiración (1 hora access, 7 días refresh)
- ✅ CORS configurado solo para orígenes autorizados
- ✅ SQL Injection prevenido (Django ORM)
- ✅ XSS prevenido (React escapa HTML automáticamente)
- ✅ Email case-insensitive para evitar duplicados sutiles
- ✅ Validación de cuentas activas (previene login de usuarios desactivados)
- ✅ Mensajes genéricos de error (previene enumeración de usuarios)
- ✅ Autenticación segura con Django authentication backend

##### Futuras Mejoras
- [ ] Verificación de email por correo electrónico
- [ ] Recuperación de contraseña (forgot password)
- [ ] Refresh token rotation para mayor seguridad
- [ ] Rate limiting en endpoints de autenticación
- [ ] HTTPS obligatorio en producción
- [ ] 2FA (two-factor authentication)
- [ ] Logging de intentos fallidos de login
- [ ] Bloqueo temporal después de X intentos fallidos
- [ ] Política de expiración de contraseñas
- [ ] OAuth2 (Google, GitHub login)

#### Limitaciones Conocidas

##### Tokens en localStorage
- localStorage es vulnerable a XSS
- Alternativa futura: httpOnly cookies
- Mitigado: React escapa contenido automáticamente

##### Sin Verificación de Email
- Usuarios pueden registrarse con emails falsos
- Implementar en US futura
- No crítico para MVP

##### Sin Rate Limiting
- Posible ataque de fuerza bruta
- Implementar middleware de throttling
- Django Rest Framework tiene soporte built-in

##### Sin Refresh Token Endpoint
- Tokens expiran después de 1 hora
- Usuario debe hacer login nuevamente
- Implementar endpoint `/api/auth/refresh` en futuro

#### Próximas Mejoras (Roadmap)
- [x] Soporte para algoritmo de reconstrucción Poisson ✅ **IMPLEMENTADO**
- [x] Soporte para algoritmo de threshold mesh ✅ **IMPLEMENTADO**
- [x] Visualización interactiva de mallas generadas con toggle ✅ **IMPLEMENTADO (US-06)**
- [x] Controles avanzados de interacción 3D con atajos de teclado ✅ **IMPLEMENTADO (US-07)**
- [x] Sistema de registro de usuarios con validación robusta ✅ **IMPLEMENTADO (US-08)**
- [x] Sistema de autenticación segura con JWT ✅ **IMPLEMENTADO (US-09)**
- [ ] Verificación de email para nuevos usuarios
- [ ] Recuperación de contraseña (forgot password)
- [ ] Endpoint de refresh token para renovar sesiones
- [ ] Protección de endpoints con autenticación requerida
- [ ] Asociación de point clouds con usuarios específicos
- [ ] Dashboard de usuario con estadísticas
- [ ] Exportación de mallas en formatos .ply y .obj desde UI
- [ ] Procesamiento asíncrono con Celery para nubes grandes (>100k puntos)
- [ ] Preview en miniatura de la malla en la tarjeta
- [ ] Downsampling automático para nubes muy grandes
- [ ] Comparación lado a lado de nube de puntos vs malla (split-screen)
- [ ] Simplificación de mallas para reducir conteo de polígonos
- [ ] Filtrado de densidades en Poisson para mejor calidad
- [ ] Control de calidad de normales antes de reconstrucción
- [ ] Level of Detail (LOD) para mallas muy grandes
- [ ] Wireframe mode toggle para análisis de topología
- [ ] Medición de distancias y áreas en las mallas
- [ ] Selección y highlighting de múltiples mallas
- [ ] Animaciones de transición entre modos de vista
- [ ] Guardado de preferencias de visualización del usuario



