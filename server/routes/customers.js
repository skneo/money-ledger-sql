const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer')
const Transaction = require('../models/Transaction')
const fetchuser = require('../middleware/fetchuser');

router.get('/all-customers', fetchuser, async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: {
                userId: req.user.id,
                softDelete: false,
            },
            attributes: { exclude: ['userId', 'softDelete', 'createdAt', 'updatedAt'] },
            order: [['name', 'ASC']],
        });
        res.send({ customers });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

router.post('/add-customer', fetchuser, async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                name: req.body.name,
                userId: req.user.id,
            },
        });
        if (customer) {
            return res
                .status(400)
                .send({ message: `Request failed! ${req.body.name} already present` });
        }
        const newCustomer = await Customer.create({
            name: req.body.name,
            balance: 0,
            userId: req.user.id,
        });
        return res.send({
            customer: newCustomer,
            message: `${req.body.name} added`,
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.delete('/delete-customer', fetchuser, async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                id: req.body.customerId,
                userId: req.user.id,
            },
        });
        customer.softDelete = true;
        await customer.save();
        res.json({
            message: `${customer.name} moved to trash successfully`,
            trashed: true,
        });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ message: 'Some error occurred' });
    }
});

router.get('/transactions/:customerId', fetchuser, async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const customer = await Customer.findOne({
            where: {
                id: customerId,
                userId: req.user.id,
            },
        });
        const transactions = await Transaction.findAll({
            where: {
                userId: req.user.id,
                customerId,
            },
            attributes: ['id', 'amount', 'balance', 'date', 'remark'],
        });
        res.send({
            transactions,
            name: customer.name,
            balance: customer.balance,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.post('/add-transaction', fetchuser, async (req, res) => {
    try {
        let newAmount = parseInt(req.body.amount);
        const customer = await Customer.findOne({
            where: {
                id: req.body.customerId,
                userId: req.user.id,
            },
        });
        if (req.body.money === 'gave') {
            newAmount = -newAmount;
        }
        const transaction = await Transaction.create({
            userId: req.user.id,
            customerId: req.body.customerId,
            amount: newAmount,
            date: req.body.date,
            balance: customer.balance + newAmount,
            remark: req.body.remark,
        });
        customer.balance = transaction.balance;
        await customer.save();
        res.send({
            message:
                newAmount < 0
                    ? `Saved! You gave ${req.body.amount} Rs`
                    : `Saved! You got ${req.body.amount} Rs`,
            transaction,
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).send({ message: 'Some error occurred' });
    }
});

router.get('/trash', fetchuser, async (req, res) => {
    try {
        const customers = await Customer.findAll({
            where: {
                userId: req.user.id,
                softDelete: true,
            },
            attributes: { exclude: ['userId', 'softDelete'] },
        });
        res.send({ customers });
    } catch (error) {
        console.error('Error fetching trashed customers:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

router.put('/restore', fetchuser, async (req, res) => {
    try {
        const customer = await Customer.findOne({
            where: {
                id: req.body.customerId,
                userId: req.user.id,
            },
        });
        customer.softDelete = false;
        await customer.save();
        res.json({
            message: `${customer.name} restored successfully`,
            trashed: false,
        });
    } catch (error) {
        console.error('Error restoring customer:', error);
        res.status(500).json({ message: 'Some error occurred' });
    }
});

module.exports = router;
