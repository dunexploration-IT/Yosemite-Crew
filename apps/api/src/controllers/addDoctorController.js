const Department = require('../models/AddDepartment');
const AddDoctors = require('../models/addDoctor');
const crypto = require('crypto');

import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminConfirmSignUpCommand,
  SignUpCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import FHIRConverter from '../utils/DoctorsHandler';
import { validateFHIR } from '../Fhirvalidator/FhirValidator';
// import { equal } from 'assert';
const AWS = require('aws-sdk');
const SES = new AWS.SES();
const { WebUser } = require('../models/WebUser');
const DoctorsTimeSlotes = require('../models/DoctorsSlotes');
const { webAppointments } = require('../models/WebAppointment');
const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});
const confirmUser = async (userPoolId, username) => {
  try {
    await cognito.send(
      new AdminConfirmSignUpCommand({
        UserPoolId: userPoolId,
        Username: username,
      })
    );
    console.log('User successfully confirmed.');
  } catch (error) {
    console.error('Error confirming user:', error);
    throw error;
  }
};
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
function getSecretHash(email) {
  const clientId = process.env.COGNITO_CLIENT_ID_WEB;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET_WEB;

  return crypto
    .createHmac('SHA256', clientSecret)
    .update(email + clientId)
    .digest('base64');
}
function convertTo24HourFormat(time) {
  const [hour, minute, period] = time
    .replace(/(\s+)/g, '') // Remove any spaces
    .match(/(\d+):(\d+)(AM|PM)/i)
    .slice(1);

  let hours24 = parseInt(hour, 10);
  if (period.toUpperCase() === 'PM' && hours24 !== 12) hours24 += 12;
  if (period.toUpperCase() === 'AM' && hours24 === 12) hours24 = 0;

  return `${hours24.toString().padStart(2, '0')}:${minute}`;
}
const AddDoctorsController = {
  addDoctor: async (req, res) => {
    try {
      console.log('file', req.files);
      const formData = req.body.fhirBundle
        ? JSON.parse(req.body.fhirBundle)
        : {};

      console.log('formData:', JSON.stringify(formData, null, 2));

      // 🛑 Check if 'entry' exists and is an array before using forEach
      if (!formData.entry || !Array.isArray(formData.entry)) {
        console.error("Invalid FHIR Bundle format. No 'entry' array found.");
        return res.status(400).json({
          error: "Invalid FHIR Bundle format. No 'entry' array found.",
        });
      }

      const parsedData = {
        personalInfo: {},
        residentialAddress: {},
        professionalBackground: {},
        availability: [],
        consultFee: 0,
        loginCredentials: {},
        authSettings: {},
        timeDuration: null,
        bussinessId: formData.identifier?.value || '', // Assuming `userId` comes from auth middleware
      };

      // 📚 Loop through FHIR Bundle and map to appropriate fields
      formData.entry.forEach((entry) => {
        const resource = entry.resource;

        switch (resource.resourceType) {
          case 'Practitioner':
            parsedData.personalInfo = {
              firstName: resource.name[0]?.given?.[0] || '',
              lastName: resource.name[0]?.family || '',
              email:
                resource.telecom?.find((t) => t.system === 'email')?.value ||
                '',
              phone:
                resource.telecom?.find((t) => t.system === 'phone')?.value ||
                '',
              gender: resource.gender || '',
              dateOfBirth: resource.birthDate || '',
            };
            parsedData.professionalBackground = {
              firstName: resource.name[0]?.given?.[0] || '',
              lastName: resource.name[0]?.family || '',
              email:
                resource.telecom?.find((t) => t.system === 'email')?.value ||
                '',
              phone:
                resource.telecom?.find((t) => t.system === 'phone')?.value ||
                '',
              gender: resource.gender || '',
              dateOfBirth: resource.birthDate || '',
              qualification: resource.qualification?.[0]?.code?.text || '',
              medicalLicenseNumber:
                resource.qualification?.[0]?.identifier?.[0]?.value || '',
              languagesSpoken:
                resource.communication?.[0]?.language?.text || '',
              biography:
                resource.extension?.find(
                  (ext) =>
                    ext.url ===
                    'http://example.org/fhir/StructureDefinition/practitioner-biography'
                )?.valueString || '',
              yearsOfExperience:
                resource.extension?.find(
                  (ext) =>
                    ext.url ===
                    'http://example.org/fhir/StructureDefinition/yearsOfExperience'
                )?.valueInteger || '',
            };
            break;
          case 'PractitionerRole':
            parsedData.availability = resource.availableTime.map((slot) => {
              // Convert FHIR Day to Schema Day
              const fhirDayToSchemaDay = {
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday',
                sun: 'Sunday',
              };

              // Split start time & end time
              const parseTime = (timeString) => {
                const [hour, minute] = timeString.split(':');
                const hourInt = parseInt(hour, 10);
                const period = hourInt >= 12 ? 'PM' : 'AM';
                const formattedHour =
                  hourInt > 12 ? (hourInt - 12).toString() : hourInt.toString();
                return {
                  hour: formattedHour.padStart(2, '0'),
                  minute: minute,
                  period: period,
                };
              };

              // Create the availability object
              return {
                day: fhirDayToSchemaDay[slot.daysOfWeek[0]] || 'Monday',
                times: [
                  {
                    from: parseTime(slot.availableStartTime),
                    to: parseTime(slot.availableEndTime),
                  },
                ],
              };
            });

            parsedData.consultFee =
              resource.extension?.find(
                (ext) =>
                  ext.url ===
                  'http://example.org/fhir/StructureDefinition/consultFee'
              )?.valueDecimal || 0;

            var timeDurationExtension = resource.extension?.find(
              (ext) =>
                ext.url ===
                'http://example.org/fhir/StructureDefinition/timeDuration'
            );
            parsedData.timeDuration = timeDurationExtension
              ? {
                  value: timeDurationExtension?.valueDuration?.value || 0,
                  unit: timeDurationExtension?.valueDuration?.unit || 'minutes',
                }
              : null;

            var activeModesExtension = resource.extension?.find(
              (ext) =>
                ext.url ===
                'http://example.org/fhir/StructureDefinition/activeModes'
            );

            parsedData.activeModes = activeModesExtension?.valueCodeableConcept
              ? activeModesExtension.valueCodeableConcept.map(
                  (concept) => concept.coding[0].display
                )
              : ['In-person'];

            var specializationCoding = resource.code?.[0]?.coding?.[0];
            parsedData.professionalBackground.specialization =
              specializationCoding?.display || 'General';
            parsedData.professionalBackground.specializationId =
              specializationCoding?.code || 'GEN001';
            break;

          case 'Location':
            parsedData.residentialAddress = {
              addressLine1: resource.address?.line?.[0] || 'NA',
              city: resource.address?.city || 'NA',
              stateProvince: resource.address?.state || 'NA',
              zipCode: resource.address?.postalCode || '',
              country: resource.address?.country || '',
            };
            break;

          case 'Basic':
            parsedData.loginCredentials = {
              username: resource.author?.display || '',
              password:
                resource.extension?.find(
                  (ext) =>
                    ext.url ===
                    'http://example.org/fhir/StructureDefinition/password'
                )?.valueString || '',
            };
            break;

          case 'Consent':
            parsedData.authSettings = resource.policy.reduce((acc, policy) => {
              const permissionType = policy.authority.split('/').pop();
              acc[permissionType] = policy.uri === 'granted';
              return acc;
            }, {});
            break;

          default:
            console.log(`Unknown Resource Type: ${resource.resourceType}`);
        }
      });

      console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));

      const {
        personalInfo,
        residentialAddress,
        professionalBackground,
        availability,
        consultFee,
        loginCredentials,
        authSettings,
        timeDuration,
        bussinessId,
        activeModes,
      } = parsedData;

      if (!loginCredentials?.username || !loginCredentials?.password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required.' });
      }

      const userPoolId = process.env.COGNITO_USER_POOL_ID_WEB;
      const clientId = process.env.COGNITO_CLIENT_ID_WEB;
      const username = loginCredentials.username;

      let userExists = false;
      try {
        await cognito.send(
          new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: username,
          })
        );
        userExists = true;
      } catch (error) {
        if (error.name !== 'UserNotFoundException') {
          console.error('Error checking user:', error);
          return res
            .status(500)
            .json({ message: 'Error checking user existence.' });
        }
      }

      if (userExists) {
        return res
          .status(409)
          .json({ message: 'User already exists. Please login.' });
      }

      const signUpParams = {
        ClientId: clientId,
        Username: username,
        Password: loginCredentials.password,
        UserAttributes: [{ Name: 'email', Value: username }],
      };

      if (process.env.COGNITO_CLIENT_SECRET_WEB) {
        signUpParams.SecretHash = getSecretHash(username);
      }

      let data;
      try {
        data = await cognito.send(new SignUpCommand(signUpParams));
        console.log('User successfully registered in Cognito:', data);
      } catch (err) {
        console.error('Cognito Signup Error:', err);
        return res
          .status(500)
          .json({ message: 'Error registering user. Please try again later.' });
      }

      try {
        await cognito.send(
          new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
          })
        );
        console.log('Email verified successfully.');
      } catch (error) {
        console.error('Error verifying email:', error);
      }

      console.log('Email verified successfully.');

      await confirmUser(userPoolId, username);

      const login = await WebUser.create({
        cognitoId: data.UserSub,
        businessType: 'Doctor',
        bussinessId,
      });

      if (!login) {
        return res
          .status(500)
          .json({ message: 'Failed to create login credentials.' });
      }

      // Send email with password
      const emailParams = {
        Source: process.env.MAIL_DRIVER,
        Destination: { ToAddresses: [username] },
        Message: {
          Subject: { Data: 'Your password' },
          Body: {
            Text: {
              Data: `Your password is: ${loginCredentials.password}. Keep it safe.`,
            },
          },
        },
      };

      try {
        const emailSent = await SES.sendEmail(emailParams).promise();
        console.log('Password sent:', emailSent);
      } catch (error) {
        console.error('Error sending email:', error);
      }

      // Upload files to S3
      const uploadToS3 = (file, folderName) => {
        return new Promise((resolve, reject) => {
          const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${folderName}/${Date.now()}_${file.name}`,
            Body: file.data,
            ContentType: file.mimetype,
          };

          s3.upload(params, (err, data) => {
            if (err) {
              console.error('Error uploading to S3:', err);
              reject(err);
            } else {
              resolve(data.Key);
            }
          });
        });
      };

      let image,
        cvFile,
        documents = [];

      if (req.files && req.files.profilePicture) {
        image = await uploadToS3(req.files.profilePicture, 'profilePicture');
      }
      if (req.files && req.files.cvFile) {
        const files = await uploadToS3(req.files.cvFile, 'cv');
        cvFile = {
          name: files,
          type: req.files.cvFile.mimetype,
          date: new Date(),
        };
      }
      if (req.files && req.files.document) {
        const documentFiles = Array.isArray(req.files.document)
          ? req.files.document
          : [req.files.document];

        for (let file of documentFiles) {
          const documentKey = await uploadToS3(file, 'documents');
          documents.push({
            name: documentKey,
            type: file.mimetype,
            date: new Date(),
          });
        }
      }

      // Save doctor details
      const newDoctor = new AddDoctors({
        userId: data.UserSub,
        personalInfo: { ...personalInfo, image },
        residentialAddress,
        professionalBackground: {
          ...professionalBackground,
          specialization: parsedData.professionalBackground.specialization,
          specializationId: parsedData.professionalBackground.specializationId,
        },
        availability,
        timeDuration: timeDuration.value,
        consultFee,
        authSettings,
        documents: documents,
        bussinessId,
        activeModes,
        cvFile,
      });

      const savedDoctor = await newDoctor.save();

      res.status(201).json({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'information',
            code: 'informational',
            details: {
              text: 'Doctor added successfully',
            },
          },
        ],
        doctor: savedDoctor,
      });
    } catch (error) {
      console.error('Error saving doctor:', error);
      res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: error.message,
            },
          },
        ],
      });
    }
  },

  getOverview: async (req, res) => {
    const { subject, reportType } = req.query;

  if (!subject || !reportType) {
    return res.status(400).json({ message: "Missing required query parameters" });
  }
  // Extract Organization ID from `subject=Organization/12345`
  const match = subject.match(/^Organization\/(.+)$/);
  if (!match) {
    return res.status(400).json({ 
      resourceType: 'OperationOutcome',
      reportType: reportType,
      issue: [
          {
              severity: 'error',
              code: 'invalid-subject',
              details: {
                text: 'Invalid subject format. Expected Organization/12345',
              },
          }]
     });
  }
  
  const organizationId = match[1];
    console.log('userId', organizationId);

    try {
     
      const aggregation = await AddDoctors.aggregate([
        {
          $match: { bussinessId: organizationId },
        },
        {
          $group: {
            _id: '$professionalBackground.specialization',
          },
        },
        {
          $count: 'totalSpecializations', // Directly count distinct specializations
        },
      ]);

      // Total doctors under this business
      const totalDoctors = await AddDoctors.countDocuments({
        bussinessId: organizationId,
      });

      // Count available doctors
      const availableDoctors = await AddDoctors.countDocuments({
        bussinessId: organizationId,
        isAvailable: '1',
      });

      const overview = {
        totalDoctors,
        totalSpecializations: aggregation[0]?.totalSpecializations || 0,
        availableDoctors,
      };
      console.log('Overview:', overview);

      const data = new FHIRConverter(overview)
      const response = data.overviewConvertToFHIR()
      // console.log('FHIR response:', JSON.stringify(response));
      return res.status(200).json(JSON.stringify(response));
 
    } catch (error) {
      console.error('Error fetching overview data:', error);
      return res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: error.message,
            },
          }]
      })
    }
  },
  getForAppDoctorsBySpecilizationId: async (req, res) => {
    try {
      const { userId, value } = req.query;

      const doctors = await AddDoctors.find({
        'professionalBackground.specialization': { $exists: true, $eq: value },
        bussinessId: { $exists: true, $eq: userId },
      }).select('userId personalInfo.firstName personalInfo.lastName');

      if (!doctors || doctors.length === 0) {
        return res
          .status(404)
          .json({ message: 'No doctors found for this specialization' });
      }

      return res.status(200).json(doctors);
    } catch (error) {
      console.error('Error fetching doctors by specialization ID:', error);

      return res.status(500).json({ message: 'Internal server error', error });
    }
  },
  getDoctorsBySpecilizationId: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const doctors = await AddDoctors.find({
        'professionalBackground.specialization': { $exists: true, $eq: id },
        bussinessId: { $exists: true, $eq: userId },
      }).select('userId personalInfo.firstName personalInfo.lastName');

      if (!doctors || doctors.length === 0) {
        return res
          .status(404)
          .json({ message: 'No doctors found for this specialization' });
      }

      return res.status(200).json(doctors);
    } catch (error) {
      console.error('Error fetching doctors by specialization ID:', error);

      return res.status(500).json({ message: 'Internal server error', error });
    }
  },
  searchDoctorsByName: async (req, res) => {
    try {
      const { name, bussinessId } = req.query;
      console.log('name', name, bussinessId);

      if (!bussinessId) {
        return res.status(400).json({ message: 'Business ID is required' });
      }

      const [firstName = '', lastName = ''] = name ? name.split(' ') : '';

      const searchFilter = {
        bussinessId,
        $or: [
          { 'personalInfo.firstName': { $regex: firstName, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: lastName, $options: 'i' } },
        ],
      };

      const doctors = await AddDoctors.find(searchFilter).select(
        'personalInfo.firstName personalInfo.lastName personalInfo.image professionalBackground.specialization professionalBackground.qualification userId isAvailable'
      );

      const specializationIds = [
        ...new Set(
          doctors
            .map((doctor) => doctor.professionalBackground?.specialization)
            .filter(Boolean) // Removes undefined/null values
        ),
      ];

      // Fetch department details
      const departments = await Department.find({
        _id: { $in: specializationIds },
      }).select('_id departmentName');

      const specializationMap = departments.reduce((acc, department) => {
        acc[department._id] = department.departmentName;
        return acc;
      }, {});

      const doctorDataWithSpecializations = doctors.map((doctor) => {
        const specializationId = doctor.professionalBackground?.specialization;
        return {
          userId: doctor.userId,
          isAvailable: doctor.isAvailable,
          doctorName: `${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
          qualification: doctor.professionalBackground?.qualification || 'N/A',
          specialization:
            specializationMap[specializationId] || 'No specialization found',
          image: doctor.personalInfo.image
            ? `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${doctor.personalInfo.image}`
            : '',
        };
      });

      // Grouping doctors by specialization
      const groupedBySpecialization = doctorDataWithSpecializations.reduce(
        (acc, doctor) => {
          const { specialization } = doctor;
          if (!acc[specialization]) {
            acc[specialization] = [];
          }
          acc[specialization].push(doctor);
          return acc;
        },
        {}
      );

      const data = new FHIRConverter(groupedBySpecialization);

      const fhirData = data.convertToFHIR();
      console.log("validate",validateFHIR(fhirData));

      res.status(200).json(fhirData);
    } catch (error) {
      console.error('Error fetching doctors data:', error);

      const operationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing',
            diagnostics: 'Failed to fetch doctors data',
            details: {
              text: error.message || 'Unknown error'
            }
          }
        ]
      };
  
      res.status(500).json(operationOutcome);
    }
  },

  getDoctors: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      console.log('Fetching doctor data for User ID:', id);

      const doctor = await AddDoctors.findOne({ userId: id }).lean();

      if (doctor) {
        const department = await Department.findOne({
          _id: doctor?.professionalBackground?.specialization,
        });

        if (doctor.personalInfo.image) {
          const imageUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: doctor.personalInfo.image,
          });
          const updatedDocuments = doctor.documents?.map((doc) => {
            const signedUrl = s3.getSignedUrl('getObject', {
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: doc.name,
            });

            return {
              _id: doc._id,
              name: signedUrl,
              type: doc.type,
              date: doc.date,
            };
          });

          console.log('updatedDocuments', updatedDocuments);
          return res.status(200).json({
            ...doctor._doc,
            timeDuration: doctor.timeDuration,
            availability: doctor.availability,
            residentialAddress: doctor.residentialAddress,
            personalInfo: { ...doctor.personalInfo, image: imageUrl },
            professionalBackground: {
              ...doctor.professionalBackground,
              specialization: department?.departmentName,
            },
            documents: updatedDocuments,
          });
        }
      } else {
        console.log('No doctor found for User ID:', id);
        return res.status(404).json({ message: 'Doctor not found' });
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      return res.status(500).json({
        message: 'An error occurred while fetching the doctor data',
        error: error.message,
      });
    }
  },

  deleteDocumentsToUpdate: async (req, res) => {
    const { userId, docId } = req.params;

    try {
      const user = await AddDoctors.findOne({ userId }).lean();

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.documents || user.documents.length === 0) {
        return res
          .status(404)
          .json({ message: 'No documents found for this user' });
      }

      const documentToDelete = user.documents.find(
        (doc) => doc._id.toString() === docId
      );

      if (!documentToDelete) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const s3Key = documentToDelete.name;
      console.log('S3 Key to delete:', s3Key);

      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
      };

      try {
        const headObject = await s3.headObject(deleteParams).promise();
        console.log('S3 File Found:', headObject);
      } catch (headErr) {
        console.error('S3 File Not Found:', headErr);
        return res.status(404).json({ message: 'File not found in S3' });
      }

      try {
        const deleteResponse = await s3.deleteObject(deleteParams).promise();
        console.log('S3 Delete Response:', deleteResponse);
      } catch (deleteErr) {
        console.error('S3 Deletion Error:', deleteErr);
        return res
          .status(500)
          .json({ message: 'Failed to delete file from S3', error: deleteErr });
      }

      const updatedUser = await AddDoctors.findOneAndUpdate(
        { userId },
        { $pull: { documents: { _id: docId } } },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: 'Document not found in the database' });
      }

      console.log('Document deleted successfully from both database and S3');
      res.status(200).json({
        message: 'Document deleted successfully from both database and S3',
        updatedUser,
      });
    } catch (err) {
      console.error('Unexpected Error:', err);
      res.status(500).json({
        message: 'An error occurred while deleting the document',
        error: err,
      });
    }
  },
  updateDoctorProfile: async (req, res) => {
    const userId = req.params.id;
    const formData = req.body.formData ? JSON.parse(req.body.formData) : {};
    const { personalInfo, residentialAddress, professionalBackground } =
      formData;

    console.log('Received Data:', formData, req.files, userId);

    // Helper function to upload files to S3
    const uploadToS3 = (file, folderName) => {
      return new Promise((resolve, reject) => {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${folderName}/${Date.now()}_${file.name}`,
          Body: file.data,
          ContentType: file.mimetype,
        };

        s3.upload(params, (err, data) => {
          if (err) {
            console.error('Error uploading to S3:', err);
            reject(err);
          } else {
            resolve(data.Key);
          }
        });
      });
    };

    // Helper function to delete a file from S3
    const deleteFromS3 = async (key) => {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      };
      try {
        await s3.deleteObject(params).promise();
        console.log(`Deleted S3 object: ${key}`);
      } catch (err) {
        console.error('Error deleting S3 object:', err);
      }
    };

    let uploadedImageKey = null;
    const uploadedDocuments = [];

    try {
      if (req.files && req.files.image) {
        uploadedImageKey = await uploadToS3(req.files.image, 'images');
      }
      if (req.files && req.files.document) {
        const documentFiles = Array.isArray(req.files.document)
          ? req.files.document
          : [req.files.document];

        for (let file of documentFiles) {
          const documentKey = await uploadToS3(file, 'documents');
          uploadedDocuments.push({
            name: documentKey,
            type: file.mimetype,
            date: new Date(),
          });
        }
      }
      console.log('uploadedImageKey', uploadedImageKey, uploadedDocuments);

      const specialization = await Department.findOne({
        departmentName: professionalBackground.specialization,
      });

      if (!specialization) {
        return res.status(400).json({
          message: 'Invalid specialization provided',
        });
      }

      // Find existing doctor profile
      const existingDoctor = await AddDoctors.findOne({ userId });
      if (!existingDoctor) {
        return res.status(404).json({
          message: 'Doctor profile not found',
        });
      }

      var oldImageKey = existingDoctor.personalInfo?.image;

      const updateResult = await AddDoctors.updateOne(
        { userId },
        {
          $set: {
            personalInfo: {
              ...personalInfo,
              image: uploadedImageKey || oldImageKey,
            },
            residentialAddress,
            professionalBackground: {
              ...professionalBackground,
              specialization: specialization._id,
            },
          },
          $push: {
            documents: {
              $each: uploadedDocuments,
            },
          },
        }
      );

      if (updateResult) {
        if (uploadedImageKey && oldImageKey) {
          await deleteFromS3(oldImageKey);
        }
        console.log('Doctor profile updated successfully');
        return res.status(200).json({
          message: 'Doctor profile updated successfully',
        });
      } else {
        console.log('falieddd');
        return res.status(400).json({
          message: 'Failed to update doctor profile',
        });
      }
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(500).json({
        message: 'An error occurred while updating the doctor profile',
        error: error.message,
      });
    }
  },

  AddDoctorsSlote: async (req, res) => {
    try {
      const { day, slots } = req.body;

      console.log(
        'slots',
        slots.entry.map((slots) => slots.resource)
      );
      const doctorId = req.params.id;
      console.log(day, slots, doctorId);
      const formattedSlots = slots.map((slot) => ({
        ...slot,
        time24: convertTo24HourFormat(slot.time),
      }));

      let existingRecord = await DoctorsTimeSlotes.findOne({ doctorId, day });

      if (existingRecord) {
        // Extract times from incoming slots and existing slots
        const incomingTimes = formattedSlots.map((slot) => slot.time);
        const existingTimes = existingRecord.timeSlots.map((slot) => slot.time);

        // Identify slots to remove (existing but not in incoming data)
        const slotsToRemove = existingTimes.filter(
          (time) => !incomingTimes.includes(time)
        );

        // Update or add incoming slots
        const updatedSlots = existingRecord.timeSlots.map((existingSlot) => {
          const incomingSlot = formattedSlots.find(
            (slot) => slot.time === existingSlot.time
          );
          if (incomingSlot) {
            // Update the `selected` and `time24` fields if they have changed
            existingSlot.selected = incomingSlot.selected;
            existingSlot.time24 = incomingSlot.time24;
          }
          return existingSlot;
        });

        // Add new slots (those in incoming data but not in existing data)
        const newSlots = formattedSlots.filter(
          (slot) => !existingTimes.includes(slot.time)
        );
        updatedSlots.push(...newSlots);

        // Remove slots that no longer exist in incoming data
        const finalSlots = updatedSlots.filter(
          (slot) => !slotsToRemove.includes(slot.time)
        );

        // Update the database with the final list of slots
        existingRecord.timeSlots = finalSlots;
        await existingRecord.save();

        return res.status(200).json({
          message: 'Slots updated successfully.',
          data: existingRecord,
        });
      } else {
        // If no record exists, create a new one
        const newRecord = new DoctorsTimeSlotes({
          doctorId,
          day,
          timeSlots: formattedSlots,
        });
        await newRecord.save();

        return res.status(201).json({
          message: 'New slots created successfully.',
          data: newRecord,
        });
      }
    } catch (error) {
      console.error('Error in AddDoctorsSlot:', error);
      return res.status(500).json({
        message: 'An error occurred while adding/updating slots.',
        error: error.message,
      });
    }
  },
  getDoctorsSlotes: async (req, res) => {
    try {
      const { doctorId, day, date } = req.query;

      console.log('Fetching slots for:', { doctorId, day, date });

      const bookedSlots = await webAppointments.find({
        veterinarian: doctorId,
        appointmentDate: date,
      });
      console.log('bookedSlots', bookedSlots);

      const response = await DoctorsTimeSlotes.findOne({ doctorId, day });
      console.log('response', response);

      if (response) {
        const bookedSlotIds = bookedSlots.map((slot) => slot.slotsId);

        const updatedTimeSlots = response.timeSlots.map((slot) => ({
          ...slot.toObject(),
          isBooked: bookedSlotIds.includes(slot._id.toString()),
        }));

        return res.status(200).json({
          message: 'Data fetched successfully',
          timeSlots: updatedTimeSlots,
        });
      } else {
        return res.status(404).json({
          // message: "Data fetch Failed",
          // timeSlots: [],
        });
      }
    } catch (error) {
      console.error('Error in getDoctorsSlotes:', error);
      return res.status(500).json({
        message: 'An error occurred while fetching slots.',
        error: error.message,
      });
    }
  },

  getAppointmentsForDoctorDashboard: async (req, res) => {
    try {
      const { doctorId, offset = 0, limit = 5 } = req.query;
      console.log(req.query);

      const parsedOffset = parseInt(offset, 10);
      const parsedLimit = parseInt(limit, 10);

      const response = await webAppointments.aggregate([
        {
          $match: {
            veterinarian: doctorId,
            isCanceled: { $eq: 0 }, // Exclude appointments where isCanceled is 2
          },
        },
        {
          $addFields: {
            departmentObjId: { $toObjectId: '$department' },
          },
        },
        {
          $lookup: {
            from: 'adddoctors',
            localField: 'veterinarian',
            foreignField: 'userId',
            as: 'doctorInfo',
          },
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'departmentObjId',
            foreignField: '_id',
            as: 'departmentInfo',
          },
        },
        {
          $unwind: {
            path: '$doctorInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$departmentInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: parsedOffset }, { $limit: parsedLimit }],
          },
        },
        {
          $project: {
            total: { $arrayElemAt: ['$metadata.total', 0] },
            Appointments: {
              $map: {
                input: '$data',
                as: 'appointment',
                in: {
                  _id: '$$appointment._id',
                  tokenNumber: '$$appointment.tokenNumber',
                  petName: '$$appointment.petName',
                  ownerName: '$$appointment.ownerName',
                  slotsId: '$$appointment.slotsId',
                  petType: '$$appointment.petType',
                  breed: '$$appointment.breed',
                  purposeOfVisit: '$$appointment.purposeOfVisit',
                  appointmentDate: {
                    $dateToString: {
                      format: '%d %b %Y',
                      date: { $toDate: '$$appointment.appointmentDate' },
                    },
                  },
                  appointmentTime: '$$appointment.appointmentTime',
                  appointmentStatus: '$$appointment.appointmentStatus',
                  department: '$$appointment.departmentInfo.departmentName',
                  veterinarian: {
                    $concat: [
                      '$$appointment.doctorInfo.personalInfo.firstName',
                      ' ',
                      '$$appointment.doctorInfo.personalInfo.lastName',
                    ],
                  },
                },
              },
            },
          },
        },
      ]);

      if (!response.length || !response[0].Appointments.length) {
        return res
          .status(404)
          .json({ message: 'No slots found for the doctor.' });
      }

      return res.status(200).json({
        message: 'Data fetched successfully',
        totalAppointments: response[0].total || 0,
        Appointments: response[0].Appointments,
      });
    } catch (error) {
      console.error('Error in getAppointmentsForDoctorDashboard:', error);
      return res.status(500).json({
        message: 'An error occurred while fetching slots.',
        error: error.message,
      });
    }
  },
  getLast7DaysAppointmentsTotalCount: async (req, res) => {
    try {
      const { doctorId } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      const totalAppointments = await webAppointments.countDocuments({
        veterinarian: doctorId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      return res.status(200).json({
        message:
          'Total appointment count for the last 7 days fetched successfully',
        totalAppointments,
      });
    } catch (error) {
      console.error('Error in getLast7DaysAppointmentsTotalCount:', error);
      return res.status(500).json({
        message: 'An error occurred while fetching data.',
        error: error.message,
      });
    }
  },
  AppointmentAcceptedAndCancel: async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
      console.log('Appointment ID:', id, 'Status:', status);

      const appointment = await webAppointments.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            isCanceled: status,
          },
        },
        { new: true }
      );
      console.log('Updated Appointment:', appointment);
      if (appointment) {
        return res.status(200).json({
          message: 'Appointment status updated successfully.',
          appointment,
        });
      } else {
        return res.status(404).json({
          message: 'Appointment not found.',
        });
      }
    } catch (error) {
      console.error('Error in AppointmentAcceptedAndCancel:', error);
      return res.status(500).json({
        message: 'An error occurred while updating appointment status.',
        error: error.message,
      });
    }
  },
  updateAvailability: async (req, res) => {
    try {
      const { userId, status } = req.query;

      const result = await AddDoctors.updateOne(
        { userId: userId },
        { $set: { isAvailable: status } }
      );

      console.log('Update Result:', result);

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.status(200).json({
        message: 'Availability updated successfully.',
        // isAvailable: status,
      });
    } catch (error) {
      console.error('Error in updateAvailability:', error);
      return res.status(500).json({
        message: 'An error occurred while updating user availability.',
        error: error.message,
      });
    }
  },
  getAvailabilityStatus: async (req, res) => {
    try {
      const { userId } = req.query;
      const result = await AddDoctors.findOne({ userId: userId });
      console.log('Availability Status:', result);
      if (!result) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json({
        message: 'Availability status retrieved successfully.',
        isAvailable: result.isAvailable,
      });
    } catch (error) {
      console.error('Error in getAvailabilityStatus:', error);
      return res.status(500).json({
        message: 'An error occurred while retrieving user availability status.',
        error: error.message,
      });
    }
  },
};

module.exports = AddDoctorsController;
