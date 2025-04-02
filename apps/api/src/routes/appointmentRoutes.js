const express = require('express');
const router = express.Router();
const webAppointmentController = require('../controllers/webAppointment');
const { verifyTokenAndRefresh } = require('../middlewares/authMiddleware');
const { uploadimage } = require('../controllers/addDepartmentController');

router.post('/Appointment', verifyTokenAndRefresh,webAppointmentController.createWebAppointment);
router.get('/schedule', verifyTokenAndRefresh,webAppointmentController.getDoctorsSlotes);
router.post("/uploadimage",uploadimage)

module.exports = router;
