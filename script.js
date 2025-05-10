document.addEventListener("DOMContentLoaded", () => {
    // DOM Selectors - Add null checks to prevent errors on pages where elements don't exist
    let listProductHTML = document.querySelector(".listProduct");
    let serviceListHTML = document.querySelector(".serviceList");
    let listCartHTML = document.querySelector(".cart-content");
    let iconCartSpan = document.querySelector(".cart-count");
    let contactForm = document.getElementById("contact-form");
    let subscribeForm = document.getElementById("subscribe");
    let checkoutForm = document.getElementById("checkout-form"); 
    // Checkout summary selectors
    let checkoutSummaryBox = document.querySelector(".checkout-summary-box");
    let cartItemCountSpan = checkoutSummaryBox?.querySelector(".cart-item-count");
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

    // this is for the icon in the navbar 
    const updateCartCount = () => {
        // Add check to make sure iconCartSpan exists before updating it
        if (iconCartSpan) {
            let total = carts.reduce((sum, item) => sum + item.quantity, 0);
            iconCartSpan.textContent = total;
        }
    };

    // Update the calculateCartTotal function to also update tax and final total
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
        
        // Format to 2 decimal places
        const subtotal = total.toFixed(2);
        
        // If we're on the checkout page, update tax and total
        if (document.getElementById('tax-amount') && document.getElementById('shipping-cost') && document.getElementById('order-total')) {
            // Calculate tax (8% for example)
            const tax = (total * 0.08).toFixed(2);
            
            // Fixed shipping for now
            const shipping = 5.00;
            
            // Calculate final total
            const finalTotal = (parseFloat(subtotal) + parseFloat(tax) + shipping).toFixed(2);
            
            // Update the elements
            document.getElementById('tax-amount').textContent = `$${tax}`;
            document.getElementById('shipping-cost').textContent = `$${shipping.toFixed(2)}`;
            document.getElementById('order-total').textContent = `$${finalTotal}`;
            
            // Also update hidden fields for EmailJS
            if (document.getElementById('order_tax')) {
                document.getElementById('order_tax').value = tax;
            }
            if (document.getElementById('order_shipping')) {
                document.getElementById('order_shipping').value = shipping.toFixed(2);
            }
            if (document.getElementById('order_subtotal')) {
                document.getElementById('order_subtotal').value = subtotal;
            }
        }
        
        return subtotal;
    };

    // Update the updateCheckoutSummary function
    const updateCheckoutSummary = () => {
        // Update the checkout summary with the new total
        if (checkoutSummaryBox && cartItemCountSpan && temporaryAmountSpan && totalAmountSpan) {
            const itemCount = carts.reduce((sum, item) => sum + item.quantity, 0);
            const total = calculateCartTotal();
            
            cartItemCountSpan.textContent = itemCount;
            temporaryAmountSpan.textContent = `$${total}`;
            totalAmountSpan.textContent = `$${total}`;
            
            // Update order items summary for EmailJS
            if (document.getElementById('order_items_summary')) {
                let itemsSummary = "";
                carts.forEach(cart => {
                    const product = listProducts.find(p => p.id == cart.product_id);
                    if (product) {
                        itemsSummary += `${product.name} x ${cart.quantity}, `;
                    }
                });
                
                // Remove trailing comma
                itemsSummary = itemsSummary.replace(/, $/, '');
                document.getElementById('order_items_summary').value = itemsSummary;
            }
            
            // Generate a simple order number
            if (document.getElementById('order_number')) {
                document.getElementById('order_number').value = `ORD-${Date.now().toString().substring(6)}`;
            }
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

    // Function for active state in the navbar
    
    
    // === PRODUCT PAGE SPECIFIC FUNCTIONS ===

    // Render Functions - Only execute if the relevant containers exist
    const addProductsToHTML = () => {
        if (!listProductHTML) return;
        
        listProductHTML.innerHTML = '';
        listProducts.forEach(product => {
            const newProduct = document.createElement('div');
            newProduct.classList.add('col-12', 'col-md-6', 'col-lg-4', 'product-card');
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
            newService.classList.add('col-12', 'col-md-6', 'col-lg-4', 'service-card');
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
                            <h5 id="productName" class="fw-bold mb-1">${product.name}</h5>
                            <p class="mb-0"><strong>Size:</strong> M</p>
                            <p class="mb-0"><strong>Color:</strong> Gray</p>
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-danger me-2" data-product-id="${product.id}">Remove</button>
                                <button class="btn btn-sm btn-outline-secondary">Move to wish list</button>
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <input id="productquantity" type="number" class="form-control mb-2 quantity-input" 
                                    data-product-id="${product.id}"
                                    value="${cart.quantity}" min="1" 
                                    style="max-width: 80px; margin-left: auto;">
                            <p id="productPrice" class="mb-0"><strong>${product.price}</strong></p>
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
    };

    window.processPayment = function(e) {
        // Prevent default form submission
        if (e) e.preventDefault();
        
        // Check if cart is empty
        if (carts.length === 0) {
            alert("Your cart is empty. Please add items before checkout.");
            return false;
        }
        
        // Simple validation - in a real app, you'd do more validation
        alert("Thank you for your purchase! Your order has been processed.\nTotal: $" + calculateCartTotal());
        clearCart();
        return false;
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

    // contact form functionality on contact us page
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
          // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const description = document.getElementById('description').value;
            const topic = document.getElementById('topic').value;

          // Store locally if you want (optional)
            localStorage.setItem('topic', topic);
            localStorage.setItem('name', name);
            localStorage.setItem('email', email);
            localStorage.setItem('description', description);

          // Prepare EmailJS variables (these must match your template keys!)
            const contactInfo = {
                topic: localStorage.getItem('topic'),
                name: localStorage.getItem('name'),
                email: localStorage.getItem('email'),
                description: localStorage.getItem('description')
            };
        
          // Send email
            emailjs.send('service_q0580t8', 'template_cqjagih', contactInfo)
                .then(() => {
                alert("Message Sent!");
                contactForm.reset();
            })
            .catch((error) => {
                console.error("EmailJS send error:", error);
                alert("Failed to send message. Please try again.");
            });
        });
    };

    // Update the checkout form handler
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Check if cart is empty
        if (carts.length === 0) {
            alert("Your cart is empty. Please add items before checkout.");
            return false;
        }
        
        // Get customer information
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        
        // Verify email is not empty
        if (!email || email.trim() === '') {
            alert("Please enter a valid email address");
            return false;
        }
        
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        
        // Calculate cart totals
        const total = calculateCartTotal();
        const tax = (parseFloat(total) * 0.08).toFixed(2); // Example tax calculation (8%)
        const shipping = "5.00"; // Example fixed shipping cost
        const finalTotal = (parseFloat(total) + parseFloat(tax) + parseFloat(shipping)).toFixed(2);

        // setting the information to the localstorage to be used in the receipt page
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('lastName', lastName);
        localStorage.setItem('email', email);
        localStorage.setItem('address', address);
        localStorage.setItem('city', city);
        localStorage.setItem('state', state);
        localStorage.setItem('zip', zip);
        localStorage.setItem('total', total);
        localStorage.setItem('tax', tax);
        localStorage.setItem('shipping', shipping);
        localStorage.setItem('finalTotal', finalTotal);
        
        // Create a summary of items in cart
        let itemsSummary = "";
        carts.forEach(cart => {
            const product = listProducts.find(p => p.id == cart.product_id);
            if (product) {
            itemsSummary += `${product.name} x ${cart.quantity}, `;
            }
        });
        
        // Remove trailing comma
        itemsSummary = itemsSummary.replace(/, $/, '');
        
        // Prepare EmailJS template parameters
        const emailParams = {
            to_email: localStorage.getItem('email'),
            to_name: `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`,
            order_number: `ORD-${Date.now().toString().substring(6)}`,
            order_items: localStorage.getItem('itemsSummary'),
            order_subtotal: `$${localStorage.getItem('total')}`,
            order_tax: `$${localStorage.getItem('tax')}`,
            order_shipping: `$${localStorage.getItem('shipping')}`,
            order_total: `$${localStorage.getItem('finalTotal')}`,
            shipping_address: `${localStorage.getItem('address')}, ${localStorage.getItem('city')}, ${localStorage.getItem('state')} ${localStorage.getItem('zip')}`
        };
        
        
        console.log("Sending email with params:", emailParams); // Debug log
        
        // Send email using EmailJS
        emailjs.send('service_q0580t8', 'template_wp9t0ve', emailParams)
            .then((response) => {
            console.log("Email sent successfully:", response);
            alert("Order confirmed! Check your email for order details.");
            window.clearCart(); // Clear the cart after successful order
            checkoutForm.reset();
            })
            .catch((error) => {
            console.error("EmailJS send error:", error);
            alert("Failed to process your order. Error: " + error.text);
            });
        });
    }

  // Update the Complete Order button to submit the form
    const completeOrderButton = document.querySelector('.checkout-summary-box .btn-success');
        if (completeOrderButton) {
            completeOrderButton.addEventListener('click', () => {
            // Validate form fields first
            const email = document.getElementById('email');
            const firstName = document.getElementById('first_name');
            const lastName = document.getElementById('last_name');
            
            // Basic validation
            if (!email || !email.value || email.value.trim() === '') {
                alert("Please enter your email address");
                email.focus();
                return;
            }
            
            if (!firstName || !firstName.value || firstName.value.trim() === '') {
                alert("Please enter your first name");
                firstName.focus();
                return;
            }
            
            if (!lastName || !lastName.value || lastName.value.trim() === '') {
                alert("Please enter your last name");
                lastName.focus();
                return;
            }
            
            // // Trigger form submission if the form exists and passes validation
            // if (checkoutForm) {
            //     checkoutForm.dispatchEvent(new Event('submit'));
            // } else {
            //     alert("Error: Checkout form not found");
            // }
            });
        }
    
    // Update the Complete Order button to submit the form
    document.querySelector('.checkout-summary-box .btn-success').addEventListener('click', () => {
        // Trigger form submission if the form exists
        if (checkoutForm) {
            checkoutForm.dispatchEvent(new Event('submit'));
        } else {
            alert("Error: Checkout form not found");
        }
    });

    // Subscribe Form in Home page (only if it exists)
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Retrieve the data from the form
            let email = document.getElementById('subscribe-email').value;
            // storing the data in local storage
            localStorage.setItem('subscribe-email', email);
            // display a message
            alert("Thanks for subscribing!");
            subscribeForm.reset();
        });
    }

    // Alternative approach for subscribe button (if you're using button instead of form)
    const subscribeButton = document.getElementById('subscribe');
        if (subscribeButton) {
            subscribeButton.addEventListener('click', (e) => {
                e.preventDefault();
                // Retrieve the data
                let email = document.getElementById('subscribe-email').value;
                // Store the data
                localStorage.setItem('subscribe-email', email);
                // Display a message
                alert("Thanks for subscribing!");
                // Clear the field
                document.getElementById('subscribe-email').value = '';
        });
    }

    // Get current path
    const currentPath = window.location.pathname;

    // Select all nav links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        // If the href matches the current path
        if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
        }
    });
});