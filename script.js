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
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // If cart is empty, show an alert and return
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Fetch the items.json to get indices
    fetch('items.json')
        .then(response => response.json())
        .then(data => {
            // Create an array of indices for items in the cart
            const cartIndices = cart.map(cartItem => {
                return data.items.findIndex(item => item.name === cartItem);
            }).filter(index => index !== -1); // Remove any -1 values (not found)

            // DEBUG - Add confirmation dialog showing indices
            const confirmed = confirm(`Selected item numbers: ${cartIndices.join(',')}\n\nProceed with navigation?`);
            if (!confirmed) {
                return Promise.reject('Navigation cancelled');
            }

            // Send the indices to the endpoint
            return fetch('http://10.42.0.114/api/cartList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartIndices)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            // Show a message that navigation will start in 5 seconds
            alert('Purchase completed! Navigation will start in 5 seconds...');
            
            // Clear the cart
            localStorage.removeItem('cart');
            
            // Redirect after 5 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 5000);
        })
        .catch(error => {
            if (error === 'Navigation cancelled') return;
            console.error('Error sending cart data:', error);
            alert('There was an error starting navigation. Please try again.\n', error);
        });
}
