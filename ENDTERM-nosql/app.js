const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const { MongoClient } = require('mongodb')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));


const { connectToDb } = require('./database');


// Mongoose schema and models
const Author = mongoose.model('Author', new mongoose.Schema({
  author_id: Number,
  Name: String,
  Biography: String
}));

const Book = mongoose.model('Book', new mongoose.Schema({
  book_id: Number,
  title: String,
  genre: String,
  author_id: Number, 
  available_quantity: Number,
  price: Number
}));

const Customer = mongoose.model('Customer', new mongoose.Schema({
  customer_id: Number,
  name: String,
  email: String,
  phone: String
}));

const OrderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    unique: true
  },
  book_id: Number,
  user_id: Number,
  quantity: Number,
  sum: Number
});

OrderSchema.pre('save', async function (next) {
  const Order = this.constructor;
  const lastOrder = await Order.findOne().sort({ order_id: -1 });
  this.order_id = lastOrder ? lastOrder.order_id + 1 : 1;
  next();
});

const Order = mongoose.model('Order', OrderSchema);

// Middleware
app.use(bodyParser.json());

// Routes

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/all-books-page', (req, res) => {
  res.render('all-books');
});

app.get('/order', (req, res) => {
    res.render('order');
});

app.get('/all-books', async (req, res) => {
  try {
      const books = await Book.find();
      const format = req.headers.accept === 'application/json' ? 'json' : 'html';

      if (format === 'json') {
          res.json(books);
      } else {
          res.render('all-books', { books });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/search-books', async (req, res) => {
  const { authorName, sortOrder } = req.body;
  try {
      const author = await Author.findOne({ Name: authorName });
      if (!author) {
          return res.status(404).json({ message: 'Author not found' });
      }
      let books = await Book.find({ author_id: author.author_id });

      // Populate author's name for each book
      books = await Promise.all(books.map(async (book) => {
          return {
              ...book.toObject(),
              author_name: author.Name
          };
      }));

      // Sort books based on title and sortOrder
      books.sort((a, b) => {
          const titleA = a.title.toUpperCase();
          const titleB = b.title.toUpperCase();
          if (sortOrder === 'asc') {
              return titleA.localeCompare(titleB);
          } else {
              return titleB.localeCompare(titleA);
          }
      });

      res.json(books);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/search-book', async (req, res) => {
  const { bookTitle } = req.body;
  try {
      const book = await Book.findOne({ title: bookTitle });
      res.json(book);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Route to edit a book
app.post('/edit-book', async (req, res) => {
  const { bookTitle, editInfo } = req.body;
  try {
      const book = await Book.findOneAndUpdate({ title: bookTitle }, editInfo, { new: true });
      res.json(book);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});


app.post('/create-order', async (req, res) => {
    const { bookTitle, customerInfo } = req.body;
    try {
      const book = await Book.findOne({ title: bookTitle });
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Check if customer already exists
      let customer = await Customer.findOne({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone
      });
  
      // If customer doesn't exist, return error
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      // Create order
      const order = new Order({
        book_id: book.book_id,
        user_id: customer.customer_id,
        quantity: req.body.quantity,
        sum: req.body.quantity * book.price
      });
  
      await order.save();
      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
app.get('/books-by-genre/:genre', async (req, res) => {
    const genre = req.params.genre;
    try {
        let books;
        if (genre === 'all') {
            books = await Book.find();
        } else {
            books = await Book.find({ genre: { $regex: genre, $options: 'i' } });
        }
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/delete-book/:title', async (req, res) => {
  const { title } = req.params;
  try {
      const deletedBook = await Book.findOneAndDelete({ title });
      if (!deletedBook) {
          return res.status(404).json({ message: 'Book not found' });
      }
      res.json(deletedBook);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/delete-author/:authorId', async (req, res) => {
  const { authorId } = req.params;
  try {
      // Find and delete the author by author_id
      const deletedAuthor = await Author.findOneAndDelete({ author_id: authorId });
      if (!deletedAuthor) {
          return res.status(404).json({ message: 'Author not found' });
      }
      res.json({ message: 'Author deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});



// Start server
connectToDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    // Handle the error gracefully
  } else {
    // Start your server once the database connection is established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
});