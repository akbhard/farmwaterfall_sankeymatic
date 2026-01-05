# Nexamp Farm Waterfall Web App

A web application for visualizing farm monetization and revenue performance using interactive Sankey diagrams.

## Quick Start

1. **Open the application:**
   - Navigate to the `build/` folder
   - Open `nexamp.html` in your web browser

2. **Upload your data:**
   - Click "Upload Data File"
   - Select a CSV or Excel file with your farm waterfall data
   - The file must have these columns: `Utility`, `Source`, `Target`, `Value`

3. **View and interact:**
   - Select a utility from the dropdown
   - Hover over nodes and flows to see values
   - Click "Upload New File" to start a new session

## File Format

Your CSV/Excel file should have this structure:

```csv
Utility,Source,Target,Value
Eversource,Modeled Revenue Cycle,Invoice Total,850000
Eversource,Modeled Revenue Cycle,Weather Insolation Loss,50000
Eversource,Invoice Total,Payment Total,800000
...
```

### Column Descriptions:

- **Utility**: The utility name (e.g., "Eversource", "National Grid")
- **Source**: Where the money/value flows FROM
- **Target**: Where it flows TO
- **Value**: The numeric amount (must be a number)

## Test Data

A sample file `test-data.csv` is included in the `build/` folder for testing.

## Features

✅ Upload CSV or Excel files
✅ Switch between utilities via dropdown
✅ Full-screen Sankey visualization
✅ Interactive hover tooltips with values
✅ Clean, professional UI
✅ New session capability (upload new files)

## Technical Notes

- Built on top of SankeyMATIC (D3.js-based Sankey diagram builder)
- No backend required - runs entirely in the browser
- Supports both CSV and Excel (.xlsx, .xls) formats
- Data stays in your browser - nothing is uploaded to a server

## Files

- `nexamp.html` - Main application page
- `nexamp-app.js` - Application logic (file parsing, utility switching)
- `sankeymatic.js` - Sankey diagram rendering engine
- `sankey.js` - D3 Sankey algorithm
- `build.css` - Styles
- `test-data.csv` - Sample data for testing

## Future Enhancements (Post-MVP)

- Databricks integration
- Export diagrams as PNG/SVG
- Custom color schemes
- Advanced filtering options
- Multiple file comparison

## Support

For issues or questions, contact your development team.
