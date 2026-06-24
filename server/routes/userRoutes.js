const express = require('express');
const { getAllUsers, updateUserRole, updateMembership } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', restrictTo('admin', 'coach'), getAllUsers);
router.put('/:id/role', restrictTo('admin'), updateUserRole);
router.put('/:id/membership', restrictTo('admin'), updateMembership);

module.exports = router;
