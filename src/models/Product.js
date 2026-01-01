const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be non-negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['Men', 'Women', 'Kids', 'Accessories', 'Unisex'],
            message: 'Please select a valid category'
        }
    },
    brand: {
        type: String,
        trim: true
    },
    sizes: {
        type: [String],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONESIZE'],
        default: []
    },
    colors: {
        type: [String],
        default: []
    },
    sku: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
