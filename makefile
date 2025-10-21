# Makefile para Point Cloud Prototype
# Comandos de gestión de Docker Compose

.PHONY: help build up start restart stop down clean logs status

# Ayuda - muestra todos los comandos disponibles
help:
	@echo "Comandos disponibles para Point Cloud Prototype:"
	@echo ""
	@echo "  build         - Construye las imágenes Docker sin iniciar los servicios"
	@echo "  up            - Inicia los servicios con construcción automática"
	@echo "  start         - Inicia los servicios (sin reconstruir)"
	@echo "  restart       - Reinicia todos los servicios"
	@echo "  stop          - Detiene los servicios sin eliminarlos"
	@echo "  down          - Detiene y elimina los servicios y redes"
	@echo "  clean         - Elimina servicios, redes, volúmenes e imágenes"
	@echo "  logs          - Muestra los logs de todos los servicios"
	@echo "  logs-f        - Muestra los logs en tiempo real"
	@echo "  logs-backend  - Muestra solo los logs del backend"
	@echo "  logs-frontend - Muestra solo los logs del frontend"
	@echo "  status        - Muestra el estado de los contenedores"
	@echo "  shell-backend - Abre una shell en el contenedor del backend"
	@echo "  shell-frontend- Abre una shell en el contenedor del frontend"
	@echo ""

# Construir las imágenes Docker
build:
	@echo "🔨 Construyendo imágenes Docker..."
	docker compose build

# Iniciar servicios con construcción automática
up:
	@echo "🚀 Iniciando servicios con construcción automática..."
	docker compose up --build

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

# Comando por defecto
.DEFAULT_GOAL := help