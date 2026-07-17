const MODO_SIMULADO = false; 
const REPO2_BACKEND_URL = "http://localhost:4000/products"; 
const REPO3_FAVS_URL = "https://microservicio-favoritos.onrender.com/favoritos"; 

let productsList = [];
let favorites = []; 

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

async function loadProducts() {
  switchState('loading');
  try {
    let data;
    
    if (MODO_SIMULADO) {
      data = [
        { id: 1, title: "Test Jacket", price: 99.9, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500", description: "Simulation test product" }
      ];
    } else {
      const response = await fetch(REPO2_BACKEND_URL);
      if (!response.ok) throw new Error("Failed to fetch products");
      data = await response.json();
    }
    
    if (Array.isArray(data)) {
      productsList = data;
    } else if (data && Array.isArray(data.products)) {
      productsList = data.products;
    } else if (data && Array.isArray(data.data)) {
      productsList = data.data;
    } else {
      throw new Error("Invalid product data format.");
    }
    
    renderCards(productsList);
    switchState('success');
  } catch (error) {
    console.error("Failed to connect to Catalog (Repo 2):", error);
    switchState('error'); 
  }
}

async function fetchFavorites() {
  const localData = localStorage.getItem('backUpFavorites');
  if (localData) {
    favorites = JSON.parse(localData);
    const favCountEl = document.getElementById('fav-count');
    if (favCountEl) favCountEl.textContent = favorites.length;
    renderCards(productsList);
  }

  try {
    const response = await fetch(REPO3_FAVS_URL);
    if (response.ok) {
      const data = await response.json();
      const serverFavs = Array.isArray(data) ? data.filter(fav => fav !== null && fav !== undefined) : [];
      
      if (serverFavs.length > 0) {
        favorites = serverFavs;
        localStorage.setItem('backUpFavorites', JSON.stringify(favorites));
        
        const favCountEl = document.getElementById('fav-count');
        if (favCountEl) favCountEl.textContent = favorites.length;
        renderCards(productsList);
      }
    } else {
      throw new Error("Render response not OK");
    }
  } catch (error) {
    console.warn("Using local favorites backup due to network/Render error:", error);
  }
}

window.toggleFavorite = async function(productId) {
  const idToFind = Number(productId);
  const currentFav = favorites.find(fav => fav && Number(fav.productId) === idToFind);

  if (currentFav) {
    favorites = favorites.filter(fav => fav && Number(fav.productId) !== idToFind);
  } else {
    const productObj = productsList.find(p => Number(p.id) === idToFind);
    if (productObj) {
      favorites.push({
        productId: productObj.id,
        title: productObj.title,
        price: productObj.price,
        image: productObj.image
      });
    }
  }

  localStorage.setItem('backUpFavorites', JSON.stringify(favorites));

  const favCountEl = document.getElementById('fav-count');
  if (favCountEl) favCountEl.textContent = favorites.length;
  renderCards(productsList);
  
  if (document.getElementById('favorites-modal') && !document.getElementById('favorites-modal').classList.contains('hidden')) {
    renderFavoritesModal();
  }

  try {
    if (currentFav) {
      await fetch(`${REPO3_FAVS_URL}/${idToFind}`, { method: 'DELETE' });
    } else {
      const productObj = productsList.find(p => Number(p.id) === idToFind);
      if (productObj) {
        await fetch(REPO3_FAVS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: productObj.id,
            title: productObj.title,
            price: productObj.price,
            image: productObj.image
          })
        });
      }
    }
  } catch (error) {
    console.error("Error syncing with Render favorites server:", error);
  }
}

function renderCards(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  grid.innerHTML = ''; 

  products.forEach(product => {
    const isFav = favorites.some(fav => fav && Number(fav.productId) === Number(product.id));
    const priceValue = (product && typeof product.price === 'number') ? product.price : 0;
    
    const titleText = product.title || 'No Title';
    const descriptionText = product.description ? product.description.substring(0, 80) + '...' : 'No description available.';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image || ''}" alt="${titleText}">
      <h3>${titleText}</h3>
      <p class="price">$${priceValue.toFixed(2)}</p>
      <p class="description">${descriptionText}</p>
      <button class="fav-btn ${isFav ? 'active' : ''}" onclick="window.toggleFavorite(${product.id})">
        ${isFav ? '❤️ En Favoritos' : '🤍 Añadir a Favoritos'}
      </button>
    `;
    grid.appendChild(card);
  });
}

function renderFavoritesModal() {
  const modalList = document.getElementById('favorites-list');
  if (!modalList) return;
  
  modalList.innerHTML = '';

  const validFavorites = favorites.filter(fav => fav !== null && fav !== undefined);

  if (validFavorites.length === 0) {
    modalList.innerHTML = '<p style="text-align:center; color:#64748b;">No tienes favoritos guardados todavía. 🤍</p>';
    return;
  }

  validFavorites.forEach(fav => {
    const realProduct = productsList.find(p => Number(p.id) === Number(fav.productId));
    
    const title = realProduct ? realProduct.title : (fav.title || 'No Title');
    const image = realProduct ? realProduct.image : (fav.image || '');
    const priceValue = realProduct ? realProduct.price : (typeof fav.price === 'number' ? fav.price : 0);
    
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.innerHTML = `
      <img src="${image}" alt="${title}">
      <div>
        <h4>${title}</h4>
        <p>$${priceValue.toFixed(2)}</p>
      </div>
      <button onclick="window.toggleFavorite(${fav.productId})" style="background:none; border:none; cursor:pointer; font-size:1.2rem;">❌</button>
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

window.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();   
  await fetchFavorites();  
  
  const favBtn = document.getElementById('btn-view-favorites');
  if (favBtn) {
    favBtn.onclick = window.openFavoritesModal;
  }
});