# Miku Miku Miiiiii - WhatsApp Bot 🎵

Este proyecto es una aplicación web que permite controlar un cliente de WhatsApp automatizado para enviar mensajes y realizar secuencias de ataque especiales ("Miku Attack").

## 🚀 Funcionalidades

1.  **Autenticación vía QR**: Interfaz visual para escanear el código QR de WhatsApp Web y vincular el dispositivo.
2.  **Envío de Mensajes**: Formulario para enviar mensajes de texto a cualquier número.
3.  **Miku Attack**: Una función especial que envía una secuencia dramática de mensajes seguida de una ráfaga de 100 stickers de Miku.
4.  **Feedback en Tiempo Real**: Indicadores de estado (conectado, enviando, éxito, error) mediante WebSockets.

## 🛠️ Arquitectura y Funcionamiento

El proyecto consta de dos partes principales que se comunican entre sí:

### 1. Backend (Servidor)
*   **Tecnologías**: Node.js, Express, Socket.io, `whatsapp-web.js`.
*   **Funcionamiento**:
    *   Utiliza la librería `whatsapp-web.js` que ejecuta una instancia real de Chrome (vía Puppeteer) en el servidor.
    *   Simula ser un navegador accediendo a WhatsApp Web.
    *   Expone eventos mediante **Socket.io** para comunicarse con el Frontend (ej: enviar el código QR, confirmar conexión, recibir órdenes de envío).
    *   Gestiona la lógica de envío de mensajes y la secuencia "Miku Attack".

### 2. Frontend (Cliente)
*   **Tecnologías**: React, Vite, Socket.io-client.
*   **Funcionamiento**:
    *   Se conecta al servidor mediante WebSockets.
    *   Recibe el código QR y lo muestra al usuario.
    *   Envía los comandos (`send-message`, `miku-attack`) al servidor cuando el usuario interactúa con la interfaz.

## 📦 Instalación y Ejecución Local

Para ejecutar este proyecto en tu máquina local:

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Iniciar el Backend** (en una terminal):
    ```bash
    node server/index.js
    ```
    *El servidor iniciará en el puerto 3000.*

3.  **Iniciar el Frontend** (en otra terminal):
    ```bash
    npm run dev
    ```
    *La aplicación web estará disponible generalmente en `http://localhost:5173`.*

## 🌍 Guía de Publicación (Deployment)

Debido a la naturaleza de este proyecto, **NO se puede desplegar en servicios de hosting estático o serverless tradicionales** (como Vercel, Netlify o AWS Lambda estándar) de forma directa.

### ¿Por qué?
Este proyecto utiliza `puppeteer`, que requiere ejecutar un navegador Chrome completo en el servidor. Esto consume más memoria y requiere un entorno de sistema operativo persistente que la mayoría de los planes gratuitos o serverless no ofrecen.

### Requisitos del Servidor
*   **Node.js** instalado.
*   **Librerías del sistema** para ejecutar Chrome (dependencias de Puppeteer).
*   **Memoria RAM**: Al menos 1GB (recomendado 2GB+) para mantener el navegador abierto.

### Opciones Recomendadas

1.  **VPS (Servidor Privado Virtual)**
    *   Proveedores: DigitalOcean, AWS EC2, Google Compute Engine, Linode.
    *   **Cómo**: Alquilas un servidor Linux (Ubuntu), clonas el repo, instalas Node.js y ejecutas los comandos de inicio (usando `pm2` para mantenerlos activos).

2.  **Railway / Render (Con Docker)**
    *   Estos servicios permiten desplegar aplicaciones Node.js persistentes.
    *   Es posible que necesites configurar un `Dockerfile` que instale las dependencias de Chrome.

### Pasos Generales para VPS (Ubuntu)

1.  Actualizar el servidor: `sudo apt update && sudo apt upgrade`
2.  Instalar dependencias de Chrome (necesario para Puppeteer):
    ```bash
    sudo apt install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
    ```
3.  Instalar Node.js.
4.  Clonar este repositorio.
5.  Instalar dependencias: `npm install`.
6.  Construir el frontend: `npm run build`.
7.  Servir el frontend desde el backend (requiere pequeña configuración extra en Express) o usar Nginx para servir los archivos estáticos y hacer proxy al backend.
8.  Usar **PM2** para mantener el proceso corriendo:
    ```bash
    npm install -g pm2
    pm2 start server/index.js --name "whatsapp-bot"
    ```

## ⚠️ Notas de Seguridad

*   **Sesiones**: El archivo `.gitignore` está configurado para ignorar las carpetas `.wwebjs_auth` y `.wwebjs_cache`. **NUNCA** subas estas carpetas al repositorio, ya que contienen tus credenciales de sesión de WhatsApp.
*   **Uso**: WhatsApp puede detectar y banear números que envían spam masivo. Usa la función "Miku Attack" con precaución y bajo tu propio riesgo.
