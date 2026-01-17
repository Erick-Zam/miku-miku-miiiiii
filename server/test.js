import wwebjs from 'whatsapp-web.js';
const { Client, LocalAuth } = wwebjs;

// TU NÚMERO AQUÍ (Cámbialo si es necesario)
const PHONE_NUMBER = '593995514638';

console.log('--- INICIANDO DIAGNÓSTICO ---');
console.log('Voy a abrir un navegador Chrome en tu pantalla.');
console.log('Por favor, NO toques nada en esa ventana, solo observa.');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "test-session" }), // Usamos una sesión de prueba
    puppeteer: {
        headless: false, // ¡IMPORTANTE! Esto hará que veas el navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    console.log('✅ [PASO 1] Código QR detectado. La página cargó correctamente.');
    console.log('⏳ Esperando 5 segundos para asegurar estabilidad...');

    setTimeout(async () => {
        try {
            console.log(`🔄 [PASO 2] Intentando pedir código para: ${PHONE_NUMBER}`);
            const code = await client.requestPairingCode(PHONE_NUMBER);
            console.log('🎉 [ÉXITO] ¡Código obtenido!');
            console.log(`👉 TU CÓDIGO ES: ${code}`);
            console.log('⚠️ Tienes poco tiempo para ingresarlo en tu celular.');
        } catch (err) {
            console.error('❌ [ERROR] Falló la petición del código:');
            console.error(err);
        }
    }, 5000);
});

client.on('ready', () => {
    console.log('✅ [LISTO] El cliente está listo y conectado.');
});

client.on('authenticated', () => {
    console.log('✅ [AUTENTICADO] Sesión restaurada correctamente.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ [FALLO AUTH] Error de autenticación:', msg);
});

console.log('🚀 Lanzando navegador...');
client.initialize();
