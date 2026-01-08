// Food data
const foodData = [
    {
        id: 1,
        name: "Margherita Pizza",
        price: 1000.99,
        category: "pizza",
        image: "img/food/p1.jpg",
        description: "Classic pizza with tomato sauce, mozzarella, and basil"
    },
    {
        id: 2,
        name: "Pepperoni Pizza",
        price: 850.00,
        category: "pizza",
        image: "img/category/pizza.jpg",
        description: "Pizza topped with pepperoni and mozzarella cheese"
    },
    {
        id: 3,
        name: "Cheeseburger",
        price: 450.50,
        category: "burger",
        image: "img/food/b1.jpg",
        description: "Juicy beef burger with cheese, lettuce, and tomato"
    },
    {
        id: 4,
        name: "Chicken Burger",
        price: 550.70,
        category: "burger",
        image: "img/category/burger.jpg",
        description: "Grilled chicken breast with special sauce"
    },
    {
        id: 5,
        name: "Club Sandwich",
        price: 800.00,
        category: "sandwich",
        image: "img/food/s1.jpg",
        description: "Triple-decker sandwich with turkey, bacon, and vegetables"
    },
    {
        id: 6,
        name: "Veggie Sandwich",
        price: 500.00,
        category: "sandwich",
        image: "img/category/sandwich.jpg",
        description: "Fresh vegetables with hummus and sprouts"
    }
];

// Cart array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Resolve asset path so images load correctly from pages inside `htmlfiles/`
function resolveAssetPath(assetPath) {
    try {
        if (window.location && window.location.pathname && window.location.pathname.includes('/htmlfiles/')) {
            return '..\/' + assetPath;
        }
    } catch (e) {
        // fallback to original path
    }
    return assetPath;
}

// DOM Elements
const cartLink = document.getElementById('cartLink');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const billModal = document.getElementById('billModal');
const billPreview = document.getElementById('billPreview');
const closeBill = document.getElementById('closeBill');
const cartCount = document.querySelector('.cart-count');
const featuredFoods = document.getElementById('featuredFoods');

cartLink?.addEventListener("click", () => {
    cartModal.style.display = "flex";
    renderCart();
});

closeCart?.addEventListener("click", () => {
    cartModal.style.display = "none";
});


// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromLocalStorage();
    displayFeaturedFoods();
    renderCart();
});

// Display featured foods
function displayFeaturedFoods() {
    featuredFoods.innerHTML = '';
    
    // Get first 3 items as featured
    const featuredItems = foodData.slice(0, 3);
    
    featuredItems.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${resolveAssetPath(food.image)}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">$${food.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        featuredFoods.appendChild(foodCard);
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-id'));
            addToCart(foodId);
        });
    });
}

// Add item to cart
function addToCart(foodId) {
    const food = foodData.find(item => item.id === foodId);
    if (food) {
        const existingItem = cart.find(item => item.id === foodId);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: food.id,
                name: food.name,
                price: food.price,
                image: food.image,
                qty: 1
            });
        }
        saveCartToLocalStorage();
        renderCart();
        alert(`${food.name} added to cart!`);
    }
} 

// Remove item from cart
function removeFromCart(foodId) {
    cart = cart.filter(item => item.id !== foodId);
    saveCartToLocalStorage();
    renderCart();
}

// Update item quantity
function updateQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(foodId);
    } else {
        saveCartToLocalStorage();
        renderCart();
    }
}




// ================= RENDER CART =================
function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + (item.qty || 0), 0);
    if (cartCount) cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart-message">Your cart is empty</p>`;
        cartTotal.innerText = '0.00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.qty} = $${itemTotal.toFixed(2)}</p>
                </div>
                <div class="item-controls">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span class="qty">${item.qty}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}">❌</button>
                </div>
            </div>
        `;
    });

    cartTotal.innerText = total.toFixed(2);

    // Attach event listeners for quantity and remove buttons
    cartItems.querySelectorAll('.qty-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-id'));
            updateQuantity(foodId, -1);
        });
    });

    cartItems.querySelectorAll('.qty-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-id'));
            updateQuantity(foodId, 1);
        });
    });

    cartItems.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-id'));
            removeFromCart(foodId);
        });
    });
} 

// Open cart modal
function openCart() {
    cartModal.style.display = 'flex';
    renderCart();
} 

// Close cart modal
function closeCartModal() {
    cartModal.style.display = 'none';
}

// ================= CHECKOUT =================
checkoutBtn?.addEventListener("click", () => {
    cartModal.style.display = "none";
    showBillPreview();
});

// ================= BILL PREVIEW =================
function showBillPreview() {
    let billText = "🧾 FOODIE DELIGHT - BILL\n\n";
    let grandTotal = 0;

    cart.forEach(item => {
        let sub = item.price * item.qty;
        grandTotal += sub;
        billText += `${item.name}  x${item.qty}  = $${sub.toFixed(2)}\n`;
    });

    billText += `\n------------------------\n`;
    billText += `TOTAL: $${grandTotal.toFixed(2)}\n`;
    billText += `Thank you for ordering ❤️`;

    billPreview.textContent = billText;
    billModal.style.display = "flex";
}

closeBill?.addEventListener("click", () => {
    billModal.style.display = "none";
});

// ================= CONFIRM ORDER =================
document.getElementById("confirmOrder")?.addEventListener("click", () => {
    // Save order to localStorage orders array
    const orderItems = cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }));
    const totalAmount = parseFloat(cartTotal.innerText) || orderItems.reduce((s, it) => s + it.price * it.qty, 0);
    const order = { items: orderItems, total: totalAmount, timestamp: new Date().toISOString() };
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    alert("🎉 Order Confirmed!");
    cart = [];
    saveCartToLocalStorage();
    billModal.style.display = "none";
    renderCart();
});

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Menu page functions
function displayMenuFoods(category = 'all') {
    const menuFoods = document.getElementById('menuFoods');
    if (!menuFoods) return;
    
    menuFoods.innerHTML = '';
    
    const filteredFoods = category === 'all' 
        ? foodData 
        : foodData.filter(food => food.category === category);
    
    filteredFoods.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${resolveAssetPath(food.image)}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">$${food.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        menuFoods.appendChild(foodCard);
    });
    
    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-id'));
            addToCart(foodId);
        });
    });
}

// Filter functionality for menu page
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category and display foods
            const category = this.getAttribute('data-category');
            displayMenuFoods(category);
        });
    });
}

// Initialize menu page if on menu page
if (document.querySelector('.menu-page')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadCartFromLocalStorage();
        renderCart();
        displayMenuFoods();
        setupFilterButtons();
        
        // Event Listeners
        const cartLink = document.getElementById('cartLink');
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                openCart();
            });
        }
        closeCart?.addEventListener('click', closeCartModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === cartModal) {
                closeCartModal();
            }
        });
    });
}

// Initialize about page if on about page
if (document.querySelector('.about-page')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadCartFromLocalStorage();
        renderCart();
        
        // Event Listeners
        const cartLink = document.getElementById('cartLink');
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                openCart();
            });
        }
        closeCart?.addEventListener('click', closeCartModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === cartModal) {
                closeCartModal();
            }
        });
    });
}

// Initialize contact page if on contact page
if (document.querySelector('.contact-page')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadCartFromLocalStorage();
        renderCart();
        
        // Event Listeners
        const cartLink = document.getElementById('cartLink');
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                openCart();
            });
        }
        closeCart?.addEventListener('click', closeCartModal);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === cartModal) {
                closeCartModal();
            }
        });
        
        // Form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form data
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;
                
                // Create contact message object
                const contactMessage = {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: new Date().toISOString()
                };
                
                // Save to localStorage
                const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                messages.push(contactMessage);
                localStorage.setItem('contactMessages', JSON.stringify(messages));
                
                // Reset form
                contactForm.reset();
                
                // Show confirmation
                alert('Thank you for your message! We will get back to you soon.');
            });
        }
    });
}