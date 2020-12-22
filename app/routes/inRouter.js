const express = require ('express');

const { createIn, getAllIn, getIn, updateIn } = require('../controllers/inController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// IN Routes

router.post('/in/create', verifyAuth, createIn);
router.get('/in/getin', verifyAuth, getIn);
router.get('/in/:inId', verifyAuth, getAllIn);
router.put('/in/:inId', verifyAuth, updateIn);

module.exports = router;