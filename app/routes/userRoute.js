const express = require ('express');

const { createUser, siginUser,getUser } = require('../controllers/userController');

const router = express.Router();

// users Routes

router.post('/auth/signup', createUser);
router.post('/auth/signin', siginUser);
router.post('/auth/getuser', getUser);

module.exports = router;