let cart = [];

// ---------------- USER FUNCTIONS ----------------
function loadUserMenu() {
  let menu = JSON.parse(localStorage.getItem("menu")) || [];
  let menuList = document.getElementById("menuList");
  if (!menuList) return;

  menuList.innerHTML = "";
  menu.forEach((dish, index) => {
    menuList.innerHTML += `
      <div class="menu-item">
        <img src="${dish.image}" alt="${dish.name}">
        <p><b>${dish.name}</b><br>₹${dish.price}</p>
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });

  // initialize cart count
  document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
}

function searchMenu() {
  let query = document.getElementById("searchBox").value.toLowerCase();
  let menu = JSON.parse(localStorage.getItem("menu")) || [];
  let filtered = menu.filter(dish => dish.name.toLowerCase().includes(query));
  let menuList = document.getElementById("menuList");
  menuList.innerHTML = "";
  filtered.forEach((dish, index) => {
    menuList.innerHTML += `
      <div class="menu-item">
        <img src="${dish.image}" alt="${dish.name}">
        <p><b>${dish.name}</b><br>₹${dish.price}</p>
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });
}

function addToCart(index) {
  let menu = JSON.parse(localStorage.getItem("menu")) || [];
  let dish = menu[index];
  let existing = cart.find(item => item.name === dish.name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...dish, qty: 1 });
  }
  renderCart();
  document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
}

function renderCart() {
  let cartDiv = document.getElementById("cart");
  if (!cartDiv) return;
  let total = 0;
  cartDiv.innerHTML = "";
  cart.forEach((item, idx) => {
    let itemTotal = item.qty * item.price;
    total += itemTotal;
    cartDiv.innerHTML += `
      <div class="cart-item">
        ${item.name} - ₹${item.price} x ${item.qty} = ₹${itemTotal}
        <button onclick="changeQty(${idx}, 1)">+</button>
        <button onclick="changeQty(${idx}, -1)">-</button>
      </div>
    `;
  });
  document.getElementById("cartTotal").innerText = total;
  document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
}

function changeQty(idx, change) {
  cart[idx].qty += change;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  renderCart();
  document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

function placeOrder() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  let orderId = "ORD" + Math.floor(Math.random() * 10000);
  let order = {
    id: orderId,
    items: cart,
    total: Number(document.getElementById("cartTotal").innerText) || 0,
    status: "Pending",
    otp: Math.floor(1000 + Math.random() * 9000)
  };
  // store pending checkout separately to allow selecting payment method on checkout page
  localStorage.setItem("pendingCheckout", JSON.stringify(order));
  cart = [];
  renderCart();
  toggleCart();
  // redirect to checkout page
  window.location.href = "checkout.html";
}

// ---------------- CHECKOUT ----------------
function loadCheckout() {
  let order = JSON.parse(localStorage.getItem("pendingCheckout"));
  if (!order) {
    document.getElementById("checkoutItems").innerText = "No items to checkout.";
    return;
  }
  let itemsDiv = document.getElementById("checkoutItems");
  let total = 0;
  itemsDiv.innerHTML = "";
  order.items.forEach(item => {
    let itemTotal = item.qty * item.price;
    total += itemTotal;
    itemsDiv.innerHTML += `
      <div class="cart-item">
        ${item.name} - ₹${item.price} x ${item.qty} = ₹${itemTotal}
      </div>
    `;
  });
  document.getElementById("checkoutTotal").innerText = total;
}

function confirmCheckout() {
  let order = JSON.parse(localStorage.getItem("pendingCheckout"));
  if (!order) {
    alert("No order found!");
    return;
  }
  let payment = document.querySelector('input[name="payment"]:checked').value;
  order.payment = payment;
  order.status = "Confirmed";
  // move to currentOrder so Admin/Delivery can see it
  localStorage.setItem("currentOrder", JSON.stringify(order));
  localStorage.removeItem("pendingCheckout");
  alert("Order Confirmed with " + payment + " ✅\nOrder ID: " + order.id + "\nOTP: " + order.otp);
  window.location.href = "index.html";
}

// ---------------- ADMIN FUNCTIONS ----------------
function loadAdminData() {
  let order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) {
    document.getElementById("adminOrderId").innerText = "-";
    document.getElementById("adminCustomer").innerText = "-";
    document.getElementById("adminStatus").innerText = "No active orders";
    document.getElementById("adminPayment").innerText = "-";
    return;
  }
  document.getElementById("adminOrderId").innerText = order.id;
  document.getElementById("adminCustomer").innerText = "User1";
  document.getElementById("adminStatus").innerText = order.status;
  document.getElementById("adminPayment").innerText = order.payment || "-";
}

function markDelivered() {
  let order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) {
    alert("No current order");
    return;
  }
  order.status = "Delivered (By Admin)";
  localStorage.setItem("currentOrder", JSON.stringify(order));
  loadAdminData();
  alert("Order marked as delivered!");
}

function resolveDispute() {
  alert("Dispute resolved by admin.");
}

function addDish() {
  let name = document.getElementById("dishName").value;
  let price = Number(document.getElementById("dishPrice").value);
  let imageInput = document.getElementById("dishImage");
  if (!name || !price || !imageInput.files[0]) {
    alert("Please enter all dish details!");
    return;
  }
  let reader = new FileReader();
  reader.onload = function(e) {
    let menu = JSON.parse(localStorage.getItem("menu")) || [];
    menu.push({ name, price, image: e.target.result });
    localStorage.setItem("menu", JSON.stringify(menu));
    loadMenu();
    document.getElementById('dishName').value='';
    document.getElementById('dishPrice').value='';
    document.getElementById('dishImage').value='';
    alert('Dish added');
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function loadMenu() {
  let menu = JSON.parse(localStorage.getItem("menu")) || [];
  let menuList = document.getElementById("menuList");
  if (!menuList) return;
  menuList.innerHTML = "";
  menu.forEach((dish, index) => {
    menuList.innerHTML += `
      <div class="menu-item">
        <img src="${dish.image}" alt="${dish.name}">
        <p><b>${dish.name}</b> - ₹${dish.price}</p>
        <button onclick="deleteDish(${index})">Delete</button>
      </div>
    `;
  });
}

// ---------------- DELIVERY FUNCTIONS ----------------
function loadDeliveryData() {
  let order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) {
    document.getElementById("deliveryOrderId").innerText = "-";
    document.getElementById("deliveryCustomer").innerText = "-";
    document.getElementById("deliveryPayment").innerText = "-";
    return;
  }
  document.getElementById("deliveryOrderId").innerText = order.id;
  document.getElementById("deliveryCustomer").innerText = "User1";
  document.getElementById("deliveryPayment").innerText = order.payment || "-";
}

function confirmDelivery() {
  let order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) {
    alert("No current order");
    return;
  }
  let otpEntered = document.getElementById("deliveryOtp").value;
  if (otpEntered == order.otp) {
    order.status = "Delivered ✅ (By Partner)";
    localStorage.setItem("currentOrder", JSON.stringify(order));
    alert("Delivery confirmed!");
  } else {
    alert("Incorrect OTP!");
  }
}

function deleteDish(index) {
  let menu = JSON.parse(localStorage.getItem("menu")) || [];
  menu.splice(index, 1);
  localStorage.setItem("menu", JSON.stringify(menu));
  loadMenu();
}
