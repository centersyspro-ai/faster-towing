// ================================
// CONFIGURATION - BUSINESS DATA
// ================================
const BUSINESS_CONFIG = {
    // Main WhatsApp number (international format: 52 + 10 digits)
    whatsappNumber: '524427128200', // Actual number: 52 442 712 8200
    
    // Business name
    businessName: 'Grúas Alexis',
};

// DOM Elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappFloat = document.getElementById('whatsappFloat');
const whatsappModal = document.getElementById('whatsappModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const whatsappForm = document.getElementById('whatsappForm');
const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
const getLocationBtn = document.getElementById('getLocationBtn');
const locationText = document.getElementById('locationText');
const customLocationInput = document.getElementById('customLocationInput');
const sendLocationRadio = document.getElementById('sendLocation');
const customLocationRadio = document.getElementById('customLocation');
const noLocationRadio = document.getElementById('noLocation');
const manualLocation = document.getElementById('manualLocation');

// Global variables for location
let userLocation = null;
let userAddress = null;
let userMapsUrl = null;
let userCoordinates = null;

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Update current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Toggle mobile navigation menu
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Open WhatsApp modal from main button
    whatsappBtn.addEventListener('click', openWhatsappModal);
    
    // Open WhatsApp modal from floating button
    whatsappFloat.addEventListener('click', openWhatsappModal);
    
    // Close WhatsApp modal
    modalClose.addEventListener('click', closeWhatsappModal);
    modalCancel.addEventListener('click', closeWhatsappModal);
    
    // Close modal when clicking outside content
    whatsappModal.addEventListener('click', function(e) {
        if (e.target === whatsappModal) {
            closeWhatsappModal();
        }
    });
    
    // Handle location options
    sendLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'none';
    });
    
    customLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'block';
    });
    
    noLocationRadio.addEventListener('change', function() {
        customLocationInput.style.display = 'none';
    });
    
    // Get user location
    getLocationBtn.addEventListener('click', getUserLocation);
    
    // Send WhatsApp message
    sendWhatsappBtn.addEventListener('click', sendWhatsappMessage);
    
    // Handle form submission with Enter
    whatsappForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendWhatsappMessage();
    });
    
    // Check if FontAwesome is loaded, if not, show SVG
    setTimeout(function() {
        const whatsappIcon = document.querySelector('.whatsapp-font');
        if (!whatsappIcon || getComputedStyle(whatsappIcon).display === 'none') {
            // FontAwesome not loaded, make sure SVG is visible
            const whatsappSvg = document.querySelector('.whatsapp-svg');
            if (whatsappSvg) {
                whatsappSvg.style.display = 'block';
            }
        }
    }, 2000);
});

// Functions
function openWhatsappModal() {
    whatsappModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWhatsappModal() {
    whatsappModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetForm();
}

function resetForm() {
    whatsappForm.reset();
    userLocation = null;
    userAddress = null;
    userMapsUrl = null;
    userCoordinates = null;
    locationText.textContent = 'Location not included';
    customLocationInput.style.display = 'none';
}

// Function to validate and format phone number
function formatPhoneForValidation(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    // For Mexican numbers:
    if (cleaned.length === 10) {
        // Local 10-digit number: 4427128200
        return cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
        // Number with country code: 524427128200
        return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('521')) {
        // Number with country code and mobile prefix: 5214427128200
        return cleaned;
    }
    
    return null;
}

function getUserLocation() {
    if (!navigator.geolocation) {
        locationText.textContent = 'Geolocation not supported by your browser';
        return;
    }
    
    locationText.innerHTML = '<span class="loading-location">Getting location...</span>';
    
    navigator.geolocation.getCurrentPosition(
        // Success
        async function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocation = { lat, lng };
            
            try {
                // Get address in Mexican colloquial format with link to Maps
                const locationData = await getMexicanAddress(lat, lng);
                userAddress = locationData.text;
                userMapsUrl = locationData.url;
                userCoordinates = locationData.coordinates;
                
                // Display information with link to Google Maps
                locationText.innerHTML = `
                    <div class="location-info">
                        <div class="location-text">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Location obtained:</strong> ${userAddress}</span>
                        </div>
                        <div class="location-link">
                            <a href="${userMapsUrl}" target="_blank" class="maps-link">
                                <i class="fas fa-external-link-alt"></i> View on Google Maps
                            </a>
                            <small>Coordinates: ${userCoordinates}</small>
                        </div>
                    </div>
                `;
                sendLocationRadio.checked = true;
            } catch (error) {
                console.error('Error getting address:', error);
                // Create Google Maps link with coordinates
                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
                userMapsUrl = googleMapsUrl;
                userCoordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                
                locationText.innerHTML = `
                    <div class="location-info">
                        <div class="location-text">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Location:</strong> Coordinates obtained</span>
                        </div>
                        <div class="location-link">
                            <a href="${googleMapsUrl}" target="_blank" class="maps-link">
                                <i class="fas fa-external-link-alt"></i> View on Google Maps
                            </a>
                            <small>Coordinates: ${userCoordinates}</small>
                        </div>
                    </div>
                `;
                sendLocationRadio.checked = true;
            }
        },
        // Error
        function(error) {
            console.error('Error getting location:', error);
            let errorMessage = "Error getting location.";
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location permission denied. You can write your location manually.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Timeout getting location.";
                    break;
                default:
                    errorMessage = "Unknown error getting location.";
            }
            
            locationText.innerHTML = `
                <div class="location-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${errorMessage}</span>
                </div>
            `;
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

async function getMexicanAddress(lat, lng) {
    try {
        // Use Nominatim API (OpenStreetMap) which is free and doesn't require a key
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
        );
        
        if (!response.ok) {
            throw new Error('Server response error');
        }
        
        const data = await response.json();
        
        let mexicanAddress = '';
        let googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
        
        if (data && data.address) {
            const address = data.address;
            // Mexican colloquial format: street, neighborhood, municipality, state
            
            if (address.road) mexicanAddress += address.road;
            if (address.suburb) mexicanAddress += `, ${address.suburb}`;
            if (address.village || address.town || address.city) {
                mexicanAddress += `, ${address.village || address.town || address.city}`;
            }
            if (address.municipality && address.municipality !== (address.village || address.town || address.city)) {
                mexicanAddress += `, ${address.municipality}`;
            }
            if (address.state) mexicanAddress += `, ${address.state}`;
            
            return {
                text: mexicanAddress || `Near coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                url: googleMapsUrl,
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                rawAddress: address
            };
        } else {
            return {
                text: `Near coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                url: googleMapsUrl,
                coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                rawAddress: null
            };
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to simple coordinates
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
        return {
            text: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            url: googleMapsUrl,
            coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            rawAddress: null
        };
    }
}

function sendWhatsappMessage() {
    // Validate form
    const userName = document.getElementById('userName').value.trim();
    const userPhone = document.getElementById('userPhone').value.trim();
    const userMessage = document.getElementById('userMessage').value.trim();
    
    if (!userName || !userPhone || !userMessage) {
        alert('Please complete all required fields (*)');
        return;
    }
    
    // Validate and format user phone number
    const formattedUserPhone = formatPhoneForValidation(userPhone);
    if (!formattedUserPhone) {
        alert('Please enter a valid phone number (10 digits). Example: 4427128200');
        return;
    }
    
    // Business phone number
    const businessPhone = BUSINESS_CONFIG.whatsappNumber;
    
    // Determine location text based on selected option
    let locationContent = '';
    
    if (sendLocationRadio.checked && userAddress && userMapsUrl) {
        // Include address in text and link to Google Maps
        locationContent = `\n📍 *My location:* ${userAddress}\n🗺️ *View on Google Maps:* ${userMapsUrl}`;
        if (userCoordinates) {
            locationContent += `\n📌 *Coordinates:* ${userCoordinates}`;
        }
    } else if (customLocationRadio.checked && manualLocation.value.trim()) {
        // For manual location, we can also create a Google Maps search link
        const manualLocationText = manualLocation.value.trim();
        const encodedLocation = encodeURIComponent(manualLocationText + ', San Diego de la Unión, Guanajuato');
        const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        
        locationContent = `\n📍 *My location:* ${manualLocationText}\n🗺️ *Search on Google Maps:* ${mapsSearchUrl}`;
    } else {
        locationContent = '\n📍 *Location:* No specific location provided.';
    }
    
    // Create WhatsApp message
    const whatsappMessage = `Hello, I am *${userName}*. I need towing service.\n\n*Service details:* ${userMessage}\n\n*Contact phone:* ${formattedUserPhone}${locationContent}\n\nThis message was sent from the ${BUSINESS_CONFIG.businessName} website.`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Determine if Android or web browser
    const isAndroid = /Android/i.test(navigator.userAgent);
    let whatsappUrl;
    
    if (isAndroid) {
        // For Android: use WhatsApp intent scheme
        whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;
    } else {
        // For web browsers: use WhatsApp web version
        whatsappUrl = `https://web.whatsapp.com/send?phone=${businessPhone}&text=${encodedMessage}`;
    }
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Close modal after a brief delay
    setTimeout(() => {
        closeWhatsappModal();
    }, 500);
}

// ================================
// PWA INSTALLATION FUNCTIONALITY
// ================================

// Variables para instalación PWA
let deferredPrompt;
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
let isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone === true;

// DOM Elements for PWA
const pwaInstallBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const pwaDismissBtn = document.getElementById('pwaDismissBtn');
const iosInstallGuide = document.getElementById('iosInstallGuide');
const iosInstallBtn = document.getElementById('iosInstallBtn');

// Inicialización PWA
function initPWA() {
    // Ocultar banners si ya está instalada
    if (isStandalone) {
        console.log('App ya está instalada como PWA');
        pwaInstallBanner.style.display = 'none';
        iosInstallGuide.style.display = 'none';
        return;
    }
    
    // Detectar dispositivo
    if (isIOS) {
        // Mostrar guía para iOS
        showIOSInstallGuide();
    } else {
        // Configurar instalación para Android/Chrome
        setupAndroidInstall();
    }
}

// Mostrar guía de instalación para iOS
function showIOSInstallGuide() {
    // Verificar si es Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
        // Mostrar después de 5 segundos
        setTimeout(() => {
            iosInstallGuide.style.display = 'block';
        }, 5000);
    }
}

// Configurar instalación para Android
function setupAndroidInstall() {
    // Evento para capturar el prompt de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar banner después de 5 segundos
        setTimeout(() => {
            if (deferredPrompt && !localStorage.getItem('pwaDismissed')) {
                pwaInstallBanner.style.display = 'block';
            }
        }, 5000);
    });
    
    // Intentar instalar
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            alert('Tu navegador no soporta instalación directa. Usa el menú de Chrome (⋮) → "Instalar app"');
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Usuario instaló la PWA');
            pwaInstallBanner.style.display = 'none';
        } else {
            console.log('Usuario rechazó la instalación');
        }
        
        deferredPrompt = null;
    });
    
    // Ocultar banner
    pwaDismissBtn.addEventListener('click', () => {
        pwaInstallBanner.style.display = 'none';
        localStorage.setItem('pwaDismissed', 'true');
    });
}

// Mostrar instrucciones para iOS
function showIOSInstructions() {
    // Crear modal con instrucciones
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
    
    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Mostrar modal
    const modal = document.getElementById('iosInstructionsModal');
    modal.style.display = 'flex';
    
    // Cerrar modal
    document.getElementById('closeIOSInstructions').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    });
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Tu código actual...
    
    // Agregar inicialización PWA
    initPWA();
    
    // Evento para botón iOS
    if (iosInstallBtn) {
        iosInstallBtn.addEventListener('click', showIOSInstructions);
    }
});

// Detectar cuando la app se instala
window.addEventListener('appinstalled', () => {
    console.log('PWA instalada exitosamente');
    pwaInstallBanner.style.display = 'none';
    iosInstallGuide.style.display = 'none';
});

