// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types'; 
import { Link } from 'react-router-dom';


const ProcedureTable = ({ procedures = [], actimg1, actimg2 }) => {

    // Fallback data if appointments prop is not provided
      const proceduresActionList = [
        {
          name: 'Bitch Spay',
          category: 'Surgical Procedures',
          item: '7',
          totalcost: 'USD 450',
          created: 'Admin',
          lstupdte: '10 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Dental Cleaning',
          category: 'Preventive Care',
          item: '5',
          totalcost: 'USD 150',
          created: 'Dr. Sarah Collins',
          lstupdte: '8 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Vaccination Bundle',
          category: 'Preventive Care',
          item: '3',
          totalcost: 'USD 85',
          created: 'Dr. Alice Rivera',
          lstupdte: '26 Oct 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Orthopedic Surgery',
          category: 'Surgical Procedures',
          item: '9',
          totalcost: 'USD 1200',
          created: 'Admin',
          lstupdte: '14 Oct 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Gastro Check-Up',
          category: 'Chronic Conditions',
          item: '6',
          totalcost: 'USD 380',
          created: 'Dr. Michael Carter',
          lstupdte: '21 Sep 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Feline Diabetes Kit',
          category: 'Surgical Procedures',
          item: '7',
          totalcost: 'USD 450',
          created: 'Admin',
          lstupdte: '10 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Bitch Spay',
          category: 'Surgical Procedures',
          item: '7',
          totalcost: 'USD 450',
          created: 'Admin',
          lstupdte: '10 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Dental Cleaning',
          category: 'Preventive Care',
          item: '5',
          totalcost: 'USD 150',
          created: 'Dr. Sarah Collins',
          lstupdte: '8 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Vaccination Bundle',
          category: 'Preventive Care',
          item: '3',
          totalcost: 'USD 85',
          created: 'Dr. Alice Rivera',
          lstupdte: '26 Oct 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Orthopedic Surgery',
          category: 'Surgical Procedures',
          item: '9',
          totalcost: 'USD 1200',
          created: 'Admin',
          lstupdte: '14 Oct 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Gastro Check-Up',
          category: 'Chronic Conditions',
          item: '6',
          totalcost: 'USD 380',
          created: 'Dr. Michael Carter',
          lstupdte: '21 Sep 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        {
          name: 'Feline Diabetes Kit',
          category: 'Surgical Procedures',
          item: '7',
          totalcost: 'USD 450',
          created: 'Admin',
          lstupdte: '10 Nov 2024',
          acceptAction: '#',  
          declineAction: '#sss', 
        },
        
        // Add more items as needed
      ];
    
      // Use the provided `appointments` or fallback to `appointmentsActionList`
      const dataToRender = procedures.length > 0 ? procedures : proceduresActionList;
    
      // Pagination states
      const [currentPage, setCurrentPage] = useState(0);
      const itemsPerPage = 5;
    
      // Get the current page data
      const currentData = dataToRender.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      );
    
      // Handlers for pagination
      const handleNext = () => {
        if (currentPage < Math.ceil(dataToRender.length / itemsPerPage) - 1) {
          setCurrentPage(currentPage + 1);
        }
      };
    
      const handlePrev = () => {
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
      };
    



  return (
    <>
    <div className="MainTableDiv">
        <table className="Prceduretable">
            <thead>
            <tr >
                <th scope="col"></th>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col">Items</th>
                <th scope="col">Total Cost</th>
                <th scope="col">Created by</th>
                <th scope="col">Last updated</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            {currentData.map((procedure, index) => (
                <tr key={index} style={{alignItems:"center"}}>
                    <td scope="row">
                        <div className="proceicon ">
                            <i className="ri-checkbox-blank-circle-fill"></i>
                        </div>
                    </td>
                    <td><strong>{procedure.name}</strong></td>
                    <td><strong> {procedure.category}</strong></td>
                    <td><strong>{procedure.item}</strong></td>
                    <td><strong>{procedure.totalcost}</strong></td>
                    <td><strong>{procedure.created}</strong></td>
                    <td><strong>{procedure.lstupdte}</strong></td>
                    
                    <td>
                        <div className="actionDiv">
                            <Link to={procedure.acceptAction}> <img src={actimg1} alt="Accept" /></Link>
                            <Link to={procedure.declineAction}> <img src={actimg2} alt="Decline" /></Link>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="PaginationDiv">
            {/* Previous Button */}
            <button 
            onClick={handlePrev} 
            disabled={currentPage === 0} // Disable if we're on the first page
            >
            <i className="ri-arrow-left-line"></i>
            </button>

            {/* Pagination Range */}
            <h6 className="PagiName">
            Responses 
            <span>
                {currentPage * itemsPerPage + 1} -{' '}
                {Math.min((currentPage + 1) * itemsPerPage, dataToRender.length)} 
                {/* You can also show total here like: "of {dataToRender.length}" */}
            </span>
            </h6>

            {/* Next Button */}
            <button 
            onClick={handleNext} 
            disabled={currentPage >= Math.ceil(dataToRender.length / itemsPerPage) - 1} // Disable if on last page
            >
            <i className="ri-arrow-right-line"></i>
            </button>
        </div>
    </div>
    </>
  )
};

ProcedureTable.propTypes = {
  actimg1: PropTypes.string.isRequired,
  actimg2: PropTypes.string.isRequired,
  procedures: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      petName: PropTypes.string.isRequired,
      ownerName: PropTypes.string.isRequired,
      petType: PropTypes.string.isRequired,
      breed: PropTypes.string.isRequired,
      appointmentDate: PropTypes.string.isRequired,
      appointmentTime: PropTypes.string.isRequired,
      doctorName: PropTypes.string.isRequired,
      specialization: PropTypes.string.isRequired,
      petImage: PropTypes.string.isRequired,
      acceptAction: PropTypes.string.isRequired,
      declineAction: PropTypes.string.isRequired,
    })
  ),
};

export default ProcedureTable;