const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Excel file path
const excelFilePath = path.join(__dirname, 'contact_form_data.xlsx');

// Create Excel file if it doesn't exist
if (!fs.existsSync(excelFilePath)) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Name', 'Email', 'Message', 'Date']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Form Data');
    XLSX.writeFile(workbook, excelFilePath);
}

// Handle form submission
app.post('/submit-form', (req, res) => {
    try {
        const { name, email, message } = req.body;
        const date = new Date().toISOString();

        // Read existing Excel file
        const workbook = XLSX.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Contact Form Data'];

        // Convert to array of arrays
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Add new row
        data.push([name, email, message, date]);

        // Create new worksheet with updated data
        const newWorksheet = XLSX.utils.aoa_to_sheet(data);

        // Replace old worksheet
        workbook.Sheets['Contact Form Data'] = newWorksheet;

        // Write back to file
        XLSX.writeFile(workbook, excelFilePath);

        res.json({ success: true, message: 'Form data saved successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ success: false, message: 'Error saving form data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 