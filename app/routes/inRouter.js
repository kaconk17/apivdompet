const express = require ('express');

const { createIn, getAllIn, getIn, updateIn, deleteIn } = require('../controllers/inController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// IN Routes

router.post('/in/create', verifyAuth, createIn);
router.get('/in/getall', verifyAuth, getIn);
router.get('/in/getin/:inId', verifyAuth, getAllIn);
router.put('/in/update/:inId', verifyAuth, updateIn);
router.delete('/in/del/:inId', verifyAuth, deleteIn);

module.exports = router;