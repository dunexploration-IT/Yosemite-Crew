import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AddProcedurePackage.css';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Forminput } from '../SignUp/SignUp';
import DynamicSelect from '../../Components/DynamicSelect/DynamicSelect';
import { MainBtn } from '../Appointment/page';
// import whtcheck from '../../../../public/Images/whtcheck.png';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import ViewPackageTable from '../../Components/PackageTable/ViewPackageTable';
import Swal from 'sweetalert2';

function ViewProcedurePackage(fetchPackageData) {
  const navigate = useNavigate();
  const { userId ,onLogout} = useAuth();
  const { id } = useParams();
  const [procedureData, setProcedureData] = useState({
    id: '',
    packageName: '',
    category: '',
    description: '',
    packageItems: [],
  });

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(                   
          `${import.meta.env.VITE_BASE_URL}api/inventory/GetProcedurePackageByid?id=${id}&userId=${userId}`,{headers:{Authorization:`Bearer ${token}`}}
        );

        const data = response.data.procedurePackage;
        setProcedureData({
          id:data._id,
          packageName: data.packageName,
          category: data.category,
          description: data.description,
          packageItems: data.packageItems.map((item, index) => ({
            ...item,
            key: index, // Ensure each item has a unique key
          })),
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('Session expired. Redirecting to signin...');
          onLogout(navigate);
        }
      }
    };

    if (id) {
      fetchPackageData();
    }
  }, [id, userId,navigate,onLogout]);

  // Function to handle deleting package items
  // const handleDeleteItem = (key) => {
  //   setProcedureData((prevData) => ({
  //     ...prevData,
  //     packageItems: prevData.packageItems.filter((item) => item.key !== key),
  //   }));
  // };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/inventory/updateProcedurePackage?id=${id}&userId=${userId}`,
        procedureData,{headers:{Authorization:`Bearer ${token}`}}
      );
     if(response){ 
       navigate('/inventory');
      Swal.fire({
        title: 'Procedure Package Updated Successfully',
        text: 'Procedure Package Updated Successfully',
        icon:'success',
       })

     }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Session expired. Redirecting to signin...');
        onLogout(navigate);
      }
     Swal.fire({
      title: 'Error Updating Procedure Package',
      text: 'Error Updating Procedure Package',
      icon:'error',
     })
    }
  };

  return (
    <section className="AddProcedurePackageSec">
      <Container>
        <div className="AddProcedurePackagedata">
          <div className="TopProcedHead">
            <h3>
              <span>View</span> Procedure Package
            </h3>
          </div>

          <div className="AddProcedurePackageBox">
            <Form onSubmit={handleUpdate}>
              <Row>
                <Col md={6}>
                  <Forminput
                    inlabel="Package Name"
                    intype="text"
                    inname="packageName"
                    value={procedureData.packageName}
                    onChange={(e) =>
                      setProcedureData({ ...procedureData, packageName: e.target.value })
                    }
                  />
                </Col>
                <Col md={6}>
                  <DynamicSelect
                    options={[
                      { value: '1', label: 'Appendectomy' },
                      { value: '2', label: 'Gallbladder Removal' },
                      { value: '3', label: 'Knee Replacement' },
                    ]}
                    value={procedureData.category}
                    onChange={(value) =>
                      setProcedureData({ ...procedureData, category: value })
                    }
                    placeholder="Category"
                  />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div className="form-floating mb-3">
                    <textarea
                      className="form-control"
                      placeholder="Short description of the procedure."
                      id="floatingTextarea2"
                      value={procedureData.description}
                      onChange={(e) =>
                        setProcedureData({ ...procedureData, description: e.target.value })
                      }
                    ></textarea>
                    <label htmlFor="floatingTextarea2">Short description of the procedure.</label>
                  </div>
                </Col>
              </Row>
              
              <ViewPackageTable
               packageItems={procedureData.packageItems}
               fetchPackageData={fetchPackageData}
               updatePackageItems={(items) =>
                setProcedureData((prevData) => ({
                  ...prevData, 
                  packageItems: items, 
                }))
              }
              
                /> 
              <div className="ee">
                <MainBtn bimg={`${import.meta.env.VITE_BASE_IMAGE_URL}/whtcheck.png`} btext="Update Package" optclas="" />
              </div>
            </Form>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ViewProcedurePackage;
