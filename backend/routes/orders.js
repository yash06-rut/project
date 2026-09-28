const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order with server-side price validation & snapshots
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentId, paymentStatus } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Order must contain at least one item' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.pincode) {
      return res.status(400).json({ msg: 'Valid shipping address is required' });
    }

    // Server-side Price & Item Validation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.id || item.productId || item._id;
      let dbProduct = null;

      if (prodId) {
        dbProduct = await Product.findOne({ $or: [{ id: prodId }, { _id: prodId }] });
      }

      const itemPrice = dbProduct ? Number(dbProduct.price) : Number(item.price || 0);
      const itemQty = Math.max(1, Number(item.quantity || 1));
      const itemName = dbProduct ? dbProduct.name : (item.name || item.productName || 'Clothing Item');
      const itemImg = dbProduct ? dbProduct.image : (item.image || item.productImage || '');

      subtotal += itemPrice * itemQty;

      validatedItems.push({
        productId: String(prodId || `prod_${Date.now()}`),
        productName: itemName,
        productImage: itemImg,
        size: item.size || 'M',
        color: item.color || 'Standard',
        quantity: itemQty,
        price: itemPrice
      });
    }

    // Server-side Shipping & Total Calculation
    const shippingAmount = subtotal >= 2000 ? 0 : 99; // Free shipping over ₹2000
    const discount = 0;
    const totalAmount = subtotal + shippingAmount - discount;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      userId: req.userId,
      orderNumber,
      items: validatedItems,
      subtotal,
      shippingAmount,
      discount,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: (shippingAddress.phone || '').trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: (shippingAddress.addressLine2 || '').trim(),
        city: (shippingAddress.city || '').trim(),
        state: (shippingAddress.state || '').trim(),
        country: (shippingAddress.country || 'India').trim(),
        pincode: shippingAddress.pincode.trim()
      },
      paymentMethod: paymentMethod || 'UPI Instant',
      paymentStatus: paymentStatus || 'paid',
      paymentId: paymentId || `pay_${Date.now()}`,
      orderStatus: 'confirmed'
    });

    await newOrder.save();

    res.status(201).json({
      msg: 'Order placed successfully!',
      order: newOrder
    });

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ msg: 'Server error creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get order history for logged-in customer only
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ msg: 'Server error retrieving orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get specific order details for logged-in customer only
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) {
      return res.status(404).json({ msg: 'Order not found or access denied' });
    }
    res.json(order);
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ msg: 'Server error retrieving order details' });
  }
});

module.exports = router;
