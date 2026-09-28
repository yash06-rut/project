// State Variables
let products = [
  { id: 1, name: "Minimalist Black Hoodie", price: 1499, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Classic White Tee", price: 799, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Oversized Denim Jacket", price: 2999, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Slim-Fit Chino Pants", price: 1899, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
];

let cart = [];
let currentUser = null;
let currentOrder = null;
let userAddresses = [];
let activePaymentMethod = 'UPI Instant';
let activeOtpPhone = '';

const API_BASE = "http://localhost:5000/api";

// DOM Elements
const productGrid = document.getElementById("product-grid");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalPrice = document.getElementById("cart-total-price");

// Modals DOM
const paymentOverlay = document.getElementById("payment-overlay");
const paymentModal = document.getElementById("payment-modal");
const closePaymentBtn = document.getElementById("close-payment");
const payModalTotal = document.getElementById("pay-modal-total");
const payBtnAmount = document.getElementById("pay-btn-amount");

const receiptOverlay = document.getElementById("receipt-overlay");
const receiptModal = document.getElementById("receipt-modal");

const authBtn = document.getElementById("auth-btn");
const userDisplay = document.getElementById("user-display");
const authModal = document.getElementById("auth-modal");
const authOverlay = document.getElementById("auth-overlay");
const closeAuth = document.getElementById("close-auth");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const tabOtp = document.getElementById("tab-otp");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const otpForm = document.getElementById("otp-form");
const loginMsg = document.getElementById("login-msg");
const registerMsg = document.getElementById("register-msg");
const otpMsg = document.getElementById("otp-msg");

const accountOverlay = document.getElementById("account-overlay");
const accountModal = document.getElementById("account-modal");
const closeAccount = document.getElementById("close-account");
const logoutBtn = document.getElementById("logout-btn");
const accUserName = document.getElementById("acc-user-name");
const accUserEmail = document.getElementById("acc-user-email");

const orderDetailOverlay = document.getElementById("order-detail-overlay");
const orderDetailModal = document.getElementById("order-detail-modal");
const closeOrderDetail = document.getElementById("close-order-detail");

// ==================================
// PRODUCT & CART MANAGEMENT
// ==================================

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data;
      }
    }
  } catch (err) {
    console.log("Using fallback static product catalog.");
  }
  renderProducts();
}

function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${Number(product.price).toLocaleString('en-IN')}</p>
        <button class="add-to-cart-btn" onclick="addToCart('${product.id || product._id}')">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id) || String(p._id) === String(id));
  if (!product) return;
  const existingItem = cart.find(item => String(item.id) === String(id) || String(item._id) === String(id));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, size: 'M', color: 'Standard' });
  }

  updateCart();
  toggleCart(true);
}

function removeFromCart(id) {
  cart = cart.filter(item => String(item.id) !== String(id) && String(item._id) !== String(id));
  updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.innerText = totalItems;

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <small>₹${Number(item.price).toLocaleString('en-IN')} x ${item.quantity}</small>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id || item._id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotalPrice) cartTotalPrice.innerText = `₹${totalCost.toLocaleString('en-IN')}`;
}

function toggleCart(open) {
  if (open) {
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("active");
  } else {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("active");
  }
}

// ==================================
// AUTHENTICATION LOGIC
// ==================================

function getAuthToken() {
  return localStorage.getItem("aura_token");
}

async function checkAuth() {
  const token = getAuthToken();
  if (!token) {
    currentUser = null;
    userDisplay.innerText = "Login";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      currentUser = await res.json();
      userDisplay.innerText = currentUser.name || currentUser.email;
      if (accUserName) accUserName.innerText = currentUser.name;
      if (accUserEmail) accUserEmail.innerText = currentUser.email;
    } else {
      localStorage.removeItem("aura_token");
      currentUser = null;
      userDisplay.innerText = "Login";
    }
  } catch (err) {
    console.error("Auth check failed:", err);
  }
}

function toggleAuthModal(open) {
  if (open) {
    if (currentUser) {
      openAccountModal();
      return;
    }
    authModal.classList.add("active");
    authOverlay.classList.add("active");
  } else {
    authModal.classList.remove("active");
    authOverlay.classList.remove("active");
    if (loginMsg) loginMsg.innerText = "";
    if (registerMsg) registerMsg.innerText = "";
    if (otpMsg) otpMsg.innerText = "";
  }
}

function switchAuthTab(tab) {
  tabLogin.classList.remove("active");
  tabRegister.classList.remove("active");
  if (tabOtp) tabOtp.classList.remove("active");

  loginForm.classList.remove("active");
  registerForm.classList.remove("active");
  if (otpForm) otpForm.classList.remove("active");

  if (tab === "login") {
    tabLogin.classList.add("active");
    loginForm.classList.add("active");
  } else if (tab === "register") {
    tabRegister.classList.add("active");
    registerForm.classList.add("active");
  } else if (tab === "otp") {
    if (tabOtp) tabOtp.classList.add("active");
    if (otpForm) otpForm.classList.add("active");
  }
}

// 1. Handle Email Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("aura_token", data.token);
        currentUser = data.user;
        toggleAuthModal(false);
        checkAuth();
        loginForm.reset();
      } else {
        if (loginMsg) loginMsg.innerText = data.msg || "Login failed";
      }
    } catch (err) {
      if (loginMsg) loginMsg.innerText = "Server error during login";
    }
  });
}

// 2. Handle Register (With fixed error message reporting)
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-username").value;
    const phone = document.getElementById("register-phone").value;
    const password = document.getElementById("register-password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("aura_token", data.token);
        currentUser = data.user;
        if (registerMsg) {
          registerMsg.style.color = "#10b981";
          registerMsg.innerText = "Account created successfully!";
        }
        setTimeout(() => {
          toggleAuthModal(false);
          checkAuth();
          registerForm.reset();
        }, 1000);
      } else {
        if (registerMsg) {
          registerMsg.style.color = "#e63946";
          registerMsg.innerText = data.msg || "Registration failed. Please check details.";
        }
      }
    } catch (err) {
      if (registerMsg) {
        registerMsg.style.color = "#e63946";
        registerMsg.innerText = "Server error during registration";
      }
    }
  });
}

// 3. Handle Phone OTP Request & Verification
async function requestOTP() {
  const phoneInput = document.getElementById("otp-phone").value.trim();
  if (!phoneInput || phoneInput.length < 10) {
    if (otpMsg) {
      otpMsg.style.color = "#e63946";
      otpMsg.innerText = "Please enter a valid 10-digit mobile number.";
    }
    return;
  }

  const sendBtn = document.getElementById("btn-send-otp");
  sendBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...`;
  sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput })
    });
    const data = await res.json();
    sendBtn.innerHTML = "Send OTP Code";
    sendBtn.disabled = false;

    if (res.ok && data.success) {
      activeOtpPhone = data.phone || phoneInput;
      document.getElementById("otp-target-phone").innerText = `+91 ${activeOtpPhone}`;
      document.getElementById("demo-otp-code").innerText = data.otpCode;
      document.getElementById("otp-step-1").style.display = "none";
      document.getElementById("otp-step-2").style.display = "block";
      if (otpMsg) {
        otpMsg.style.color = "#10b981";
        otpMsg.innerText = "OTP sent! Check code above.";
      }
    } else {
      if (otpMsg) {
        otpMsg.style.color = "#e63946";
        otpMsg.innerText = data.msg || "Error sending OTP";
      }
    }
  } catch (err) {
    sendBtn.innerHTML = "Send OTP Code";
    sendBtn.disabled = false;
    if (otpMsg) {
      otpMsg.style.color = "#e63946";
      otpMsg.innerText = "Server error sending OTP";
    }
  }
}

async function submitVerifyOTP() {
  const otpCode = document.getElementById("otp-code-input").value.trim();
  if (!otpCode || otpCode.length < 6) {
    if (otpMsg) {
      otpMsg.style.color = "#e63946";
      otpMsg.innerText = "Please enter the 6-digit OTP code.";
    }
    return;
  }

  const verifyBtn = document.getElementById("btn-verify-otp");
  verifyBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
  verifyBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: activeOtpPhone, otp: otpCode })
    });
    const data = await res.json();
    verifyBtn.innerHTML = "Verify & Login";
    verifyBtn.disabled = false;

    if (res.ok && data.success) {
      localStorage.setItem("aura_token", data.token);
      currentUser = data.user;
      if (otpMsg) {
        otpMsg.style.color = "#10b981";
        otpMsg.innerText = "Phone verified successfully!";
      }
      setTimeout(() => {
        toggleAuthModal(false);
        checkAuth();
        resetOTPForm();
      }, 1000);
    } else {
      if (otpMsg) {
        otpMsg.style.color = "#e63946";
        otpMsg.innerText = data.msg || "Invalid OTP code";
      }
    }
  } catch (err) {
    verifyBtn.innerHTML = "Verify & Login";
    verifyBtn.disabled = false;
    if (otpMsg) {
      otpMsg.style.color = "#e63946";
      otpMsg.innerText = "Server error verifying OTP";
    }
  }
}

function resetOTPForm() {
  document.getElementById("otp-step-1").style.display = "block";
  document.getElementById("otp-step-2").style.display = "none";
  document.getElementById("otp-phone").value = "";
  document.getElementById("otp-code-input").value = "";
  if (otpMsg) otpMsg.innerText = "";
}

// 4. Handle Direct Google Connect Authentication
async function triggerGoogleAuth() {
  // Check if Google SDK is loaded
  if (typeof google !== "undefined" && google.accounts && google.accounts.id) {
    google.accounts.id.initialize({
      client_id: "876543210987-auraapparel.apps.googleusercontent.com", // standard OAuth client ID
      callback: handleGoogleCredentialResponse
    });
    google.accounts.id.prompt(); // Show Google One-Tap prompt
  }
  
  // Prompt direct Google account sign-in simulation
  const gEmail = prompt("Google Sign-In Connect:\nEnter your Google Email address:", "khushal.google@gmail.com");
  if (!gEmail) return;

  const gName = gEmail.split("@")[0].replace(".", " ");

  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: gEmail,
        name: gName,
        googleId: `google_${Date.now()}`
      })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("aura_token", data.token);
      currentUser = data.user;
      alert(`🎉 Successfully connected with Google!\nWelcome, ${data.user.name}`);
      toggleAuthModal(false);
      checkAuth();
    } else {
      alert("Google auth failed: " + (data.msg || "Error"));
    }
  } catch (err) {
    alert("Error connecting with Google");
  }
}

function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;
  // Parse JWT credential token from Google
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);

    fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        picture: payload.picture
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        localStorage.setItem("aura_token", data.token);
        currentUser = data.user;
        toggleAuthModal(false);
        checkAuth();
      }
    });
  } catch (e) {
    console.error("Google token decode error:", e);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("aura_token");
    currentUser = null;
    closeAccountModal();
    checkAuth();
  });
}

// ==================================
// MY ACCOUNT & PROFILE
// ==================================

function openAccountModal() {
  if (!currentUser) {
    toggleAuthModal(true);
    return;
  }
  if (accountOverlay) accountOverlay.classList.add("active");
  if (accountModal) accountModal.classList.add("active");

  if (accUserName) accUserName.innerText = currentUser.name;
  if (accUserEmail) accUserEmail.innerText = currentUser.email;

  // Pre-fill profile
  document.getElementById("prof-name").value = currentUser.name || "";
  document.getElementById("prof-email").value = currentUser.email || "";
  document.getElementById("prof-phone").value = currentUser.phone || "";

  // Load orders & addresses
  fetchUserOrders();
  fetchUserAddresses();
}

function closeAccountModal() {
  if (accountOverlay) accountOverlay.classList.remove("active");
  if (accountModal) accountModal.classList.remove("active");
}

document.querySelectorAll(".acc-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".acc-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".acc-content").forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    const target = tab.getAttribute("data-acctab");
    const targetContent = document.getElementById(`acc-tab-${target}`);
    if (targetContent) targetContent.classList.add("active");

    if (target === 'orders') fetchUserOrders();
    else if (target === 'addresses') fetchUserAddresses();
  });
});

// Update Profile
const profileForm = document.getElementById("profile-form");
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("prof-name").value;
    const email = document.getElementById("prof-email").value;
    const phone = document.getElementById("prof-phone").value;
    const profMsg = document.getElementById("prof-msg");

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      if (res.ok) {
        currentUser = data.user;
        checkAuth();
        if (profMsg) {
          profMsg.style.color = "#10b981";
          profMsg.innerText = "Profile saved successfully!";
        }
      } else {
        if (profMsg) {
          profMsg.style.color = "#e63946";
          profMsg.innerText = data.msg || "Error updating profile";
        }
      }
    } catch (err) {
      if (profMsg) {
        profMsg.style.color = "#e63946";
        profMsg.innerText = "Server error updating profile";
      }
    }
  });
}

// ==================================
// ADDRESS MANAGEMENT
// ==================================

async function fetchUserAddresses() {
  const container = document.getElementById("address-list-container");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/addresses`, {
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      userAddresses = await res.json();
      renderAddresses();
    }
  } catch (err) {
    container.innerHTML = `<p class="empty-state-msg">Error loading addresses.</p>`;
  }
}

function renderAddresses() {
  const container = document.getElementById("address-list-container");
  if (!container) return;

  if (userAddresses.length === 0) {
    container.innerHTML = `<p class="empty-state-msg">No saved delivery addresses yet.</p>`;
    return;
  }

  container.innerHTML = userAddresses.map(addr => `
    <div class="address-card ${addr.isDefault ? 'default' : ''}">
      <strong>${addr.fullName}</strong>
      ${addr.isDefault ? '<span class="default-badge">DEFAULT</span>' : ''}
      <p style="font-size:0.85rem; color:#4b5563; margin:4px 0;">
        ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}
      </p>
      <p style="font-size:0.85rem; color:#6b7280;">Phone: ${addr.phone}</p>
      <div class="address-actions">
        ${!addr.isDefault ? `<button class="btn-text" onclick="setDefaultAddress('${addr._id}')">Make Default</button>` : ''}
        <button class="btn-text" onclick="editAddress('${addr._id}')">Edit</button>
        <button class="btn-text danger" onclick="deleteAddress('${addr._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function showAddAddressForm() {
  document.getElementById("addr-form-title").innerText = "Add New Address";
  document.getElementById("addr-id").value = "";
  document.getElementById("address-form").reset();
  document.getElementById("address-form").style.display = "block";
}

function hideAddressForm() {
  document.getElementById("address-form").style.display = "none";
}

function editAddress(id) {
  const addr = userAddresses.find(a => a._id === id);
  if (!addr) return;

  document.getElementById("addr-form-title").innerText = "Edit Address";
  document.getElementById("addr-id").value = addr._id;
  document.getElementById("addr-name").value = addr.fullName;
  document.getElementById("addr-phone").value = addr.phone;
  document.getElementById("addr-line1").value = addr.addressLine1;
  document.getElementById("addr-line2").value = addr.addressLine2 || "";
  document.getElementById("addr-city").value = addr.city;
  document.getElementById("addr-state").value = addr.state;
  document.getElementById("addr-pincode").value = addr.pincode;
  document.getElementById("addr-default").checked = addr.isDefault;

  document.getElementById("address-form").style.display = "block";
}

const addressForm = document.getElementById("address-form");
if (addressForm) {
  addressForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("addr-id").value;
    const bodyData = {
      fullName: document.getElementById("addr-name").value,
      phone: document.getElementById("addr-phone").value,
      addressLine1: document.getElementById("addr-line1").value,
      addressLine2: document.getElementById("addr-line2").value,
      city: document.getElementById("addr-city").value,
      state: document.getElementById("addr-state").value,
      pincode: document.getElementById("addr-pincode").value,
      isDefault: document.getElementById("addr-default").checked
    };

    const url = id ? `${API_BASE}/addresses/${id}` : `${API_BASE}/addresses`;
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        hideAddressForm();
        fetchUserAddresses();
      } else {
        alert("Failed to save address");
      }
    } catch (err) {
      alert("Error saving address");
    }
  });
}

async function deleteAddress(id) {
  if (!confirm("Are you sure you want to delete this address?")) return;
  try {
    const res = await fetch(`${API_BASE}/addresses/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (res.ok) fetchUserAddresses();
  } catch (err) {
    alert("Error deleting address");
  }
}

async function setDefaultAddress(id) {
  try {
    const res = await fetch(`${API_BASE}/addresses/${id}/default`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (res.ok) fetchUserAddresses();
  } catch (err) {
    alert("Error updating default address");
  }
}

// ==================================
// ORDER HISTORY & DETAILS
// ==================================

async function fetchUserOrders() {
  const container = document.getElementById("orders-list-container");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      const orders = await res.json();
      renderOrders(orders);
    }
  } catch (err) {
    container.innerHTML = `<p class="empty-state-msg">Error loading orders.</p>`;
  }
}

function renderOrders(orders) {
  const container = document.getElementById("orders-list-container");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<p class="empty-state-msg">You haven't placed any orders yet.</p>`;
    return;
  }

  container.innerHTML = orders.map(ord => `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <strong>#${ord.orderNumber}</strong>
          <div>Placed on ${new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <span class="order-badge ${ord.orderStatus}">${ord.orderStatus}</span>
      </div>

      <div class="order-items-preview">
        ${ord.items.map(item => `<img src="${item.productImage}" alt="${item.productName}" class="order-thumb" title="${item.productName}">`).join('')}
      </div>

      <div class="order-card-footer">
        <div>Total: <strong>₹${Number(ord.totalAmount).toLocaleString('en-IN')}</strong> (${ord.items.length} items)</div>
        <button class="btn-sm" onclick="viewOrderDetails('${ord._id}')">View Details</button>
      </div>
    </div>
  `).join('');
}

async function viewOrderDetails(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) {
      alert("Could not load order details");
      return;
    }
    const order = await res.json();

    const content = document.getElementById("order-detail-content");
    const badge = document.getElementById("od-status-badge");
    if (badge) {
      badge.innerText = order.orderStatus;
      badge.className = `order-badge ${order.orderStatus}`;
    }

    content.innerHTML = `
      <div style="font-size:0.85rem; color:#6b7280; margin-bottom:1rem;">
        Order ID: <strong>#${order.orderNumber}</strong> | Date: ${new Date(order.createdAt).toLocaleString('en-IN')}
      </div>

      <h5 style="font-size:0.95rem; margin-bottom:0.6rem;">Items Ordered (${order.items.length})</h5>
      <div>
        ${order.items.map(item => `
          <div class="od-item-row">
            <img src="${item.productImage}" class="od-item-img">
            <div class="od-item-info">
              <h5>${item.productName}</h5>
              <p>Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</p>
            </div>
            <strong>₹${Number(item.price * item.quantity).toLocaleString('en-IN')}</strong>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:1.2rem; background:#f9fafb; padding:1rem; border-radius:8px;">
        <h5 style="font-size:0.9rem; margin-bottom:0.4rem;">Delivery Address</h5>
        <p style="font-size:0.85rem; color:#374151;">
          <strong>${order.shippingAddress.fullName}</strong><br>
          ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? ', ' + order.shippingAddress.addressLine2 : ''}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>
      </div>

      <div style="margin-top:1rem; font-size:0.9rem; line-height:1.6;">
        <div style="display:flex; justify-content:space-between;"><span>Subtotal:</span> <span>₹${Number(order.subtotal).toLocaleString('en-IN')}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Shipping:</span> <span>${order.shippingAmount === 0 ? 'FREE' : '₹' + order.shippingAmount}</span></div>
        <hr style="margin:0.5rem 0; border:none; border-top:1px solid #e5e7eb;">
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.05rem;">
          <span>Total Paid:</span> <span style="color:#10b981;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;

    if (orderDetailOverlay) orderDetailOverlay.classList.add("active");
    if (orderDetailModal) orderDetailModal.classList.add("active");

  } catch (err) {
    alert("Error fetching order details");
  }
}

function closeOrderDetailsModal() {
  if (orderDetailOverlay) orderDetailOverlay.classList.remove("active");
  if (orderDetailModal) orderDetailModal.classList.remove("active");
}

// ==================================
// CHECKOUT & SERVER ORDER CREATION
// ==================================

async function checkout() {
  if (!currentUser) {
    alert("Please login to your account to proceed with checkout.");
    toggleAuthModal(true);
    return;
  }

  if (cart.length === 0) {
    alert("Your shopping cart is currently empty!");
    return;
  }

  // Ensure customer has at least 1 address
  try {
    const res = await fetch(`${API_BASE}/addresses`, {
      headers: { "Authorization": `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      userAddresses = await res.json();
    }
  } catch (err) {}

  if (userAddresses.length === 0) {
    alert("Please add a delivery address in My Account > Addresses before placing an order.");
    openAccountModal();
    return;
  }

  const defaultAddr = userAddresses.find(a => a.isDefault) || userAddresses[0];
  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  currentOrder = {
    items: cart,
    shippingAddress: defaultAddr,
    amount: totalCost
  };

  toggleCart(false);
  openPaymentModal(totalCost);
}

function openPaymentModal(amount) {
  const formatted = `₹${amount.toLocaleString('en-IN')}`;
  if (payModalTotal) payModalTotal.innerText = formatted;
  if (payBtnAmount) payBtnAmount.innerText = formatted;
  if (paymentOverlay) paymentOverlay.classList.add("active");
  if (paymentModal) paymentModal.classList.add("active");
}

function closePaymentModal() {
  if (paymentOverlay) paymentOverlay.classList.remove("active");
  if (paymentModal) paymentModal.classList.remove("active");
}

function closeReceiptModal() {
  if (receiptOverlay) receiptOverlay.classList.remove("active");
  if (receiptModal) receiptModal.classList.remove("active");
}

async function submitCustomPayment() {
  const payBtn = document.getElementById("pay-now-btn");
  const originalHtml = payBtn.innerHTML;

  try {
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;
    payBtn.disabled = true;

    const paymentId = `pay_aura_${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 1. Verify Payment on Backend
    const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: `order_${Date.now()}`,
        razorpay_payment_id: paymentId,
        razorpay_signature: "mock_sig_verified"
      })
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      alert("Payment verification failed");
      payBtn.innerHTML = originalHtml;
      payBtn.disabled = false;
      return;
    }

    // 2. Create Order in MongoDB with Server Price Calculation & Snapshots
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        items: cart,
        shippingAddress: currentOrder.shippingAddress,
        paymentMethod: activePaymentMethod,
        paymentId: paymentId,
        paymentStatus: "paid"
      })
    });

    const orderData = await orderRes.json();
    payBtn.innerHTML = originalHtml;
    payBtn.disabled = false;

    if (orderRes.ok && orderData.order) {
      closePaymentModal();

      const createdOrder = orderData.order;
      document.getElementById("rec-order-id").innerText = `#${createdOrder.orderNumber}`;
      document.getElementById("rec-pay-id").innerText = createdOrder.paymentId;
      document.getElementById("rec-method").innerText = createdOrder.paymentMethod;
      document.getElementById("rec-date").innerText = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      document.getElementById("rec-amount").innerText = `₹${Number(createdOrder.totalAmount).toLocaleString('en-IN')}`;

      if (receiptOverlay) receiptOverlay.classList.add("active");
      if (receiptModal) receiptModal.classList.add("active");

      // Reset cart
      cart = [];
      updateCart();
    } else {
      alert("Error saving order: " + (orderData.msg || "Server error"));
    }

  } catch (err) {
    payBtn.innerHTML = originalHtml;
    payBtn.disabled = false;
    console.error("Order creation error:", err);
    alert("Error placing order. Please try again.");
  }
}

// Global Event Listeners
if (cartBtn) cartBtn.addEventListener("click", () => toggleCart(true));
if (closeCartBtn) closeCartBtn.addEventListener("click", () => toggleCart(false));
if (cartOverlay) cartOverlay.addEventListener("click", () => toggleCart(false));

if (closePaymentBtn) closePaymentBtn.addEventListener("click", () => closePaymentModal());
if (paymentOverlay) paymentOverlay.addEventListener("click", () => closePaymentModal());

if (authBtn) authBtn.addEventListener("click", () => toggleAuthModal(true));
if (closeAuth) closeAuth.addEventListener("click", () => toggleAuthModal(false));
if (authOverlay) authOverlay.addEventListener("click", () => toggleAuthModal(false));

if (tabLogin) tabLogin.addEventListener("click", () => switchAuthTab("login"));
if (tabRegister) tabRegister.addEventListener("click", () => switchAuthTab("register"));
if (tabOtp) tabOtp.addEventListener("click", () => switchAuthTab("otp"));

if (closeAccount) closeAccount.addEventListener("click", () => closeAccountModal());
if (accountOverlay) accountOverlay.addEventListener("click", () => closeAccountModal());

if (closeOrderDetail) closeOrderDetail.addEventListener("click", () => closeOrderDetailsModal());
if (orderDetailOverlay) orderDetailOverlay.addEventListener("click", () => closeOrderDetailsModal());

// Payment Method Tabs Logic
const payTabs = document.querySelectorAll(".pay-tab");
const payContents = document.querySelectorAll(".pay-content");

payTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and contents
    payTabs.forEach(t => t.classList.remove("active"));
    payContents.forEach(c => c.classList.remove("active"));
    
    // Add active class to clicked tab
    tab.classList.add("active");
    
    // Show corresponding content
    const tabName = tab.getAttribute("data-tab");
    const targetContent = document.getElementById(`pay-tab-${tabName}`);
    if (targetContent) targetContent.classList.add("active");
    
    // Update activePaymentMethod
    if (tabName === "upi") activePaymentMethod = "UPI Instant";
    else if (tabName === "card") activePaymentMethod = "Card";
    else if (tabName === "netbanking") activePaymentMethod = "NetBanking";
    else if (tabName === "cod") activePaymentMethod = "Cash on Delivery";
  });
});

function selectUpiApp(appName) {
  activePaymentMethod = `UPI - ${appName}`;
  // Visual feedback for selected app
  document.querySelectorAll(".upi-app-btn").forEach(btn => btn.style.border = "1px solid #e2e8f0");
  event.currentTarget.style.border = "2px solid #10b981";
}

// Initialize Page
fetchProducts();
checkAuth();