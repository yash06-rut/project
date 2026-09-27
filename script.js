// Sample Products Data
const products = [
  { id: 1, name: "Minimalist Black Hoodie", price: 65, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2" },
  { id: 2, name: "Classic White Tee", price: 30, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518" },
  { id: 3, name: "Oversized Denim Jacket", price: 110, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0" },
  { id: 4, name: "Slim-Fit Chino Pants", price: 75, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80" }
];

let cart = [];

// DOM Elements
const productGrid = document.getElementById("product-grid");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalPrice = document.getElementById("cart-total-price");

// Render Products to Webpage
function renderProducts() {
  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// Add Item to Shopping Cart
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  toggleCart(true); // Open drawer on addition
}

// Remove Item from Cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

// Update Cart Display & Calculations
function updateCart() {
  // Update Item Count badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalItems;

  // Render Items inside Cart Drawer
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <h4>${item.name}</h4>
        <small>$${item.price.toFixed(2)} x ${item.quantity}</small>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');

  // Update Total Price
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalPrice.innerText = `$${totalCost.toFixed(2)}`;
}

// Drawer Visibility Toggle
function toggleCart(open) {
  if (open) {
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("active");
  } else {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("active");
  }
}

// Checkout alert trigger
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is currently empty!");
    return;
  }
  alert("Order placed successfully!");
  cart = [];
  updateCart();
  toggleCart(false);
}

// Event Listeners
cartBtn.addEventListener("click", () => toggleCart(true));
closeCartBtn.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

// Initialize Page
renderProducts();