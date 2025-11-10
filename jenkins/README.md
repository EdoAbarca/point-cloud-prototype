# Jenkins Custom Image

Este directorio contiene la configuración personalizada de Jenkins para el proyecto Point Cloud Prototype.

## ¿Por qué una imagen personalizada?

La imagen base `jenkins/jenkins:lts` no incluye:
- Docker CLI (necesario para ejecutar comandos `docker compose`)
- Make (necesario para ejecutar comandos del Makefile)

Esta imagen personalizada extiende la imagen base agregando estas herramientas esenciales para el pipeline de CI/CD.

## Herramientas instaladas

- ✅ **Docker CLI**: Para ejecutar comandos `docker` y `docker compose`
- ✅ **Docker Compose Plugin**: Para la compatibilidad con `docker compose` (v2)
- ✅ **Make**: Para ejecutar comandos del Makefile
- ✅ **Jenkins Plugins**: Plugins preinstalados para CI/CD
  - Git
  - Pipeline (workflow-aggregator)
  - Docker Workflow
  - Blue Ocean
  - Credentials Binding
  - Timestamper

## Construcción de la imagen

La imagen se construye automáticamente cuando ejecutas:

```bash
# Construir y levantar Jenkins
make jenkins-up

# O construir todos los servicios
docker compose build jenkins
```

## Permisos de Docker

La imagen agrega el usuario `jenkins` al grupo `docker` (GID 999) para que pueda ejecutar comandos Docker sin necesidad de permisos de root.

**Nota**: Si tu sistema usa un GID diferente para el grupo docker, debes ajustar el Dockerfile:

```bash
# Ver el GID del grupo docker en tu sistema
getent group docker

# Si es diferente de 999, edita Dockerfile y cambia:
RUN groupadd -g 999 docker || true && \
    usermod -aG docker jenkins

# Por el GID correcto
```

## Volúmenes montados

El servicio de Jenkins en `docker-compose.yml` monta:

1. **`jenkins_home:/var/jenkins_home`**: Datos persistentes de Jenkins
2. **`/var/run/docker.sock:/var/run/docker.sock`**: Socket de Docker del host (DinD pattern)
3. **`./:/workspace`**: Código fuente del proyecto

## Socket de Docker (Docker-in-Docker)

Jenkins no ejecuta un daemon Docker propio. En su lugar, utiliza el socket del Docker del host (`/var/run/docker.sock`). Esto significa que:

- ✅ Los contenedores que Jenkins ejecuta son hermanos (siblings), no hijos
- ✅ Mejor rendimiento que Docker-in-Docker real
- ✅ Menor uso de recursos
- ⚠️ El contenedor Jenkins necesita `privileged: true` en docker-compose.yml

## Solución de problemas

### Error: "permission denied" al ejecutar docker

**Causa**: El GID del grupo docker no coincide

**Solución**:
```bash
# 1. Ver el GID de docker en tu host
getent group docker

# 2. Ajustar el Dockerfile si es necesario
# 3. Reconstruir la imagen
docker compose build jenkins --no-cache
```

### Error: "make: not found"

**Causa**: La imagen no se construyó correctamente

**Solución**:
```bash
# Reconstruir desde cero
docker compose build jenkins --no-cache
docker compose up -d jenkins
```

### Plugins de Jenkins no se instalan

**Causa**: Error durante la construcción o falta de conectividad

**Solución**:
```bash
# Verificar logs durante la construcción
docker compose build jenkins

# Si falla, instalar plugins manualmente desde la UI de Jenkins
# Manage Jenkins → Manage Plugins → Available
```

## Actualización de la imagen

Para actualizar la imagen base de Jenkins:

```bash
# 1. Cambiar la versión en Dockerfile
FROM jenkins/jenkins:2.440.1  # Por ejemplo

# 2. Reconstruir
docker compose build jenkins --no-cache

# 3. Recrear el contenedor
docker compose up -d jenkins
```

## Seguridad

- El usuario jenkins corre con permisos limitados dentro del contenedor
- Solo se usa `root` temporalmente durante la instalación de paquetes
- El acceso al socket de Docker es necesario pero controlado
- Los datos sensibles deben manejarse a través de Jenkins Credentials

## Referencias

- [Jenkins Official Docker Image](https://hub.docker.com/r/jenkins/jenkins)
- [Docker-in-Docker vs Docker-out-of-Docker](https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/)
- [Installing Docker CLI in Jenkins](https://www.jenkins.io/doc/book/installing/docker/)
