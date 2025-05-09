FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html

EXPOSE 80

FROM node:22 AS builder

# Install common development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    zip \
    unzip \
    vim \
    jq \
    openssh-client \
    ca-certificates \
    bash

# Download the Bun installation script
RUN curl -fsSL https://bun.sh/install -o /tmp/bun-install.sh

# Execute the script using bash
RUN bash /tmp/bun-install.sh

# Set up environment variables for Bun in PATH
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH:/kaniko"
WORKDIR /root/builder

# Keep the container running
CMD ["sleep", "infinity"]
buildctl build --frontend dockerfile.v0 --local context=. --local dockerfile=. -o type=image,name=registry.ldlabs.diy/ldlabs/threedee:latest,push=true \
  --registry-auth "$(echo -n '{"username":"your_registry_username","password":"your_registry_password_or_token"}' | base64)"