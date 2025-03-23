// Function to add a book to the cart
function addToCart(bookId, bookTitle, bookImage, bookRating, bookPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const book = {
        id: bookId,
        title: bookTitle,
        image: bookImage, // Ensure the image path is stored correctly
        rating: bookRating,
        price: Number(bookPrice) // Ensure price is stored as a number
    };

    // Check if the book is already in the cart
    const existingBook = cart.find(item => item.id === bookId);
    if (existingBook) {
        alert(`${bookTitle} is already in your cart.`);
        return;
    }

    cart.push(book);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${bookTitle} has been added to your cart.`);
    updateTotalPrice(); // Update total price after adding a book
}

// Function to remove a book from the cart
function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(book => book.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Book has been removed from your cart.`);
    displayCart(); // Refresh the cart display after removing an item
    updateTotalPrice(); // Update total price after removing a book
}

// Function to display the cart items
function displayCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = ''; // Clear the container before rendering

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        updateTotalPrice();
        return;
    }

    cart.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.classList.add('cart-item');
        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}" style="width: 100px; height: auto;"> <!-- Ensure image is displayed -->
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <div class="rating">${book.rating}</div>
            <p class="price">₹${book.price}</p> <!-- Ensure price is displayed -->
            <button onclick="removeFromCart('${book.id}')">Remove from Cart</button>
        `;
        cartContainer.appendChild(bookItem);
    });

    updateTotalPrice(); // Update total price when displaying the cart
}

// Function to calculate and display the total price of books in the cart
function updateTotalPrice() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalPrice = cart.reduce((sum, book) => sum + (book.price || 0), 0); // Default to 0 if price is missing
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `Total Price: ₹${totalPrice}`;
    }

    // Store the total price in localStorage for the payment page
    localStorage.setItem('totalPrice', totalPrice);
}

// Function to handle payment form submission
function handlePaymentFormSubmission(event) {
    event.preventDefault(); // Prevent the default form submission

    // Perform form validation
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const paymentMethod = document.getElementById('payment-method').value;

    if (!name || !address || !email || !paymentMethod) {
        alert('Please fill in all fields.');
        return;
    }

    if (paymentMethod === 'credit-card') {
        const card = document.getElementById('card').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;

        if (!card || !expiry || !cvv) {
            alert('Please fill in all credit card fields.');
            return;
        }
    } else if (paymentMethod === 'upi') {
        const upiId = document.getElementById('upi-id').value;

        if (!upiId) {
            alert('Please fill in the UPI ID.');
            return;
        }
    }

    // Include cart items in the form data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartInput = document.createElement('input');
    cartInput.type = 'hidden';
    cartInput.name = 'cart';
    cartInput.value = JSON.stringify(cart);
    event.target.appendChild(cartInput);

    // Submit the form
    event.target.submit();
}

// Call displayCart on page load if the cart-container element exists
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('cart-container')) {
        displayCart();
    }

    // Attach the payment form submission handler
    const paymentForm = document.querySelector('.payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentFormSubmission);
    }

    // Attach the payment method change handler
    const paymentMethodSelect = document.getElementById('payment-method');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function () {
            const paymentMethod = paymentMethodSelect.value;
            document.getElementById('upi-info').style.display = paymentMethod === 'upi' ? 'block' : 'none';
            document.getElementById('bank-transfer-info').style.display = paymentMethod === 'bank-transfer' ? 'block' : 'none';
            document.getElementById('paypal-info').style.display = paymentMethod === 'paypal' ? 'block' : 'none';
            document.getElementById('credit-card-info').style.display = paymentMethod === 'credit-card' ? 'block' : 'none';
        });
    }
});