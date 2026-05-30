#!/bin/bash

# Script de inicialización del proyecto

# Crear estructura de carpetas
mkdir -p src src/components src/utils
mkdir -p server/lib
mkdir -p public

# Crear archivo .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
*.log
.DS_Store
EOF

echo "✓ Estructura de carpetas creada"
echo "✓ Ejecuta: npm install"
echo "✓ Luego: npm run dev"
