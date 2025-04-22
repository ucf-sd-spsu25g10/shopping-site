document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('searchBox')) {
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchText = e.target.value.toLowerCase();
            document.querySelectorAll('.item').forEach(item => {
                const text = item.querySelector('span').textContent.toLowerCase();
                item.style.display = text.includes(searchText) ? '' : 'none';
            });
        });
    }

    if (document.getElementById('cartItems')) {
        displayCart();
    }

    updateButtonStates();
});

function updateButtonStates() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    document.querySelectorAll('.item').forEach(item => {
        const itemName = item.querySelector('span').textContent;
        const button = item.querySelector('button');
        if (cart.includes(itemName)) {
            button.textContent = 'Remove from Cart';
            button.classList.add('in-cart');
            button.onclick = () => removeFromCart(itemName);
        } else {
            button.textContent = 'Add to Cart';
            button.classList.remove('in-cart');
            button.onclick = () => addToCart(itemName);
        }
    });
}

function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.includes(item)) {
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateButtonStates();
    }
}

function removeFromCart(item) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(i => i !== item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateButtonStates();
    if (document.getElementById('cartItems')) {
        displayCart();
    }
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = cart.map(item => `
        <div class="item">
            <span>${item}</span>
            <button onclick="removeFromCart('${item}')" class="in-cart">Remove from Cart</button>
        </div>
    `).join('');
}

function completePurchase() {
    localStorage.removeItem('cart');
    alert('Purchase completed!');
    window.location.href = 'index.html';
}
