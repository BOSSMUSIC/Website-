// =========================================================
// script.js
// Handles: product rendering, cart (localStorage),
// enquiry/contact/order form submissions to backend API
// =========================================================

// ---------------------------------------------------
// PRODUCT DATA
// (In a real app this would come from a database/API)
// ---------------------------------------------------
const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    description: "Over-ear headphones with noise cancellation and 20-hour battery life."
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    description: "Track your steps, heart rate, and sleep with this sleek smart watch."
  },
  {
    id: 3,
    name: "Men's Casual Jacket",
    price: 1499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
    description: "Stylish and comfortable jacket, perfect for everyday wear."
  },
  {
    id: 4,
    name: "Women's Handbag",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
    description: "Elegant handbag with multiple compartments and durable strap."
  },
  {
    id: 5,
    name: "Ceramic Coffee Mug Set",
    price: 699,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80",
    description: "Set of 4 elegant ceramic mugs, microwave and dishwasher safe."
  },
  {
    id: 6,
    name: "LED Desk Lamp",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
    description: "Adjustable brightness LED lamp with USB charging port."
  },
  {
    id: 7,
    name: "Leather Wallet",
    price: 599,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80",
    description: "Genuine leather wallet with multiple card slots and coin pocket."
  },
  {
    id: 8,
    name: "Sunglasses - Classic Aviator",
    price: 799,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
    description: "UV-protected classic aviator sunglasses for men and women."
  }
];

// ---------------------------------------------------
// BACKEND API BASE URL
// Since server.js serves the frontend files too,
// relative paths work when run via "npm start".
// ---------------------------------------------------
const API_BASE = "";

// ---------------------------------------------------
// CART HELPERS (localStorage based)
// ---------------------------------------------------
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart!`);
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach((el) => {
    el.textContent = totalItems;
  });
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    return removeFromCart(id);
  }
  saveCart(cart);
  renderCart();
}

// ---------------------------------------------------
// SIMPLE TOAST NOTIFICATION
// ---------------------------------------------------
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.right = "24px";
    toast.style.background = "#1a1a2e";
    toast.style.color = "#fff";
    toast.style.padding = "14px 22px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
    toast.style.zIndex = "2000";
    toast.style.fontSize = "0.9rem";
    toast.style.transition = "opacity 0.3s ease";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

// ---------------------------------------------------
// RENDER PRODUCT CARDS
// ---------------------------------------------------
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-img" />
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="product-desc">${product.description}</p>
      <div class="product-price">₹${product.price}</div>
      <div class="product-actions">
        <button class="btn" data-action="add" data-id="${product.id}">Add to Cart</button>
        <button class="btn-enquire" data-action="buy" data-id="${product.id}">Buy Now</button>
      </div>
      <div class="product-actions" style="margin-top:10px;">
        <button class="btn-enquire" data-action="enquire" data-id="${product.id}" style="width:100%;">Enquire</button>
      </div>
    </div>
  `;
  return card;
}

function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

// Event delegation for product action buttons (Add to Cart / Buy Now / Enquire)
function bindProductActions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    if (btn.dataset.action === "add") {
      addToCart(product);
    } else if (btn.dataset.action === "buy" || btn.dataset.action === "enquire") {
      openEnquiryModal(product, btn.dataset.action);
    }
  });
}

// ---------------------------------------------------
// ENQUIRY / BUY NOW MODAL
// ---------------------------------------------------
function openEnquiryModal(product, mode) {
  const modal = document.getElementById("enquiryModal");
  if (!modal) return;

  const titleEl = modal.querySelector("h2");
  const subtitleEl = modal.querySelector(".modal-subtitle");
  const productInput = document.getElementById("enq-product");
  const msgEl = document.getElementById("enquiryMsg");

  if (mode === "buy") {
    titleEl.textContent = "Buy Now";
    subtitleEl.textContent = "Enter your details to purchase this product. We will contact you to confirm your order.";
  } else {
    titleEl.textContent = "Product Enquiry";
    subtitleEl.textContent = "Fill in your details and we'll get back to you about this product.";
  }

  productInput.value = product.name;
  msgEl.style.display = "none";
  msgEl.className = "form-msg";
  msgEl.textContent = "";

  modal.classList.add("active");
}

function closeEnquiryModal() {
  const modal = document.getElementById("enquiryModal");
  if (modal) modal.classList.remove("active");
}

// ---------------------------------------------------
// GENERIC FORM SUBMIT HANDLER
// Sends JSON to backend, shows success/error message
// ---------------------------------------------------
async function handleFormSubmit(form, endpoint, msgElId, payloadExtra = {}) {
  const msgEl = document.getElementById(msgElId);
  const submitBtn = form.querySelector('button[type="submit"]');

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => (data[key] = value));
  Object.assign(data, payloadExtra);

  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      msgEl.className = "form-msg success";
      msgEl.textContent = result.message || "Submitted successfully!";
      form.reset();
      return true;
    } else {
      msgEl.className = "form-msg error";
      msgEl.textContent = result.error || "Something went wrong. Please try again.";
      return false;
    }
  } catch (err) {
    console.error(err);
    msgEl.className = "form-msg error";
    msgEl.textContent = "Could not connect to the server. Please make sure the backend is running.";
    return false;
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// ---------------------------------------------------
// RENDER CART PAGE
// ---------------------------------------------------
function renderCart() {
  const wrapper = document.getElementById("cartWrapper");
  const orderSection = document.getElementById("orderSection");
  if (!wrapper) return;

  const cart = getCart();

  if (cart.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-cart">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="products.html" class="btn">Browse Products</a>
      </div>
    `;
    if (orderSection) orderSection.style.display = "none";
    return;
  }

  if (orderSection) orderSection.style.display = "block";

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const rows = cart
    .map(
      (item) => `
      <tr>
        <td>
          <div class="cart-item-name">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
            <span>${item.name}</span>
          </div>
        </td>
        <td>₹${item.price}</td>
        <td>
          <div class="qty-control">
            <button data-action="dec" data-id="${item.id}">−</button>
            <span>${item.quantity}</span>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
        <td><button class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button></td>
      </tr>`
    )
    .join("");

  wrapper.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>₹${shipping.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>₹${total.toFixed(2)}</span>
      </div>
    </div>
  `;

  // Bind quantity/remove buttons
  wrapper.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === "inc") changeQuantity(id, 1);
    if (btn.dataset.action === "dec") changeQuantity(id, -1);
    if (btn.dataset.action === "remove") removeFromCart(id);
  });
}

// ---------------------------------------------------
// MOBILE NAV TOGGLE
// ---------------------------------------------------
function bindNavToggle() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });
}

// ---------------------------------------------------
// INITIALIZE PAGE
// ---------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Cart badge count on every page
  updateCartCount();

  // Mobile nav
  bindNavToggle();

  // HOME PAGE: featured products (first 4)
  if (document.getElementById("featuredProducts")) {
    renderProductGrid("featuredProducts", PRODUCTS.slice(0, 4));
    bindProductActions("featuredProducts");
  }

  // PRODUCTS PAGE
  if (document.getElementById("allProducts")) {
    renderProductGrid("allProducts", PRODUCTS);
    bindProductActions("allProducts");

    // Category filter
    const filterBar = document.getElementById("filterBar");
    if (filterBar) {
      filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;

        filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.dataset.category;
        const filtered =
          category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

        renderProductGrid("allProducts", filtered);
      });
    }
  }

  // CART PAGE
  if (document.getElementById("cartWrapper")) {
    renderCart();
  }

  // ENQUIRY MODAL (Home & Products pages)
  const modal = document.getElementById("enquiryModal");
  if (modal) {
    document.getElementById("modalClose").addEventListener("click", closeEnquiryModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeEnquiryModal();
    });

    const enquiryForm = document.getElementById("enquiryForm");
    enquiryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const success = await handleFormSubmit(enquiryForm, "/api/enquiry", "enquiryMsg");
      if (success) {
        setTimeout(() => {
          closeEnquiryModal();
        }, 1800);
      }
    });
  }

  // CONTACT PAGE
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit(contactForm, "/api/contact", "contactMsg");
    });
  }

  // ORDER FORM (Cart page)
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const cart = getCart();
      if (cart.length === 0) {
        const msgEl = document.getElementById("orderMsg");
        msgEl.className = "form-msg error";
        msgEl.textContent = "Your cart is empty. Please add items before placing an order.";
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = 50;
      const total = (subtotal + shipping).toFixed(2);

      const items = cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const success = await handleFormSubmit(orderForm, "/api/order", "orderMsg", {
        items,
        total
      });

      if (success) {
        // Clear cart after successful order
        localStorage.removeItem("cart");
        updateCartCount();
        setTimeout(() => {
          renderCart();
        }, 1500);
      }
    });
  }
});

