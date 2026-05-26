// ── GLOBALS ──
const video      = document.getElementById("video");
const canvas     = document.getElementById("canvas");
const countdownEl= document.getElementById("countdown");
const previewGrid= document.getElementById("previewGrid");
const progressFill=document.getElementById("progressFill");
const captureBtn = document.getElementById("captureBtn");
const generateBtn= document.getElementById("generateBtn");
const resultImg  = document.getElementById("result");
const downloadLink=document.getElementById("downloadLink");
const downloadBtn= document.getElementById("downloadBtn");
const emptyStrip = document.getElementById("emptyStrip");
const cameraNotice=document.getElementById("cameraNotice");

let stream = null;
let photos = [];
let selectedTheme = "white";
let isMirrored = true;
let currentFilter = "f-normal";
let isRunning = false;

// ── TOAST ──
function toast(msg, dur = 2500) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), dur);
}

// ── APP START ──
function startApp() {
    document.getElementById("landingPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    toast("📸 Foto kamu hanya diproses di browser, tidak disimpan di server manapun ✨", 4000);
}

// ── CAMERA ──
async function startCamera() {
    if (stream) return;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user"
            }
        });
        video.srcObject = stream;
        video.style.display = "block";
        cameraNotice.style.display = "none";
        captureBtn.disabled = false;
        applyVideoState();
        toast("Kamera siap! ✨");
    } catch (e) {
        if (e.name === "NotAllowedError") toast("❌ Izin kamera ditolak");
        else if (e.name === "AbortError") toast("❌ Kamera gagal dimulai");
        else toast("❌ Kamera tidak bisa diakses: " + e.message);
    }
}

function stopCamera() {
    if (!stream) return;
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;
    video.style.display = "none";
    cameraNotice.style.display = "flex";
    stream = null;
    captureBtn.disabled = true;
    toast("Kamera dimatikan");
}

function applyVideoState() {
    // Reset classes
    video.className = "";
    // Mirror
    if (!isMirrored) video.classList.add("flip-off");
    // Filter
    if (currentFilter && currentFilter !== "f-normal") video.classList.add(currentFilter);
}

function toggleFlip() {
    isMirrored = !isMirrored;
    applyVideoState();
}

function setFilter(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyVideoState();
}

// ── CAPTURE ──
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function captureToArray() {
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return;

    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;

    ctx.save();
    if (isMirrored) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
    }

    // Apply filter to canvas
    const filterMap = {
        "f-vivid": "saturate(1.6) contrast(1.1)",
        "f-soft":  "brightness(1.05) saturate(0.8) contrast(0.9)",
        "f-mono":  "grayscale(1) contrast(1.05)",
        "f-warm":  "sepia(0.3) saturate(1.2) brightness(1.05)",
        "f-cool":  "hue-rotate(15deg) saturate(0.9) brightness(0.95)",
        "f-normal": "none"
    };
    ctx.filter = filterMap[currentFilter] || "none";
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    photos.push(canvas.toDataURL("image/png"));
}

function updatePreviewGrid() {
    const slots = previewGrid.querySelectorAll(".preview-slot");
    slots.forEach((slot, i) => {
        if (photos[i]) {
            slot.innerHTML = `<img src="${photos[i]}" alt="photo ${i+1}">`;
        } else {
            slot.innerHTML = `<span class="slot-num">${i+1}</span>`;
        }
    });
    progressFill.style.width = (photos.length / 4 * 100) + "%";
}

async function runCountdown(seconds) {
    for (let i = seconds; i > 0; i--) {
        countdownEl.textContent = i;
        await delay(1000);
    }
    countdownEl.textContent = "📸";
    await delay(400);
    countdownEl.textContent = "";
}

async function startPhotobooth() {
    if (!stream) { toast("Nyalakan kamera dulu ya! 📷"); return; }
    if (isRunning) return;

    isRunning = true;
    captureBtn.disabled = true;
    generateBtn.disabled = true;
    photos = [];
    updatePreviewGrid();

    for (let i = 0; i < 4; i++) {
        toast(`📸 Foto ${i + 1} dari 4...`);
        await runCountdown(3);
        captureToArray();
        updatePreviewGrid();
        await delay(600);
    }

    isRunning = false;
    captureBtn.disabled = false;
    generateBtn.disabled = false;
    toast("Yeyy 4 foto udah jadi! Klik Generate 🎞✨", 3000);
}

// ── THEME CONFIGS ──
const themes = {
    white: {
        bg: "#ffffff",
        border: "#f0f0f0",
        headerBg: "#ffffff",
        headerText: "#e75480",
        subText: "#aaaaaa",
        decorColor: "rgba(242,181,197,0.6)",
        motif: "floral"
    },
    pink: {
        bg: "#fce4ec",
        border: "#f48fb1",
        headerBg: "#fce4ec",
        headerText: "#880e4f",
        subText: "#c2185b",
        decorColor: "rgba(136,14,79,0.3)",
        motif: "hearts"
    },
    black: {
        bg: "#111111",
        border: "#333333",
        headerBg: "#111111",
        headerText: "#f8bbd0",
        subText: "#888888",
        decorColor: "rgba(248,187,208,0.4)",
        motif: "stars"
    },
    cream: {
        bg: "#fdf6e3",
        border: "#e6d5b8",
        headerBg: "#fdf6e3",
        headerText: "#8b5e3c",
        subText: "#a07850",
        decorColor: "rgba(139,94,60,0.25)",
        motif: "botanical"
    },
    mint: {
        bg: "#e8f8f5",
        border: "#80cbc4",
        headerBg: "#e8f8f5",
        headerText: "#00695c",
        subText: "#4db6ac",
        decorColor: "rgba(0,105,92,0.2)",
        motif: "dots"
    },
    purple: {
        bg: "#f3e5f5",
        border: "#ce93d8",
        headerBg: "#f3e5f5",
        headerText: "#4a148c",
        subText: "#9c27b0",
        decorColor: "rgba(74,20,140,0.25)",
        motif: "sparkle"
    }
};

// ── DRAW MOTIF / DECORATION ──
function drawMotif(ctx, theme, canvasW, region, color) {
    const cfg = themes[theme];
    ctx.save();
    ctx.fillStyle = color || cfg.decorColor;
    ctx.strokeStyle = color || cfg.decorColor;
    ctx.lineWidth = 1.2;

    const { x, y, w, h } = region;

    if (cfg.motif === "floral") {
        // tiny flower clusters
        const positions = [];
        for (let px = x + 15; px < x + w; px += 28) {
            for (let py = y + 10; py < y + h - 5; py += 22) {
                positions.push([px + (Math.random() * 10 - 5), py + (Math.random() * 6 - 3)]);
            }
        }
        positions.forEach(([fx, fy]) => drawFlower(ctx, fx, fy, 5, color || cfg.decorColor));

    } else if (cfg.motif === "hearts") {
        for (let px = x + 18; px < x + w - 10; px += 30) {
            for (let py = y + 10; py < y + h - 8; py += 24) {
                drawHeart(ctx, px, py, 5, color || cfg.decorColor);
            }
        }

    } else if (cfg.motif === "stars") {
        for (let px = x + 16; px < x + w - 10; px += 28) {
            for (let py = y + 12; py < y + h - 8; py += 22) {
                drawStar(ctx, px, py, 4, color || cfg.decorColor);
            }
        }

    } else if (cfg.motif === "botanical") {
        for (let px = x + 14; px < x + w - 10; px += 32) {
            for (let py = y + 12; py < y + h - 8; py += 24) {
                drawLeaf(ctx, px, py, 7, color || cfg.decorColor);
            }
        }

    } else if (cfg.motif === "dots") {
        for (let px = x + 12; px < x + w - 8; px += 20) {
            for (let py = y + 10; py < y + h - 6; py += 18) {
                ctx.beginPath();
                ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

    } else if (cfg.motif === "sparkle") {
        for (let px = x + 16; px < x + w - 10; px += 26) {
            for (let py = y + 12; py < y + h - 8; py += 22) {
                drawSparkle(ctx, px, py, 5, color || cfg.decorColor);
            }
        }
    }

    ctx.restore();
}

function drawFlower(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * r * 0.7, y + Math.sin(angle) * r * 0.7, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawHeart(ctx, x, y, s, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.4);
    ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.6);
    ctx.bezierCurveTo(x - s, y + s * 1.2, x, y + s * 1.6, x, y + s * 1.6);
    ctx.bezierCurveTo(x, y + s * 1.6, x + s, y + s * 1.2, x + s, y + s * 0.6);
    ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.4);
    ctx.fill();
    ctx.restore();
}

function drawStar(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const outer = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const inner = outer + Math.PI / 5;
        if (i === 0) ctx.moveTo(x + Math.cos(outer) * r, y + Math.sin(outer) * r);
        else ctx.lineTo(x + Math.cos(outer) * r, y + Math.sin(outer) * r);
        ctx.lineTo(x + Math.cos(inner) * r * 0.45, y + Math.sin(inner) * r * 0.45);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawLeaf(ctx, x, y, s, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.bezierCurveTo(x + s, y - s * 0.5, x + s, y + s * 0.5, x, y + s);
    ctx.bezierCurveTo(x - s, y + s * 0.5, x - s, y - s * 0.5, x, y - s);
    ctx.fill();
    ctx.restore();
}

function drawSparkle(ctx, x, y, r, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x - Math.cos(a) * r, y - Math.sin(a) * r);
        ctx.stroke();
    }
    ctx.restore();
}

// ── GENERATE STRIP ──
async function generateStrip() {
    if (photos.length < 4) { toast("Foto belum lengkap! Capture dulu 😏"); return; }

    const cfg = themes[selectedTheme];

    // Load images
    const imgs = [];
    for (let src of photos) {
        const img = new Image();
        img.src = src;
        await new Promise(r => img.onload = r);
        imgs.push(img);
    }

    const iw = imgs[0].width;
    const ih = imgs[0].height;

    // Layout constants
    const sidePad    = 40;
    const topPad     = 80;   // header height
    const gap         = 16;
    const botPad      = 90;  // footer height
    const imgScale    = 0.45; // scale down so strip isn't huge
    const dw = Math.round(iw * imgScale);
    const dh = Math.round(ih * imgScale);

    const cw = dw + sidePad * 2;
    const ch = topPad + (dh + gap) * 4 - gap + botPad;

    canvas.width  = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");

    // ── BACKGROUND ──
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, cw, ch);

    // ── SIDE BORDER STRIPES ──
    const stripeW = sidePad - 4;
    // left stripe
    const leftGrad = ctx.createLinearGradient(0, 0, stripeW, ch);
    leftGrad.addColorStop(0,   cfg.decorColor);
    leftGrad.addColorStop(0.5, cfg.border);
    leftGrad.addColorStop(1,   cfg.decorColor);
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, stripeW, ch);

    // right stripe
    const rightGrad = ctx.createLinearGradient(cw - stripeW, 0, cw, ch);
    rightGrad.addColorStop(0,   cfg.decorColor);
    rightGrad.addColorStop(0.5, cfg.border);
    rightGrad.addColorStop(1,   cfg.decorColor);
    ctx.fillStyle = rightGrad;
    ctx.fillRect(cw - stripeW, 0, stripeW, ch);

    // ── MOTIF ON SIDE STRIPES ──
    drawMotif(ctx, selectedTheme, cfg.decorColor, { x: 0,               y: 0, w: stripeW, h: ch });
    drawMotif(ctx, selectedTheme, cfg.decorColor, { x: cw - stripeW,    y: 0, w: stripeW, h: ch });

    // ── HEADER ──
    ctx.fillStyle = cfg.headerBg;
    ctx.fillRect(stripeW, 0, cw - stripeW * 2, topPad);

    // thin top line
    ctx.fillStyle = cfg.border;
    ctx.fillRect(stripeW, topPad - 2, cw - stripeW * 2, 2);

    // Header text
    ctx.textAlign = "center";

    ctx.fillStyle = cfg.headerText;
    ctx.font = `bold ${Math.round(cw * 0.08)}px 'Dancing Script', Georgia, serif`;
    ctx.fillText("photobooth", cw / 2, topPad * 0.58);

    ctx.fillStyle = cfg.subText;
    ctx.font = `${Math.round(cw * 0.038)}px Arial, sans-serif`;
    ctx.fillText(new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" }), cw / 2, topPad * 0.84);

    // ── PHOTOS ──
    imgs.forEach((img, i) => {
        const px = sidePad;
        const py = topPad + gap / 2 + i * (dh + gap);

        // Subtle shadow
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur  = 10;
        ctx.shadowOffsetY = 3;
        ctx.drawImage(img, px, py, dw, dh);
        ctx.restore();

        // Thin border around each photo
        ctx.strokeStyle = cfg.border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, dw, dh);
    });

    // ── FOOTER ──
    const fy = ch - botPad;
    ctx.fillStyle = cfg.headerBg;
    ctx.fillRect(stripeW, fy, cw - stripeW * 2, botPad);

    // thin top line
    ctx.fillStyle = cfg.border;
    ctx.fillRect(stripeW, fy, cw - stripeW * 2, 2);

    // Footer motif row
    drawMotif(ctx, selectedTheme, cfg.decorColor, { x: stripeW, y: fy + 6, w: cw - stripeW * 2, h: 36 });

    // Footer text
    ctx.fillStyle = cfg.subText;
    ctx.font = `${Math.round(cw * 0.038)}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("✦ made with love ✦", cw / 2, fy + 60);

    // ── OUTPUT ──
    const finalImage = canvas.toDataURL("image/png");
    resultImg.src = finalImage;
    resultImg.style.display = "block";
    emptyStrip.style.display = "none";
    downloadLink.href = finalImage;
    downloadBtn.style.display = "block";

    toast("Strip siap! Download sekarang 🎉", 3000);
}

// ── THEME ──
function setTheme(theme, btn) {
    selectedTheme = theme;
    document.querySelectorAll(".frame-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    toast("Frame " + theme + " dipilih!");
}

// ── RESET ──
function resetPhotobooth() {
    photos = [];
    updatePreviewGrid();

    resultImg.src = "";
    resultImg.style.display = "none";
    emptyStrip.style.display = "block";
    downloadLink.href = "";
    downloadBtn.style.display = "none";
    progressFill.style.width = "0%";

    stopCamera();
    generateBtn.disabled = true;
    toast("Reset! Siap mulai lagi 😊");
        }
