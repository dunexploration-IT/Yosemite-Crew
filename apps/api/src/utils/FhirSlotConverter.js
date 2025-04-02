class FHIRSlotConverter {
  constructor(slots, practitionerId, scheduleId) {
    this.slots = slots;
    this.practitionerId = practitionerId; 
    this.scheduleId = scheduleId || `schedule-${practitionerId}`; 
  }

  
  createSlotResource(slot) {
    return {
      resourceType: 'Slot',
      identifier: [
        {
          system: 'http://example.org/slots',
          value: slot._id,
        },
      ],
      schedule: {
        reference: `Schedule/${this.scheduleId}`,
      },
      status: slot.isBooked ? 'busy' : 'free',
      start: `${slot.time24}:00Z`, // Return original time data
    };
  }

 
  createScheduleResource() {
    return {
      resourceType: 'Schedule',
      id: this.scheduleId,
      active: true,
      serviceType: [
        {
          coding: [
            {
              system: 'http://example.org/service-type',
              code: 'consult',
              display: 'Doctor Consultation',
            },
          ],
        },
      ],
      actor: [
        {
          reference: `Practitioner/${this.practitionerId}`,
          display: 'Doctor',
        },
      ],
    };
  }


  convertToFHIRBundle() {
    const scheduleEntry = {
      resource: this.createScheduleResource(),
      request: {
        method: 'PUT',
        url: `Schedule/${this.scheduleId}`,
      },
    };

    const slotEntries = this.slots.map((slot) => ({
      resource: this.createSlotResource(slot),
      request: {
        method: 'POST',
        url: 'Slot',
      },
    }));

    return {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [scheduleEntry, ...slotEntries],
    };
  }
}

module.exports = FHIRSlotConverter;
