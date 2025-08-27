document.addEventListener('DOMContentLoaded', function () {
    const bar = document.getElementById("bar");
    const close = document.getElementById("close");
    const nav = document.getElementById("navBar");

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
    }

    // Close menu when clicking outside of it
    document.addEventListener('click', (event) => {
        const isClickInsideNav = nav.contains(event.target);
        const isClickOnBar = bar.contains(event.target);

        if (!isClickInsideNav && !isClickOnBar && nav.classList.contains('active')) {
            nav.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// new add in start
// Check if user is logged in
function checkLoginStatus() {
    // Cookie management function
    function getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    }

    const userEmail = getCookie('userEmail');
    const authNavItem = document.getElementById('authNavItem');

    if (userEmail) {
        // User is logged in - show logout button
        authNavItem.innerHTML = '<a href="logout.html">Log Out</a>';
    } else {
        // User is not logged in - show login button
        authNavItem.innerHTML = '<a href="login.html">Log In</a>';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
});
// new add in end