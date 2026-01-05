/**
 * Nexamp Farm Waterfall Application
 * Handles file upload, parsing, and utility switching for farm revenue visualization
 */

(function() {
  'use strict';

  // Global state
  let farmData = null; // Will store parsed data
  let utilities = []; // List of unique utilities

  /**
   * Handle file upload event
   */
  window.handleFileUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      showUploadError('Please upload a CSV or Excel file.');
      return;
    }

    hideUploadError();

    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        if (isCSV) {
          parseCSV(e.target.result);
        } else {
          parseExcel(e.target.result);
        }
      } catch (error) {
        showUploadError('Error parsing file: ' + error.message);
        console.error('Parse error:', error);
      }
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  /**
   * Parse CSV file content
   */
  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      showUploadError('File appears to be empty.');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());

    // Validate headers
    const requiredHeaders = ['Utility', 'Source', 'Target', 'Value'];
    const hasRequiredHeaders = requiredHeaders.every(h =>
      headers.some(header => header.toLowerCase() === h.toLowerCase())
    );

    if (!hasRequiredHeaders) {
      showUploadError('CSV must contain columns: Utility, Source, Target, Value');
      return;
    }

    // Find column indices (case-insensitive)
    const utilityIdx = headers.findIndex(h => h.toLowerCase() === 'utility');
    const sourceIdx = headers.findIndex(h => h.toLowerCase() === 'source');
    const targetIdx = headers.findIndex(h => h.toLowerCase() === 'target');
    const valueIdx = headers.findIndex(h => h.toLowerCase() === 'value');

    // Parse data rows
    const data = [];
    const utilitySet = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);

      const utility = values[utilityIdx]?.trim();
      const source = values[sourceIdx]?.trim();
      const target = values[targetIdx]?.trim();
      let value = values[valueIdx]?.trim();

      // Clean up value - remove dollar signs, commas, and extra spaces
      if (value) {
        value = value.replace(/[$,\s]/g, '').trim();
      }

      if (utility && source && target) {
        data.push({ utility, source, target, value });
        utilitySet.add(utility);
      }
    }

    if (data.length === 0) {
      showUploadError('No valid data found in file.');
      return;
    }

    farmData = data;
    utilities = Array.from(utilitySet).sort();

    initializeVisualization();
  }

  /**
   * Parse Excel file content
   */
  function parseExcel(arrayBuffer) {
    // Check if XLSX library is loaded
    if (typeof XLSX === 'undefined') {
      showUploadError('Excel parsing library not loaded. Please try again.');
      return;
    }

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      showUploadError('No data found in Excel file.');
      return;
    }

    // Validate and transform data
    const data = [];
    const utilitySet = new Set();

    jsonData.forEach((row, index) => {
      // Find columns (case-insensitive)
      const utility = findValue(row, 'utility');
      const source = findValue(row, 'source');
      const target = findValue(row, 'target');
      const value = findValue(row, 'value');

      if (utility && source && target) {
        data.push({
          utility: String(utility).trim(),
          source: String(source).trim(),
          target: String(target).trim(),
          value: String(value || '').trim()
        });
        utilitySet.add(String(utility).trim());
      }
    });

    if (data.length === 0) {
      showUploadError('No valid data found. Ensure columns: Utility, Source, Target, Value exist.');
      return;
    }

    farmData = data;
    utilities = Array.from(utilitySet).sort();

    initializeVisualization();
  }

  /**
   * Find value in object with case-insensitive key matching
   */
  function findValue(obj, keyName) {
    const key = Object.keys(obj).find(k => k.toLowerCase() === keyName.toLowerCase());
    return key ? obj[key] : null;
  }

  /**
   * Parse a CSV line handling quoted values
   */
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  /**
   * Initialize the visualization after data is loaded
   */
  function initializeVisualization() {
    // Hide upload screen
    document.getElementById('upload-screen').style.display = 'none';

    // Show visualization screen
    document.getElementById('visualization-screen').style.display = 'flex';

    // Populate utility dropdown
    const select = document.getElementById('utility-select');
    select.innerHTML = '<option value="">-- Select a Utility --</option>';

    utilities.forEach(utility => {
      const option = document.createElement('option');
      option.value = utility;
      option.textContent = utility;
      select.appendChild(option);
    });

    // Select first utility by default
    if (utilities.length > 0) {
      select.value = utilities[0];
      handleUtilityChange();
    }
  }

  /**
   * Handle utility selection change
   */
  window.handleUtilityChange = function() {
    const selectedUtility = document.getElementById('utility-select').value;

    if (!selectedUtility) {
      document.getElementById('chart').innerHTML = '<div class="loading">Please select a utility.</div>';
      return;
    }

    // Filter data for selected utility
    const utilityData = farmData.filter(row => row.utility === selectedUtility);

    if (utilityData.length === 0) {
      document.getElementById('chart').innerHTML = '<div class="loading">No data for selected utility.</div>';
      return;
    }

    // Convert to SankeyMATIC format
    const sankeyText = convertToSankeyFormat(utilityData);

    // Update the hidden textarea
    const flowsInput = document.getElementById('flows_in');
    if (flowsInput) {
      flowsInput.value = sankeyText;

      // Trigger SankeyMATIC's render function
      if (typeof process_sankey === 'function') {
        process_sankey();
      }
    }
  };

  /**
   * Convert farm data to SankeyMATIC text format
   */
  function convertToSankeyFormat(data) {
    const lines = [];

    lines.push('// Nexamp Farm Waterfall Data');
    lines.push('// Auto-generated from uploaded file');
    lines.push('');

    // Helper function to determine if a node is a loss node
    function isLossNode(nodeName) {
      const nameLower = nodeName.toLowerCase();
      return nameLower.includes('loss') || nameLower.includes('lost');
    }

    // Helper function to determine if a node is a revenue/total node
    function isRevenueNode(nodeName) {
      const nameLower = nodeName.toLowerCase();
      return nameLower.includes('revenue') || nameLower.includes('total') || nameLower.includes('payment');
    }

    // Separate flows into revenue flows and loss flows
    const revenueFlows = [];
    const lossFlows = [];
    const nodes = new Set();

    data.forEach(row => {
      const { source, target, value } = row;
      const amount = value && value !== '' ? value : '0';

      nodes.add(source);
      nodes.add(target);

      if (isLossNode(target)) {
        lossFlows.push({ source, target, amount });
      } else {
        revenueFlows.push({ source, target, amount });
      }
    });

    // Write revenue flows first (these will be at the top)
    revenueFlows.forEach(({ source, target, amount }) => {
      lines.push(`${source} [${amount}] ${target} #16a34a`);
    });

    lines.push('');

    // Write loss flows (these will be below)
    lossFlows.forEach(({ source, target, amount }) => {
      lines.push(`${source} [${amount}] ${target} #dc2626`);
    });

    lines.push('');
    lines.push('// Node Colors');

    // Apply colors to nodes
    nodes.forEach(nodeName => {
      if (isLossNode(nodeName)) {
        lines.push(`:${nodeName} #dc2626 <<`); // Red color, align bottom
      } else if (isRevenueNode(nodeName)) {
        lines.push(`:${nodeName} #16a34a >>`); // Green color, align top
      }
    });

    return lines.join('\n');
  }

  /**
   * Start a new session (reset and show upload screen)
   */
  window.startNewSession = function() {
    // Clear data
    farmData = null;
    utilities = [];

    // Reset file input
    document.getElementById('file-input').value = '';

    // Hide visualization, show upload
    document.getElementById('visualization-screen').style.display = 'none';
    document.getElementById('upload-screen').style.display = 'flex';

    hideUploadError();
  };

  /**
   * Show error message on upload screen
   */
  function showUploadError(message) {
    const errorDiv = document.getElementById('upload-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  /**
   * Hide error message
   */
  function hideUploadError() {
    const errorDiv = document.getElementById('upload-error');
    errorDiv.style.display = 'none';
  }

})();
