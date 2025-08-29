// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout process
    loadCartItems();
    setupFormNavigation();
    setupPaymentMethodToggle();
    setupPromoCode();
    
    // Load saved user data if available
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    populateShippingForm(userData);
});

function loadCartItems() {
    // Get cart from cookies
    const cart = getCookie("cart");
    const cartItemsContainer = document.getElementById("checkout-items");
    const reviewItemsContainer = document.getElementById("review-items");
    const subtotalElement = document.getElementById("subtotal");
    const shippingElement = document.getElementById("shipping");
    const taxElement = document.getElementById("tax");
    const grandTotalElement = document.getElementById("grand-total");
    
    if (!cart || cart.trim() === "") {
        cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
        reviewItemsContainer.innerHTML = "<p>Your cart is empty</p>";
        return;
    }
    
    let cartData;
    try {
        cartData = JSON.parse(cart);
        if (!Array.isArray(cartData)) {
            throw new Error("Cart data is not an array");
        }
    } catch (e) {
        console.error("Error parsing cart data:", e);
        cartItemsContainer.innerHTML = "<p>Error loading cart items</p>";
        reviewItemsContainer.innerHTML = "<p>Error loading cart items</p>";
        return;
    }
    
    // Fetch products to get details
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            let subtotal = 0;
            let itemsHTML = '';
            let reviewItemsHTML = '';
            
            cartData.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const itemTotal = (product.price || 0) * (item.quantity || 1);
                    subtotal += itemTotal;
                    
                    itemsHTML += `
                        <div class="checkout-item">
                            <img src="${product.image || 'img/placeholder.jpg'}" alt="${product.name}">
                            <div class="item-details">
                                <h4>${product.name}</h4>
                                <p>Size: ${item.size} | Qty: ${item.quantity}</p>
                            </div>
                            <div class="item-price">RM${itemTotal.toFixed(2)}</div>
                        </div>
                    `;
                    
                    reviewItemsHTML += `
                        <div class="review-item">
                            <img src="${product.image || 'img/placeholder.jpg'}" alt="${product.name}">
                            <div class="item-details">
                                <h4>${product.name}</h4>
                                <p>Size: ${item.size} | Qty: ${item.quantity}</p>
                            </div>
                            <div class="item-price">RM${itemTotal.toFixed(2)}</div>
                        </div>
                    `;
                }
            });
            
            // Calculate totals
            const shipping = subtotal > 0 ? 10.00 : 0; // RM10 flat shipping rate
            const tax = subtotal * 0.06; // 6% tax
            const grandTotal = subtotal + shipping + tax;
            
            // Update DOM
            cartItemsContainer.innerHTML = itemsHTML || "<p>No items in cart</p>";
            reviewItemsContainer.innerHTML = reviewItemsHTML || "<p>No items in cart</p>";
            subtotalElement.textContent = subtotal.toFixed(2);
            shippingElement.textContent = shipping.toFixed(2);
            taxElement.textContent = tax.toFixed(2);
            grandTotalElement.textContent = grandTotal.toFixed(2);
        })
        .catch(error => {
            console.error("Error loading products:", error);
            cartItemsContainer.innerHTML = "<p>Error loading cart items</p>";
            reviewItemsContainer.innerHTML = "<p>Error loading cart items</p>";
        });
}

function setupFormNavigation() {
    // Next button functionality
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', function() {
            const currentForm = this.closest('.checkout-form');
            const currentStep = currentForm.id.split('-')[0];
            const nextStep = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            
            // Validate current form before proceeding
            if (validateForm(currentForm)) {
                // Save form data
                saveFormData(currentForm);
                
                // Move to next step
                currentForm.classList.remove('active');
                document.getElementById(`${nextStep}-form`).classList.add('active');
                
                // Update progress indicator
                updateProgressIndicator(nextStep);
                
                // If moving to review step, populate review information
                if (nextStep === 'review') {
                    populateReviewInformation();
                }
            }
        });
    });
    
    // Back button functionality
    document.querySelectorAll('.btn-back').forEach(button => {
        button.addEventListener('click', function() {
            if (this.getAttribute('onclick')) {
                return;
            }
            
            const currentForm = this.closest('.checkout-form');
            const currentStep = currentForm.id.split('-')[0];
            let prevStep;
            
            switch(currentStep) {
                case 'payment':
                    prevStep = 'shipping';
                    break;
                case 'review':
                    prevStep = 'payment';
                    break;
                default:
                    prevStep = 'shipping';
            }
            
            currentForm.classList.remove('active');
            document.getElementById(`${prevStep}-form`).classList.add('active');
            updateProgressIndicator(prevStep);
        });
    });
}

function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            const creditCardForm = document.querySelector('.credit-card-form');
            
            if (this.value === 'credit-card') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });
}

function setupPromoCode() {
    const promoButton = document.querySelector('.promo-code button');
    
    promoButton.addEventListener('click', function() {
        const promoInput = document.querySelector('.promo-code input');
        const promoCode = promoInput.value.trim();
        
        if (promoCode) {
            applyPromoCode(promoCode);
        }
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
        
        // Special validation for email
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                input.style.borderColor = '#dc3545';
                isValid = false;
            }
        }
        
        // Special validation for credit card if payment form
        if (form.id === 'payment-form' && input.name === 'card-number' && input.value.trim()) {
            if (!isValidCardNumber(input.value)) {
                input.style.borderColor = '#dc3545';
                isValid = false;
            }
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
    }
    
    return isValid;
}

function isValidCardNumber(cardNumber) {
    // Remove spaces and dashes
    cardNumber = cardNumber.replace(/\s+|-/g, '');
    
    // Check if it's all digits and correct length
    if (!/^\d{13,19}$/.test(cardNumber)) {
        return false;
    }
    
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
}

function saveFormData(form) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.name && input.value) {
            formData[input.name] = input.value;
        }
    });
    
    const currentData = JSON.parse(localStorage.getItem('checkoutData')) || {};
    const step = form.id.split('-')[0];
    currentData[step] = formData;
    localStorage.setItem('checkoutData', JSON.stringify(currentData));
}

function populateShippingForm(userData) {
    if (userData.firstName) {
        document.querySelector('#shipping-form input[type="text"]:nth-child(1)').value = userData.firstName;
    }
    if (userData.lastName) {
        document.querySelector('#shipping-form input[type="text"]:nth-child(2)').value = userData.lastName;
    }
    if (userData.email) {
        document.querySelector('#shipping-form input[type="email"]').value = userData.email;
    }
    if (userData.phone) {
        document.querySelector('#shipping-form input[type="tel"]').value = userData.phone;
    }
}

function updateProgressIndicator(step) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(stepElement => stepElement.classList.remove('active'));
    
    switch(step) {
        case 'shipping':
            document.querySelector('.progress-step:nth-child(1)').classList.add('active');
            break;
        case 'payment':
            document.querySelector('.progress-step:nth-child(2)').classList.add('active');
            break;
        case 'review':
            document.querySelector('.progress-step:nth-child(3)').classList.add('active');
            break;
    }
}

function populateReviewInformation() {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || {};
    
    // Populate shipping address
    if (checkoutData.shipping) {
        const shipping = checkoutData.shipping;
        const address = `
            ${shipping['first-name'] || ''} ${shipping['last-name'] || ''}<br>
            ${shipping.address || ''}<br>
            ${shipping.city || ''}, ${shipping.state || ''} ${shipping['postal-code'] || ''}
        `;
        document.getElementById('review-shipping-address').innerHTML = address;
    }
    
    // Populate payment method
    if (checkoutData.payment) {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        let methodText = '';
        
        switch(paymentMethod) {
            case 'credit-card':
                methodText = 'Credit Card ending in ' + (checkoutData.payment['card-number'] || '').slice(-4);
                break;
            case 'paypal':
                methodText = 'PayPal';
                break;
            case 'bank-transfer':
                methodText = 'Bank Transfer';
                break;
        }
        
        document.getElementById('review-payment-method').textContent = methodText;
    }
}

function applyPromoCode(promoCode) {
    // For demo purposes, we'll use a simple check
    const discountCodes = {
        'NIKU10': 0.1,  // 10% discount
        'FREESHIP': 'free-shipping',  // Free shipping
        'WELCOME15': 0.15  // 15% discount
    };
    
    if (discountCodes.hasOwnProperty(promoCode.toUpperCase())) {
        const discount = discountCodes[promoCode.toUpperCase()];
        applyDiscount(discount, promoCode.toUpperCase());
    } else {
        alert('Invalid promo code. Please try again.');
    }
}

function applyDiscount(discount, code) {
    const subtotal = parseFloat(document.getElementById('subtotal').textContent);
    const shipping = parseFloat(document.getElementById('shipping').textContent);
    const tax = parseFloat(document.getElementById('tax').textContent);
    
    let newShipping = shipping;
    let discountAmount = 0;
    
    if (discount === 'free-shipping') {
        newShipping = 0;
        document.getElementById('shipping').textContent = '0.00';
        document.getElementById('shipping').parentElement.classList.add('discounted');
    } else if (typeof discount === 'number') {
        discountAmount = subtotal * discount;
        // Add a discount row
        const discountRow = `
            <div class="total-row discount">
                <span>Discount (${code})</span>
                <span>-RM${discountAmount.toFixed(2)}</span>
            </div>
        `;
        document.querySelector('.order-totals').insertAdjacentHTML('beforeend', discountRow);
    }
    
    // Recalculate grand total
    const grandTotal = subtotal - discountAmount + newShipping + tax;
    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    
    // Disable promo code input and button
    document.querySelector('.promo-code input').disabled = true;
    document.querySelector('.promo-code button').disabled = true;
    document.querySelector('.promo-code input').value = code;
}

// Cookie functions (same as in other files)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
    return null;
}

// Place order function (to be called when the place order button is clicked)
function placeOrder() {
    // Validate all forms
    const forms = document.querySelectorAll('.checkout-form');
    let allValid = true;
    
    forms.forEach(form => {
        if (!validateForm(form)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        alert('Please correct the errors in the form before placing your order.');
        return;
    }
    
    // Clear cart
    document.cookie = "cart=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    
    // Show success message
    alert('Order placed successfully! Thank you for your purchase.');
    
    window.location.href = 'index.html';
}

// Add event listener to place order button
document.addEventListener('DOMContentLoaded', function() {
    const placeOrderBtn = document.querySelector('.btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }

});
