// npm packages
const mongoose = require('mongoose');

// Use native promises
mongoose.Promise = global.Promise;

// create connection
const db = mongoose.createConnection('mongodb://localhost/datascience');

// create article schema
const ArticleSchema = new mongoose.Schema(
  {
    id: {type: Number, unique: true, index: true},
    externalUrl: {type: String, unique: true},
    addedDate: {type: Date, default: Date.now},
    text: String,
  },
  {
    // allow saving arbitrary fields
    strict: false,
  }
);

// exports
exports.connectedToDB = new Promise(resolve => db.on('connected', resolve));
exports.db = db;
exports.Article = db.model('Article', ArticleSchema);
