const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TEST_ADMIN = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
};

const TEST_PRODUCT = {
    name: 'Test T-Shirt',
    description: 'A comfortable cotton t-shirt',
    price: 29.99,
    stock: 100,
    category: 'Men',
    brand: 'Generic',
    sizes: ['M', 'L'],
    colors: ['Blue', 'Black']
};

async function verify() {
    try {
        console.log('Connecting to database...');
        // Matching config/database.js logic
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const DB_NAME = process.env.DB_NAME || 'node-backend';

        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
        console.log('Connected to MongoDB:', DB_NAME);

        // 1. Setup Admin
        console.log('\n--- Setting up Admin User ---');
        await User.deleteOne({ email: TEST_ADMIN.email });
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(TEST_ADMIN.password, salt);

        const admin = await User.create({
            ...TEST_ADMIN,
            password: hashedPassword
        });
        console.log('Admin user created/reset:', admin.email);

        // 2. Simulate Login to get Token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );
        console.log('Generated Admin Token');

        // 3. Test API
        const PORT = process.env.PORT || 3000;
        const API_URL = `http://localhost:${PORT}/api`;
        console.log(`\n--- Testing API at ${API_URL} ---`);

        const request = async (method, path, body = null, token = null) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const options = { method, headers };
            if (body) options.body = JSON.stringify(body);
            const res = await fetch(`${API_URL}${path}`, options);
            const data = await res.json();
            return { status: res.status, data };
        };

        // A. Create Product
        console.log('Creating Product...');
        const createRes = await request('POST', '/products', TEST_PRODUCT, token);
        console.log(`Status: ${createRes.status}`);
        if (createRes.status === 201) {
            console.log('SUCCESS: Product created');
        } else {
            console.log('FAILURE:', createRes.data);
        }

        // B. Get Products
        console.log('\nFetching Products...');
        const getRes = await request('GET', '/products');
        console.log(`Status: ${getRes.status}`);
        const productFound = getRes.data.data?.find(p => p.name === TEST_PRODUCT.name);
        if (productFound) {
            console.log('SUCCESS: Product found in list');
            console.log(`Attributes - Sizes: ${productFound.sizes}, Colors: ${productFound.colors}`);
        } else {
            console.log('FAILURE: Product not found');
        }

        // C. Update Product
        if (productFound) {
            console.log('\nUpdating Product...');
            const updateData = { price: 35.99, stock: 90 };
            const updateRes = await request('PUT', `/products/${productFound._id}`, updateData, token);
            console.log(`Status: ${updateRes.status}`);
            if (updateRes.status === 200 && updateRes.data.data.price === 35.99) {
                console.log('SUCCESS: Product updated');
            } else {
                console.log('FAILURE:', updateRes.data);
            }
        }

        // Cleanup
        console.log('\n--- Cleanup ---');
        if (productFound) await Product.findByIdAndDelete(productFound._id);
        await User.deleteOne({ email: TEST_ADMIN.email });
        console.log('Cleanup Done');

        console.log('\nVerification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
