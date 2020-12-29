const express = require ('express');

const { createDompet,getAllDompet, getDompet, updateDompet, deleteDompet, getHistory } = require('../controllers/dompetController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// dompet Routes

router.post('/dompet/create', verifyAuth, createDompet);
router.get('/dompet/getall', verifyAuth, getAllDompet);
router.get('/dompet/getdompet/:dompetId', verifyAuth, getDompet);
router.get('/dompet/history/:dompetId', verifyAuth, getHistory);
router.put('/dompet/update/:dompetId', verifyAuth, updateDompet);
router.delete('/dompet/del/:dompetId', verifyAuth, deleteDompet);
module.exports = router;