const Product = require('../models/Product');
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const productSchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(2000).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).required(),
    category: Joi.string().valid('Men', 'Women', 'Kids', 'Accessories', 'Unisex').required(),
    brand: Joi.string().optional().allow(''),
    sizes: Joi.array().items(Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONESIZE')),
    colors: Joi.array().items(Joi.string()),
    sku: Joi.string().optional(),
    imageUrl: Joi.string().uri().optional()
});

const updateProductSchema = Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().max(2000),
    price: Joi.number().min(0),
    stock: Joi.number().min(0),
    category: Joi.string().valid('Men', 'Women', 'Kids', 'Accessories', 'Unisex'),
    brand: Joi.string().optional().allow(''),
    sizes: Joi.array().items(Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONESIZE')),
    colors: Joi.array().items(Joi.string()),
    sku: Joi.string(),
    imageUrl: Joi.string().uri(),
    isActive: Joi.boolean()
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const product = await Product.create(req.body);

        logger.info(`Product created: ${product._id}`);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'SKU already exists'
            });
        }
        logger.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            brand,
            search,
            sort,
            minPrice,
            maxPrice
        } = req.query;

        const query = { isActive: true };

        // Filtering
        if (category) query.category = category;
        if (brand) query.brand = { $regex: brand, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search
        if (search) {
            query.$text = { $search: search };
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'name_asc') sortOption = { name: 1 };
        if (sort === 'name_desc') sortOption = { name: -1 };

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                total: count,
                page: Number(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        logger.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Get product error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { error } = updateProductSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        logger.info(`Product updated: ${product._id}`);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        logger.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Hard delete or Soft delete? Using Hard delete for now as per "Delete Product"
        await product.deleteOne();

        logger.info(`Product deleted: ${req.params.id}`);
        res.json({
            success: true,
            message: 'Product removed'
        });
    } catch (error) {
        logger.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};


/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - stock
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           description: The product price
 *         stock:
 *           type: number
 *           description: The quantity in stock
 *         category:
 *           type: string
 *           enum: [Men, Women, Kids, Accessories, Unisex]
 *           description: The product category
 *         sizes:
 *           type: array
 *           items:
 *             type: string
 *           enum: [XS, S, M, L, XL, XXL, ONESIZE]
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *         brand:
 *           type: string
 *         sku:
 *           type: string
 *         imageUrl:
 *           type: string
 *       example:
 *         name: Classic White Tee
 *         description: Premium cotton t-shirt
 *         price: 25.00
 *         stock: 50
 *         category: Men
 *         sizes: [M, L, XL]
 *         colors: [White]
 *         brand: Generic
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The products managing API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns the list of all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: The list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       403:
 *         description: Admin access required
 * 
 * /api/products/{id}:
 *   get:
 *     summary: Get the product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 *   put:
 *     summary: Update the product by the id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product was updated
 *       404:
 *         description: The product was not found
 *   delete:
 *     summary: Remove the product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product was deleted
 *       404:
 *         description: The product was not found
 */
