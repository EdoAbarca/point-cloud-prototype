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

#### Próximas Mejoras (Roadmap)
- [x] Soporte para algoritmo de reconstrucción Poisson ✅ **IMPLEMENTADO**
- [ ] Soporte para algoritmo de threshold mesh
- [ ] Exportación de mallas en formatos .ply y .obj desde UI
- [ ] Procesamiento asíncrono con Celery para nubes grandes (>100k puntos)
- [ ] Preview en miniatura de la malla en la tarjeta
- [ ] Downsampling automático para nubes muy grandes
- [ ] Comparación lado a lado de nube de puntos vs malla
- [ ] Simplificación de mallas para reducir conteo de polígonos
- [ ] Filtrado de densidades en Poisson para mejor calidad
- [ ] Control de calidad de normales antes de reconstrucción



