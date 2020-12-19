const express = require ('express');

const { createDompet,getAllDompet, getDompet, updateDompet, deleteDompet } = require('../controllers/dompetController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// dompet Routes

router.post('/dompet/create', verifyAuth, createDompet);
router.get('/dompet/getall', verifyAuth, getAllDompet);
router.get('/dompet/getdompet', verifyAuth, getDompet);
router.put('/dompet/:dompetId', verifyAuth, updateDompet);
router.delete('/dompet/:dompetId', verifyAuth, deleteDompet);
module.exports = router;