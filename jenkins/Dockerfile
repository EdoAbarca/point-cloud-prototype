FROM jenkins/jenkins:lts

# Cambiar a usuario root para instalar paquetes
USER root

# Instalar Docker CLI, Docker Compose, y Make
RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    make && \
    # Agregar la clave GPG oficial de Docker
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    # Agregar el repositorio de Docker a las fuentes de Apt
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    # Instalar Docker CLI y Docker Compose plugin
    apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin && \
    # Limpiar cache de apt para reducir el tamaño de la imagen
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Agregar usuario jenkins al grupo docker (GID 999 es común en hosts Linux)
# Si tu host usa un GID diferente, ajusta este número
RUN groupadd -g 999 docker || true && \
    usermod -aG docker jenkins

# Volver al usuario jenkins por seguridad
USER jenkins

# Instalar plugins de Jenkins recomendados para CI/CD
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    docker-workflow \
    blueocean \
    credentials-binding \
    timestamper
