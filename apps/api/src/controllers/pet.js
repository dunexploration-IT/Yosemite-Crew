const pet = require('../models/YoshPet');
const jwt = require('jsonwebtoken');
const path = require('path');
const {  handleMultipleFileUpload } = require('../middlewares/upload');
async function handleAddPet(req,res){
  const token = req.headers.authorization.split(' ')[1]; // Extract token
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
  const cognitoUserId = decoded.username; // Get user ID from token
  let imageUrls = '';
  const { petType, petBreed, petName, petGender, petdateofBirth, petCurrentWeight, petColor, petBloodGroup, isNeutered,ageWhenNeutered,microChipNumber,isInsured,insuranceCompany,policyNumber,passportNumber,petFrom  } = req.body; // Data from request body
 if (req.files) {
        const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
         imageUrls = await handleMultipleFileUpload(files);
    }

    const addPet = await pet.create({
        cognitoUserId,
        petType,
        petBreed,
        petName,
        petdateofBirth,
        petGender,
        petAge: calculateAge(petdateofBirth),
        petCurrentWeight,
        petColor,
        petBloodGroup,
        isNeutered,
        ageWhenNeutered,
        microChipNumber,
        isInsured,
        insuranceCompany,
        policyNumber,
        passportNumber,
        petFrom,
        petImage: imageUrls
    });
    if(addPet){
        res.status(200).json({
            status: 1,
            message: 'Pet Added successfully',
            data: addPet
          });
    }
   
}

async function handleGetPet(req, res) {
  try {
    const baseUrl = process.env.BASE_URL;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Missing token' }] });

    const cognitoUserId = jwt.verify(token, process.env.JWT_SECRET).username;
    const { limit = 10, offset = 0 } = req.body;
    const pets = await pet.find({ cognitoUserId }).skip(parseInt(offset)).limit(parseInt(limit));

    if (!pets.length) return res.status(200).json({ resourceType: 'Bundle', type: 'searchset', total: 0, entry: [], message: 'No pets found' });

    const fhirPets = pets.map(petData => ({
      resourceType: 'Patient', // Ensure resourceType is top level
      id: petData._id.toString(),
      identifier: [{ system: `${baseUrl}/fhir/pet-ids`, value: petData._id.toString() }],
      name: [{ use: 'official', text: petData.petName }],
      gender: petData.petGender?.toLowerCase() === 'male' ? 'male' : 'female',
      birthDate: petData.petdateofBirth,
      animal: { species: { text: petData.petType }, breed: { text: petData.petBreed } },
      extension: [
        { url: `${baseUrl}/fhir/extensions/pet-age`, valueString: petData.petAge,title: "petAge" },
        { url: `${baseUrl}/fhir/extensions/pet-color`, valueString: petData.petColor,title: "petColor" },
        { url: `${baseUrl}/fhir/extensions/pet-weight`, valueString: petData.petCurrentWeight,title: "petCurrentWeight" },
        { url: `${baseUrl}/fhir/extensions/pet-blood-group`, valueString: petData.petBloodGroup,title: "petBloodGroup" },
        { url: `${baseUrl}/fhir/extensions/is-neutered`, valueString: petData.isNeutered,title: "isNeutered" },
        { url: `${baseUrl}/fhir/extensions/age-when-neutered`, valueString: petData.ageWhenNeutered,title: "ageWhenNeutered" },
        { url: `${baseUrl}/fhir/extensions/microchip-number`, valueString: petData.microChipNumber,title: "microChipNumber" },
        { url: `${baseUrl}/fhir/extensions/is-insured`, valueString: petData.isInsured,title: "isInsured" },
        { url: `${baseUrl}/fhir/extensions/insurance-company`, valueString: petData.insuranceCompany,title: "insuranceCompany" },
        { url: `${baseUrl}/fhir/extensions/policy-number`, valueString: petData.policyNumber,title: "policyNumber" },
        { url: `${baseUrl}/fhir/extensions/passport-number`, valueString: petData.passportNumber,title: "passportNumber" },
        { url: `${baseUrl}/fhir/extensions/pet-from`, valueString: petData.petFrom,title: "petFrom" },
        { url: `${baseUrl}/fhir/extensions/pet-image`, valueString: petData.petImage[0],title: "petImage" }
      ],
      meta: {
        created: petData.createdAt,
        lastUpdated: petData.updatedAt
      }
    }));

    res.status(200).json({
      resourceType: 'Bundle',
      type: 'searchset',
      total: fhirPets.length,
      entry: fhirPets.map(petData => ({
        resource: petData // `resource` is directly the petData object
      }))
    });
  } catch (error) {
    res.status(500).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: error.message }] });
  }
}


async function handleDeletePet(req,res) {
    const petId = req.body.petId;
    const result = await pet.deleteOne({ _id: petId });
    if (result.deletedCount === 0) {
      return res.status(200).json({ message: "Pet not found" });
    }

    res.json({ message: "Pet deleted successfully" });
}

async function handleEditPet(req,res) {
    try {
    const updatedPetData = req.body;
    const id = updatedPetData.petId;
    const document =  req.file;
    if(document) {
        updatedPetData.petImage = document.filename;
    }
    const editPetData = await pet.findByIdAndUpdate(id,updatedPetData, { new: true });
    if (!editPetData) {
        return res.status(404).json({ message: "Pet record not found" });
      }
  
      res.json(editPetData);
    } catch (error) {
      res.status(500).json({ message: "Error updating pet record", error });
    }
    
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If the birth month hasn't occurred yet this year, or it's the birth month but the day hasn't occurred yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}


module.exports = {
    handleAddPet,
    handleGetPet,
    handleDeletePet,
    handleEditPet,
}