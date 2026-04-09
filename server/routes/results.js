const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  publishResult,
  getStudentResults,
  generateResultPDF
} = require('../controllers/resultController');

router.post('/publish', protect, publishResult);
router.get('/student/:studentId', protect, getStudentResults);
router.get('/pdf/:resultId', protect, generateResultPDF);

module.exports = router;