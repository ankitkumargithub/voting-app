const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const {jwtMiddleware} = require('./jwt.js');


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

userRoutes = require('./routes/userRoutes');

candidateRoutes = require('./routes/candidateRoutes');

app.use('/api/user', userRoutes);
app.use('/api/candidate', jwtMiddleware,candidateRoutes);