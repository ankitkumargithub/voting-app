const mongoos = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.DBURL;

mongoos.connect(mongoUrl);

const db = mongoos.connection;

db.on('connected',()=>{
    console.log('MongoDB connected successfully');
});

db.on('error',()=>{
    console.log('MongoDB connection failed');
});

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
});

module.exports = db;