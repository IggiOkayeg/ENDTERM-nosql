document.addEventListener('DOMContentLoaded', function() {
    showAllBooks();
});

function showAllBooks() {
    fetch('/all-books', {
        headers: {
            'Accept': 'application/json', 
        },
    })
    .then(response => {
        if (response.headers.get('content-type').includes('application/json')) {
            return response.json(); 
        } else {
            return response.text(); 
        }
    })
    .then(data => {
        if (Array.isArray(data)) {
            displayBooks(data);
        } else {
            document.body.innerHTML = data;
        }
    })
    .catch(error => console.error('Error:', error));
}

function filterBooks() {
    const genreSelect = document.getElementById('genreSelect');
    const selectedGenre = genreSelect.value;
    if (selectedGenre === 'all') {
        showAllBooks();
    } else {
        fetch(`/books-by-genre/${selectedGenre}`)
        .then(response => response.json())
        .then(data => {
            displayBooks(data);
        })
        .catch(error => console.error('Error:', error));
    }
}

function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    books.forEach(book => {
        const listItem = document.createElement('div');
        listItem.textContent = `${book.title} - Genres: ${book.genre}`;
        bookList.appendChild(listItem);
    });
}
