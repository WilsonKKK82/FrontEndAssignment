function updateCartIndicator() {
    const cart = JSON.parse(getCookie("cart") || "[]");
    const cartIcon = document.querySelector("#header #cart a");
    let indicator = document.querySelector("#header #cart .cart-indicator");
    if (cart.length > 0) {
        if (!indicator) {
            indicator = document.createElement("span");
            indicator.className = "cart-indicator";
            cartIcon.appendChild(indicator);
        }
        indicator.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    } else if (cart.length === 0 && indicator) {
        indicator.remove();
    }
}