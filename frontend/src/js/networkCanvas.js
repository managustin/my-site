// networkCanvas.js modificado - Versión "Constelación Magnética Sutil"

export function initCanvas() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Estilos del canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.transition = 'opacity 0.8s ease-in-out'; // Transición más lenta y suave

    let dots = [];
    // Reduje un poco la cantidad para que sea más limpio
    const dotCount = 70; 
    // El radio de acción del mouse
    const connectionRadius = 120; 

    let mouse = {
        x: null,
        y: null
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Event listener para rastrear el mouse
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    // Si el mouse sale de la ventana, limpiamos la posición para que no queden líneas pegadas
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });


    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            // VELOCIDAD REDUCIDA DRASTICAMENTE: Ahora es 0.3 en vez de 1.5
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            // Hacemos que el tamaño de los puntos varíe levemente para más naturalidad
            radius: Math.random() * 1.5 + 1 
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        dots.forEach((dot) => {
            // Mover puntos lentamente
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Rebote suave en los bordes
            if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
            if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

            // Dibujar el punto: Color claro (#E4FDE1) pero MUY transparente (0.2)
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(228, 253, 225, 0.2)`; 
            ctx.fill();

            // --- LÓGICA DE INTERACCIÓN CON EL MOUSE ---
            // Solo si el mouse está dentro de la pantalla
            if (mouse.x != null) {
                 // Calculamos distancia entre el punto y el mouse
                const dist = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
                
                // Si está dentro del radio de conexión, dibujamos línea
                if (dist < connectionRadius) {
                    // La opacidad depende de qué tan cerca esté del centro del mouse
                    const opacity = 1 - (dist / connectionRadius);
                    
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    // Línea muy fina y sutil
                    ctx.strokeStyle = `rgba(228, 253, 225, ${opacity * 0.4})`;
                    ctx.lineWidth = 0.5; 
                    ctx.stroke();
                    
                    // OPCIONAL: Efecto sutil de atracción magnética.
                    // Si descomentás estas 2 líneas, los puntos se acercarán un poquito al mouse.
                    // dot.x += (mouse.x - dot.x) * 0.02;
                    // dot.y += (mouse.y - dot.y) * 0.02;
                }
            }
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}