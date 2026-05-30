# 🔧 PRÓXIMAS VECES QUE QUIERAS USAR LA APP

## Súper fácil:

### Opción 1: Ejecutar ambos servidores juntos (RECOMENDADO)

```bash
cd C:\Users\umana\OneDrive\Documentos\Tarea2.worktrees\agents-mejoras-especificaciones-carros
npm run dev
```

Esto abre:
- Backend: http://localhost:3001
- Frontend: http://localhost:3001

### Opción 2: Ejecutar en dos terminales separadas

**Terminal 1 (Backend):**
```bash
cd C:\Users\umana\OneDrive\Documentos\Tarea2.worktrees\agents-mejoras-especificaciones-carros
npm run server
```

**Terminal 2 (Frontend):**
```bash
cd C:\Users\umana\OneDrive\Documentos\Tarea2.worktrees\agents-mejoras-especificaciones-carros
npm run client
```

### Opción 3: Solo Backend (sin interfaz visual)

```bash
npm start
```

Podrás acceder a:
- API REST: http://localhost:3001/api/state
- WebSocket: ws://localhost:3001

---

## ⏹️ CÓMO DETENER

Presiona **Ctrl+C** en cada terminal:

```
^C
npm notice to exit, press ctrl+c again
```

Presiona Ctrl+C una segunda vez si es necesario.

---

## 🚀 QUICK START SIMPLIFICADO

```bash
# 1. Navega a la carpeta
cd C:\Users\umana\OneDrive\Documentos\Tarea2.worktrees\agents-mejoras-especificaciones-carros

# 2. Instala dependencias (solo la primera vez)
npm install

# 3. Inicia la app
npm run dev

# 4. Abre el navegador
# Ve a http://localhost:3001

# 5. ¡Listo! Disfruta la simulación 🚦
```

---

## 📍 URL DE ACCESO

Siempre la misma en desarrollo:

```
http://localhost:3001
```

---

## 🔄 HOT RELOAD

Si editas archivos en la carpeta `src/`:
- Los cambios se aplican automáticamente ✨
- No necesitas reiniciar nada
- Solo actualiza el navegador (F5)

---

## 💾 GUARDAR CAMBIOS EN GIT

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

---

## 🆘 RESET COMPLETO

Si algo se daña:

```bash
# Limpia todo
rm -r node_modules package-lock.json

# Reinstala
npm install

# Inicia de nuevo
npm run dev
```

---

## 📊 BUILD PARA PRODUCCIÓN

Si quieres generar una versión optimizada:

```bash
npm run build
```

Esto crea una carpeta `build/` lista para deploy.

---

## 🎯 RECORDATORIOS

✅ La app está **totalmente funcional**
✅ Todos los requisitos están cumplidos
✅ El código está **bien comentado**
✅ La documentación es completa

Disfruta tu simulador de cruce de calles! 🚦🚗
