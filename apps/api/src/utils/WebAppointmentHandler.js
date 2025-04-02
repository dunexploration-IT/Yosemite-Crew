class FHIRToNormalConverter {
    constructor(fhirData) {
      this.fhirData = fhirData;
    }
  
    // Convert FHIR to normal data format
    convertToNormal() {
      const resource = this.fhirData;
  
      // Extracting hospital data from Organization
      const hospitalParticipant = resource.participant?.find((p) =>
        p.actor?.reference?.startsWith('Organization/')
      );
      const hospitalId = hospitalParticipant?.actor?.reference?.split('/')[1] || '';
      const HospitalName = hospitalParticipant?.actor?.display || '';
  
      // Extracting owner data from Patient
      const ownerParticipant = resource.participant?.find((p) =>
        p.actor?.reference?.startsWith('Patient/')
      );
      const ownerName = ownerParticipant?.actor?.display || '';
  
      // Extracting veterinarian data from Practitioner
      const vetParticipant = resource.participant?.find((p) =>
        p.actor?.reference?.startsWith('Practitioner/')
      );
      const veterinarian = vetParticipant?.actor?.display || '';
  
      // Extracting other extensions and appointment data
      const phone =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/phone'
        )?.valueString || '';
      const addressline1 =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/address-line1'
        )?.valueString || '';
      const street =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/street'
        )?.valueString || '';
      const city =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/city'
        )?.valueString || '';
      const state =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/state'
        )?.valueString || '';
      const zipCode =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/zip-code'
        )?.valueString || '';
      const petName =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/pet-name'
        )?.valueString || '';
      const petAge =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/pet-age'
        )?.valueString || '';
      const petType =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/pet-type'
        )?.valueString || '';
      const gender =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/gender'
        )?.valueString || '';
      const breed =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/breed'
        )?.valueString || '';
      const purposeOfVisit =
        resource.reasonCode?.[0]?.text || '';
      const appointmentType =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/appointment-type'
        )?.valueString || '';
      const appointmentSource =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/appointment-source'
        )?.valueString || 'In-Hospital';
      const department =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/department'
        )?.valueString || '';
      const appointmentDate =
        resource.extension?.find(
          (ext) => ext.url === 'http://example.com/fhir/StructureDefinition/appointment-date'
        )?.valueString || '';
  
      // Convert date to readable format
      const day = appointmentDate
        ? new Date(appointmentDate).toLocaleDateString('en-US', {
            weekday: 'long',
          })
        : 'Invalid Date';
  
      // Extracting time slots
      const timeSlots =
        resource.extension
          ?.find((ext) => ext.url === 'http://example.com/fhir/StructureDefinition/time-slots')
          ?.extension?.map((slot) => ({
            time:
              slot.extension?.find((ext) => ext.url === 'time')?.valueString ||
              '',
            time24:
              slot.extension?.find((ext) => ext.url === 'time24')?.valueString ||
              '',
            _id: slot.extension?.find((ext) => ext.url === '_id')?.valueString || '',
            isBooked:
              slot.extension?.find((ext) => ext.url === 'isBooked')
                ?.valueBoolean || false,
            selected:
              slot.extension?.find((ext) => ext.url === 'selected')
                ?.valueBoolean || false,
          })) || [];
  
      // Map data to the normal data format
      const normalData = {
        hospitalId,
        HospitalName,
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
        day,
        timeSlots,
      };
  
      return normalData;
    }
  }
  
  module.exports = FHIRToNormalConverter;
  