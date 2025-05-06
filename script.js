document.addEventListener("DOMContentLoaded", () => {
    // DOM Selectors - Add null checks to prevent errors on pages where elements don't exist
    let listProductHTML = document.querySelector(".listProduct");
    let serviceListHTML = document.querySelector(".serviceList");
    let listCartHTML = document.querySelector(".cart-content");
    let iconCartSpan = document.querySelector(".cart-count");
    let contactForm = document.getElementById("contact-form");
    let subForm = document.getElementById("subform");
    // Checkout summary selectors
    let checkoutSummaryBox = document.querySelector(".checkout-summary-box");
    let temporaryAmountSpan = checkoutSummaryBox?.querySelector(".d-flex:nth-child(2) span:last-child");
    let totalAmountSpan = checkoutSummaryBox?.querySelector(".fw-bold span:last-child");

    // Data
    let listProducts = [];
    let serviceList = [];
    let carts = [];

    // === CART FUNCTIONS - These should run on every page ===
    
    // Utility Functions
    const saveCartToSession = () => {
        sessionStorage.setItem('cart', JSON.stringify(carts));
        updateCartCount();
        updateCheckoutSummary();
    };

    const loadCartFromSession = () => {
        const savedCart = sessionStorage.getItem('cart');
        if (savedCart) {
            carts = JSON.parse(savedCart);
        }
        updateCartCount();
        updateCheckoutSummary();
    };

    const updateCartCount = () => {
        // Add check to make sure iconCartSpan exists before updating it
        if (iconCartSpan) {
            let total = carts.reduce((sum, item) => sum + item.quantity, 0);
            iconCartSpan.textContent = total;
        }
    };
    
    const calculateCartTotal = () => {
        // Calculate total price of all items in cart
        let total = 0;
        carts.forEach(cart => {
            const product = listProducts.find(p => p.id == cart.product_id);
            if (product) {
                // Extract price as a number (remove currency symbol and parse)
                const priceStr = product.price.replace(/[^0-9.]/g, '');
                const price = parseFloat(priceStr);
                if (!isNaN(price)) {
                    total += price * cart.quantity;
                }
            }
        });
        return total.toFixed(2); // Format to 2 decimal places
    };
    
    const updateCheckoutSummary = () => {
        // Update the checkout summary with the new total
        if (checkoutSummaryBox && temporaryAmountSpan && totalAmountSpan) {
            const total = calculateCartTotal();
            temporaryAmountSpan.textContent = `${total}`;
            totalAmountSpan.textContent = `${total}`;
        }
    };

    // Function to add item to cart
    const addToCart = (product_id) => {
        // Check if product exists in products list
        const product = listProducts.find(p => p.id == product_id);
        if (!product) {
            console.error('Product not found');
            return;
        }
        
        // Check if product is already in cart
        const existingItem = carts.find(item => item.product_id == product_id);
        
        if (existingItem) {
            // If already in cart, increase quantity
            existingItem.quantity += 1;
        } else {
            // If not in cart, add new item
            const newItem = {
                product_id: product_id,
                quantity: 1
            };
            carts.push(newItem);
        }
        
        // Update session storage and UI
        saveCartToSession();
        
        // Show confirmation message
        const productName = product.name;
        const confirmationMessage = document.createElement('div');
        confirmationMessage.classList.add('alert', 'alert-success', 'position-fixed', 'top-0', 'end-0', 'm-3');
        confirmationMessage.style.zIndex = '9999';
        confirmationMessage.innerHTML = `
            <strong>Success!</strong> ${productName} added to cart.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(confirmationMessage);
        
        // Remove confirmation after 3 seconds
        setTimeout(() => {
            confirmationMessage.remove();
        }, 3000);
        
        // Also allow manual close
        confirmationMessage.querySelector('.btn-close').addEventListener('click', () => {
            confirmationMessage.remove();
        });
    };

    // Function to adjust cart section height based on content
    const adjustCartSectionHeight = () => {
        const cartSection = document.querySelector('.Shopping-cart-section');
        if (cartSection) {
            // Let the content determine the height
            cartSection.style.height = 'auto';
            
            // Get the current height of the content
            const contentHeight = document.querySelector('.checkout-container').offsetHeight;
            const windowHeight = window.innerHeight;
            
            // If content is smaller than window, set min-height to fill the screen
            if (contentHeight < windowHeight * 0.7) {
                cartSection.style.minHeight = '80vh';
            } else {
                // Otherwise, let it grow with the content
                cartSection.style.minHeight = 'auto';
            }
        }
    };
    
    // Function to remove item from cart
    const removeFromCart = (product_id) => {
        carts = carts.filter(item => item.product_id != product_id);
        saveCartToSession();
        addToCartHTML();
        updateCheckoutSummary();
        adjustCartSectionHeight();
    };
    
    // Function to update cart item quantity
    const updateCartItemQuantity = (product_id, quantity) => {
        const index = carts.findIndex(item => item.product_id == product_id);
        if (index !== -1) {
            carts[index].quantity = quantity;
            saveCartToSession();
            updateCheckoutSummary();
        }
    };
    
    // === PRODUCT PAGE SPECIFIC FUNCTIONS ===

    // Render Functions - Only execute if the relevant containers exist
    const addProductsToHTML = () => {
        if (!listProductHTML) return;
        
        listProductHTML.innerHTML = '';
        listProducts.forEach(product => {
            const newProduct = document.createElement('div');
            newProduct.classList.add('col-6', 'col-md-6', 'col-lg-4', 'product-card');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" />
                    <div class="card-body">
                        <h5 class="card-title text-center">${product.name}</h5>
                        <p class="card-text">${product.price}</p>
                        <button type="button" class="addCart btn btn-success">Add To Cart</button>
                    </div>
                </div>
            `;
            listProductHTML.appendChild(newProduct);
        });
    };

    const addServicesToHTML = () => {
        if (!serviceListHTML) return;
        
        serviceListHTML.innerHTML = '';
        serviceList.forEach(service => {
            const newService = document.createElement('div');
            newService.classList.add('col-6', 'col-md-6', 'col-lg-4', 'service-card');
            newService.dataset.id = service.id;
            newService.innerHTML = `
                <div class="card h-100">
                    <img src="${service.image}" class="card-img-top" alt="${service.name}" />
                    <div class="card-body">
                        <h5 class="card-title text-center">${service.name}</h5>
                        <p class="card-text">${service.description}</p>
                        <button type="button" class="btn btn-primary">Book Now</button>
                    </div>
                </div>
            `;
            serviceListHTML.appendChild(newService);
        });
    };

    const addToCartHTML = () => {
        if (!listCartHTML) return;
        
        listCartHTML.innerHTML = '';
        
        // Check if cart is empty
        if (carts.length === 0) {
            const emptyCartMessage = document.createElement('div');
            emptyCartMessage.classList.add('text-center', 'p-5', 'my-4');
            emptyCartMessage.innerHTML = `
                <i class="bi bi-cart-x" style="font-size: 3rem;"></i>
                <h4 class="mt-3">Your cart is empty</h4>
                <p class="text-muted">Add some products to your cart to see them here</p>
                <a href="Gallery.html" class="btn btn-primary mt-3">Continue Shopping</a>
            `;
            listCartHTML.appendChild(emptyCartMessage);
        } else {
            // Add each cart item to the HTML
            carts.forEach(cart => {
                const product = listProducts.find(p => p.id == cart.product_id);
                if (!product) return; // Skip if product not found
                
                const newCart = document.createElement('div');
                newCart.classList.add('card', 'mb-3', 'p-3', 'cart-item', 'shadow-sm', 'rounded', 'list', 'listCart');
                newCart.innerHTML = `
                    <div class="row g-3 align-items-center">
                        <div class="col-md-3">
                            <img src="${product.image}" class="img-fluid rounded" alt="Item">
                        </div>
                        <div class="col-md-6">
                            <h5 class="fw-bold mb-1">${product.name}</h5>
                            <p class="mb-0"><strong>Size:</strong> M</p>
                            <p class="mb-0"><strong>Color:</strong> Gray</p>
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-danger me-2" data-product-id="${product.id}">Remove</button>
                                <button class="btn btn-sm btn-outline-secondary">Move to wish list</button>
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <input type="number" class="form-control mb-2 quantity-input" 
                                    data-product-id="${product.id}"
                                    value="${cart.quantity}" min="1" 
                                    style="max-width: 80px; margin-left: auto;">
                            <p class="mb-0"><strong>${product.price}</strong></p>
                        </div>
                    </div>
                `;
                listCartHTML.appendChild(newCart);
            });
            
            // Add event listeners for quantity changes
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const productId = e.target.dataset.productId;
                    const quantity = parseInt(e.target.value);
                    if (quantity > 0) {
                        updateCartItemQuantity(productId, quantity);
                    }
                });
            });
            
            // Add event listeners for remove buttons
            listCartHTML.querySelectorAll('.btn-outline-danger').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.dataset.productId;
                    removeFromCart(productId);
                });
            });
        }
        
        // Adjust cart section height based on content
        adjustCartSectionHeight();
    };

    // Data loading functions with proper error handling
    const loadProducts = () => {
        // Always load products data if we need cart information or product listings
        if (!listProductHTML && !listCartHTML && !checkoutSummaryBox) return Promise.resolve();
        
        return fetch("products.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                listProducts = data;
                addProductsToHTML();
                
                // If we're on the cart page, update the cart contents
                if (listCartHTML) {
                    addToCartHTML();
                }
                
                // Update checkout summary after products are loaded
                updateCheckoutSummary();
            })
            .catch(error => {
                console.error('Error loading products:', error);
            });
    };

    const loadServices = () => {
        if (!serviceListHTML) return Promise.resolve(); // Don't load if not needed
        
        return fetch("services.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                serviceList = data;
                addServicesToHTML();
            })
            .catch(error => {
                console.error('Error loading services:', error);
            });
    };

    // Event listeners - Only add if the relevant elements exist
    if (listProductHTML) {
        listProductHTML.addEventListener('click', (e) => {
            if (e.target.classList.contains('addCart')) {
                const productCard = e.target.closest('.product-card');
                const product_id = productCard?.dataset.id;
                if (product_id) {
                    addToCart(product_id);
                }
            }
        });
    }

    // Misc dummy functions
    window.subscription = () => alert("Thank you for subscribing");
    window.remove_from_cart = () => {
        alert("Item removed (using updated function)");
        // This is just a fallback, we now use event listeners instead
    };
    window.checkout = () => {
        alert("Proceeding to checkout with total: $" + calculateCartTotal());
        clearCart();
    };

    window.clearCart = () => {
        carts = [];
        saveCartToSession();
        addToCartHTML();
        updateCheckoutSummary();
        adjustCartSectionHeight();
        alert("Cart cleared");
    };

    // Init - Always load cart from session on every page
    loadCartFromSession();
    
    // Load products if needed for product display, cart display, or checkout summary
    if (listProductHTML || listCartHTML || checkoutSummaryBox) {
        loadProducts().then(() => {
            // After loading products, adjust the cart section height if needed
            if (listCartHTML) {
                adjustCartSectionHeight();
            }
        });
    }
    
    if (serviceListHTML) {
        loadServices();
    }
    
    // Set up event listener for promo code button if it exists
    const promoButton = document.querySelector(".promo-code-section button");
    if (promoButton) {
        promoButton.addEventListener('click', () => {
            const promoInput = document.querySelector(".promo-code-section input");
            if (promoInput && promoInput.value.trim()) {
                alert("Promo code applied: " + promoInput.value);
                // Here you would add actual promo code logic
            } else {
                alert("Please enter a promo code");
            }
        });
    }
    
    // Set up window resize event to adjust the cart section height
    window.addEventListener('resize', () => {
        if (listCartHTML) {
            adjustCartSectionHeight();
        }
    });

    // Setting up the contact us form in the contact us page 
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        // Retrieve the data from the form 
        let name = document.getElementById('name').value;
        let email = document.getElementById('email').value;
        let description = document.getElementById('description').value;
        let topic = document.getElementById('topic').value;
        
        // storing the data, setItem is to store the items in the local storage
        let usertopic = localStorage.setItem('topic', topic);
        let username = localStorage.setItem('name', name);
        let useremail = localStorage.setItem('email', email);
        let userdescription = localStorage.setItem('description', description);


        // display a message
        alert("Thanks for reaching out! We will get back to you as soon as possible.");
        
        contactForm.reset();
    });
});