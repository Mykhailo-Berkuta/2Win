const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');

router.get('/bets/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const bets = await Bet.find({ userId }).sort({ date: -1 });

        if (!bets || bets.length === 0) {
            return res.status(404).json({ message: 'Ставок не знайдено' });
        }

        res.status(200).json(bets);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;