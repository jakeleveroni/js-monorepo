#!/bin/bash

# Check the operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macOS"
elif [[ "$(uname -s)" == "Linux" ]]; then
  # Further check for Fedora
  if command -v yum &> /dev/null; then
    OS="Fedora"
  else
    echo "Unsupported Linux distribution. This script is designed for macOS and Fedora."
    exit 1
  fi
else
  echo "Unsupported operating system: $OSTYPE"
  exit 1
fi

echo "Detected operating system: $OS"

# Function to install OrbStack
install_orbstack() {
  echo "Installing OrbStack..."
  if [[ "$OS" == "macOS" ]]; then
    brew install --cask orbstack
    if [[ $? -eq 0 ]]; then
      echo "OrbStack installed successfully via Brew."
    else
      echo "Error installing OrbStack via Brew."
    fi
  elif [[ "$OS" == "Fedora" ]]; then
    sudo dnf install -y curl
    curl -fsSL https://get.orbstack.dev | bash
    if [[ $? -eq 0 ]]; then
      echo "OrbStack installed successfully."
    else
      echo "Error installing OrbStack."
    fi
  fi
}

# Function to install Caddy
install_caddy() {
  echo "Installing Caddy..."
  if [[ "$OS" == "macOS" ]]; then
    brew install caddy
    if [[ $? -eq 0 ]]; then
      echo "Caddy installed successfully via Brew."
    else
      echo "Error installing Caddy via Brew."
    fi
  elif [[ "$OS" == "Fedora" ]]; then
    sudo dnf install -y caddy
    if [[ $? -eq 0 ]]; then
      echo "Caddy installed successfully via DNF."
    else
      echo "Error installing Caddy via DNF."
    fi
  fi
}

# Function to install Bun
install_bun() {
  echo "Installing Bun..."
  if [[ "$OS" == "macOS" ]]; then
    brew install bun
    if [[ $? -eq 0 ]]; then
      echo "Bun installed successfully via Brew."
    else
      echo "Error installing Bun via Brew."
    fi
  elif [[ "$OS" == "Fedora" ]]; then
    curl -fsSL https://bun.sh/install | bash
    if [[ $? -eq 0 ]]; then
      echo "Bun installed successfully."
    else
      echo "Error installing Bun."
    fi
    # Add Bun to PATH (may require a new terminal session)
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.zshrc
    echo "Please run 'source ~/.bashrc' or 'source ~/.zshrc' or open a new terminal to add Bun to your PATH."
  fi
}

# Check for prerequisites on macOS
if [[ "$OS" == "macOS" ]]; then
  if ! command -v brew &> /dev/null; then
    echo "Homebrew is not installed. Please install it from https://brew.sh/"
    exit 1
  fi
fi

# Install the requested tools
install_orbstack
install_caddy
install_bun

# build initial reverse proxy container
pushd ./reverse-proxy
sudo docker build
popd

echo "Installation complete."
