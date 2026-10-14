document.addEventListener("DOMContentLoaded", () => {

    const dashboardSection = document.getElementById('acceso-dashboard');
    if (dashboardSection) {
        if ('IntersectionObserver' in window) {
            const dashboardObserver = new IntersectionObserver((entries, observer) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    dashboardSection.classList.add('is-visible');
                    observer.disconnect();
                }
            }, { threshold: 0.25 });
            dashboardObserver.observe(dashboardSection);
        } else {
            dashboardSection.classList.add('is-visible');
        }
    }

    const applicationSection = document.getElementById('aplicacion');
    if (applicationSection) {
        if ('IntersectionObserver' in window) {
            const applicationTitleObserver = new IntersectionObserver((entries, observer) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    applicationSection.classList.add('application-title-visible');
                    observer.disconnect();
                }
            }, { threshold: 0.2 });
            applicationTitleObserver.observe(applicationSection);
        } else {
            applicationSection.classList.add('application-title-visible');
        }
    }

    const appGallery = document.querySelector('.app-screen-gallery');
    const appModal = document.getElementById('appScreenModal');
    if (appGallery && appModal) {
        const appCards = Array.from(appGallery.querySelectorAll('.app-screen-card'));
        const appModalDialog = appModal.querySelector('.app-screen-dialog');
        const appModalImage = document.getElementById('appModalImage');
        const appModalCounter = document.getElementById('appModalCounter');
        const appModalTitle = document.getElementById('appModalTitle');
        const appModalDescription = document.getElementById('appModalDescription');
        const appModalClose = appModal.querySelector('[data-app-modal-close]');
        const appModalPrevious = appModal.querySelector('[data-app-modal-previous]');
        const appModalNext = appModal.querySelector('[data-app-modal-next]');
        let activeAppCardIndex = 0;
        let appModalReturnFocus = null;
        let appModalPreviousOverflow = '';
        let appModalCloseTimer;

        const renderAppModalCard = (index) => {
            activeAppCardIndex = (index + appCards.length) % appCards.length;
            const card = appCards[activeAppCardIndex];
            const image = card.querySelector('.app-screenshot-image');
            const screenName = card.querySelector('.app-screen-title')?.textContent.trim() || '';
            const screenNumber = String(activeAppCardIndex + 1).padStart(2, '0');

            appModal.classList.add('is-changing');
            appModalCounter.textContent = `PANTALLA ${screenNumber} / ${String(appCards.length).padStart(2, '0')}`;
            appModalTitle.textContent = card.dataset.appModalTitle;
            appModalDescription.textContent = card.dataset.appModalDescription;
            appModalImage.src = image.getAttribute('src');
            appModalImage.alt = image.alt || `Captura de la pantalla ${screenName}`;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => appModal.classList.remove('is-changing'));
            });
        };

        const openAppModal = (index) => {
            window.clearTimeout(appModalCloseTimer);
            appModalReturnFocus = appCards[index];
            appModalPreviousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            appModal.hidden = false;
            appModal.setAttribute('aria-hidden', 'false');
            renderAppModalCard(index);
            requestAnimationFrame(() => {
                appModal.classList.add('is-open');
                appModalClose.focus();
            });
        };

        const closeAppModal = () => {
            if (appModal.hidden) return;
            appModal.classList.remove('is-open', 'is-changing');
            appModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = appModalPreviousOverflow;
            appModalCloseTimer = window.setTimeout(() => {
                if (!appModal.classList.contains('is-open')) appModal.hidden = true;
            }, 260);
            appModalReturnFocus?.focus();
        };

        appGallery.addEventListener('click', (event) => {
            const card = event.target.closest('.app-screen-card');
            const index = appCards.indexOf(card);
            if (index !== -1) openAppModal(index);
        });

        appGallery.addEventListener('keydown', (event) => {
            const card = event.target.closest('.app-screen-card');
            const index = appCards.indexOf(card);
            if (index === -1 || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            openAppModal(index);
        });

        appModalClose.addEventListener('click', closeAppModal);
        appModalPrevious.addEventListener('click', () => renderAppModalCard(activeAppCardIndex - 1));
        appModalNext.addEventListener('click', () => renderAppModalCard(activeAppCardIndex + 1));
        appModal.addEventListener('click', (event) => {
            if (event.target === appModal) closeAppModal();
        });

        document.addEventListener('keydown', (event) => {
            if (appModal.hidden) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                closeAppModal();
                return;
            }

            if (event.key === 'Tab') {
                const focusableElements = Array.from(appModal.querySelectorAll('button:not([disabled])'));
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
   
    const colors = {
        paleSky: '#C9E0EB',
        dustyDenim: '#A9BED3',
        deepLilac: '#8350C4',
        midnightViolet: '#402B47',
        shadowGrey: '#262423'
    };

    const brandControl = document.getElementById('brandControl');
    const teamToggle = document.getElementById('teamToggle');
    const teamPopover = document.getElementById('teamPopover');
    const teamClose = document.getElementById('teamClose');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const primaryNavigation = document.getElementById('primaryNavigation');
    const closeTeamPopover = () => {
        brandControl?.classList.remove('is-open');
        brandControl?.classList.add('is-dismissed');
        teamToggle?.setAttribute('aria-expanded', 'false');
    };
    const closeMobileMenu = () => {
        document.querySelector('nav')?.classList.remove('mobile-menu-open');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        mobileMenuToggle?.setAttribute('aria-label', 'Abrir menú');
    };

    teamToggle?.addEventListener('click', (event) => {
        event.stopPropagation();
        closeMobileMenu();
        brandControl.classList.remove('is-dismissed');
        const isOpen = brandControl.classList.toggle('is-open');
        teamToggle.setAttribute('aria-expanded', String(isOpen));
    });

    teamClose?.addEventListener('click', closeTeamPopover);
    teamPopover?.addEventListener('click', (event) => {
        if (event.target === teamPopover) closeTeamPopover();
    });

    brandControl?.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'touch') {
            brandControl.classList.remove('is-dismissed');
            teamToggle.setAttribute('aria-expanded', 'true');
        }
    });

    brandControl?.addEventListener('pointerleave', (event) => {
        if (event.pointerType !== 'touch' && !brandControl.classList.contains('is-open')) {
            teamToggle.setAttribute('aria-expanded', 'false');
        }
    });

    mobileMenuToggle?.addEventListener('click', () => {
        const isOpen = document.querySelector('nav').classList.toggle('mobile-menu-open');
        if (isOpen) closeTeamPopover();
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    primaryNavigation?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (event) => {
        if (brandControl && !brandControl.contains(event.target)) closeTeamPopover();
        if (!event.target.closest('nav')) closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeTeamPopover();
            closeMobileMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMobileMenu();
    });

    
    const bitacoraSection = document.getElementById('bitacora-viaje');
    const lightbox = document.querySelector('.lightbox-overlay');
    const lightboxImage = document.getElementById('img-lightbox');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    const closeBitacoraLightbox = () => {
        lightbox?.classList.remove('is-open');
        if (lightbox) lightbox.style.display = 'none';
        lightbox?.setAttribute('aria-hidden', 'true');
        lightboxImage?.removeAttribute('src');
        lightboxImage?.setAttribute('alt', '');
        document.body.classList.remove('bitacora-lightbox-open');
    };

    const openBitacoraLightbox = (image) => {
        if (!lightbox || !lightboxImage) return;
        lightboxImage.setAttribute('src', image.getAttribute('src'));
        lightboxImage.alt = image.alt || `Fotografía de la bitácora ${image.dataset.photoIndex}`;
        lightbox.classList.add('is-open');
        lightbox.style.display = 'flex';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('bitacora-lightbox-open');
        lightboxClose?.focus();
    };

    bitacoraSection?.querySelectorAll('.viewport-doble-cascada img').forEach((image) => {
        image.addEventListener('click', () => openBitacoraLightbox(image));
        image.addEventListener('keydown', (event) => {
            if (image.getAttribute('role') === 'button' && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openBitacoraLightbox(image);
            }
        });
    });

    lightboxClose?.addEventListener('click', closeBitacoraLightbox);
    lightbox?.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeBitacoraLightbox();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && lightbox?.classList.contains('is-open')) {
            closeBitacoraLightbox();
        }
    });

    
    const materialsData = [
        {
            nombre: 'Servomotor MG90S',
            especificaciones: '4.8V-6V, Piñonería metálica, torque ~1.6kg/cm',
            funcion: 'Actuador principal para movimiento mecánico robusto'
        },
        {
            nombre: 'Micro-servo 2g',
            especificaciones: 'Muy ligero, bajo consumo, alta precisión',
            funcion: 'Actuaciones pequeñas, ligeras o de alta sensibilidad'
        },
        {
            nombre: 'Módulo PCA9685',
            especificaciones: 'I2C, 16 canales, resolución 12-bit PWM',
            funcion: 'Permite controlar múltiples servos desde un solo ESP32'
        },
        {
            nombre: 'ESP32 DevKit V1',
            especificaciones: 'Dual-core, Wi-Fi/Bluetooth integrado',
            funcion: '"Cerebro" que procesa lógica y controla todo el sistema'
        },
        {
            nombre: 'Pantalla OLED 0.96"',
            especificaciones: 'Interfaz I2C, resolución 128x64',
            funcion: 'Visualización de datos, estados o mensajes en tiempo real'
        },
        {
            nombre: 'Fuente de Poder 5V 10A',
            especificaciones: '50W, alta capacidad de corriente',
            funcion: 'Suministra energía estable a todos los servos y módulos'
        },
        {
            nombre: 'Condensador 1000uF',
            especificaciones: 'Electrolítico (filtro de ruido)',
            funcion: 'Estabiliza el voltaje y filtra picos de corriente (evita resets)'
        },
        {
            nombre: 'Hilo Dyneema',
            especificaciones: 'Alta resistencia, casi nula elasticidad',
            funcion: 'Transmisión de fuerza mecánica (tendones)'
        },
        {
            nombre: 'Kit de Resortes',
            especificaciones: 'Varios calibres (tensión/compresión)',
            funcion: 'Retorno mecánico de piezas y compensación de carga'
        },
        {
            nombre: 'Tubo de Teflón',
            especificaciones: 'Baja fricción, resistente al calor',
            funcion: 'Guía interna para el deslizamiento del hilo de Dyneema'
        }
    ];

    
    const materialsTableBody = document.getElementById('materialsTableBody');
    if (materialsTableBody) {
        materialsData.forEach((material, idx) => {
            const row = document.createElement('tr');
            row.className = 'material-row';
            row.style.animation = `slideInGlass 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`;
            
            row.innerHTML = `
                <td class="font-space-grotesk font-bold text-paleSky">${material.nombre}</td>
                <td class="text-dustyDenim font-light">${material.especificaciones}</td>
                <td class="text-dustyDenim font-light">${material.funcion}</td>
                <div class="material-tooltip">${material.especificaciones} — ${material.funcion}</div>
            `;
            
            materialsTableBody.appendChild(row);
        });
    }

   
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { 
                labels: { 
                    color: colors.paleSky, 
                    font: { family: "'Space Grotesk', sans-serif", size: 12, weight: 'bold' } 
                } 
            } 
        },
        scales: {
            y: { 
                grid: { color: `rgba(131, 80, 196, 0.1)` }, 
                ticks: { color: colors.dustyDenim, font: { family: "'Space Grotesk', sans-serif", size: 11 } },
                border: { display: false }
            },
            x: { 
                grid: { display: false }, 
                ticks: { color: colors.paleSky, font: { family: "'Space Grotesk', sans-serif", size: 11 } } 
            }
        },
        animation: { duration: 2000, easing: 'easeOutQuart' }
    };

    
    function renderMarketCharts() {
        const chartsTrack = document.getElementById('marketChartsTrack');
        if (!chartsTrack || typeof Chart === 'undefined') return;

        const chartSets = [...chartsTrack.querySelectorAll('.market-carousel-set')];

        const charts = [
            {
                title: 'Muestra de campo: ¿Conoces el Lenguaje de Señas? (N = 24)',
                id: 'survey',
                type: 'bar',
                labels: ['Sí (33.3%)', 'No (25%)', 'Un poco (41.7%)'],
                data: [8, 6, 10],
                colors: [colors.deepLilac, colors.midnightViolet, colors.paleSky],
                borderWidth: 0,
                showLegend: false,
                animationDuration: 2000,
                animationEasing: 'easeOutQuart'
            },
            {
                title: '¿Conoces el lenguaje de señas?',
                id: 'chart1',
                type: 'bar',
                labels: ['Sí (33.3%)', 'No (25%)', 'Un poco (41.7%)'],
                data: [8, 6, 10],
                colors: [colors.deepLilac, colors.paleSky, colors.dustyDenim]
            },
            {
                title: '¿Qué tan importante es la inclusión?',
                id: 'chart2',
                type: 'pie',
                labels: ['Muy importante (100%)', 'Importante (0%)'],
                data: [24, 0],
                colors: [colors.deepLilac, colors.dustyDenim]
            },
            {
                title: '¿Dificultades comunicativas?',
                id: 'chart3',
                type: 'doughnut',
                labels: ['Sí (75%)', 'No (25%)'],
                data: [18, 6],
                colors: [colors.paleSky, colors.deepLilac]
            },
            {
                title: '¿Habías escuchado sobre dispositivos LSC?',
                id: 'chart7',
                type: 'bar',
                labels: ['Sí (25%)', 'No (75%)'],
                data: [6, 18],
                colors: [colors.deepLilac, colors.dustyDenim],
                indexAxis: 'y'
            },
            {
                title: '¿Utilidad de mano biónica?',
                id: 'chart4',
                type: 'bar',
                labels: ['Útil (37.5%)', 'Muy Útil (62.5%)'],
                data: [9, 15],
                colors: [colors.paleSky, colors.deepLilac]
            },
            {
                title: '¿Probabilidad de resolver problemas?',
                id: 'chart8',
                type: 'bar',
                labels: ['Probable (37.5%)', 'Muy Probable (62.5%)'],
                data: [9, 15],
                colors: [colors.deepLilac, colors.paleSky]
            }
        ];

        chartSets.forEach((chartSet, setIndex) => {
            charts.forEach((chartCfg, idx) => {
                const card = document.createElement('article');
                const canvasId = `market-chart-${setIndex}-${chartCfg.id}`;
                card.className = 'market-chart-card';
                card.style.animation = `slideInUp 0.6s ease-out ${idx * 0.1}s both`;
                card.innerHTML = `
                    <h3 class="market-chart-title">${chartCfg.title}</h3>
                    <div class="market-chart-plot">
                        <canvas id="${canvasId}" role="img" aria-label="${chartCfg.title}"></canvas>
                    </div>
                `;
                chartSet.appendChild(card);

                new Chart(card.querySelector('canvas'), {
                    type: chartCfg.type,
                    data: {
                        labels: chartCfg.labels,
                        datasets: [{
                            data: chartCfg.data,
                            backgroundColor: chartCfg.colors,
                            borderWidth: chartCfg.borderWidth ?? 2,
                            borderColor: 'rgba(201, 224, 235, 0.3)',
                            borderRadius: 6,
                            hoverBorderWidth: 3,
                            hoverBorderColor: 'rgba(201, 224, 235, 0.8)'
                        }]
                    },
                    options: {
                        ...chartConfig,
                        indexAxis: chartCfg.indexAxis,
                        plugins: {
                            legend: {
                                display: chartCfg.showLegend ?? chartCfg.type !== 'bar',
                                labels: { color: colors.paleSky, font: { size: 12 } }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(64, 43, 71, 0.95)',
                                borderColor: colors.deepLilac,
                                borderWidth: 1,
                                titleColor: colors.paleSky,
                                bodyColor: colors.paleSky,
                                padding: 12,
                                titleFont: { size: 13, weight: 'bold' },
                                bodyFont: { size: 12 },
                                cornerRadius: 8
                            }
                        },
                        animation: {
                            duration: chartCfg.animationDuration ?? 2500,
                            easing: chartCfg.animationEasing ?? 'easeOutElastic',
                            delay: setIndex * 250 + idx * 200
                        }
                    }
                });
            });
        });
    }

    renderMarketCharts();

    
    window.openTabPanel = function(tab) {
        if (tab === 'aplicacion') {
            document.getElementById('aplicacion')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const panel = document.getElementById('tabPanel');
        panel.classList.remove('hidden');
        switchTab(tab);
    };

    window.closeTabPanel = function() {
        document.getElementById('tabPanel').classList.add('hidden');
    };

    window.switchTab = function(tabName) {
        
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active', 'border-b-2', 'border-deepLilac'));

        
        const tabEl = document.getElementById(`tab-${tabName}`);
        if (tabEl) tabEl.classList.remove('hidden');
        
        
        if (event && event.target) {
            event.target.classList.add('active', 'border-b-2', 'border-deepLilac');
        }
    };

   
    window.addEventListener('scroll', () => {
        const heroText = document.getElementById('hero-text');
        const scrollPosition = window.scrollY;
        if (heroText && scrollPosition <= 700) {
            const calculatedOpacity = Math.max(0, 1 - scrollPosition / 550);
            const calculatedTranslate = scrollPosition * 0.28;
            heroText.style.opacity = calculatedOpacity;
            heroText.style.transform = `translateY(${calculatedTranslate}px)`;
        }

        
        document.querySelectorAll('.glass-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isInView) {
                const distance = Math.min(window.innerHeight - rect.top, rect.bottom);
                const opacity = Math.max(0.3, Math.min(1, distance / window.innerHeight * 1.5));
                
                card.classList.add('scroll-glass', 'active');
                card.style.backdropFilter = `blur(${Math.max(5, 15 * opacity)}px)`;
            }
        });
    }, { passive: true });

   
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('tabPanel').classList.add('hidden');
        }
    });

    
    window.addEventListener('click', (e) => {
        const tabPanel = document.getElementById('tabPanel');
        
        if (e.target === tabPanel) {
            tabPanel.classList.add('hidden');
        }
    });
});


let loginWithEmail = null;
let registerWithEmail = null;
let logout = null;


async function initFirebaseAuth() {
    try {
        const {
            loginWithEmail: login,
            registerWithEmail: register,
            logout: logoutFn,
            onUserStateChanged
        } = await import('./firebase.js');
        window.firebaseLoginWithEmail = login;
        window.firebaseRegisterWithEmail = register;
        window.firebaseLogout = logoutFn;
        onUserStateChanged(user => {
            const welcomeMessage = document.getElementById('welcomeMessage');
            const welcomeName = document.getElementById('welcomeName');
            const logoutButton = document.getElementById('logoutButton');

            if (user) {
                if (welcomeMessage && welcomeName) {
                    welcomeName.textContent = user.displayName || 'usuario';
                    welcomeMessage.classList.remove('hidden');
                }
            } else {
                if (welcomeMessage && welcomeName) {
                    welcomeName.textContent = '';
                    welcomeMessage.classList.add('hidden');
                }
            }

            if (logoutButton) {
                logoutButton.classList.toggle('hidden', !user);
            }
        });
    } catch (error) {
        console.log('Firebase Auth initialized with basic functions');
    }
}


initFirebaseAuth();

window.openLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.closeLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.add('hidden');
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeLoginModal();
    }
});


document.addEventListener('click', (e) => {
    const loginModal = document.getElementById('loginModal');
    if (loginModal && e.target === loginModal) {
        window.closeLoginModal();
    }
});



window.handleLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    
    if (!email || !password) {
        errorDiv.textContent = 'Por favor completa todos los campos';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    
    submitButton.disabled = true;
    submitButton.textContent = 'Ingresando...';
    errorDiv.classList.add('hidden');
    
    try {
       
        if (window.firebaseLoginWithEmail) {
          await window.firebaseLoginWithEmail(email, password);
          setTimeout(() => {
                
                window.closeLoginModal();
                submitButton.textContent = 'Ingresar';
                submitButton.disabled = false;
            }, 500);
        } else {
            throw new Error('Firebase Auth no está disponible');
        }
    } catch (error) {
        
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'El correo no está registrado';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Correo inválido';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Demasiados intentos. Intenta más tarde';
        } else {
            errorMessage = error.message || 'Error desconocido';
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.classList.remove('hidden');
        submitButton.textContent = 'Ingresar';
        submitButton.disabled = false;
    }
};



window.handleRegister = async function(name, email, password, confirmPassword) {
    name = name.trim();

    if (!name) {
        return { success: false, message: 'Por favor escribe tu nombre de usuario' };
    }

    if (password !== confirmPassword) {
        return { success: false, message: 'Las contraseñas no coinciden' };
    }

    if (password.length < 6) {
        return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    try {
        if (window.firebaseRegisterWithEmail) {
            await window.firebaseRegisterWithEmail(email, password, name);
            return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión' };
        }

        throw new Error('Firebase Auth no está disponible');
    } catch (error) {
        let message = 'Error al registrarse';

        if (error.code === 'auth/email-already-in-use') {
            message = 'El correo ya está registrado';
        } else if (error.code === 'auth/weak-password') {
            message = 'La contraseña es muy débil';
        }

        return { success: false, message: message };
    }
};
  window.openRegisterModal = function() {
    document.getElementById('loginModal')?.classList.add('hidden');
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.closeRegisterModal = function() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = '';
    }
};

window.openLoginFromRegister = function() {
    window.closeRegisterModal();
    window.openLoginModal();
};

window.submitRegister = async function(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    const button = event.target.querySelector('button[type="submit"]');

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    button.disabled = true;
    button.textContent = 'Registrando...';

    try {
       const result = await window.handleRegister(name, email, password, confirmPassword);
        if (result?.success) {
            successDiv.textContent = result.message;
            successDiv.classList.remove('hidden');
            document.getElementById('registerForm').reset();

            setTimeout(() => {
                window.closeRegisterModal();
                window.openLoginModal();
            }, 1500);
        } else {
            errorDiv.textContent = result?.message || 'No se pudo completar el registro.';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        errorDiv.textContent = error.message || 'Error al registrarse.';
        errorDiv.classList.remove('hidden');
    } finally {
        button.disabled = false;
        button.textContent = 'Crear cuenta';
    }
};