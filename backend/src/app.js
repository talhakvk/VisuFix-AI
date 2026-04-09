const express = require('express');
const cors = require('cors');
const faultRoutes = require('./routes/faultRoutes');
const stepRoutes = require('./routes/stepRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/faults', faultRoutes);
app.use('/api/faults/:id/steps', stepRoutes);

app.use(errorHandler);

module.exports = app;
