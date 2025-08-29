// User account page functionality
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the user account page
    initUserAccount();
});

function initUserAccount() {
    // Set up tab navigation
    setupTabNavigation();

    // Load user data
    loadUserData();

    // Set up form submissions
    setupFormSubmissions();

    // Set up address management
    setupAddressManagement();

    // Set up password change functionality
    setupPasswordChange();

    // Check login status
    checkLoginStatus();
}

function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Show corresponding content section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

function loadUserData() {
    // Try to get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const userEmail = getCookie('userEmail');

    // If user is logged in but no user data, create basic user data
    if (userEmail && !userData.email) {
        userData.email = userEmail;
        userData.firstName = 'User';
        userData.lastName = 'Name';
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // Populate profile form
    if (userData.firstName) {
        document.getElementById('first-name').value = userData.firstName;
    }
    if (userData.lastName) {
        document.getElementById('last-name').value = userData.lastName;
    }
    if (userData.email) {
        document.getElementById('user-email-input').value = userData.email;
    }
    if (userData.phone) {
        document.getElementById('user-phone').value = userData.phone;
    }

    // Update display name and email
    if (userData.firstName && userData.lastName) {
        document.getElementById('user-display-name').textContent = `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.email) {
        document.getElementById('user-email').textContent = userData.email;
    }

    // Load user avatar if available
    if (userData.avatar) {
        document.getElementById('user-avatar-img').src = userData.avatar;
    }

    // Load addresses if available
    loadAddresses();

    // Load wishlist if available
    loadWishlist();

    // Load orders if available
    loadOrders();
}

function setupFormSubmissions() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }

    // Avatar upload handling
    const avatarInput = document.getElementById('user-avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            handleAvatarUpload(e.target.files[0]);
        });
    }
}

function saveProfileChanges() {
    const userData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('user-email-input').value,
        phone: document.getElementById('user-phone').value
    };

    // Preserve existing avatar if it exists
    const existingData = JSON.parse(localStorage.getItem('userData')) || {};
    if (existingData.avatar) {
        userData.avatar = existingData.avatar;
    }

    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update display
    document.getElementById('user-display-name').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('user-email').textContent = userData.email;

    // Show success message
    showNotification('Profile updated successfully!', 'success');
}

function handleAvatarUpload(file) {
    if (!file || !file.type.match('image.*')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Image must be less than 2MB.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        // Update avatar preview
        document.getElementById('user-avatar-img').src = e.target.result;

        // Save to user data
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        userData.avatar = e.target.result;
        localStorage.setItem('userData', JSON.stringify(userData));

        showNotification('Profile picture updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

function setupAddressManagement() {
    const addAddressBtn = document.getElementById('add-address-btn');
    const addressFormContainer = document.getElementById('address-form-container');
    const addressForm = document.getElementById('address-form');
    const cancelAddressBtn = document.getElementById('cancel-address-btn');

    if (addAddressBtn && addressFormContainer) {
        addAddressBtn.addEventListener('click', function () {
            addressFormContainer.style.display = 'block';
            addAddressBtn.style.display = 'none';
        });
    }

    if (cancelAddressBtn && addressFormContainer) {
        cancelAddressBtn.addEventListener('click', function () {
            addressFormContainer.style.display = 'none';
            addAddressBtn.style.display = 'block';
            addressForm.reset();
        });
    }

    if (addressForm) {
        addressForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveAddress();
        });
    }
}

function loadAddresses() {
    const addressesGrid = document.getElementById('addresses-grid');
    const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];

    if (addresses.length === 0) {
        addressesGrid.innerHTML = `
            <div class="no-addresses">
                <i class="fas fa-map-marker-alt"></i>
                <h3>No addresses saved</h3>
                <p>Add your first address to make checkout easier</p>
            </div>
        `;
        return;
    }

    let addressesHTML = '';

    addresses.forEach((address, index) => {
        addressesHTML += `
            <div class="address-card ${address.default ? 'default' : ''}">
                <div class="address-header">
                    <h4>${address.title}</h4>
                    ${address.default ? '<span class="default-badge">Default</span>' : ''}
                </div>
                <p>${address.firstName} ${address.lastName}</p>
                <p>${address.street}</p>
                <p>${address.city}, ${address.state} ${address.postcode}</p>
                <p>${address.phone}</p>
                <div class="address-actions">
                    <button class="edit-address" data-index="${index}">Edit</button>
                    <button class="delete-address" data-index="${index}">Delete</button>
                </div>
            </div>
        `;
    });

    addressesGrid.innerHTML = addressesHTML;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-address').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            editAddress(index);
        });
    });

    document.querySelectorAll('.delete-address').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            deleteAddress(index);
        });
    });
}

function saveAddress() {
    const addressForm = document.getElementById('address-form');
    const formData = new FormData(addressForm);

    const address = {
        title: formData.get('title'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        postcode: formData.get('postcode'),
        phone: formData.get('phone'),
        default: formData.get('default') === 'on'
    };

    // Get existing addresses
    const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];

    // If this is set as default, remove default from others
    if (address.default) {
        addresses.forEach(addr => {
            addr.default = false;
        });
    }

    // Check if we're editing an existing address
    const editIndex = addressForm.getAttribute('data-edit-index');
    if (editIndex !== null) {
        addresses[editIndex] = address;
    } else {
        // Add new address
        addresses.push(address);

        // If this is the first address, set it as default
        if (addresses.length === 1) {
            address.default = true;
        }
    }

    // Save addresses
    localStorage.setItem('userAddresses', JSON.stringify(addresses));

    // Reload addresses
    loadAddresses();

    // Hide form and show success message
    document.getElementById('address-form-container').style.display = 'none';
    document.getElementById('add-address-btn').style.display = 'block';
    addressForm.reset();
    addressForm.removeAttribute('data-edit-index');

    showNotification('Address saved successfully!', 'success');
}

function editAddress(index) {
    const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    const address = addresses[index];

    // Populate form with address data
    document.getElementById('address-title').value = address.title;
    document.getElementById('address-first-name').value = address.firstName;
    document.getElementById('address-last-name').value = address.lastName;
    document.getElementById('address-street').value = address.street;
    document.getElementById('address-city').value = address.city;
    document.getElementById('address-state').value = address.state;
    document.getElementById('address-postcode').value = address.postcode;
    document.getElementById('address-phone').value = address.phone;
    document.getElementById('address-default').checked = address.default;

    // Show form and set edit index
    document.getElementById('address-form-container').style.display = 'block';
    document.getElementById('add-address-btn').style.display = 'none';
    document.getElementById('address-form').setAttribute('data-edit-index', index);
}

function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }

    const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
    const wasDefault = addresses[index].default;

    // Remove address
    addresses.splice(index, 1);

    // If we deleted the default address and there are other addresses, set a new default
    if (wasDefault && addresses.length > 0) {
        addresses[0].default = true;
    }

    // Save addresses
    localStorage.setItem('userAddresses', JSON.stringify(addresses));

    // Reload addresses
    loadAddresses();

    showNotification('Address deleted successfully!', 'success');
}

function loadWishlist() {
    const wishlistGrid = document.getElementById('wishlist-grid');
    const wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <div class="no-wishlist">
                <i class="fas fa-heart"></i>
                <h3>Your wishlist is empty</h3>
                <p>Save items you love for later</p>
                <a href="shop.html" class="btn-primary">Browse Products</a>
            </div>
        `;
        return;
    }

    // Fetch products to get details
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            let wishlistHTML = '';

            wishlist.forEach(itemId => {
                const product = products.find(p => p.id === itemId);
                if (product) {
                    wishlistHTML += `
                        <div class="wishlist-item">
                            <img src="${product.image || 'img/placeholder.jpg'}" alt="${product.name}">
                            <div class="wishlist-item-details">
                                <h4>${product.name}</h4>
                                <div class="wishlist-item-price">RM${product.price.toFixed(2)}</div>
                                <div class="wishlist-actions">
                                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                                    <button class="remove-wishlist-btn" data-id="${product.id}">Remove</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            wishlistGrid.innerHTML = wishlistHTML;

            // Add event listeners
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = parseInt(this.getAttribute('data-id'));
                    addToCartFromWishlist(productId);
                });
            });

            document.querySelectorAll('.remove-wishlist-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = parseInt(this.getAttribute('data-id'));
                    removeFromWishlist(productId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading wishlist:', error);
            wishlistGrid.innerHTML = '<p>Error loading wishlist items.</p>';
        });
}

function addToCartFromWishlist(productId) {
    // For now, we'll just show a message
    showNotification('Product added to cart!', 'success');
}

function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('userWishlist', JSON.stringify(wishlist));

    // Reload wishlist
    loadWishlist();

    showNotification('Product removed from wishlist.', 'success');
}

function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    const orders = JSON.parse(localStorage.getItem('userOrders')) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-bag"></i>
                <h3>No orders yet</h3>
                <p>Your order history will appear here</p>
                <a href="shop.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    let ordersHTML = '';

    orders.forEach(order => {
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${formatDate(order.date)}</span>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
        `;

        order.items.forEach(item => {
            ordersHTML += `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Size: ${item.size} | Qty: ${item.quantity}</p>
                    </div>
                    <div class="item-price">RM${item.price.toFixed(2)}</div>
                </div>
            `;
        });

        ordersHTML += `
                </div>
                <div class="order-footer">
                    <div class="order-total">Total: RM${order.total.toFixed(2)}</div>
                    <button class="reorder-btn">Reorder</button>
                </div>
            </div>
        `;
    });

    ordersList.innerHTML = ordersHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setupPasswordChange() {
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordFormContainer = document.getElementById('password-form-container');
    const passwordForm = document.getElementById('password-form');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const newPasswordInput = document.getElementById('new-password');

    if (changePasswordBtn && passwordFormContainer) {
        changePasswordBtn.addEventListener('click', function () {
            passwordFormContainer.style.display = 'block';
            changePasswordBtn.style.display = 'none';
        });
    }

    if (cancelPasswordBtn && passwordFormContainer) {
        cancelPasswordBtn.addEventListener('click', function () {
            passwordFormContainer.style.display = 'none';
            changePasswordBtn.style.display = 'block';
            passwordForm.reset();
        });
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function () {
            checkPasswordStrength(this.value);
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', function (e) {
            e.preventDefault();
            changePassword();
        });
    }
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength');
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    // Update strength bar
    strengthBar.className = 'password-strength';

    if (strength < 40) {
        strengthBar.classList.add('weak');
    } else if (strength < 80) {
        strengthBar.classList.add('medium');
    } else {
        strengthBar.classList.add('strong');
    }
}

function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Basic validation
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match.', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('New password must be at least 8 characters.', 'error');
        return;
    }

    // For demo purposes, we'll just show a success message
    // Hide form and reset
    document.getElementById('password-form-container').style.display = 'none';
    document.getElementById('change-password-btn').style.display = 'block';
    document.getElementById('password-form').reset();

    showNotification('Password changed successfully!', 'success');
}

function checkLoginStatus() {
    const userEmail = getCookie('userEmail');
    const authNavItem = document.getElementById('authNavItem');

    if (!userEmail) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                animation: slideIn 0.3s ease;
            }
            .notification.success {
                background: #28a745;
            }
            .notification.error {
                background: #dc3545;
            }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Cookie function (same as in other files)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
    return null;

}
