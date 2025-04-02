import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './CheckIn.css';
import Modal from 'react-bootstrap/Modal';
import Swal from 'sweetalert2';

import {
  CiBookmarkCheck,
  CiCircleChevLeft,
  CiCircleChevRight,
} from 'react-icons/ci';
import { BoxDiv, DivHeading } from '../Dashboard/page';
// import box1 from '../../../../public/Images/box1.png';

// import box2 from '../../../../public/Images/box2.png';
// import box3 from '../../../../public/Images/box3.png';
// import box4 from '../../../../public/Images/box4.png';

// import box5 from '../../../../public/Images/box5.png';
// import box6 from '../../../../public/Images/box6.png';
import {FHIRMapper,FHIRToSlotConverter} from "../../utils/FhirMapper";
import { Forminput } from '../SignUp/SignUp';
import { Col, Row } from 'react-bootstrap';
import DynamicSelect from '../../Components/DynamicSelect/DynamicSelect';
import DynamicDatePicker from '../../Components/DynamicDatePicker/DynamicDatePicker';
import { MainBtn } from '../Appointment/page';
import PatientsTable from '../../Components/PatientsTable/PatientsTable';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import { Link, useNavigate } from 'react-router-dom';

function CheckInModal(props) {
  const { userId, profileData ,onLogout} = useAuth();
  const navigate= useNavigate()

  const [AllData, setAllData] = useState({
    hospitalId: '',
    HospitalName: '',
    ownerName: '',
    phone: '',
    addressline1: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    petName: '',
    petAge: '',
    breed: '',
    purposeOfVisit: '',
    department: '',
    appointmentType: '',
    veterinarian: '',
    appointmentDate: '',
    day: '',
    petType: '',
    gender: '',
    appointmentSource: 'In-Hospital',
    Time: '',
    timeSlots: [],
  });
  console.log("hhhhhhhhhhhhhhhhhhhh",AllData.Time,AllData.timeSlots);
  useEffect(() => {
    setAllData((prev) => ({
      ...prev,
      hospitalId: userId || prev.hospitalId,
      HospitalName: profileData?.businessName,
    }));
  }, [userId, profileData]); // Include profileData to ensure re-run when it changes

  const [AvailableSlots, setAvailableSlots] = useState([]);
  console.log('AvailableSlots', AvailableSlots);
  console.log('AllData.hospitalId', AllData.HospitalName);
  useEffect(() => {
    setAllData((prev) => ({
      ...prev,
      userId,
    }));
  }, [userId]);
  const handleClick = (category, value) => {
    setAllData((prev) => ({
      ...prev,
      [category]: value,
    }));
  };
  const handleClicked = (category, value) => {
    if (!category || value === undefined) {
      console.error('Invalid category or value passed to handleClick');
      return;
    }

    console.log(`Updating ${category} with value:`, value);

    setAllData((prev) => ({
      ...prev,
      [category]: [value],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAllData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Select options
  const options = useMemo(
    () => [
      { value: '1', label: 'Vaccination' },
      { value: '2', label: 'Surgery' },
      { value: '3', label: 'Grooming' },
    ],
    []
  );

  const options2 = useMemo(
    () => [
      { value: '1', label: 'OPD' },
      { value: '2', label: 'Follow-up' },
      { value: '3', label: 'Walk-in' },
    ],
    []
  );

  const options3 = useMemo(
    () => [
      { value: '1', label: 'German Shepherd' },
      { value: '2', label: 'Poodle' },
      { value: '3', label: 'Labrador' },
    ],
    []
  );

  const [department, setDepartment] = useState([]);
  console.log("department",department)

  const getSpecializationDepartment = useCallback(async () => {
    // console.log('userId', userId);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}api/auth/getAddDepartment?userId=${userId}`,{headers:{Authorization: `Bearer ${token}`}}
      );
      if (response && response.data) {
        const data = response.data;
        setDepartment(
          data.map((v) => ({
            value: v._id,
            label: v.departmentName,
          }))
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
    }
  },[userId,navigate,onLogout]);

  useEffect(() => {
    getSpecializationDepartment();
    // getWaittingRoomOverView();
  }, [userId,getSpecializationDepartment]);
  const [veterinarian, setVeterinarian] = useState(null);
  console.log('veterinarian', veterinarian);
  const handleDepartmentSelect = async (value) => {
    console.log('Department Selected:', value);
    setAllData((prev) => ({
      ...prev,
      department: value,
    }));
    const token = sessionStorage.getItem('token');
    try {
      console.log('id', value);
      const response = await axios.get(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}api/doctors/getForAppDoctorsBySpecilizationId`,{params: {value: value,userId: userId}, headers: {
          Authorization: `Bearer ${token}`, // Attach the token to the request headers
        },}
      );

      if (response && response.data) {
        const data = response.data;
        console.log('data', data);

        setVeterinarian(
          data.map((v) => ({
            value: v.userId,
            label: `${v.personalInfo.firstName} ${v.personalInfo.lastName}`,
          }))
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
    }
  };
  const handleveternarian = (value) => {
    setAllData((prev) => ({
      ...prev,
      veterinarian: value,
    }));
  };
  const handleDateChange = async (date) => {
    setAllData((prev) => ({
      ...prev,
      appointmentDate: date,
    }));
    const day = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
    });
    setAllData((pre) => ({
      ...pre,
      day: day,
    }));
    try {
      const token = sessionStorage.getItem("token");  
      const { data } = await axios.get(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}fhir/v1/schedule`,
        {
          params: {
            doctorId: AllData.veterinarian,
            day,
            date,
          },
          headers: {Authorization: `Bearer ${token}`},
        }
      );
      console.log('data', data);
      if (data?.timeSlots) {
        console.log("//////////", data?.timeSlots);
        const convertedSlots = data.timeSlots.entry
          .filter((slot) => slot.resource.resourceType === "Slot") // Filter only Slot resources
          .map((slot) => {
            const slotConverter = new FHIRToSlotConverter(slot.resource);
            return slotConverter.convert();
          });
      console.log("convertedSlots", convertedSlots);
        setAvailableSlots(convertedSlots);      
      } else {
        console.log('hello');
        setAvailableSlots([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
      console.error('Error fetching doctor slots:', error);
      setAvailableSlots([]);
    }
  };
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!AllData.ownerName) errors.ownerName = 'Owner name is required.';
    if (!AllData.phone) errors.phone = 'Phone number is required.';
    if (!AllData.addressline1) errors.addressline1 = 'Address is required.';
    if (!AllData.city) errors.city = 'City is required.';
    if (!AllData.street) errors.street = 'Street is required.';
    if (!AllData.state) errors.state = 'State is required.';
    if (!AllData.zipCode) errors.zipCode = 'ZIP Code is required.';
    if (!AllData.petName) errors.petName = 'Pet name is required.';
    if (!AllData.petAge) errors.petAge = 'Pet age is required.';
    if (!AllData.breed) errors.breed = 'Breed is required.';
    if (!AllData.purposeOfVisit)
      errors.purposeOfVisit = 'Purpose of visit is required.';
    if (!AllData.appointmentType)
      errors.appointmentType = 'Appointment type is required';
    // if (!AllData.appointmentSource)
    //   errors.appointmentSource = 'Appointment source is required';
    if (!AllData.department) errors.department = 'Department is required.';
    if (!AllData.veterinarian)
      errors.veterinarian = 'Veterinarian is required.';
    if (!AllData.appointmentDate)
      errors.appointmentDate = 'Appointment date is required.';
    if (!AllData.petType) errors.petType = 'PetType is required';
    if (!AllData.gender) errors.gender = 'Gender i required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSave = async () => {
    // console.log('AllData', AllData);
    if (!validateFields()) return;
    const fhirMapper = new FHIRMapper(AllData);
    const fhirData = fhirMapper.toFHIR();
    console.log("FHIR Data:", fhirData);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}fhir/v1/Appointment`,
        fhirData,{headers:{Authorization:`Bearer ${token}`}}
      );

      if (response.status === 200) {
        // ✅ Success alert
        Swal.fire({
          icon: "success",
          title: "Appointment Created Successfully!",
          text: "Your appointment has been booked.",
        });
    
        // ✅ Reset form data
        setAllData({
          ownerName: "",
          phone: "",
          addressline1: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          petName: "",
          petAge: "",
          breed: "",
          purposeOfVisit: "",
          department: "",
          appointmentType: "",
          veterinarian: "",
          appointmentDate: "",
        });
    
    
        props.onHide();
      }
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
    
    
        if (
          errorData.resourceType === "OperationOutcome" &&
          errorData.issue &&
          errorData.issue.length > 0
        ) {
          const errorMessage =
            errorData.issue[0]?.details?.text || "An error occurred.";
          
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: errorMessage,
          });
        } else {
      
          Swal.fire({
            icon: "error",
            title: "Something went wrong!",
            text: "There was an issue creating the appointment. Please try again.",
          });
        }
    
       
        if (error.response.status === 401) {
          console.log("Session expired. Redirecting to signin...");
          onLogout(navigate); 
        }
      } else {
      
        Swal.fire({
          icon: "error",
          title: "Network Error!",
          text: "Unable to connect to the server. Please check your internet connection and try again.",
        });
      }
    }}

  return (
    <div className="CheckInModalSec">
      <Modal
        {...props}
        className="CheckInModal"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <h3>
            <span>Book</span> an Appointment
          </h3>
        </Modal.Header>

        <Modal.Body>
          <div className="CheckInBg">
            <h6>Owner Details</h6>
            <div className="onrdtl">
              <Row>
                <Col md={6}>
                  <Forminput
                    inlabel="Pet Owner’s Name"
                    intype="text"
                    inname="ownerName"
                    invalue={AllData.ownerName}
                    onChange={handleChange}
                  />
                  {validationErrors.ownerName && (
                    <div className="error-text">
                      {validationErrors.ownerName}
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <Forminput
                    inlabel="Phone number"
                    intype="number"
                    inname="phone"
                    invalue={AllData.phone}
                    onChange={handleChange}
                  />
                  {validationErrors.phone && (
                    <div className="error-text">{validationErrors.phone}</div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Forminput
                    inlabel="Address Line 1"
                    intype="text"
                    inname="addressline1"
                    invalue={AllData.addressline1}
                    onChange={handleChange}
                  />
                  {validationErrors.addressline1 && (
                    <div className="error-text">
                      {validationErrors.addressline1}
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <Forminput
                    inlabel="Street"
                    intype="text"
                    inname="street"
                    invalue={AllData.street}
                    onChange={handleChange}
                  />
                  {validationErrors.street && (
                    <div className="error-text">{validationErrors.street}</div>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Forminput
                    inlabel="City"
                    intype="text"
                    inname="city"
                    invalue={AllData.city}
                    onChange={handleChange}
                  />
                  {validationErrors.city && (
                    <div className="error-text">{validationErrors.city}</div>
                  )}
                </Col>
                <Col md={4}>
                  <Forminput
                    inlabel="State"
                    intype="text"
                    inname="state"
                    invalue={AllData.state}
                    onChange={handleChange}
                  />
                  {validationErrors.state && (
                    <div className="error-text">{validationErrors.state}</div>
                  )}
                </Col>
                <Col md={4}>
                  <Forminput
                    inlabel="ZIP Code"
                    intype="number"
                    inname="zipCode"
                    invalue={AllData.zipCode}
                    onChange={handleChange}
                  />
                  {validationErrors.zipCode && (
                    <div className="error-text">{validationErrors.zipCode}</div>
                  )}
                </Col>
              </Row>
            </div>
          </div>

          <div className="CheckInBg">
            <h6>Pet Details</h6>
            <div className="onrdtl">
              <Row>
                <Col md={6}>
                  <Forminput
                    inlabel="Pet’s Name"
                    intype="text"
                    inname="petName"
                    invalue={AllData.petName}
                    onChange={handleChange}
                  />
                  {validationErrors.petName && (
                    <div className="error-text">{validationErrors.petName}</div>
                  )}
                </Col>
                <Col md={6}>
                  <Forminput
                    inlabel="Age"
                    intype="number"
                    inname="petAge"
                    invalue={AllData.petAge}
                    onChange={handleChange}
                  />
                  {validationErrors.petAge && (
                    <div className="error-text">{validationErrors.petAge}</div>
                  )}
                </Col>
              </Row>
            </div>
            <div className="onrdtltype">
              <div className="PetTypeDiv">
                <p>Pet Type</p>
                <ul className="SelectUl">
                  {['Cat', 'Dog', 'Horse'].map((pet) => (
                    <li
                      key={pet}
                      className={AllData.petType === pet ? 'active' : ''}
                      onClick={() => handleClick('petType', pet)}
                    >
                      {pet}
                    </li>
                  ))}
                </ul>
                {validationErrors.petType && (
                  <div className="error-text">{validationErrors.petType}</div>
                )}
              </div>

              <div className="PetTypeDiv">
                <p>Gender</p>
                <ul className="SelectUl">
                  {['Male', 'Female'].map((gender) => (
                    <li
                      key={gender}
                      className={AllData.gender === gender ? 'active' : ''}
                      onClick={() => handleClick('gender', gender)}
                    >
                      {gender}
                    </li>
                  ))}
                </ul>
                {validationErrors.gender && (
                  <div className="error-text">{validationErrors.gender}</div>
                )}
              </div>

              <div>
                <DynamicSelect
                  options={options3}
                  placeholder="Breed"
                  value={AllData.breed}
                  onChange={(e) =>
                    setAllData((prev) => ({ ...prev, breed: e }))
                  }
                />
                {validationErrors.breed && (
                  <div className="error-text">{validationErrors.breed}</div>
                )}
              </div>
            </div>
          </div>

          <div className="CheckInBg">
            <h6>Appointment Details</h6>

            <Row>
              <Col md={6}>
                <DynamicSelect
                  options={options2}
                  placeholder="Purpose of Visit"
                  value={AllData.purposeOfVisit}
                  onChange={(e) =>
                    setAllData((prev) => ({ ...prev, purposeOfVisit: e }))
                  }
                />
                {validationErrors.purposeOfVisit && (
                  <div className="error-text">
                    {validationErrors.purposeOfVisit}
                  </div>
                )}
              </Col>
              <Col md={6}>
                <DynamicSelect
                  options={options}
                  placeholder="Appointment Type"
                  value={AllData.appointmentType}
                  onChange={(e) =>
                    setAllData((prev) => ({ ...prev, appointmentType: e }))
                  }
                />
                {validationErrors.appointmentType && (
                  <div className="error-text">
                    {validationErrors.appointmentType}
                  </div>
                )}
              </Col>
            </Row>

            {/* <div className="PetTypeDiv">
              <p>Appointment Source</p>
              <ul className="SelectUl">
                {['In-Hospital', 'App'].map((App) => (
                  <li
                    key={App}
                    className={
                      AllData.appointmentSource === App ? 'active' : ''
                    }
                    onClick={() => handleClick('appointmentSource', App)}
                  >
                    {App}
                  </li>
                ))}
              </ul>
              {validationErrors.appointmentSource && (
                <div className="error-text">
                  {validationErrors.appointmentSource}
                </div>
              )}
            </div> */}

            <Row>
              <Col md={6}>
                <DynamicSelect
                  options={department}
                  value={AllData.department}
                  onChange={(value) => handleDepartmentSelect(value)}
                  placeholder="Department"
                />
                {validationErrors.department && (
                  <div className="error-text">
                    {validationErrors.department}
                  </div>
                )}
              </Col>
              <Col md={6}>
                <DynamicSelect
                  options={veterinarian}
                  placeholder="Select Veterinarian"
                  value={AllData.veterinarian}
                  onChange={(value) => handleveternarian(value)}
                />
                {validationErrors.veterinarian && (
                  <div className="error-text">
                    {validationErrors.veterinarian}
                  </div>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <DynamicDatePicker
                  onDateChange={handleDateChange}
                  placeholder="Select Appointment Date"
                  minDate={Date.now()}
                />
                {validationErrors.appointmentDate && (
                  <div className="error-text">
                    {validationErrors.appointmentDate}
                  </div>
                )}
              </Col>
            </Row>

            <div className="PetTypeDiv">
              <p>Appointment Time</p>
              <ul className="SelectUl">
                {
                  // [
                  //   "10:30 AM",
                  //   "10:45 AM",
                  //   "11:00 AM",
                  //   "11:15 AM",
                  //   "11:30 AM",
                  //   "11:45 AM",
                  //   "12:00 PM",
                  //   "12:15 PM",
                  //   "12:30 PM",
                  //   "2:30 PM",
                  //   "3:15 PM",
                  //   "3:45 PM",
                  //   "4:30 PM",
                  //   "5:15 PM",
                  // ]

                  AvailableSlots && AvailableSlots.length > 0 ? (
                    AvailableSlots.map((timeSlot) => (
                      <li
                        key={timeSlot._id} // Ensure _id is unique
                        className={`${
                          AllData.timeSlots.some(
                            (v) => v.time === timeSlot.time
                          ) || timeSlot.isBooked
                            ? 'active'
                            : ''
                        }`}
                        onClick={
                          !timeSlot.isBooked
                            ? () => handleClicked('timeSlots', timeSlot)
                            : null
                        } // Disable click if isBooked is true
                        style={{
                          pointerEvents: timeSlot.isBooked ? 'none' : 'auto', // Disable pointer events if isBooked is true
                          opacity: timeSlot.isBooked ? 0.6 : 1, // Optional: Dim the slot if it is booked
                        }}
                      >
                        {timeSlot.time || 'No Time Available'}{' '}
                        {/* Fallback in case `time` is undefined */}
                      </li>
                    ))
                  ) : (
                    <div>No Slots Available For Today</div>
                  )
                }
              </ul>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <MainBtn
            onClick={() => {
              handleSave();
            }}
            btext="Create Appointment"
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
}

const CheckIn = () => {
  const { userId, onLogout } = useAuth();
  const navigate = useNavigate()
  const [modalShow, setModalShow] = React.useState(false);
  const [waittingRoomOverView, setWaitingRoomOverView] = useState({});
  const [
    WaitingRoomOverViewPatientInQueue,
    setWaitingRoomOverViewPatientInQueue,
  ] = useState([]);
  console.log(
    'WaitingRoomOverViewPatientInQueue',
    WaitingRoomOverViewPatientInQueue
  );
  const getWaittingRoomOverView = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}api/hospitals/WaitingRoomOverView?userId=${userId}`,{headers:{Authorization:`Bearer ${token}`}}
      );
      if (response.status === 200) {
        setWaitingRoomOverView(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
    }
  },[userId,onLogout,navigate]);
  const WaittingRoomOverViewPatientInQueue = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NX_PUBLIC_VITE_BASE_URL}api/hospitals/WaittingRoomOverViewPatientInQueue?userId=${userId}`,{headers:{Authorization:`Bearer ${token}`}}
      );
      if (response.status === 200) {
        setWaitingRoomOverViewPatientInQueue(response.data.Appointments);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
    }
  },[userId, navigate,onLogout]);
  useEffect(() => {
    getWaittingRoomOverView();
    WaittingRoomOverViewPatientInQueue();
  }, [userId,WaittingRoomOverViewPatientInQueue,getWaittingRoomOverView]);
  return (
    <>
      <section className="CheckInSec">
        <div className="container">
          <div className="CheckInData">
            <div className="TopCheckIn">
              <div className="CheckInHead">
                <div className="CheckInName">
                  <h2>
                    {' '}
                    <span>Waiting Room</span> Overview
                  </h2>
                </div>
                <div className="CheckInBtn">
                  <div className="Searchbar">
                    <input
                      type="text"
                      id="searchQueryInput"
                      name="searchQueryInput"
                      className="form-control"
                      placeholder="Search by name, ID, phone"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                    <button
                      id="searchQuerySubmit"
                      type="submit"
                      name="searchQuerySubmit"
                    >
                      <i className="ri-search-line"></i>
                    </button>
                  </div>

                  <div className="CheckToken">
                    <button onClick={() => setModalShow(true)}>
                      <CiBookmarkCheck /> Book Appointment
                    </button>
                  </div>
                </div>
              </div>
              <div className="CheckInBoxed">
                <h6>Overview</h6>
                <div className="CheckInOverview">
                  <div className="Boxsed">
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box1.png`}
                      ovradcls="purple"
                      ovrtxt="Patients in Waiting Room"
                      boxcoltext="purpletext"
                      overnumb={waittingRoomOverView.totalAppointments}
                    />
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box3.png`}
                      ovradcls=" cambrageblue"
                      ovrtxt="Tokens Generated Today"
                      boxcoltext="frowntext"
                      overnumb={waittingRoomOverView.appointmentsCreatedToday}
                    />
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box5.png`}
                      ovradcls=" cambrageblue"
                      ovrtxt="Checked-In Patients"
                      boxcoltext="greentext"
                      overnumb={waittingRoomOverView.checkedIn}
                    />
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box4.png`}
                      ovradcls="fawndark"
                      ovrtxt="Consultations Completed"
                      boxcoltext="ciltext"
                      overnumb={waittingRoomOverView.successful}
                    />
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box6.png`}
                      ovradcls="chillibg"
                      ovrtxt="Cancelled Tokens"
                      boxcoltext="purpletext"
                      overnumb={waittingRoomOverView.canceled}
                    />
                    <BoxDiv
                      boximg={`${process.env.NX_PUBLIC_VITE_BASE_IMAGE_URL}/box2.png`}
                      ovradcls=" purple"
                      ovrtxt="Doctors On-Duty"
                      boxcoltext="frowntext"
                      overnumb={waittingRoomOverView.availableDoctors}
                    />
                  </div>
                  <div className="CheckInServing">
                    <div className="ServingText">
                      <h6>Now Serving:</h6>
                      <h2>#12</h2>
                    </div>
                    <div className="ServPrevBtn">
                      <Link to="#">
                        <CiCircleChevLeft /> Previous
                      </Link>
                      <Link to="#" className="active">
                        Next Token <CiCircleChevRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="BottomCheckIn">
              <DivHeading TableHead="Patients in Queue" tablespan="(48)" />
              <PatientsTable
                // onClick={WaittingRoomOverViewPatientInQueue}
                appointments={WaitingRoomOverViewPatientInQueue}
              />
            </div>
          </div>
        </div>
      </section>

      <CheckInModal show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default CheckIn;
