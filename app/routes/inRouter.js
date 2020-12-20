const express = require ('express');

const { createIn, getAllIn, getIn } = require('../controllers/inController');
const verifyAuth = require ('../middleware/verifyAuth');

const router = express.Router();

// IN Routes

router.post('/in/create', verifyAuth, createIn);
router.get('/in/getall', verifyAuth, getAllIn);
router.get('/in/getdompet', verifyAuth, getIn);

module.exports = router;