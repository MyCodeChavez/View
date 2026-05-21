/* ==========================================
   1. ALIEN AUDIO SYNTHESIZER ENGINE (Web Audio API)
   ========================================== */
let audioCtx = null;
let isMuted = true;

// Initialize Web Audio API
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Play standard beep
function playBeep(freq = 440, duration = 0.1, type = 'sine') {
    if (isMuted) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Volume shaping
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Futuristic Synth Space Sweep (Upwards)
function playSpaceSweep() {
    if (isMuted) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// Downwards space chime
function playSpaceSweep2() {
    if (isMuted) return;
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.7);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.7);
}

// Sound controller click
document.getElementById('audio-toggle').addEventListener('click', function() {
    isMuted = !isMuted;
    const pulse = document.getElementById('audio-status-pulse');
    const text = document.getElementById('audio-text');
    const icon = document.getElementById('audio-toggle').querySelector('i');

    if (isMuted) {
        pulse.className = "w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse";
        text.innerText = "AUDIO: MUTED";
        icon.className = "fa-solid fa-volume-mute ml-2";
    } else {
        initAudio();
        pulse.className = "w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#39ff14]";
        text.innerText = "AUDIO: COGNITIVE";
        icon.className = "fa-solid fa-volume-high ml-2";
        playSpaceSweep();
    }
});


/* ==========================================
   2. THREE.JS COSMIC 3D ARENA & ALIEN SPHERE
   ========================================== */
let scene, camera, renderer, starField, alienCore, outerRings = [];
const canvas = document.getElementById('cosmic-canvas');

function initThreeJS() {
    // Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050d, 0.015);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // STARFIELD (Background Galaxies)
    const starsCount = 1200;
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
        // Spherical distribution of stars
        const radius = 30 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        starsPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
        starsPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starsPositions[i + 2] = radius * Math.cos(phi);

        // Space colors (blue, pink, white)
        const randColor = Math.random();
        if (randColor < 0.4) {
            starsColors[i] = 0.0; starsColors[i + 1] = 0.94; starsColors[i + 2] = 1.0; // Cyan
        } else if (randColor < 0.7) {
            starsColors[i] = 0.74; starsColors[i + 1] = 0.0; starsColors[i + 2] = 1.0; // Purple
        } else {
            starsColors[i] = 1.0; starsColors[i + 1] = 1.0; starsColors[i + 2] = 1.0; // White
        }
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));

    // Small square particle stars
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // MORPHING ALIEN QUANTUM CORE (Wireframe morphing mesh)
    const coreGeometry = new THREE.IcosahedronGeometry(2, 4);
    // Save original positions of vertices to distort them later
    coreGeometry.userData = {
        originalPositions: coreGeometry.attributes.position.clone()
    };

    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });

    alienCore = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(alienCore);

    // Adding neon rings circling the alien entity
    const ringCount = 3;
    for (let r = 0; r < ringCount; r++) {
        const ringGeom = new THREE.TorusGeometry(3 + r * 0.8, 0.03, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: r % 2 === 0 ? 0xbd00ff : 0x00f0ff,
            transparent: true,
            opacity: 0.25,
            wireframe: true
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        
        // Set custom rotation axes
        ringMesh.rotation.x = Math.random() * Math.PI;
        ringMesh.rotation.y = Math.random() * Math.PI;
        
        scene.add(ringMesh);
        outerRings.push(ringMesh);
    }

    // LIGHTING (Just subtle colors in void)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Start animation loop
    animate();
}

// Track mouse/touch momentum to rotate Core
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX - window.innerWidth / 2) * 0.0005;
    targetY = (e.clientY - window.innerHeight / 2) * 0.0005;
    
    // Render space coordinates HUD
    const coordsText = document.getElementById('coords-text');
    if (coordsText) {
        coordsText.innerText = `X: ${e.clientX} // Y: ${e.clientY}`;
    }
});

// Add touch capability for mobile
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        targetX = (e.touches[0].clientX - window.innerWidth / 2) * 0.0008;
        targetY = (e.touches[0].clientY - window.innerHeight / 2) * 0.0008;
        const coordsText = document.getElementById('coords-text');
        if (coordsText) {
            coordsText.innerText = `X: ${Math.round(e.touches[0].clientX)} // Y: ${Math.round(e.touches[0].clientY)}`;
        }
    }
});

// Main Animation Render Loop
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse rotation drift
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    if (alienCore) {
        alienCore.rotation.y = elapsedTime * 0.15 + mouseX * 2;
        alienCore.rotation.x = elapsedTime * 0.1 + mouseY * 2;

        // Deform/Morph Core Vertices (Organic Alien Anomaly feel)
        const posAttr = alienCore.geometry.attributes.position;
        const origPos = alienCore.geometry.userData.originalPositions;
        const tempVec = new THREE.Vector3();

        for (let i = 0; i < posAttr.count; i++) {
            tempVec.fromBufferAttribute(origPos, i);
            
            // Complex sine modulation over three dimensions
            const noise = Math.sin(tempVec.x * 2.5 + elapsedTime * 2.0) * 0.15 +
                          Math.cos(tempVec.y * 2.5 + elapsedTime * 1.5) * 0.15 +
                          Math.sin(tempVec.z * 2.0 + elapsedTime * 2.5) * 0.15;
            
            tempVec.addScaledVector(tempVec.clone().normalize(), noise);
            posAttr.setXYZ(i, tempVec.x, tempVec.y, tempVec.z);
        }
        posAttr.needsUpdate = true;
    }

    // Spin external space starfields slightly
    if (starField) {
        starField.rotation.y = elapsedTime * 0.02;
        starField.rotation.x = mouseY * 0.2;
    }

    // Spin Rings
    outerRings.forEach((ring, idx) => {
        ring.rotation.z += 0.005 * (idx + 1);
        ring.rotation.x += 0.002;
    });

    // Pulse quantum telemetry UI
    const powerRating = Math.round(90 + Math.sin(elapsedTime * 4) * 10);
    const readout = document.getElementById('quantum-energy-readout');
    if (readout) {
        readout.innerText = `NÚCLEO: ${powerRating}% DE ENERGÍA`;
        if (powerRating < 85) {
            readout.className = "font-terminal text-sm text-yellow-400 font-bold";
        } else {
            readout.className = "font-terminal text-sm text-green-400 font-bold";
        }
    }

    renderer.render(scene, camera);
}

// Handle Responsive Canvas Resize
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Start WebGL space backdrop
window.onload = function() {
    initThreeJS();
    generateSpaceTelemetry();
}


/* ==========================================
   3. ALIEN SPORES CURSOR PARTICLES TRAIL
   ========================================== */
const container = document.getElementById('cursor-particle-container');

document.addEventListener('mousemove', (e) => {
    // Random chance to spawn cursor dust to save performance
    if (Math.random() > 0.6) return;
    
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.className = 'space-dust';
    
    // Random variations
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Colors: Cyan or Purple glow
    if (Math.random() > 0.5) {
        particle.style.background = '#bd00ff';
        particle.style.boxShadow = '0 0 8px #bd00ff';
    } else {
        particle.style.background = '#00f0ff';
        particle.style.boxShadow = '0 0 8px #00f0ff';
    }

    // Start position at cursor
    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;
    
    container.appendChild(particle);

    // Animate flying away
    const destinationX = (Math.random() - 0.5) * 60;
    const destinationY = (Math.random() - 0.5) * 60 - 30; // Float upwards slightly

    particle.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${destinationX}px, ${destinationY}px)`, opacity: 0 }
    ], {
        duration: 800 + Math.random() * 400,
        easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
    });

    // Cleanup
    setTimeout(() => {
        particle.remove();
    }, 1000);
});


/* ==========================================
   4. QUANTUM COGNITIVE DECODER (TERMINAL PROCESSOR)
   ========================================== */
const terminalInput = document.getElementById('terminal-input');
const terminalHistory = document.getElementById('terminal-history');
const terminalBody = document.getElementById('terminal-body');
const executeBtn = document.getElementById('terminal-execute-btn');

// Commands definition
const COMMANDS = {
    help: `Comandos decodificados disponibles:
                    - <span class="text-cyan-400 font-bold">about</span> : Revela los datos de composición biológica del creador.
                    - <span class="text-cyan-400 font-bold">skills</span>: Despliega las métricas de potencia técnica del agente.
                    - <span class="text-cyan-400 font-bold">projects</span>: Muestra los portales de anomalías y experimentos.
                    - <span class="text-cyan-400 font-bold">hack</span> : Intenta desencriptar el núcleo secreto alienígena.
                    - <span class="text-cyan-400 font-bold">clear</span> : Purga el buffer de la pantalla de terminal.
                    - <span class="text-cyan-400 font-bold">beacon</span>: Explica cómo emitir una baliza de contacto cósmica.`,
            
    about: `🧬 <span class="text-white font-bold">REVELANDO ARCHIVO: "MYCODECHAVEZ"</span>
                    -----------------------------------------------------------
                    Originario de la nebulosa del desarrollo. Se especializa en 
                    desafiar los límites de la Web con interfaces inmersivas.
                    Capacidades extras: Resistencia a la estática nocturna,
                    consumidor de cafeína estelar y visionario cuántico.`,

    skills: `⚡ <span class="text-cyan-400 font-bold">TELEMETRÍA DE COMPOSICIÓN DE PODER (TECH STACK)</span>
                    -----------------------------------------------------------
                    - JAVASCRIPT / TYPESCRIPT [||||||||||||||||||||] 95%
                    - REACT & NEXT.JS        [||||||||||||||||||  ] 90%
                    - STYLING & ANIMATION    [||||||||||||||||||  ] 92%
                    - BACKEND / DATABASE     [|||||||||||||||||   ] 85%`,

    projects: `🛰️ <span class="text-purple-400 font-bold">ARCHIVOS DE ANOMALÍAS ACTIVAS (PROYECTOS)</span>
                    -----------------------------------------------------------
                    1. <span class="text-white font-bold">Nebula Engine DB</span>: Base de datos multidimensional ultra-rápida.
                    2. <span class="text-white font-bold">Quantum Sentinel AI</span>: Red neuronal de simulación sintética de UI.
                    3. <span class="text-white font-bold">Stellar Horizon 3D</span>: Simulador estelar WebGL de alto octanaje.`,

    hack: `⚠️ <span class="text-red-500 font-bold">ADVERTENCIA: ESCUDOS DEFENSIVOS COGNITIVOS ACTIVADOS!</span>
                    -----------------------------------------------------------
                    [ALERTA] Intentando eludir cortafuegos del núcleo...
                    [ERROR] Acceso denegado. Se requiere llave de cifrado de Sector 7.
                    [MESSG] "Nice try, Earthling!" - Mycodechavez.`,

    beacon: `📡 <span class="text-cyan-400 font-bold">CÓMO EMITIR UNA BALIZA DE TRANSMISIÓN</span>
                    -----------------------------------------------------------
                    Completa el módulo de telemetría de contacto al final de 
                    esta página. La señal se dispersará instantáneamente 
                    hasta el panel holográfico principal del creador.`
};

// Command handler
function executeCommand(commandText) {
    const cleanCmd = commandText.trim().toLowerCase();
    
    if (!terminalHistory || !terminalBody) return;
    
    // Create terminal entry for user input
    const userLine = document.createElement('div');
    userLine.innerHTML = `<span class="text-cyan-400 font-bold">$ alien_guest_></span> ${commandText}`;
    terminalHistory.appendChild(userLine);

    // Synthesize short key chime
    playBeep(480, 0.05, 'triangle');

    setTimeout(() => {
        const responseLine = document.createElement('div');
        responseLine.className = 'mt-1 mb-4 leading-relaxed pl-2 border-l border-green-500/30';
        
        if (cleanCmd === 'clear') {
            terminalHistory.innerHTML = '';
            responseLine.innerHTML = `Buffer purgado con éxito. Escribe 'help' para comandos.`;
            playBeep(220, 0.1);
        } else if (COMMANDS[cleanCmd]) {
            responseLine.innerHTML = COMMANDS[cleanCmd];
            playBeep(350, 0.15);
        } else if (cleanCmd === '') {
            return;
        } else {
            responseLine.innerHTML = `⚠️ <span class="text-red-500">SEÑAL NO RECONOCIDA: "${cleanCmd}"</span>. Intenta con <span class="text-cyan-400 font-bold">'help'</span> para guías de frecuencia.`;
            playBeep(180, 0.2, 'sawtooth');
        }

        terminalHistory.appendChild(responseLine);
        // Scroll to bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }, 100);
}

// Listener for enter key in terminal
if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = terminalInput.value;
            executeCommand(val);
            terminalInput.value = '';
        }
    });
}

if (executeBtn) {
    executeBtn.addEventListener('click', () => {
        if (terminalInput) {
            const val = terminalInput.value;
            executeCommand(val);
            terminalInput.value = '';
        }
    });
}


/* ==========================================
   5. SIMULATED LIVE SPACE TELEMETRY FEED
   ========================================== */
const telemetryFeed = document.getElementById('live-telemetry');
const telemetryLogs = [
    "Handshake completed with Sector 7 Earth receiver.",
    "Warming up dimension core warp coils... Status: 100%",
    "Downloading local JavaScript matrix modules...",
    "Decrypting planetary gravity sensors... Complete.",
    "Alien biosphere structural integrity safe.",
    "Connecting hyper-drive ports to github.com/mycodechavez...",
    "Listening to space void frequencies for signals..."
];

function generateSpaceTelemetry() {
    setInterval(() => {
        if (telemetryFeed) {
            const randomLog = telemetryLogs[Math.floor(Math.random() * telemetryLogs.length)];
            telemetryFeed.innerHTML = `<span class="text-cyan-400">[TELEMETRÍA]</span> ${randomLog}`;
        }
    }, 6000);
}


/* ==========================================
   6. BEACON FORM ACTIONS
   ========================================== */
const beaconForm = document.getElementById('beacon-form');
const alertBox = document.getElementById('beacon-alert');

if (beaconForm) {
    beaconForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formName = document.getElementById('form-name');
        const formEmail = document.getElementById('form-email');
        const formMessage = document.getElementById('form-message');
        
        // Save contact signal telemetry mock
        const contactData = {
            name: formName ? formName.value : '',
            email: formEmail ? formEmail.value : '',
            message: formMessage ? formMessage.value : '',
            timestamp: new Date().toISOString()
        };
        
        // Store message locally to show we intercepted it
        localStorage.setItem('alien_last_signal', JSON.stringify(contactData));
        
        // Trigger sound effects for warp launch
        playSpaceSweep2();
        
        // Show alert box
        if (alertBox) {
            alertBox.classList.remove('hidden');
        }
    });
}

function closeFormAlert() {
    if (alertBox) {
        alertBox.classList.add('hidden');
    }
    if (beaconForm) {
        beaconForm.reset();
    }
}
