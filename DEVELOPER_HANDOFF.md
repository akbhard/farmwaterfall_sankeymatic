# Nexamp Farm Waterfall - Developer Handoff Documentation

## 🎯 Project Overview

A web application for visualizing farm revenue waterfalls using interactive Sankey diagrams. Built on top of the open-source SankeyMATIC project (forked from https://github.com/nowthis/sankeymatic).

**Tech Stack:**
- Vanilla JavaScript (no framework)
- D3.js v7 for Sankey visualization
- XLSX.js for Excel parsing
- HTML5/CSS3
- No backend (static site)

---

## 📂 Project Structure

```
build/
├── nexamp.html           # Main application entry point (14KB)
├── nexamp-app.js         # Custom upload/parsing logic (10KB)
├── sankeymatic.js        # Core Sankey engine (110KB) - DO NOT MODIFY
├── sankey.js             # D3 Sankey algorithm (36KB) - DO NOT MODIFY
├── constants.js          # SankeyMATIC config (19KB) - DO NOT MODIFY
├── build.css             # SankeyMATIC styles (21KB)
├── lz-string.min.js      # Compression library (4.4KB)
└── test-data.csv         # Sample test data (1.1KB)
```

---

## 🔧 Key Files to Understand

### 1. **nexamp.html** (Custom UI)
- **Purpose**: Main application page with upload interface and diagram display
- **Key sections**:
  - Upload screen (shown on page load)
  - Visualization screen (shown after file upload)
  - Hidden form inputs (lines 262-356) - **REQUIRED** by SankeyMATIC, don't delete!
  - Embedded CSS (lines 16-200) for custom styling

**Important Settings:**
```javascript
// Diagram dimensions (lines 263-268)
size_w: 1800px        // Width
size_h: 800px         // Height
margin_l/r: 150px     // Left/right margins (for labels)
margin_t/b: 40px      // Top/bottom margins

// Node appearance (lines 271-273)
node_w: 8px           // Node thickness (bars)
node_h: 37.5          // Node height percentage
node_spacing: 85      // Spacing between nodes

// Value formatting (line 330)
value_prefix: "$"     // Dollar signs on all values
```

### 2. **nexamp-app.js** (Custom Logic)
- **Purpose**: Handles CSV/Excel upload, parsing, and data transformation
- **Key functions**:

```javascript
handleFileUpload()           // Lines 15-51: File upload handler
parseCSV()                   // Lines 56-117: CSV parser
parseExcel()                 // Lines 122-175: Excel parser
convertToSankeyFormat()      // Lines 267-328: Data → SankeyMATIC format
handleUtilityChange()        // Lines 236-262: Utility dropdown handler
```

**Data Flow:**
```
Upload File → Parse (CSV/Excel) → Clean Values → Filter by Utility →
Convert to SankeyMATIC format → Apply Colors → Render Diagram
```

**Color Logic (lines 274-325):**
- 🔴 Red (`#dc2626`): Flows to nodes with "loss" or "lost" in name
- 🟢 Green (`#16a34a`): Flows between "revenue", "total", or "payment" nodes
- ⚪ Gray (default): All other flows

---

## ⚠️ Known Issues & Gotchas

### 1. **Hidden DOM Elements Are Required**
Lines 245-356 in `nexamp.html` contain hidden form inputs and divs that SankeyMATIC expects. **DO NOT DELETE THESE** even though they're not visible. The app will crash without them.

Required elements:
- All form inputs (size, margins, colors, etc.)
- Message divs (`info_messages`, `issue_messages`, etc.)
- PNG download buttons (`save_as_png_1x`, etc.)
- Theme guide divs (`theme_a_guide`, etc.)

### 2. **Value Parsing**
The CSV parser (line 98-100) strips out dollar signs, commas, and spaces:
```javascript
value = value.replace(/[$,\s]/g, '').trim();
```
This is because the input file has formatted values like `" $3,344,314.39 "` but SankeyMATIC needs plain numbers like `3344314.39`.

### 3. **Node Naming Conflicts**
If your CSV has nodes with special characters (colons, brackets, etc.), SankeyMATIC may have issues. Current data doesn't have this problem, but future data might.

### 4. **Performance**
With many utilities (18+) and many flows per utility (50+), the diagram can become very tall. Current solution: user scrolls. Consider future enhancement: pagination or filtering.

### 5. **Excel Support**
Excel parsing uses XLSX.js loaded from CDN (line 10 in nexamp.html). If CDN fails, Excel uploads won't work. Consider self-hosting the library.

---

## 🚀 Future Enhancements (Not Yet Implemented)

### High Priority:
1. **Databricks Integration**
   - Replace file upload with API call to Databricks SQL Warehouse
   - See lines 53-115 in `nexamp-app.js` for where to add this
   - Will need backend API or proxy to hide credentials

2. **Better Mobile Support**
   - Current layout is desktop-optimized (1800px wide)
   - Consider responsive breakpoints

3. **Export Functionality**
   - Save diagrams as PNG/SVG
   - SankeyMATIC has this built-in, just needs UI buttons exposed

### Medium Priority:
4. **Custom Color Themes**
   - Allow users to configure colors
   - Currently hardcoded in `convertToSankeyFormat()`

5. **Data Validation**
   - Better error messages for malformed CSVs
   - Preview data before rendering

6. **User Settings Persistence**
   - Save preferred utility, layout settings to localStorage

---

## 🐛 Debugging Tips

### Common Errors:

**1. "Cannot read properties of null"**
- **Cause**: Missing required DOM element
- **Fix**: Check that all hidden elements exist in nexamp.html

**2. "No valid data found in file"**
- **Cause**: CSV doesn't have Utility/Source/Target/Value columns
- **Fix**: Check parseCSV() header validation (lines 66-74)

**3. Diagram doesn't render / blank screen**
- **Cause**: SankeyMATIC error, check browser console
- **Common issues**:
  - Invalid flow data (negative values, missing nodes)
  - Circular flows (A→B→A)
  - Special characters in node names

**4. Labels cut off**
- **Cause**: Margins too small for long node names
- **Fix**: Increase `margin_l` and `margin_r` values (line 266-267)

### Debug Mode:
Add this to nexamp-app.js to see generated SankeyMATIC format:
```javascript
// In convertToSankeyFormat(), before return:
console.log('Generated Sankey format:', lines.join('\n'));
```

---

## 📦 Dependencies

All loaded from CDN (no npm/package.json):
- **D3.js v7**: `https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js`
- **Canvg v3.0.9**: `https://cdn.jsdelivr.net/npm/canvg@3/lib/umd.js`
- **XLSX v0.18.5**: `https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js`

Local files (already in build/):
- lz-string.min.js (compression)
- constants.js (SankeyMATIC config)
- sankey.js (D3 algorithm)
- sankeymatic.js (core engine)
- build.css (styles)

---

## 🔒 Security Notes

1. **No backend**: Everything runs in browser, no server-side code
2. **File uploads**: Processed locally, never sent to server
3. **No data persistence**: Data cleared on page refresh
4. **No authentication**: Anyone with URL can access
5. **CDN dependencies**: If CDN compromised, app is vulnerable
   - **Recommendation**: Self-host all dependencies for production

---

## 📊 Data Format Requirements

**CSV Structure:**
```csv
Utility,Source,Target,Value
Eversource,Modeled Revenue Cycle,Invoice Total,850000
Eversource,Modeled Revenue Cycle,Weather Insolation Loss,50000
Eversource,Invoice Total,Payment Total,800000
```

**Requirements:**
- Headers: `Utility`, `Source`, `Target`, `Value` (case-insensitive)
- Value: Can contain `$`, `,`, spaces (will be stripped)
- All rows for same utility don't need to be grouped
- Empty values treated as 0

**Excel:**
- First sheet only (other sheets ignored)
- Same column requirements as CSV

---

## 🧪 Testing

**Test Files:**
- `build/test-data.csv` - Simple test with 2 utilities
- `portfolio_performance_waterfall_final (1).csv` - Real production data

**Manual Test Checklist:**
- [ ] Upload CSV file
- [ ] Upload Excel file
- [ ] Switch between utilities in dropdown
- [ ] Hover over nodes (should show tooltips)
- [ ] Hover over flows (should show values)
- [ ] Click "Upload New File" (should reset to upload screen)
- [ ] Upload file with $, commas in values (should parse correctly)
- [ ] Upload file with empty values (should treat as 0)

---

## 🎨 Customization Guide

### Change Colors:
Edit `nexamp-app.js`, lines 298-302:
```javascript
if (isLossNode(target)) {
  flowColor = ' #dc2626';  // Change red color here
} else if (isRevenueNode(target) && isRevenueNode(source)) {
  flowColor = ' #16a34a';  // Change green color here
}
```

### Change Dimensions:
Edit `nexamp.html`, lines 264-265:
```html
<input id="size_w" type="number" value="1800">  <!-- Width -->
<input id="size_h" type="number" value="800">   <!-- Height -->
```

### Change Header:
Edit `nexamp.html`, lines 206-208:
```html
<div class="nexamp-header">
  <h1>Nexamp Farm Waterfall</h1>  <!-- Change title here -->
</div>
```

---

## 📝 Code Quality Notes

### What's Good:
✅ Clear separation of concerns (upload logic vs rendering)
✅ Comments throughout nexamp-app.js
✅ Error handling for file parsing
✅ Consistent naming conventions

### What Could Be Improved:
⚠️ No TypeScript (all vanilla JS)
⚠️ No automated tests
⚠️ No build process (everything is manual)
⚠️ Lots of hidden DOM elements required (SankeyMATIC dependency)
⚠️ No code splitting (all JS loaded upfront)

### Refactoring Suggestions:
1. Extract color logic into separate config file
2. Add input validation with detailed error messages
3. Create reusable CSV/Excel parser module
4. Consider migrating to React/Vue for better state management
5. Add TypeScript for type safety

---

## 🆘 Support & Resources

**Original SankeyMATIC:**
- GitHub: https://github.com/nowthis/sankeymatic
- Website: https://sankeymatic.com
- Manual: https://sankeymatic.com/manual/

**D3 Sankey Plugin:**
- GitHub: https://github.com/d3/d3-sankey
- Examples: https://observablehq.com/@d3/sankey

**This Project:**
- Main files: `nexamp.html`, `nexamp-app.js`
- Sample data: `test-data.csv`

---

## 📞 Questions for Product Team

Before major changes, clarify:
1. **Databricks integration timeline?** (Will require backend/API)
2. **Max data size expected?** (May need pagination/virtualization)
3. **Mobile support priority?** (May need responsive redesign)
4. **Export features needed?** (PNG, SVG, PDF?)
5. **Authentication required?** (Currently open access)
6. **Multiple file comparison?** (Currently one file at a time)

---

## ✅ Handoff Checklist

Before starting work:
- [ ] Read this entire document
- [ ] Open `nexamp.html` in browser and test with `test-data.csv`
- [ ] Review `nexamp-app.js` - understand data flow
- [ ] Check browser console for any errors
- [ ] Test with real production CSV file
- [ ] Identify any immediate bugs/issues
- [ ] Set up local development environment
- [ ] Consider version control strategy (currently no .gitignore for build/)

---

**Last Updated**: 2025-12-29
**Contact**: [Add PM contact info here]
