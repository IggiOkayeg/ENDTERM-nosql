const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
let dbConnection;
const uri = "mongodb+srv://endterm_user:kappa123@cluster0.tc83brq.mongodb.net/ENDTERM?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, connectTimeoutMS: 30000 });

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db();
        console.log('Connected to MongoDB Atlas successfully');
        console.log(`Connected to database: ${dbConnection.databaseName}`);
        return cb();
      })
      .catch(err => {
        console.error('Error connecting to MongoDB Atlas:', err);
        return cb(err);
      });
  },
  getDb: () => dbConnection
};
