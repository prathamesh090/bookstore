const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://online-book-store-663d3.firebaseio.com' // Firebase database URL
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/', express.static(path.join(__dirname, '../html')));

// API to handle user sign-up
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({ message: 'All fields are required.' });
    }

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            return res.status(400).send({ message: 'User already exists.' });
        }

        await userRef.set({ name, email, password });
        res.status(201).send({ message: 'User signed up successfully!' });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).send({ message: 'Error signing up user.', error });
    }
});

// API to handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'All fields are required.' });
    }

    try {
        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists || userDoc.data().password !== password) {
            return res.status(401).send({ message: 'Invalid email or password.' });
        }

        res.status(200).send({ message: 'Login successful!', user: userDoc.data() });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send({ message: 'Error logging in user.', error });
    }
});

// API to handle transactions
app.post('/transaction', async (req, res) => {
    const { email, cart, totalPrice } = req.body;

    if (!email || !cart || !totalPrice) {
        return res.status(400).send({ message: 'Invalid transaction data.' });
    }

    try {
        const transactionRef = db.collection('transactions').doc(); // Create a new transaction document
        await transactionRef.set({
            email,
            cart,
            totalPrice,
            date: new Date() // Store the current date and time
        });

        res.status(201).send({ message: 'Transaction recorded successfully!' });
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).send({ message: 'Error recording transaction.', error });
    }
});

// API to handle profile updates
app.post('/updateProfile', async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).send({ message: 'All fields are required.' });
    }

    try {
        console.log(`Received request to update profile: username=${username}, email=${email}`); // Log the request

        const userRef = db.collection('users').doc(email);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log(`User not found for email: ${email}`); // Log if user is not found
            return res.status(404).send({ message: 'User not found.' });
        }

        await userRef.update({ name: username });
        console.log(`Profile updated for email: ${email}, new username: ${username}`); // Log successful update
        res.status(200).send({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ message: 'Error updating profile.', error });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});