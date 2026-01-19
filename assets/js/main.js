// ================================
// CONFIGURACIÓN - DATOS DEL NEGOCIO
// ================================
const BUSINESS_CONFIG = {
    whatsappNumber: '524427128200',
    businessName: 'Grúas Alexis',
};

// ================================
// VARIABLES GLOBALES Y ELEMENTOS DOM
// ================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappFloat = document.getElementById('whatsappFloat');
const whatsappModal = document.getElementById('whatsappModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const pwaInstallBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const pwaDismissBtn = document.getElementById('pwaDismissBtn');
const iosInstallGuide = document.getElementById('iosInstallGuide');
const iosInstallBtn = document.getElementById('iosInstallBtn');

// Variables para PWA
let deferredPrompt = null;
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
let isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone === true;

// Variables para ubicación
let userLocation = null;
let userAddress = null;
let userMapsUrl = null;

// ================================
// INICIALIZACIÓN
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Grúas Alexis PWA');
    
    // Año actual en footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Navegación móvil
    initNavigation();
    
    // WhatsApp
    initWhatsApp();
    
    // PWA Installation
    initPWA();
    
    // Verificar si ya está instalada
    if (isStandalone) {
        console.log('📱 App ya está instalada como PWA');
        hideInstallPrompts();
    }
});

// ================================
// FUNCIONES DE NAVEGACIÓN
// ================================
function initNavigation() {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ================================
// FUNCIONES DE WHATSAPP
// ================================
function initWhatsApp() {
    whatsappBtn.addEventListener('click', openWhatsappModal);
    whatsappFloat.addEventListener('click', openWhatsappModal);
    modalClose.addEventListener('click', closeWhatsappModal);
    
    whatsappModal.addEventListener('click', function(e) {
        if (e.target === whatsappModal) {
            closeWhatsappModal();
        }
    });
}

function openWhatsappModal() {
    whatsappModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWhatsappModal() {
    whatsappModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ================================
// FUNCIONES DE INSTALACIÓN PWA
// ================================
function initPWA() {
    console.log('📱 Inicializando sistema PWA');
    
    // Detectar dispositivo
    if (isIOS) {
        setupIOSInstallation();
    } else {
        setupAndroidInstallation();
    }
    
    // Evento cuando se instala la PWA
    window.addEventListener('appinstalled', (evt) => {
        console.log('🎉 PWA instalada exitosamente');
        hideInstallPrompts();
    });
}

function setupIOSInstallation() {
    console.log('🍎 Configurando para iOS');
    
    // Detectar si es Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari && !isStandalone) {
        // Mostrar botón después de 3 segundos
        setTimeout(() => {
            iosInstallGuide.style.display = 'block';
        }, 3000);
        
        // Configurar evento del botón
        iosInstallBtn.addEventListener('click', showIOSInstructions);
    }
}

function setupAndroidInstallation() {
    console.log('🤖 Configurando para Android');
    
    // Capturar el evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        console.log('📲 Evento beforeinstallprompt capturado');
        
        // Mostrar banner después de 3 segundos
        setTimeout(() => {
            if (deferredPrompt && !localStorage.getItem('pwaDismissed')) {
                pwaInstallBanner.style.display = 'block';
                console.log('🟢 Mostrando banner de instalación');
            }
        }, 3000);
    });
    
    // Botón de instalación
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            showManualInstallInstructions();
            return;
        }
        
        console.log('🔄 Iniciando instalación...');
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ Usuario aceptó la instalación');
            pwaInstallBanner.style.display = 'none';
        } else {
            console.log('❌ Usuario rechazó la instalación');
        }
        
        deferredPrompt = null;
    });
    
    // Botón para descartar
    pwaDismissBtn.addEventListener('click', () => {
        pwaInstallBanner.style.display = 'none';
        localStorage.setItem('pwaDismissed', 'true');
        console.log('✋ Usuario descartó el banner');
    });
}

function showIOSInstructions() {
    console.log('📖 Mostrando instrucciones para iOS');
    
    const modalHTML = `
        <div id="iosInstructionsModal" class="ios-instructions-modal">
            <div class="ios-instructions-content">
                <div class="ios-instructions-header">
                    <h3><i class="fas fa-mobile-alt"></i> Instalar en iPhone</h3>
                    <p>Sigue estos pasos para instalar la app</p>
                </div>
                <div class="ios-instructions-body">
                    <div class="ios-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Abrir menú compartir</h4>
                            <p>Toca el botón <i class="fas fa-share-square"></i> "Compartir" en la barra inferior de Safari</p>
                        </div>
                        <div class="ios-step-icon">
                            <i class="fas fa-share-square"></i>
                        </div>
                    </div>
                    <div class="ios-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Desplazar hacia abajo</h4>
                            <p>Desplaza el menú hacia arriba hasta ver más opciones</p>
                        </div>
                        <div class="ios-step-icon">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                    </div>
                    <div class="ios-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Seleccionar opción</h4>
                            <p>Busca y selecciona <strong>"Añadir a pantalla de inicio"</strong></p>
                        </div>
                        <div class="ios-step-icon">
                            <i class="fas fa-plus-square"></i>
                        </div>
                    </div>
                    <div class="ios-step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>Agregar app</h4>
                            <p>Toca "Agregar" en la esquina superior derecha</p>
                        </div>
                        <div class="ios-step-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
                <div class="ios-instructions-footer">
                    <button id="closeIOSInstructions" class="btn btn-primary">
                        <i class="fas fa-check"></i> Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('iosInstructionsModal');
    modal.style.display = 'flex';
    
    document.getElementById('closeIOSInstructions').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}

function showManualInstallInstructions() {
    const isChrome = /Chrome/.test(navigator.userAgent);
    let message = '';
    
    if (isChrome) {
        message = 'Para instalar la app:\n1. Toca el menú (⋮) en la esquina superior derecha\n2. Selecciona "Instalar app"\n3. Confirma la instalación';
    } else {
        message = 'Tu navegador no soporta instalación automática. Busca en el menú de tu navegador la opción "Instalar app" o "Añadir a pantalla de inicio".';
    }
    
    alert(message);
}

function hideInstallPrompts() {
    pwaInstallBanner.style.display = 'none';
    iosInstallGuide.style.display = 'none';
}

// ================================
// FUNCIONES DE UBICACIÓN (para WhatsApp)
// ================================
async function getMexicanAddress(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
        );
        
        if (!response.ok) throw new Error('Error del servidor');
        
        const data = await response.json();
        let address = '';
        
        if (data && data.address) {
            const addr = data.address;
            if (addr.road) address += addr.road;
            if (addr.suburb) address += `, ${addr.suburb}`;
            if (addr.village || addr.town || addr.city) {
                address += `, ${addr.village || addr.town || addr.city}`;
            }
            if (addr.municipality && addr.municipality !== (addr.village || addr.town || addr.city)) {
                address += `, ${addr.municipality}`;
            }
            if (addr.state) address += `, ${addr.state}`;
        }
        
        return {
            text: address || `Cerca de: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            url: `https://www.google.com/maps?q=${lat},${lng}&z=17`,
            coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
    } catch (error) {
        return {
            text: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            url: `https://www.google.com/maps?q=${lat},${lng}&z=17`,
            coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
    }
}

// ================================
// UTILIDADES
// ================================
function formatPhoneForValidation(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
        return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('521')) {
        return cleaned;
    }
    
    return null;
}