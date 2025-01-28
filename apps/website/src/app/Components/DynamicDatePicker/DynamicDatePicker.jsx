// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import "./DynamicDatePicker.css";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormControl } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";

const DynamicDatePicker = ({ placeholder, onDateChange, value }) => {
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );

  // Update the local state when the value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : null;
    onDateChange(formattedDate);
  };

  return (
    <>
      <div className="DatePicDiv">
        <FormControl
          as="div"
          style={{ cursor: "pointer" }}
          className=""
          onClick={(e) => e.preventDefault()}
        >
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            placeholderText={placeholder}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
          />
        </FormControl>
        <FaCalendarAlt />
      </div>
    </>
  );
};

// Add PropTypes validation
DynamicDatePicker.propTypes = {
  placeholder: PropTypes.string.isRequired, // Placeholder must be a string and is required
  onDateChange: PropTypes.func.isRequired,
  value: PropTypes.string, // Optional initial value in 'yyyy-MM-dd' format
};

DynamicDatePicker.defaultProps = {
  value: null, // Default value is null if not provided
};

export default DynamicDatePicker;
