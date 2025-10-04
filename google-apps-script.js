/**
 * Google Apps Script for Lucille's Premium Catering CRM
 * 
 * This script connects your Google Sheets to the CRM Dashboard
 * Replace 'YOUR_SHEET_ID_HERE' with your actual Google Sheets ID
 */

// Configuration - Replace with your Google Sheets ID
const SHEET_ID = '18dwG4K7r0Zt4RXSVYvNiE5t8f6-muFImHYhyo1YWdv0';
const LEADS_SHEET_NAME = 'Lead Intake';
const DEALS_SHEET_NAME = 'Deal Tracking';

/**
 * Main function to handle GET requests from the CRM dashboard
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // Set CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    let result;
    
    if (action === 'getLeads') {
      result = getLeads();
    } else if (action === 'getDeals') {
      result = getDeals();
    } else {
      result = { error: 'Invalid action parameter' };
    }
    
    return output.setContent(JSON.stringify(result));
    
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fetch all leads from the Lead Intake sheet
 */
function getLeads() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LEADS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${LEADS_SHEET_NAME}" not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const leads = rows.map(row => {
      return {
        refNumber: row[0] || '',
        timestamp: formatTimestamp(row[1]),
        clientName: row[2] || '',
        email: row[3] || '',
        phone: row[4] || '',
        dateOfBirth: formatDate(row[5]),
        eventDate: formatDate(row[6]),
        eventType: row[7] || '',
        numberOfGuests: parseInt(row[8]) || 0,
        message: row[9] || '',
        status: row[10] || 'Pending Follow-up',
        calendarEventId: row[11] || ''
      };
    }).filter(lead => lead.refNumber); // Only include rows with reference numbers
    
    return leads;
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Failed to fetch leads: ' + error.toString());
  }
}

/**
 * Fetch all deals from the Deal Tracking sheet
 */
function getDeals() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DEALS_SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${DEALS_SHEET_NAME}" not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const deals = rows.map(row => {
      return {
        timestamp: formatTimestamp(row[0]),
        refNumber: row[1] || '',
        status: row[2] || 'Pending',
        bookingAmount: parseFloat(row[3]) || 0,
        notes: row[4] || '',
        commission: parseFloat(row[5]) || 0,
        latestEntry: row[6] === true || row[6] === 'TRUE' || row[6] === 'true'
      };
    }).filter(deal => deal.refNumber); // Only include rows with reference numbers
    
    return deals;
    
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw new Error('Failed to fetch deals: ' + error.toString());
  }
}

/**
 * Format timestamp for consistent display
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  
  try {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US');
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString('en-US');
    } else {
      return timestamp.toString();
    }
  } catch (error) {
    return timestamp.toString();
  }
}

/**
 * Format date to YYYY-MM-DD format
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    } else if (typeof date === 'string') {
      return new Date(date).toISOString().split('T')[0];
    } else {
      return date.toString();
    }
  } catch (error) {
    return date.toString();
  }
}

/**
 * Test function to verify the setup
 */
function testConnection() {
  try {
    console.log('Testing connection...');
    
    const leads = getLeads();
    const deals = getDeals();
    
    console.log(`Successfully fetched ${leads.length} leads and ${deals.length} deals`);
    console.log('Sample lead:', leads[0]);
    console.log('Sample deal:', deals[0]);
    
    return {
      success: true,
      leadsCount: leads.length,
      dealsCount: deals.length
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Setup function to create sample data (optional)
 * Run this once to populate your sheets with sample data for testing
 */
function setupSampleData() {
  try {
    // Create sample leads
    const leadsSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LEADS_SHEET_NAME);
    
    if (!leadsSheet) {
      throw new Error('Leads sheet not found. Please create a sheet named "Lead Intake"');
    }
    
    const leadsHeaders = [
      'Reference Number', 'Timestamp', 'Client Name', 'Email', 'Phone',
      'Date of Birth', 'Event Date', 'Event Type', 'Number of Guests',
      'Message', 'Status', 'Calendar Event ID'
    ];
    
    const sampleLeads = [
      leadsHeaders,
      [
        'CAT-20251003-001', new Date(), 'Maria Santos', 'maria.santos@email.com',
        '+63 917 123 4567', new Date('1985-10-15'), new Date('2025-11-15'),
        'Wedding', 150, 'Looking for elegant wedding catering for 150 guests',
        'Pending Follow-up', 'cal123'
      ],
      [
        'CAT-20251003-002', new Date(), 'John Rodriguez', 'john.rod@email.com',
        '+63 917 234 5678', new Date('1978-12-05'), new Date('2025-10-25'),
        'Corporate Event', 80, 'Annual company party catering needed',
        'Closed', 'cal124'
      ]
    ];
    
    leadsSheet.getRange(1, 1, sampleLeads.length, sampleLeads[0].length).setValues(sampleLeads);
    
    // Create sample deals
    const dealsSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DEALS_SHEET_NAME);
    
    if (!dealsSheet) {
      throw new Error('Deals sheet not found. Please create a sheet named "Deal Tracking"');
    }
    
    const dealsHeaders = [
      'Timestamp', 'Reference Number', 'Status', 'Booking Amount (If Closed)',
      'Notes', 'Commission (5%)', 'Latest Entry'
    ];
    
    const sampleDeals = [
      dealsHeaders,
      [
        new Date(), 'CAT-20251003-001', 'Pending', 45000,
        'Client considering premium package', 2250, true
      ],
      [
        new Date(), 'CAT-20251003-002', 'Closed(Won)', 32000,
        'Successfully closed corporate deal', 1600, true
      ]
    ];
    
    dealsSheet.getRange(1, 1, sampleDeals.length, sampleDeals[0].length).setValues(sampleDeals);
    
    console.log('Sample data created successfully!');
    return { success: true, message: 'Sample data created successfully!' };
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw new Error('Failed to create sample data: ' + error.toString());
  }
}

/**
 * Function to add a new lead (for form integration)
 */
function addLead(leadData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LEADS_SHEET_NAME);
    
    const refNumber = generateReferenceNumber();
    const timestamp = new Date();
    
    const newRow = [
      refNumber,
      timestamp,
      leadData.clientName || '',
      leadData.email || '',
      leadData.phone || '',
      leadData.dateOfBirth || '',
      leadData.eventDate || '',
      leadData.eventType || '',
      leadData.numberOfGuests || 0,
      leadData.message || '',
      leadData.status || 'Pending Follow-up',
      leadData.calendarEventId || ''
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      refNumber: refNumber,
      message: 'Lead added successfully'
    };
    
  } catch (error) {
    console.error('Error adding lead:', error);
    throw new Error('Failed to add lead: ' + error.toString());
  }
}

/**
 * Generate a unique reference number
 */
function generateReferenceNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const time = Date.now().toString().slice(-3); // Last 3 digits of timestamp
  
  return `CAT-${year}${month}${day}-${time}`;
}

/**
 * Update deal status (for workflow integration)
 */
function updateDeal(refNumber, dealData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DEALS_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find existing deal or create new row
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === refNumber) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    const timestamp = new Date();
    const bookingAmount = parseFloat(dealData.bookingAmount) || 0;
    const commission = bookingAmount * 0.05; // 5% commission
    
    const rowData = [
      timestamp,
      refNumber,
      dealData.status || 'Pending',
      bookingAmount,
      dealData.notes || '',
      commission,
      true // Latest entry
    ];
    
    if (rowIndex > 0) {
      // Update existing row
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Add new row
      sheet.appendRow(rowData);
    }
    
    return {
      success: true,
      message: 'Deal updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating deal:', error);
    throw new Error('Failed to update deal: ' + error.toString());
  }
}