document.addEventListener('DOMContentLoaded', function() {
    // Load items from JSON file if we're on the items page
    if (document.getElementById('itemsList')) {
        loadItemsFromJson();
    }

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

// Function to load items from JSON file
function loadItemsFromJson() {
    fetch('items.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            
            data.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                
                const itemSpan = document.createElement('span');
                itemSpan.textContent = item.name;
                
                const itemButton = document.createElement('button');
                itemButton.textContent = 'Add to Cart';
                itemButton.onclick = () => addToCart(item.name);
                
                itemDiv.appendChild(itemSpan);
                itemDiv.appendChild(itemButton);
                itemsList.appendChild(itemDiv);
            });
            
            updateButtonStates();
        })
        .catch(error => {
            console.error('Error loading items:', error);
            document.getElementById('itemsList').innerHTML = '<p>Error loading items. Please try again later.</p>';
        });
}

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
