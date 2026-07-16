// ==========================================
// 📦 1. DATOS SIMULADOS CON IMÁGENES ESTABLES
// ==========================================
const mockProducts = [
  {
    id: 1,
    title: "Chaqueta Impermeable Premium",
    price: 109.95,
    description: "Perfecta para climas fríos y lluvias. Diseño aerodinámico y bolsillos internos.",
    category: "men's clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80"
  },
  {
    id: 2,
    title: "Smartwatch Deportivo Pro",
    price: 64.00,
    description: "Monitor de ritmo cardíaco, GPS integrado y batería de hasta 7 días.",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80"
  },
  {
    id: 3,
    title: "Anillo de Oro 14k Elegance",
    price: 295.00,
    description: "Anillo de compromiso clásico con acabados pulidos de alta calidad.",
    category: "jewelery",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80"
  }
];

let favorites = [];

// ==========================================
// 🔄 2. MANEJO DE ESTADOS DE LA UI
// ==========================================
function switchState(state) {
  const loadingEl = document.getElementById('state-loading');
  const successEl = document.getElementById('state-success');
  const errorEl = document.getElementById('state-error');

  if (loadingEl) loadingEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  if (state === 'loading' && loadingEl) loadingEl.classList.remove('hidden');
  if (state === 'success' && successEl) successEl.classList.remove('hidden');
  if (state === 'error' && errorEl) errorEl.classList.remove('hidden');
}

// ==========================================
// 🌐 3. PETICIÓN ASÍNCRONA SIMULADA
// ==========================================
async function loadProducts() {
  switchState('loading');
  try {
    // Retraso de red simulado
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    renderCards(mockProducts);
    switchState('success');
  } catch (error) {
    console.error("Fallo interno:", error);
    switchState('error');
  }
}

// ==========================================
// 🎨 4. RENDERIZADO DE TARJETAS
// ==========================================
function renderCards(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  grid.innerHTML = ''; 

  products.forEach(product => {
    const isFav = favorites.includes(product.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <p class="description">${product.description.substring(0, 80)}...</p>
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="window.toggleFavorite(${product.id})">
        ${isFav ? '❤️ En Favoritos' : '🤍 Añadir a Favoritos'}
      </button>
    `;
    grid.appendChild(card);
  });
}

// ==========================================
// ❤️ 5. FUNCIONALIDAD EXTRA: FAVORITOS
// ==========================================
window.toggleFavorite = function(productId) {
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId); 
  } else {
    favorites.push(productId); 
  }
  
  const favCountEl = document.getElementById('fav-count');
  if (favCountEl) favCountEl.textContent = favorites.length;
  
  renderCards(mockProducts);
  
  const modalEl = document.getElementById('favorites-modal');
  if (modalEl && !modalEl.classList.contains('hidden')) {
    renderFavoritesModal();
  }
}

// ==========================================
// 🪟 6. LÓGICA DE LA VENTANA MODAL
// ==========================================
function renderFavoritesModal() {
  const modalList = document.getElementById('favorites-list');
  if (!modalList) return;
  
  modalList.innerHTML = '';
  const favProducts = mockProducts.filter(p => favorites.includes(p.id));

  if (favProducts.length === 0) {
    modalList.innerHTML = '<p style="text-align:center; color:#64748b;">No tienes productos guardados todavía. 🤍</p>';
    return;
  }

  favProducts.forEach(product => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <div>
        <h4>${product.title}</h4>
        <p>$${product.price.toFixed(2)}</p>
      </div>
      <button onclick="window.toggleFavorite(${product.id})" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">❌</button>
    `;
    modalList.appendChild(item);
  });
}

window.openFavoritesModal = function() {
  renderFavoritesModal();
  const modalEl = document.getElementById('favorites-modal');
  if (modalEl) modalEl.classList.remove('hidden');
}

window.closeFavoritesModal = function() {
  const modalEl = document.getElementById('favorites-modal');
  if (modalEl) modalEl.classList.add('hidden');
}

window.retryFetch = function() {
  loadProducts();
}

// Ejecución inicial segura
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  const favBtn = document.getElementById('btn-view-favorites');
  if (favBtn) {
    favBtn.onclick = window.openFavoritesModal;
  }
});