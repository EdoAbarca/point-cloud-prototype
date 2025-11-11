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



