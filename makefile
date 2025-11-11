# Makefile para Point Cloud Prototype
# Comandos de gestión de Docker Compose

.PHONY: help build build-app up up-app up-d start start-d restart stop down down-app clean logs logs-f logs-backend logs-frontend status status-app test lint jenkins shell-backend shell-frontend test-backend test-frontend lint-backend lint-frontend jenkins-up jenkins-rebuild jenkins-stop jenkins-logs jenkins-pass jenkins-shell jenkins-restart jenkins-cli jenkins-build jenkins-status

# Ayuda - muestra todos los comandos disponibles
help:
	@echo "Comandos disponibles para Point Cloud Prototype:"
	@echo ""
	@echo "  build         - Construye las imágenes Docker sin iniciar los servicios"
	@echo "  up            - Inicia los servicios con construcción automática"
	@echo "  up-app        - Inicia solo los servicios de la aplicación (backend y frontend) en segundo plano"
	@echo "  start         - Inicia los servicios (sin reconstruir)"
	@echo "  restart       - Reinicia todos los servicios"
	@echo "  stop          - Detiene los servicios sin eliminarlos"
	@echo "  down          - Detiene y elimina los servicios y redes"
	@echo "  down-app      - Detiene solo backend/frontend (mantiene Jenkins)"
	@echo "  clean         - Elimina servicios, redes, volúmenes e imágenes"
	@echo "  test          - Ejecuta todas las pruebas (backend y frontend)"
	@echo "  test-backend  - Ejecuta solo las pruebas del backend"
	@echo "  test-frontend - Ejecuta solo las pruebas del frontend"
	@echo "  lint          - Ejecuta linting en el código (backend y frontend)"
	@echo "  lint-backend  - Ejecuta linting solo en el backend"
	@echo "  lint-frontend - Ejecuta linting solo en el frontend"
	@echo "  logs          - Muestra los logs de todos los servicios"
	@echo "  logs-f        - Muestra los logs en tiempo real"
	@echo "  logs-backend  - Muestra solo los logs del backend"
	@echo "  logs-frontend - Muestra solo los logs del frontend"
	@echo "  status        - Muestra el estado de los contenedores"
	@echo "  shell-backend - Abre una shell en el contenedor del backend"
	@echo "  shell-frontend- Abre una shell en el contenedor del frontend"
	@echo ""
	@echo "Jenkins:"
	@echo "  jenkins-up      - Inicia solo el servicio de Jenkins (construye si es necesario)"
	@echo "  jenkins-rebuild - Reconstruye la imagen personalizada de Jenkins desde cero"
	@echo "  jenkins-stop    - Detiene el servicio de Jenkins"
	@echo "  jenkins-logs    - Muestra los logs de Jenkins"
	@echo "  jenkins-pass    - Muestra la contraseña inicial de Jenkins"
	@echo "  jenkins-shell   - Abre una shell en el contenedor de Jenkins"
	@echo "  jenkins-setup   - Configura Jenkins automáticamente (CLI, plugins, jobs)"
	@echo "  jenkins-cli     - Descarga el Jenkins CLI jar"
	@echo "  jenkins-create-job - Crea el pipeline job automáticamente"
	@echo "  jenkins-build   - Ejecuta el build del pipeline"
	@echo "  jenkins-status  - Muestra el estado del último build"
	@echo ""

# Construir las imágenes Docker
build:
	@echo "🔨 Construyendo imágenes Docker..."
	docker compose build

# Construir solo las imágenes de la aplicación (backend y frontend)
build-app:
	@echo "🔨 Construyendo imágenes Docker de la aplicación (backend y frontend)..."
	docker compose build backend frontend

# Iniciar servicios con construcción automática
up:
	@echo "🚀 Iniciando servicios con construcción automática..."
	docker compose up --build

# Iniciar solo servicios de la aplicación (backend y frontend)

up-app:
	@echo "🚀 Iniciando servicios de la aplicación (backend y frontend) en segundo plano..."
	docker compose up -d backend frontend


# Iniciar servicios en segundo plano
up-d:
	@echo "🚀 Iniciando servicios en segundo plano..."
	docker compose up --build -d

# Iniciar servicios sin reconstruir
start:
	@echo "▶️ Iniciando servicios..."
	docker compose up

# Iniciar servicios en segundo plano sin reconstruir
start-d:
	@echo "▶️ Iniciando servicios en segundo plano..."
	docker compose up -d

# Reiniciar todos los servicios
restart:
	@echo "🔄 Reiniciando servicios..."
	docker compose restart

# Detener servicios sin eliminarlos
stop:
	@echo "⏹️ Deteniendo servicios..."
	docker compose stop

# Detener y eliminar servicios y redes
down:
	@echo "🛑 Deteniendo y eliminando servicios..."
	docker compose down

# Detener solo servicios de aplicación (backend y frontend), mantener Jenkins
down-app:
	@echo "🛑 Deteniendo servicios de aplicación (manteniendo Jenkins)..."
	docker compose stop backend frontend
	docker compose rm -f backend frontend

# Limpiar completamente (servicios, redes, volúmenes e imágenes)
clean:
	@echo "🧹 Limpiando completamente el entorno..."
	docker compose down --volumes --remove-orphans
	docker system prune -f

# Mostrar logs de todos los servicios
logs:
	@echo "📋 Mostrando logs de todos los servicios..."
	docker compose logs

# Mostrar logs en tiempo real
logs-f:
	@echo "📋 Mostrando logs en tiempo real..."
	docker compose logs -f

# Mostrar logs solo del backend
logs-backend:
	@echo "📋 Mostrando logs del backend..."
	docker compose logs backend

# Mostrar logs solo del frontend
logs-frontend:
	@echo "📋 Mostrando logs del frontend..."
	docker compose logs frontend

# Mostrar estado de los contenedores
status:
	@echo "📊 Estado de los contenedores:"
	docker compose ps

# Abrir shell en el contenedor del backend
shell-backend:
	@echo "🐚 Abriendo shell en el contenedor del backend..."
	docker compose exec backend bash

# Abrir shell en el contenedor del frontend
shell-frontend:
	@echo "🐚 Abriendo shell en el contenedor del frontend..."
	docker compose exec frontend sh

# Ejecutar todas las pruebas
test:
	@echo "🧪 Ejecutando todas las pruebas..."
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

# Ejecutar pruebas del backend
test-backend:
	@echo "🧪 Ejecutando pruebas del backend Django..."
	docker compose exec backend python manage.py test

# Ejecutar pruebas del frontend (placeholder - agregar cuando se implementen)
test-frontend:
	@echo "🧪 Ejecutando pruebas del frontend..."
	@echo "⚠️  Las pruebas del frontend no están implementadas aún"
	@echo "💡 Para agregar pruebas, considera usar Vitest o Jest"

# Ejecutar linting en todo el código
lint:
	@echo "🔍 Ejecutando linting en todo el código..."
	@$(MAKE) lint-backend
	@$(MAKE) lint-frontend

# Ejecutar linting del backend
lint-backend:
	@echo "🔍 Ejecutando linting del backend..."
	@echo "⚠️  Linting del backend no configurado aún"
	@echo "💡 Para agregar linting, considera usar flake8, black o ruff"

# Ejecutar linting del frontend
lint-frontend:
	@echo "🔍 Ejecutando linting del frontend..."
	docker compose exec frontend npm run lint

# ============================================
# Comandos específicos de Jenkins
# ============================================

# Reconstruir imagen personalizada de Jenkins
jenkins-rebuild:
	@echo "🔨 Reconstruyendo imagen personalizada de Jenkins..."
	@echo "Destruir contenedor existente de Jenkins si lo hay..."
	docker compose rm -fs -v jenkins
	docker compose build jenkins --no-cache
	@echo "✅ Imagen de Jenkins reconstruida con Docker CLI y Make"
	@echo "💡 Usa 'make jenkins-up' para reiniciar con la nueva imagen"

# Iniciar solo Jenkins (construye la imagen si no existe)
jenkins-up:
	@echo "🚀 Iniciando servicio de Jenkins..."
	@echo "📦 Construyendo imagen personalizada si es necesario..."
	docker compose up -d --build jenkins
	@echo "⏳ Esperando a que Jenkins esté listo..."
	@sleep 10
	@echo "✅ Jenkins iniciado en http://localhost:8080"
	@echo "💡 Usa 'make jenkins-pass' para obtener la contraseña inicial"

# Detener Jenkins
jenkins-stop:
	@echo "⏹️ Deteniendo servicio de Jenkins..."
	docker compose stop jenkins

# Ver logs de Jenkins
jenkins-logs:
	@echo "📋 Mostrando logs de Jenkins..."
	docker compose logs -f jenkins

# Obtener contraseña inicial de Jenkins
jenkins-pass:
	@echo "🔑 Contraseña inicial de Jenkins:"
	@docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "⚠️ Jenkins no está ejecutándose o ya fue configurado"

# Abrir shell en Jenkins
jenkins-shell:
	@echo "🐚 Abriendo shell en el contenedor de Jenkins..."
	docker compose exec jenkins bash

# Reiniciar Jenkins
jenkins-restart:
	@echo "🔄 Reiniciando Jenkins..."
	docker compose restart jenkins

# Descargar Jenkins CLI
jenkins-cli:
	@echo "📥 Descargando Jenkins CLI..."
	@mkdir -p .jenkins
	@curl -s -o .jenkins/jenkins-cli.jar http://localhost:8080/jnlpJars/jenkins-cli.jar
	@echo "✅ Jenkins CLI descargado en .jenkins/jenkins-cli.jar"

# Ejecutar build del pipeline
jenkins-build:
	@echo "🚀 Ejecutando build del pipeline..."
	@if [ ! -f .jenkins/jenkins-cli.jar ]; then $(MAKE) jenkins-cli; fi
	@java -jar .jenkins/jenkins-cli.jar -s http://localhost:8080/ build point-cloud-prototype -f -v

# Ver estado del último build
jenkins-status:
	@echo "📊 Estado del último build:"
	@if [ ! -f .jenkins/jenkins-cli.jar ]; then $(MAKE) jenkins-cli; fi
	@java -jar .jenkins/jenkins-cli.jar -s http://localhost:8080/ get-job point-cloud-prototype | grep -A 5 "lastBuild" || echo "⚠️ No hay builds disponibles"

# Comando por defecto
.DEFAULT_GOAL := help