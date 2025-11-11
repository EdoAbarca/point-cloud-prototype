#!/usr/bin/env groovy

/**
 * Jenkinsfile para Point Cloud Prototype
 * 
 * Este archivo define el pipeline de CI/CD para el proyecto de prototipo de nubes de puntos.
 * Utiliza los comandos del Makefile para mantener consistencia entre desarrollo local y CI/CD.
 * 
 * Autor: Eduardo Abarca
 * Fecha: 2025-11-03
 */

pipeline {
    agent any
    
    environment {
        // Variables de entorno para el pipeline
        COMPOSE_PROJECT_NAME = 'point-cloud-prototype'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        
        // Discord Webhook para notificaciones (cargado desde Jenkins credentials)
        DISCORD_WEBHOOK = credentials('DISCORD_WEBHOOK')
    }
    
    options {
        // Mantener solo los últimos 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Timeout para todo el pipeline
        timeout(time: 30, unit: 'MINUTES')
        
        // Deshabilitar checkout automático
        skipDefaultCheckout(false)
        
        // Timestamps se pueden habilitar a nivel de Jenkins en la configuración del job
        // o usando el plugin Timestamper en la configuración global
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Obteniendo código fuente del repositorio...'
                
                // Checkout del código fuente
                checkout scm
                
                // Mostrar información del commit
                script {
                    def gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    def gitBranch = sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                    echo "🔗 Commit: ${gitCommit}"
                    echo "🌿 Branch: ${gitBranch}"
                }
                
                // Verificar que existen los archivos necesarios
                sh '''
                    echo "📁 Verificando estructura del proyecto..."
                    ls -la
                    
                    echo "📋 Verificando Makefile..."
                    test -f makefile || (echo "❌ Makefile no encontrado" && exit 1)
                    
                    echo "🐳 Verificando docker-compose.yml..."
                    test -f docker-compose.yml || (echo "❌ docker-compose.yml no encontrado" && exit 1)
                    
                    echo "✅ Estructura del proyecto verificada"
                '''
            }
        }
        
        stage('Build') {
            steps {
                echo '🔨 Construyendo imágenes Docker...'
                
                // Limpiar contenedores previos si existen
                sh '''
                    echo "🧹 Limpiando contenedores previos..."
                    make down-ci || true
                    docker system prune -f || true
                '''
                
                // Crear archivos .env si no existen (para CI/CD)
                sh '''
                    echo "📝 Creando archivos .env para CI/CD..."
                    
                    # Crear .env del backend si no existe
                    if [ ! -f django-backend/.env ]; then
                        echo "DEBUG=True" > django-backend/.env
                        echo "SECRET_KEY=ci-cd-test-key-not-for-production" >> django-backend/.env
                        echo "ALLOWED_HOSTS=localhost,127.0.0.1" >> django-backend/.env
                        echo "✅ Backend .env creado"
                    fi
                    
                    # Crear .env del frontend si no existe
                    if [ ! -f react-frontend/.env ]; then
                        echo "VITE_API_URL=http://localhost:8000" > react-frontend/.env
                        echo "✅ Frontend .env creado"
                    fi
                '''
                
                // Construir las imágenes usando el Makefile con configuración CI
                sh '''
                    echo "🏗️ Construyendo imágenes en modo CI (sin volume mounts)..."
                    make build-ci
                '''
                
                // Iniciar los servicios después de construir
                sh '''
                    echo "🚀 Iniciando servicios en modo CI..."
                    make up-ci
                '''
                
                // Verificar que las imágenes se crearon y los servicios están corriendo
                sh '''
                    echo "🔍 Verificando imágenes creadas..."
                    docker images | grep point-cloud-prototype
                    
                    echo "📊 Verificando que los servicios iniciaron correctamente..."
                    sleep 10
                    make status-ci
                    
                    echo "📋 Logs iniciales de los servicios..."
                    make logs-ci
                '''
            }
        }
        
        stage('Test') {
            parallel {
                stage('Test Backend') {
                    steps {
                        echo '🧪 Ejecutando pruebas del backend...'
                        
                        script {
                            try {
                                // Los servicios ya están corriendo desde el Build stage
                                sh '''
                                    echo "🔍 Verificando estado de los servicios CI..."
                                    make status-ci
                                '''
                                
                                // Ejecutar pruebas del backend en modo CI
                                sh 'make test-backend-ci'
                                
                            } catch (Exception e) {
                                echo "❌ Error en las pruebas del backend: ${e.getMessage()}"
                                
                                // Mostrar logs para debugging
                                sh 'make logs-ci || true'
                                
                                throw e
                            }
                        }
                    }
                }
                
                stage('Test Frontend') {
                    steps {
                        echo '🧪 Ejecutando pruebas del frontend...'
                        
                        script {
                            try {
                                // Las pruebas del frontend aún no están implementadas
                                // pero mantenemos la estructura para futuras implementaciones
                                sh 'make test-frontend'
                                
                            } catch (Exception e) {
                                echo "⚠️ Pruebas del frontend no implementadas aún"
                                echo "💡 Este es el lugar donde se ejecutarían las pruebas con Vitest/Jest"
                                
                                // No fallar el build por pruebas no implementadas
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Lint') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo '🔍 Ejecutando linting del backend...'
                        
                        script {
                            try {
                                sh 'make lint-backend'
                                
                            } catch (Exception e) {
                                echo "⚠️ Linting del backend no configurado aún"
                                echo "💡 Considera agregar flake8, black o ruff para linting de Python"
                                
                                // No fallar el build por linting no configurado
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                
                stage('Lint Frontend') {
                    steps {
                        echo '🔍 Ejecutando linting del frontend...'
                        
                        script {
                            try {
                                // Ejecutar ESLint en el frontend
                                sh 'make lint-frontend'
                                
                            } catch (Exception e) {
                                echo "❌ Error en el linting del frontend: ${e.getMessage()}"
                                
                                // Mostrar logs del frontend para debugging
                                sh 'make logs-frontend || true'
                                
                                // El linting puede ser más estricto - marcar como unstable pero no fallar
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Integration Test') {
            steps {
                echo '🔗 Ejecutando pruebas de integración...'
                
                script {
                    try {
                        // Verificar que ambos servicios están funcionando
                        // Jenkins está en la misma red Docker, usar nombres de servicio en lugar de localhost
                        sh '''
                            echo "🔍 Verificando que los servicios estén respondiendo..."
                            
                            # Verificar backend (usar nombre de servicio Docker)
                            echo "🔧 Verificando backend en http://backend:8000..."
                            timeout 30 bash -c 'until curl -f http://backend:8000/admin/; do sleep 2; done' || (
                                echo "❌ Backend no responde"
                                make logs-backend-ci
                                exit 1
                            )
                            
                            # Verificar frontend (usar nombre de servicio Docker)
                            echo "⚛️ Verificando frontend en http://frontend:5173..."
                            timeout 30 bash -c 'until curl -f http://frontend:5173/; do sleep 2; done' || (
                                echo "❌ Frontend no responde"
                                make logs-frontend-ci
                                exit 1
                            )
                            
                            echo "✅ Todos los servicios están funcionando correctamente"
                        '''
                        
                    } catch (Exception e) {
                        echo "❌ Error en las pruebas de integración: ${e.getMessage()}"
                        throw e
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                // Solo hacer deploy en la rama principal o en tags
                anyOf {
                    branch 'main'
                    branch 'master'
                    tag pattern: 'v\\d+\\.\\d+\\.\\d+', comparator: 'REGEXP'
                }
            }
            steps {
                echo '🚀 Iniciando proceso de despliegue...'
                
                script {
                    try {
                        // En un entorno real, aquí se haría el deploy a producción
                        // Por ahora, solo simularemos el proceso
                        sh '''
                            echo "🎯 Simulando despliegue a producción..."
                            echo "📦 Servicios listos para producción:"
                            make status
                            
                            echo "💡 En un entorno real, aquí se harían las siguientes acciones:"
                            echo "   - Push de imágenes a registro Docker"
                            echo "   - Deploy a Kubernetes/Docker Swarm"
                            echo "   - Actualización de configuraciones de producción"
                            echo "   - Smoke tests en producción"
                        '''
                        
                    } catch (Exception e) {
                        echo "❌ Error en el despliegue: ${e.getMessage()}"
                        throw e
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Ejecutando limpieza post-build...'
            
            // Limpiar recursos independientemente del resultado
            sh '''
                echo "📋 Mostrando logs finales..."
                make logs-ci || true
                
                echo "📊 Estado final de contenedores..."
                make status-ci || true
                
                echo "🛑 Deteniendo servicios CI (manteniendo Jenkins)..."
                make down-ci || true
                
                echo "🧹 Limpieza de sistema Docker..."
                docker system prune -f || true
            '''
        }
        
        success {
            echo '✅ ¡Pipeline ejecutado exitosamente!'
            
            script {
                def buildDuration = currentBuild.durationString.replace(' and counting', '')
                def gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                
                // Detectar nombre de rama correctamente (Jenkins usa detached HEAD)
                def gitBranch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                if (gitBranch == 'HEAD') {
                    gitBranch = sh(returnStdout: true, script: 'git symbolic-ref --short HEAD || git describe --tags --exact-match || echo "detached"').trim()
                }
                
                // Construir URL del build manualmente si no está disponible
                def buildUrl = env.BUILD_URL ?: "${env.JENKINS_URL}job/${env.JOB_NAME}/${env.BUILD_NUMBER}/"
                
                echo "⏱️ Duración del build: ${buildDuration}"
                echo "🎉 Todas las etapas completadas correctamente"
                
                // Generar timestamp para Discord
                def timestamp = sh(returnStdout: true, script: 'date -u +%Y-%m-%dT%H:%M:%S.000Z').trim()
                
                // Ensure BUILD_URL is properly set
                if (!buildUrl || buildUrl.contains('null')) {
                    buildUrl = "http://localhost:8080/jenkins/job/${env.JOB_NAME}/${env.BUILD_NUMBER}/"
                }
                
                // Enviar notificación de éxito a Discord
                sh """
                    curl -X POST '${DISCORD_WEBHOOK}' \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "embeds": [{
                            "title": "✅ Build Exitoso",
                            "description": "El pipeline se completó correctamente",
                            "color": 3066993,
                            "fields": [
                                {
                                    "name": "Proyecto",
                                    "value": "Point Cloud Prototype",
                                    "inline": true
                                },
                                {
                                    "name": "Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "inline": true
                                },
                                {
                                    "name": "Rama",
                                    "value": "${gitBranch}",
                                    "inline": true
                                },
                                {
                                    "name": "Commit",
                                    "value": "${gitCommit}",
                                    "inline": true
                                },
                                {
                                    "name": "Duración",
                                    "value": "${buildDuration}",
                                    "inline": true
                                },
                                {
                                    "name": "URL",
                                    "value": "[Ver build](${buildUrl})",
                                    "inline": true
                                }
                            ],
                            "timestamp": "${timestamp}"
                        }]
                    }'
                """
            }
        }
        
        failure {
            echo '❌ Pipeline falló'
            
            script {
                def buildNumber = env.BUILD_NUMBER
                def gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                
                // Detectar nombre de rama correctamente (Jenkins usa detached HEAD)
                def gitBranch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                if (gitBranch == 'HEAD') {
                    gitBranch = sh(returnStdout: true, script: 'git symbolic-ref --short HEAD || git describe --tags --exact-match || echo "detached"').trim()
                }
                
                // Construir URL del build manualmente si no está disponible
                def jenkinsUrl = env.JENKINS_URL ?: 'http://localhost:8080/jenkins/'
                def buildUrl = env.BUILD_URL ?: "${jenkinsUrl}job/${env.JOB_NAME}/${env.BUILD_NUMBER}/"
                
                echo "🔍 Build #${buildNumber} falló"
                echo "🔗 URL: ${buildUrl}"
                echo "💡 Revisa los logs anteriores para más detalles"
                
                // Generar timestamp para Discord
                def timestamp = sh(returnStdout: true, script: 'date -u +%Y-%m-%dT%H:%M:%S.000Z').trim()
                
                // Enviar notificación de fallo a Discord
                sh """
                    curl -X POST '${DISCORD_WEBHOOK}' \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "embeds": [{
                            "title": "❌ Build Fallido",
                            "description": "El pipeline falló durante la ejecución",
                            "color": 15158332,
                            "fields": [
                                {
                                    "name": "Proyecto",
                                    "value": "Point Cloud Prototype",
                                    "inline": true
                                },
                                {
                                    "name": "Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "inline": true
                                },
                                {
                                    "name": "Rama",
                                    "value": "${gitBranch}",
                                    "inline": true
                                },
                                {
                                    "name": "Commit",
                                    "value": "${gitCommit}",
                                    "inline": true
                                },
                                {
                                    "name": "URL",
                                    "value": "[Ver logs](${buildUrl}console)",
                                    "inline": false
                                }
                            ],
                            "timestamp": "${timestamp}"
                        }]
                    }'
                """
            }
        }
        
        unstable {
            echo '⚠️ Pipeline completado con advertencias'
            
            script {
                def gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                
                // Detectar nombre de rama correctamente (Jenkins usa detached HEAD)
                def gitBranch = env.GIT_BRANCH ?: env.BRANCH_NAME ?: sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim()
                if (gitBranch == 'HEAD') {
                    gitBranch = sh(returnStdout: true, script: 'git symbolic-ref --short HEAD || git describe --tags --exact-match || echo "detached"').trim()
                }
                
                // Construir URL del build manualmente si no está disponible
                def jenkinsUrl = env.JENKINS_URL ?: 'http://localhost:8080/jenkins/'
                def buildUrl = env.BUILD_URL ?: "${jenkinsUrl}job/${env.JOB_NAME}/${env.BUILD_NUMBER}/"
                
                echo '💡 Revisa las etapas de linting y testing para más detalles'
                
                // Generar timestamp para Discord
                def timestamp = sh(returnStdout: true, script: 'date -u +%Y-%m-%dT%H:%M:%S.000Z').trim()
                
                // Enviar notificación de advertencia a Discord
                sh """
                    curl -X POST '${DISCORD_WEBHOOK}' \
                    -H 'Content-Type: application/json' \
                    -d '{
                        "embeds": [{
                            "title": "⚠️ Build Inestable",
                            "description": "El pipeline se completó con advertencias",
                            "color": 16776960,
                            "fields": [
                                {
                                    "name": "Proyecto",
                                    "value": "Point Cloud Prototype",
                                    "inline": true
                                },
                                {
                                    "name": "Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "inline": true
                                },
                                {
                                    "name": "Rama",
                                    "value": "${gitBranch}",
                                    "inline": true
                                },
                                {
                                    "name": "Commit",
                                    "value": "${gitCommit}",
                                    "inline": true
                                },
                                {
                                    "name": "URL",
                                    "value": "[Ver detalles](${buildUrl})",
                                    "inline": false
                                }
                            ],
                            "timestamp": "${timestamp}"
                        }]
                    }'
                """
            }
        }
    }
}