let products = [
  { id: 1, name: "Classic White T-Shirt", price: 25.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Black Denim Jacket", price: 89.00, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Beige Chino Pants", price: 45.00, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Minimalist Sneakers", price: 120.00, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
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

// =======================
// AUTHENTICATION LOGIC
// =======================

const authBtn = document.getElementById("auth-btn");
const userDisplay = document.getElementById("user-display");
const authModal = document.getElementById("auth-modal");
const authOverlay = document.getElementById("auth-overlay");
const closeAuth = document.getElementById("close-auth");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loggedInState = document.getElementById("logged-in-state");
const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");
const loginMsg = document.getElementById("login-msg");
const registerMsg = document.getElementById("register-msg");

const API_URL = "http://localhost:5000/api/auth";

// Check Login Status on Load
function checkAuth() {
  const token = localStorage.getItem("aura_token");
  const username = localStorage.getItem("aura_user");
  
  if (token && username) {
    userDisplay.innerText = username;
    loginForm.classList.remove("active");
    registerForm.classList.remove("active");
    loggedInState.classList.add("active");
    welcomeMsg.innerText = `Welcome back, ${username}!`;
    tabLogin.style.display = "none";
    tabRegister.style.display = "none";
  } else {
    userDisplay.innerText = "Login";
    loggedInState.classList.remove("active");
    loginForm.classList.add("active");
    tabLogin.style.display = "block";
    tabRegister.style.display = "block";
    switchTab("login");
  }
}

// Toggle Auth Modal
function toggleAuthModal(open) {
  if (open) {
    authModal.classList.add("active");
    authOverlay.classList.add("active");
    checkAuth();
  } else {
    authModal.classList.remove("active");
    authOverlay.classList.remove("active");
    loginMsg.innerText = "";
    registerMsg.innerText = "";
  }
}

// Switch Tabs
function switchTab(tab) {
  if (tab === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  } else {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem("aura_token", data.token);
      localStorage.setItem("aura_user", data.user.username);
      toggleAuthModal(false);
      checkAuth();
      loginForm.reset();
    } else {
      loginMsg.innerText = data.msg || "Login failed";
    }
  } catch (err) {
    loginMsg.innerText = "Server error. Is backend running?";
  }
});

// Handle Register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;
  
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      registerMsg.style.color = "green";
      registerMsg.innerText = "Success! Please login.";
      registerForm.reset();
      setTimeout(() => switchTab("login"), 1500);
    } else {
      registerMsg.style.color = "#e63946";
      registerMsg.innerText = data.msg || "Registration failed";
    }
  } catch (err) {
    registerMsg.style.color = "#e63946";
    registerMsg.innerText = "Server error. Is backend running?";
  }
});

// Handle Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("aura_token");
  localStorage.removeItem("aura_user");
  checkAuth();
});

// Event Listeners for UI
authBtn.addEventListener("click", () => toggleAuthModal(true));
closeAuth.addEventListener("click", () => toggleAuthModal(false));
authOverlay.addEventListener("click", () => toggleAuthModal(false));
tabLogin.addEventListener("click", () => switchTab("login"));
tabRegister.addEventListener("click", () => switchTab("register"));

// Run checkAuth on page load
checkAuth();