# Agent Averages Dashboard

A web application for calculating and analyzing sales agent performance averages by branch, position, or combined filters.

## Features

- **Agent Roster Management**: Store and manage agent information (initials, branch, position)
- **CRM Report Upload**: Upload monthly sales CSV reports from your CRM
- **Flexible Filtering**: Calculate averages by branch (TIJ, RSA, OVS), position (Closer, Dialer), or any combination
- **Results Dashboard**: View averages with individual agent breakdowns and performance comparisons

## Getting Started

### Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. No build process required - pure HTML/CSS/JavaScript

### Deployment

This app is designed to be deployed on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy (no configuration needed)

## Usage

### 1. Set Up Agent Roster

Before uploading sales data, add your agents to the roster:
- Click "Add Agent"
- Enter agent initials, select branch (TIJ/RSA/OVS), and position (Closer/Dialer)
- Agents are automatically saved to browser storage

### 2. Upload CRM Report

Upload your monthly CRM export CSV file. The system will:
- Match agents by their initials
- Skip any agents not in the roster (admin accounts, robo-dialers, etc.)
- Show you which agents were matched and which were skipped

### 3. Filter and Calculate

Use the branch and position checkboxes to filter which agents to include:
- Select specific branches or "All Branches"
- Select specific positions or "All Positions"
- Click "Calculate Averages" to see results

### 4. View Results

The dashboard displays:
- Overall average for selected agents
- Breakdown by branch
- Breakdown by position
- Individual agent performance with comparison to averages

## Data Storage

Agent roster data is stored in your browser's localStorage. Use the Export/Import buttons to:
- Back up your roster
- Transfer roster between devices
- Share roster with team members

## CSV Format

The CRM export should have columns for:
- `Agent` - Agent initials (e.g., "AZN")
- `Collected Total` - Dollar amount (e.g., "$5,600.00")

## License

Internal use only - PHG

