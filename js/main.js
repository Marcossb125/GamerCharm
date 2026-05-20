/* ═══════════════════════════════════════════════
   GAMERCHARM – Lógica interactiva de comercio electrónico
   ═══════════════════════════════════════════════ */

// Detect directory nesting for asset path correction
const isSubfolder = window.location.pathname.includes('/productos/');
const basePath = isSubfolder ? '../' : '';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroParticles();
  initIntersectionObserver();
  initShoppingCart();
  initFinancialDashboard();
  initFAQs();
});

/* ── Navbar scrolled style & active link ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      navToggle.classList.toggle('open');
    });
    // Close on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  // Highlight active link
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      // Normalize href for comparison
      const cleanHref = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
      if (currentPath.endsWith(cleanHref)) {
        link.classList.add('active');
      }
    }
  });
}

/* ── Hero floating particles ── */
function initHeroParticles() {
  const canvas = document.getElementById('particles');
  if (canvas) {
    const count = 35;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1.5}px;
        height: ${Math.random() * 3 + 1.5}px;
        background: ${Math.random() > 0.5 ? 'var(--accent-purple)' : 'var(--accent-cyan)'};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        bottom: -20px;
        opacity: 0;
        box-shadow: ${Math.random() > 0.5 ? 'var(--purple-glow)' : 'var(--cyan-glow)'};
        animation: particle ${Math.random() * 10 + 7}s linear ${Math.random() * 4}s infinite;
      `;
      canvas.appendChild(p);
    }
  }
}

/* ── Scroll fade-in observer ── */
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        
        // If it's a player card, trigger stat bars animation
        if (e.target.classList.contains('player-card')) {
          animatePlayerStats(e.target);
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .universe-card, .product-card, .content-block, .player-card, .formulario-equipo, .contact-item, .financial-dashboard').forEach(el => {
    el.style.cssText += 'opacity: 0; transform: translateY(30px); transition: opacity 0.65s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.65s cubic-bezier(0.25, 0.8, 0.25, 1);';
    observer.observe(el);
  });
}

function animatePlayerStats(card) {
  card.querySelectorAll('.stat-bar-inner').forEach(bar => {
    const val = bar.getAttribute('data-value');
    if (val) {
      setTimeout(() => {
        bar.style.width = val + '%';
      }, 150);
    }
  });
}

/* ════════════════════════════════
   SHOPPING CART SYSTEM
   ════════════════════════════════ */
let cart = [];

function initShoppingCart() {
  // Load existing cart from localStorage
  const savedCart = localStorage.getItem('gamercharm_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  // Inject Shopping Cart Drawer & Overlay HTML dynamically to avoid repeating code on every page
  injectCartHTML();

  // Bind navbar cart button click
  const navCartBtn = document.getElementById('navCartBtn');
  if (navCartBtn) {
    navCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCart(true);
    });
  }

  // Bind floating cart button click
  const floatingCart = document.getElementById('floatingCart');
  if (floatingCart) {
    floatingCart.addEventListener('click', () => {
      toggleCart(true);
    });
  }

  // Bind close buttons
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));
  if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

  // Bind Drag & Drop STL Upload Zone listeners
  initSTLUpload();

  // Initial draw
  updateCartUI();
}

function injectCartHTML() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  document.body.appendChild(overlay);

  // Create drawer
  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.id = 'cartDrawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h2>🛒 Tu Inventario <span style="font-size:0.75rem; color:var(--accent-cyan); font-weight:normal; font-family:'Inter'">[Comercio electrónico activo]</span></h2>
      <button class="cart-close-btn" id="cartClose">×</button>
    </div>
    
    <div class="cart-items-list" id="cartItemsList">
      <!-- Items populated by JS -->
    </div>
    
    <div class="cart-custom-prompt">
      <h4>🎨 ¿Botín personalizado?</h4>
      <p>Sube tu modelo 3D (.STL) para imprimir tu llavero a medida.</p>
      <div class="stl-upload-zone" id="cartStlZone">
        <span class="scan-line"></span>
        <span class="stl-upload-icon">💿</span>
        <span class="stl-upload-text" id="cartStlText">Arrastra tu archivo <strong>.STL</strong> aquí</span>
        <input type="file" id="cartStlInput" accept=".stl" style="display: none;" />
      </div>
    </div>
    
    <div class="cart-footer">
      <div class="cart-summary-line">
        <span>Artículos:</span>
        <span id="cartCountLabel">0</span>
      </div>
      <div class="cart-summary-line">
        <span>Envío (España exprés):</span>
        <span style="color:#10b981; font-weight:600;">GRATIS</span>
      </div>
      <div class="cart-summary-line total">
        <span>TOTAL:</span>
        <span id="cartTotalLabel">0.00 €</span>
      </div>
      <button class="btn btn-primary" style="width: 100%; border-radius: 8px; margin-top: 0.5rem;" onclick="checkoutMock()">
        Proceder al Pago 💳
      </button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Inject Floating Cart Button if not already in document
  if (!document.getElementById('floatingCart')) {
    const floatBtn = document.createElement('button');
    floatBtn.className = 'floating-cart';
    floatBtn.id = 'floatingCart';
    floatBtn.style.display = 'none'; // Shown when items exist
    floatBtn.innerHTML = `
      🛒
      <span class="floating-cart-badge" id="floatingCartBadge">0</span>
    `;
    document.body.appendChild(floatBtn);
  }
}

// Global functions for cart interaction
window.toggleCart = function(isOpen) {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    if (isOpen) {
      drawer.classList.add('open');
      overlay.classList.add('open');
    } else {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
    }
  }
};

window.addToCart = function(id, name, price, img, isCustom = false, filename = '') {
  // Resolve image path correctly depending on directory level
  let finalImg = img;
  if (isSubfolder && !img.startsWith('http') && !img.startsWith('../')) {
    finalImg = '../' + img;
  } else if (!isSubfolder && img.startsWith('../')) {
    finalImg = img.replace('../', '');
  }

  // Check if item already exists in cart (regular items only)
  const existingItemIndex = cart.findIndex(item => item.id === id && !item.isCustom);
  
  if (existingItemIndex > -1 && !isCustom) {
    cart[existingItemIndex].qty += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: parseFloat(price),
      img: finalImg,
      qty: 1,
      isCustom: isCustom,
      filename: filename
    });
  }

  saveCart();
  updateCartUI();
  toggleCart(true); // Auto-open cart to show added item
};

function saveCart() {
  localStorage.setItem('gamercharm_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const itemsList = document.getElementById('cartItemsList');
  const navBadge = document.getElementById('navCartBadge');
  const floatBadge = document.getElementById('floatingCartBadge');
  const floatBtn = document.getElementById('floatingCart');
  const countLabel = document.getElementById('cartCountLabel');
  const totalLabel = document.getElementById('cartTotalLabel');

  if (!itemsList) return;

  if (cart.length === 0) {
    itemsList.innerHTML = `<div class="cart-empty-message">Tu mochila está vacía.<br><span style="font-size:0.75rem; color:var(--text-muted);">¡Añade productos para llenarla de botín!</span></div>`;
    if (navBadge) navBadge.style.display = 'none';
    if (floatBadge) floatBadge.style.display = 'none';
    if (floatBtn) floatBtn.style.display = 'none';
    countLabel.textContent = '0';
    totalLabel.textContent = '0.00 €';
    return;
  }

  // Render items
  let total = 0;
  let itemsCount = 0;
  itemsList.innerHTML = '';

  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    itemsCount += item.qty;

    const card = document.createElement('div');
    card.className = 'cart-item';
    card.innerHTML = `
      <img src="${item.img}" class="cart-item-img" alt="${item.name}" />
      <div class="cart-item-details">
        <div>
          <div class="cart-item-name">${item.name}</div>
          ${item.isCustom ? `<div class="cart-item-subtitle">Custom Model: ${item.filename}</div>` : ''}
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty-btn" onclick="changeQty(${idx}, -1)">-</div>
          <span class="cart-item-qty">${item.qty}</span>
          <div class="cart-qty-btn" onclick="changeQty(${idx}, 1)">+</div>
          <span class="cart-item-price" style="margin-left:auto">${(item.price * item.qty).toFixed(2)} €</span>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${idx})">×</button>
    `;
    itemsList.appendChild(card);
  });

  // Update badges
  if (navBadge) {
    navBadge.textContent = itemsCount;
    navBadge.style.display = 'flex';
  }
  if (floatBadge) {
    floatBadge.textContent = itemsCount;
    floatBadge.style.display = 'flex';
  }
  if (floatBtn) {
    floatBtn.style.display = 'flex';
  }

  countLabel.textContent = itemsCount;
  totalLabel.textContent = total.toFixed(2) + ' €';
}

window.changeQty = function(index, delta) {
  if (index < 0 || index >= cart.length) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
};

window.removeFromCart = function(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
};

window.checkoutMock = function() {
  if (cart.length === 0) return;
  alert('🏆 ¡Misión de Compra Simulada! En una tienda real, aquí procederías a la pasarela de pago segura. ¡Gracias por testear GamerCharm!');
  cart = [];
  saveCart();
  updateCartUI();
  toggleCart(false);
};

/* ── Drag and Drop STL Logic ── */
function initSTLUpload() {
  // We handle both upload zones: inside cart, and potential page zones (e.g. in products.html)
  const cartZone = document.getElementById('cartStlZone');
  const cartInput = document.getElementById('cartStlInput');
  const cartText = document.getElementById('cartStlText');

  setupUploadZone(cartZone, cartInput, cartText);

  // Setup page-level stl upload if present (e.g. products page)
  const pageZone = document.getElementById('pageStlZone');
  const pageInput = document.getElementById('pageStlInput');
  const pageText = document.getElementById('pageStlText');

  setupUploadZone(pageZone, pageInput, pageText);
}

function setupUploadZone(zone, input, textElement) {
  if (!zone || !input || !textElement) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleStlFile(files[0], zone, textElement);
    }
  });

  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      handleStlFile(input.files[0], zone, textElement);
    }
  });
}

function handleStlFile(file, zone, textElement) {
  if (!file.name.toLowerCase().endsWith('.stl')) {
    alert('❌ Error: Solo se admiten archivos en formato 3D .STL');
    return;
  }

  // Trigger processing animation
  zone.classList.add('scanning');
  const originalText = textElement.innerHTML;
  
  // Phase messages
  const phases = [
    { text: '📡 Conectando con impresora 3D...', delay: 0 },
    { text: '🔍 Analizando malla de polígonos...', delay: 800 },
    { text: '⚖️ Estimando volumen de resina (16.4g)...', delay: 1600 },
    { text: '⚡ ¡Modelo STL Validado! Añadiendo a la mochila...', delay: 2400 }
  ];

  phases.forEach(phase => {
    setTimeout(() => {
      textElement.innerHTML = `<span style="color:var(--accent-cyan)">${phase.text}</span>`;
    }, phase.delay);
  });

  setTimeout(() => {
    // Add custom STL product to cart
    addToCart(
      'stl-custom-' + Date.now(),
      `Llavero Custom STL`,
      5.00,
      'Fotos/Productos/logo.png',
      true,
      file.name
    );
    
    // Reset scanner
    zone.classList.remove('scanning');
    textElement.innerHTML = originalText;
  }, 3200);
}

/* ════════════════════════════════
   INVESTOR: FINANCIAL CHARTS
   ════════════════════════════════ */
function initFinancialDashboard() {
  // Setup tabs toggling
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  if (tabs.length > 0 && contents.length > 0) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-target');
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const activeContent = document.getElementById(target);
        if (activeContent) {
          activeContent.classList.add('active');
          // If we activate charts tab, draw/redraw charts
          if (target === 'viabilidad') {
            setTimeout(drawFinancialCharts, 100);
          }
        }
      });
    });
  }

  // 3D Card Flip logic for Balance and Income Statement (P&L)
  const btnPrev = document.getElementById('btnFlipPrev');
  const btnNext = document.getElementById('btnFlipNext');
  const cardContainer = document.querySelector('.balance-3d-scene-container');
  const flipCard = document.getElementById('balanceFlipCard');

  if (cardContainer && flipCard) {
    const performFlip = () => {
      cardContainer.classList.toggle('flipped');
    };

    if (btnPrev) btnPrev.addEventListener('click', performFlip);
    if (btnNext) btnNext.addEventListener('click', performFlip);
    
    // Tactile clicking on the card itself (excluding tables/links/interactive parts)
    flipCard.addEventListener('click', (e) => {
      if (!e.target.closest('a') && !e.target.closest('button') && !e.target.closest('.table-wrap')) {
        performFlip();
      }
    });
  }

  // Auto-draw if charts canvas is on screen on load (i.e. default tab)
  if (document.getElementById('activoPasivoChart')) {
    // Setup observer to trigger charts animation when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          drawFinancialCharts();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    const dashboard = document.querySelector('.financial-dashboard');
    if (dashboard) observer.observe(dashboard);
  }
}

function drawFinancialCharts() {
  // Chart 1: Bar Chart (Activo vs Pasivo + PN)
  const barCanvas = document.getElementById('activoPasivoChart');
  if (barCanvas) {
    const ctx = barCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal size matching css
    const rect = barCanvas.getBoundingClientRect();
    barCanvas.width = rect.width * dpr;
    barCanvas.height = 280 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 280;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      let y = h - 40 - (i * (h - 80) / 4);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9px Orbitron';
      ctx.fillText((i * 1000) + ' €', 10, y + 3);
    }

    // Baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(50, h - 40);
    ctx.lineTo(w - 20, h - 40);
    ctx.stroke();

    // Data
    const data = [3500, 3500]; // Activo vs Pasivo+PN (balance de apertura)
    const maxVal = 4000;
    const labels = ['ACTIVO TOTAL', 'PASIVO + PN'];
    const colors = [
      { start: '#00f0ff', end: '#06b6d4', glow: 'rgba(0,240,255,0.35)' }, // Cyan
      { start: '#bc3cfc', end: '#a855f7', glow: 'rgba(188,60,252,0.35)' } // Purple
    ];

    const barW = Math.min(70, w * 0.18);
    const spacing = w * 0.22;

    data.forEach((val, idx) => {
      const barH = (val / maxVal) * (h - 80);
      const x = (w / 2) - spacing + (idx * spacing * 1.8) - (barW / 2);
      const y = h - 40 - barH;

      // Draw bar with gradient
      const grad = ctx.createLinearGradient(x, y + barH, x, y);
      grad.addColorStop(0, colors[idx].end);
      grad.addColorStop(1, colors[idx].start);

      ctx.fillStyle = grad;
      
      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();

      // Shadow glow effect
      ctx.shadowColor = colors[idx].glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Value label on top
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(val.toLocaleString('es-ES') + ' €', x + (barW / 2), y - 10);

      // Axis label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Orbitron';
      ctx.fillText(labels[idx], x + (barW / 2), h - 20);
    });
  }

  // Chart 2: Donut Chart (Desglose de Gastos)
  const donutCanvas = document.getElementById('gastosChart');
  if (donutCanvas) {
    const ctx = donutCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = donutCanvas.getBoundingClientRect();
    donutCanvas.width = rect.width * dpr;
    donutCanvas.height = 280 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 280;

    ctx.clearRect(0, 0, w, h);

    // Data breakdown
    const expenses = [
      { name: 'Materias Primas', val: 1200, color: '#bc3cfc' }, // Purple
      { name: 'Marketing Digital', val: 600, color: '#00f0ff' }, // Cyan
      { name: 'Packaging y Envíos', val: 480, color: '#ec4899' }, // Pink
      { name: 'Legal y Asesoría', val: 400, color: '#fbbf24' },  // Yellow
      { name: 'Gastos Notaría/Const.', val: 350, color: '#10b981' }, // Green
      { name: 'Software y Hosting', val: 120, color: '#64748b' }  // Gray
    ];

    const total = expenses.reduce((sum, item) => sum + item.val, 0);

    const centerX = w * 0.35;
    const centerY = h / 2;
    const outerRadius = Math.min(w * 0.22, 75);
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    expenses.forEach((item) => {
      const sliceAngle = (item.val / total) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      // Draw arc
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();

      // Subtle border to divide segments
      ctx.strokeStyle = '#0c0d14';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Draw central text in donut hole
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '9px Orbitron';
    ctx.fillText('TOTAL GASTOS', centerX, centerY - 6);
    ctx.font = 'bold 13px Orbitron';
    ctx.fillStyle = 'var(--accent-cyan)';
    ctx.fillText(total.toLocaleString('es-ES') + ' €', centerX, centerY + 10);

    // Draw Legend on the right side
    ctx.textAlign = 'left';
    ctx.font = '9px Inter';
    
    expenses.forEach((item, idx) => {
      const lx = w * 0.64;
      const ly = (h / 2) - 65 + (idx * 22);

      // Color marker block
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, ly - 7, 10, 10);

      // Label text
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(item.name, lx + 16, ly);

      // Value text
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px Orbitron';
      const pct = ((item.val / total) * 100).toFixed(0);
      ctx.fillText(`${item.val} € (${pct}%)`, lx + 16, ly + 10);
      ctx.font = '9px Inter'; // reset
    });
  }
}

/* ════════════════════════════════
   FAQs NEON ACCORDION
   ════════════════════════════════ */
function initFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-content').style.maxHeight = null;
        });

        // Toggle active
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });
}
