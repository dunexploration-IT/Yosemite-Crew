const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Serve pet-age.json file from the extensions folder
router.get('/pet-age', (req, res) => {
    // Resolve the relative path based on the current working directory
    const filePath = path.join(process.cwd(), 'apps/api/src/extensions/pet-age.json');
    
    // Log the file path to verify it's correct
    console.log("File Path:", filePath);
    
    // Read and log the JSON content from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return res.status(500).json({ message: "Error reading the file", error: err.message });
        }

        // Parse the JSON data
        try {
            const jsonData = JSON.parse(data);
            console.log("File Content:", jsonData);  // Log the JSON content
            res.json(jsonData);  // Send the JSON content in the response
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            res.status(500).json({ message: "Error parsing JSON", error: parseError.message });
        }
    });
});

module.exports = router;
