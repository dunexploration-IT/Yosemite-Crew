const webAppointment = require("../models/WebAppointment");

const webAppointmentController = {
  createWebAppointment: async (req, res) => {
    try {
      const {
        ownerName,
        phone,
        addressline1,
        street,
        city,
        state,
        zipCode,
        petName,
        petAge,
        petType,
        gender,
        breed,
        purposeOfVisit,
        appointmentType,
        appointmentSource,
        department,
        veterinarian,
        appointmentDate,
      } = req.body;

      const response = await webAppointment.create({
        ownerName,
        phone,
        addressline1,
        street,
        city,
        state,
        zipCode,
        petName,
        petAge,
        petType,
        gender,
        breed,
        purposeOfVisit,
        appointmentType,
        appointmentSource,
        department,
        veterinarian,
        appointmentDate,
      });
      if (response) {
        res.status(200).json({ message: "Appointment created successfully" });
      } else {
        console.log("failed ");
        res.status(400).json({ message: "Failed to create Appointment" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = webAppointmentController;
