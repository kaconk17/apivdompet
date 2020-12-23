const express = require ('express');

const { createOut,getAllOut, getOut, updateOut,deleteOut } = require('../controllers/outController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// IN Routes

router.post('/out/create', verifyAuth, createOut);
router.get('/out/getall/:dompetId', verifyAuth, getAllOut);
router.get('/out/getout', verifyAuth, getOut);
router.put('/out/update/:outId', verifyAuth, updateOut);
router.delete('/out/del/:outId', verifyAuth, deleteOut);

module.exports = router;