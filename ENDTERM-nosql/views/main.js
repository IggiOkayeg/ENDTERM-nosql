let sortOrder = 'asc'; // Default sorting order

function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    searchBooks(); // Refresh search results after toggling order
}

function searchBooks() {
    const authorName = document.getElementById('authorName').value;
    fetch('/search-books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorName, sortOrder })
    })
    .then(response => response.json())
    .then(data => {
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '';
        if (data.length === 0) {
            const message = document.createElement('div');
            message.textContent = "This author's books are not present in our store";
            bookList.appendChild(message);
        } else {
            data.forEach(book => {
                const listItem = document.createElement('div');
                listItem.textContent = `${book.title} by ${book.author_name}`;
                bookList.appendChild(listItem);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('This is not name of the author');
    });
}


function createOrder() {
    const bookTitle = document.getElementById('bookTitle').value;
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const quantity = document.getElementById('quantity').value;

    const customerInfo = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
    };

    fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookTitle, customerInfo, quantity })
    })
    .then(response => {
        if (response.status === 404) {
            alert('Something went wrong: change the fields to include existing information.')
            throw new Error('Customer not found');
        }
        return response.json();
    })
    .then(data => {
        alert('Order created');
        console.log('Order created:', data);
    })
    .catch(error => console.error('Error:', error));
}

let currentBookId;

function searchBook() {
    const bookTitle = document.getElementById('bookTitle').value;
    fetch('/search-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookTitle })
    })
    .then(response => response.json())
    .then(data => {
        const bookInfo = document.getElementById('bookInfo');
        const editForm = document.getElementById('editForm');

        if (data) {
            editForm.style.display = 'block';

            document.getElementById('editTitle').value = data.title;
            document.getElementById('editGenre').value = data.genre;
            document.getElementById('editAuthorId').value = data.author_id;
            document.getElementById('editQuantity').value = data.available_quantity;
            document.getElementById('editPrice').value = data.price;

            bookInfo.innerHTML = `<p>Title: ${data.title}</p><p>Genre: ${data.genre}</p><p>Author ID: ${data.author_id}</p><p>Available Quantity: ${data.available_quantity}</p><p>Price: ${data.price}</p>`;
        } else {
            editForm.style.display = 'none';
            bookInfo.innerHTML = 'Book not found';
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveChanges() {
    const bookTitle = document.getElementById('bookTitle').value;
    const editInfo = {
        title: document.getElementById('editTitle').value,
        genre: document.getElementById('editGenre').value,
        author_id: document.getElementById('editAuthorId').value,
        available_quantity: document.getElementById('editQuantity').value,
        price: document.getElementById('editPrice').value,
    };

    fetch('/edit-book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookTitle, editInfo })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book updated:', data);
        alert('Updated successfully')
    })
    .catch(error => console.error('Error:', error));
}


function deleteBook() {
    const bookTitle = document.getElementById('bookTitle').value;

    fetch(`/delete-book/${encodeURIComponent(bookTitle)}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book deleted:', data);
        alert('Deleted successfully')
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('deleteAuthorForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const authorId = document.getElementById('authorId').value;
    fetch(`/delete-author/${authorId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Author not found');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message);
        alert('Deleted successfully')
        document.getElementById('authorId').value = ''; // Clear the input field
    })
    .catch(error => console.error('Error:', error.message));
});