const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const auth = require('../middleware/auth');

// @route   GET /api/addresses
// @desc    Get customer addresses
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ msg: 'Server error retrieving addresses' });
  }
});

// @route   POST /api/addresses
// @desc    Add a new delivery address
router.post('/', auth, async (req, res) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, country, pincode, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ msg: 'Please provide all required address fields' });
    }

    // Check if user has any existing addresses
    const existingCount = await Address.countDocuments({ userId: req.userId });
    const setAsDefault = isDefault || existingCount === 0;

    if (setAsDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId: req.userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      city: city.trim(),
      state: state.trim(),
      country: (country || 'India').trim(),
      pincode: pincode.trim(),
      isDefault: setAsDefault
    });

    await newAddress.save();
    res.status(201).json({ msg: 'Address added successfully', address: newAddress });

  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ msg: 'Server error adding address' });
  }
});

// @route   PUT /api/addresses/:id
// @desc    Update an existing address
router.put('/:id', auth, async (req, res) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found or unauthorized' });
    }

    const { fullName, phone, addressLine1, addressLine2, city, state, country, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = phone.trim();
    if (addressLine1) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (country) address.country = country.trim();
    if (pincode) address.pincode = pincode.trim();

    await address.save();
    res.json({ msg: 'Address updated successfully', address });

  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ msg: 'Server error updating address' });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found or unauthorized' });
    }
    res.json({ msg: 'Address deleted successfully' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ msg: 'Server error deleting address' });
  }
});

// @route   PATCH /api/addresses/:id/default
// @desc    Set an address as default
router.patch('/:id/default', auth, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!address) {
      return res.status(404).json({ msg: 'Address not found or unauthorized' });
    }

    await Address.updateMany({ userId: req.userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({ msg: 'Default address updated successfully', address });
  } catch (err) {
    console.error('Set default address error:', err);
    res.status(500).json({ msg: 'Server error setting default address' });
  }
});

module.exports = router;
