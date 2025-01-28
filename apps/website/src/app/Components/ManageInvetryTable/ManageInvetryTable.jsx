// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types'; 
import { Link } from 'react-router-dom';

const ManageInvetryTable = ({ mangeinvts = [], actimg1}) => {


    // Fallback data if appointments prop is not provided
          const mangeinvtsActionList = [
            {
              name: 'Zimax',
              generic: 'Azithromycin',
              sku: 'UY3750',
              strenth: '500mg',
              categry: 'Tablet',
              manufact: 'Zoetis',
              price: 'USD 20.55',
              manufactprice: 'USD 20.55 ',
              stock: '100',
              stockbtm: '150',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Oxidon',
              generic: 'Domperidon',
              sku: 'UY3749',
              strenth: '10mg',
              categry: 'Tablet',
              manufact: 'Intas',
              price: 'USD 15.00',
              manufactprice: 'USD 12.00',
              stock: '50',
              stockbtm: '60',
              expdate: '17/05/2025',
              acceptAction: '#',  
              
            },
            {
              name: 'Ceevit',
              generic: 'Multivitamin',
              sku: 'UY3710',
              strenth: '250mg',
              categry: 'Vitamins',
              manufact: 'Boehringer',
              price: 'USD 12.45',
              manufactprice: 'USD 10.00',
              stock: '5',
              stockbtm: '45',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Zimax',
              generic: 'Azithromycin',
              sku: 'UY3750',
              strenth: '500mg',
              categry: 'Tablet',
              manufact: 'Zoetis',
              price: 'USD 20.55',
              manufactprice: 'USD 20.55 ',
              stock: '100',
              stockbtm: '150',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Oxidon',
              generic: 'Domperidon',
              sku: 'UY3749',
              strenth: '10mg',
              categry: 'Tablet',
              manufact: 'Intas',
              price: 'USD 15.00',
              manufactprice: 'USD 12.00',
              stock: '50',
              stockbtm: '60',
              expdate: '17/05/2025',
              acceptAction: '#',  
              
            },
            {
              name: 'Ceevit',
              generic: 'Multivitamin',
              sku: 'UY3710',
              strenth: '250mg',
              categry: 'Vitamins',
              manufact: 'Boehringer',
              price: 'USD 12.45',
              manufactprice: 'USD 10.00',
              stock: '5',
              stockbtm: '45',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Zimax',
              generic: 'Azithromycin',
              sku: 'UY3750',
              strenth: '500mg',
              categry: 'Tablet',
              manufact: 'Zoetis',
              price: 'USD 20.55',
              manufactprice: 'USD 20.55 ',
              stock: '100',
              stockbtm: '150',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Oxidon',
              generic: 'Domperidon',
              sku: 'UY3749',
              strenth: '10mg',
              categry: 'Tablet',
              manufact: 'Intas',
              price: 'USD 15.00',
              manufactprice: 'USD 12.00',
              stock: '50',
              stockbtm: '60',
              expdate: '17/05/2025',
              acceptAction: '#',  
              
            },
            {
              name: 'Ceevit',
              generic: 'Multivitamin',
              sku: 'UY3710',
              strenth: '250mg',
              categry: 'Vitamins',
              manufact: 'Boehringer',
              price: 'USD 12.45',
              manufactprice: 'USD 10.00',
              stock: '5',
              stockbtm: '45',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Zimax',
              generic: 'Azithromycin',
              sku: 'UY3750',
              strenth: '500mg',
              categry: 'Tablet',
              manufact: 'Zoetis',
              price: 'USD 20.55',
              manufactprice: 'USD 20.55 ',
              stock: '100',
              stockbtm: '150',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            {
              name: 'Oxidon',
              generic: 'Domperidon',
              sku: 'UY3749',
              strenth: '10mg',
              categry: 'Tablet',
              manufact: 'Intas',
              price: 'USD 15.00',
              manufactprice: 'USD 12.00',
              stock: '50',
              stockbtm: '60',
              expdate: '17/05/2025',
              acceptAction: '#',  
              
            },
            {
              name: 'Ceevit',
              generic: 'Multivitamin',
              sku: 'UY3710',
              strenth: '250mg',
              categry: 'Vitamins',
              manufact: 'Boehringer',
              price: 'USD 12.45',
              manufactprice: 'USD 10.00',
              stock: '5',
              stockbtm: '45',
              expdate: '19/12/2024',
              acceptAction: '#',  
              
            },
            
            
            // Add more items as needed
          ];
        
          // Use the provided `appointments` or fallback to `appointmentsActionList`
          const dataToRender = mangeinvts.length > 0 ? mangeinvts : mangeinvtsActionList;
        
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
        <table className="MangeInvttable">
            <thead>
            <tr >
                <th scope="col"></th>
                <th scope="col">Name</th>
                <th scope="col">Generic <br /> Name</th>
                <th scope="col">SKU</th>
                <th scope="col">Strength</th>
                <th scope="col">Category</th>
                <th scope="col">Manufacturer</th>
                <th scope="col">Price</th>
                <th scope="col">Manufacturer <br /> Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Expiry Date</th>
                <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            {currentData.map((mangeinvt, index) => (
                <tr key={index} style={{alignItems:"center"}}>
                    <td scope="row">
                        <div className="proceicon">
                            <i className="ri-checkbox-blank-circle-fill"></i>
                        </div>
                    </td>
                    <td>{mangeinvt.name}</td>
                    <td> {mangeinvt.generic}</td>
                    <td>{mangeinvt.sku}</td>
                    <td>{mangeinvt.strenth}</td>
                    <td>{mangeinvt.categry}</td>
                    <td>{mangeinvt.manufact}</td>
                    <td>{mangeinvt.price}</td>
                    <td>{mangeinvt.manufactprice}</td>
                    <td>
                        <div className="tblDiv">
                            <h4>{mangeinvt.stock}</h4>
                            <p><i className="ri-box-3-fill"></i> {mangeinvt.stockbtm}</p>
                        </div>
                    </td>
                    <td>{mangeinvt.expdate}</td>
                    <td>
                        <div className="actionDiv">
                            <Link to={mangeinvt.acceptAction}> <img src={actimg1} alt="Accept" /></Link>
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

ManageInvetryTable.propTypes = {
  actimg1: PropTypes.string.isRequired,
  actimg2: PropTypes.string.isRequired,
  mangeinvts: PropTypes.arrayOf(
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

export default ManageInvetryTable;