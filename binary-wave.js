/* =========================================
   BINARY WAVE BACKGROUND
   Cursor movement leaves a wake of 0s and 1s
   that sways and fades when the cursor stops.
========================================= */
(() => {
    const canvas = document.getElementById("binary-wave");
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const ctx = canvas.getContext("2d");

    /* Tuning knobs */
    const FONT_SIZE = 14;
    const MAX_PARTICLES = 320;
    const SPAWN_SPACING = 10;   // px of pointer travel per glyph
    const TRAIL_SPEED = 3;      // how far the wake drifts with the cursor
    const MAX_ALPHA = 0.55;

    const particles = [];
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, active: false };
    let rgb = "129, 140, 248";
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = 0;
    let frameId = null;
    let spawnCarry = 0;

    function hexToRgb(hex) {
        const clean = hex.replace("#", "");
        if (clean.length !== 6) return null;
        const n = parseInt(clean, 16);
        return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }

    function readThemeColor() {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue("--primary-color")
            .trim();
        rgb = hexToRgb(value) || rgb;
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Consolas, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    function spawn(x, y, vx, vy) {
        if (particles.length >= MAX_PARTICLES) {
            particles.shift();
        }

        particles.push({
            x,
            y,
            vx: vx + (Math.random() - 0.5) * 40,
            vy: vy + (Math.random() - 0.5) * 40 - 12,
            char: Math.random() < 0.5 ? "0" : "1",
            age: 0,
            life: 1.4 + Math.random() * 1.0,
            phase: Math.random() * Math.PI * 2,
            wobble: 6 + Math.random() * 8
        });
    }

    function frame(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.05) || 0.016;
        lastTime = time;

        ctx.clearRect(0, 0, width, height);

        const damping = Math.pow(0.6, dt);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.age += dt;

            if (p.age >= p.life) {
                particles.splice(i, 1);
                continue;
            }

            const t = p.age / p.life;

            p.vx *= damping;
            p.vy *= damping;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // The sway shrinks over time, so the wave settles as it fades
            const wave = Math.sin(p.age * 7 + p.phase) * p.wobble * (1 - t);
            const alpha = Math.sin(Math.PI * t) * MAX_ALPHA;

            ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
            ctx.fillText(p.char, p.x, p.y + wave);
        }

        if (particles.length > 0) {
            frameId = requestAnimationFrame(frame);
        } else {
            frameId = null;
        }
    }

    function startLoop() {
        if (frameId === null) {
            lastTime = performance.now();
            frameId = requestAnimationFrame(frame);
        }
    }

    function onPointerMove(event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;

        if (!pointer.active) {
            pointer.active = true;
            pointer.lastX = pointer.x;
            pointer.lastY = pointer.y;
            return;
        }

        const dx = pointer.x - pointer.lastX;
        const dy = pointer.y - pointer.lastY;
        const distance = Math.hypot(dx, dy);

        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;

        if (distance === 0) return;

        // Spawn glyphs proportional to how far the cursor moved
        spawnCarry += distance;
        let spawned = 0;
        while (spawnCarry >= SPAWN_SPACING && spawned < 6) {
            spawnCarry -= SPAWN_SPACING;
            spawned++;
            spawn(
                pointer.x + (Math.random() - 0.5) * 12,
                pointer.y + (Math.random() - 0.5) * 12,
                dx * TRAIL_SPEED,
                dy * TRAIL_SPEED
            );
        }

        if (spawned > 0) startLoop();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) pointer.active = false;
    });
    window.addEventListener("resize", resize);

    // Keep the glyph color in sync with the dark/light theme
    new MutationObserver(readThemeColor).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });

    readThemeColor();
    resize();
})();