const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://pandurangatradersoffical.vercel.app',
    'https://panduranga-traders-frontend.vercel.app',
    'https://panduranga-traders-backend.onrender.com'
];

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `CORS not allowed for ${origin}`;
            console.warn(msg);
            return callback(new Error(msg), false);

        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 hours
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bills_db';
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increased timeout for production
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
};

// Production/Development environment check
const isProduction = process.env.NODE_ENV === 'production';

// Handle MongoDB connection
const connectDB = async() => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MongoDB connection string is not defined. Please set MONGODB_URI environment variable.');
        }
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        if (isProduction) {
            console.log('Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        }
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Reconnecting...');
    connectDB();
});

// Routes
const billsRouter = require('./routes/bills');
const entriesRouter = require('./routes/entries');

app.use('/api/bills', billsRouter);
app.use('/api/entries', entriesRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../office_bills/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../office_bills/dist', 'index.html'));
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});