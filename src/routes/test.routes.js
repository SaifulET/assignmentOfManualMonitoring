const express = require('express');
const testController = require('../controllers/test.controller');
const asyncHandler = require('../middlewares/async-handler.middleware');

const router = express.Router();

router.get('/', asyncHandler(testController.list));
router.get('/:id', asyncHandler(testController.getById));
router.post('/', asyncHandler(testController.create));
router.patch('/:id', asyncHandler(testController.update));
router.delete('/:id', asyncHandler(testController.remove));

module.exports = router;
