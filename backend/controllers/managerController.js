const { User, Property, Booking, Payment, Review } = require('../models');
const { Op } = require('sequelize');

// --- Payment Manager Functions ---

// @desc    Get all payments with details
// @route   GET /api/manager/payments
// @access  Private (Payment Manager, Admin)
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                {
                    model: Booking,
                    as: 'booking',
                    include: [
                        {
                            model: Property,
                            as: 'property',
                            attributes: ['id', 'title']
                        },
                        {
                            model: User,
                            as: 'guest',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [['payment_date', 'DESC']]
        });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

// @desc    Update payment status
// @route   PUT /api/manager/payments/:id
// @access  Private (Payment Manager, Admin)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByPk(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = status;
        await payment.save();

        console.log(`✅ [MANAGER] Updated payment ${payment.id}: status=${payment.status} by ${req.user.role} ${req.user.id}`);

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
};

// --- Field Inspector Functions ---

// @desc    Get properties awaiting inspection
// @route   GET /api/manager/inspections
// @access  Private (Field Inspector, Admin)
exports.getPendingInspections = async (req, res) => {
    try {
        const properties = await Property.findAll({
            where: {
                [Op.or]: [
                    { verified_badge: false },
                    { status: 'pending' }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'host',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        console.error('Error fetching pending inspections:', error);
        res.status(500).json({ message: 'Error fetching inspections' });
    }
};

// @desc    Verify property after inspection
// @route   PUT /api/manager/properties/:id/verify
// @access  Private (Field Inspector, Admin)
exports.verifyProperty = async (req, res) => {
    try {
        const { inspector_notes, verified_badge } = req.body;
        const property = await Property.findByPk(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        property.inspector_notes = inspector_notes;
        if (verified_badge !== undefined) {
            property.verified_badge = verified_badge;
        }

        await property.save();

        console.log(`✅ [MANAGER] Verified property ${property.id}: verified_badge=${property.verified_badge} by ${req.user.role} ${req.user.id}`);

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error('Error verifying property:', error);
        res.status(500).json({ message: 'Error verifying property' });
    }
};
