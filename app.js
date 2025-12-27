/**
 * Agent Averages Dashboard
 * Main Application Logic
 */

class AgentAveragesDashboard {
    constructor() {
        // Storage key for localStorage
        this.STORAGE_KEY = 'phg_agent_roster';
        
        // Agent roster data
        this.roster = [];
        
        // Uploaded CRM data
        this.salesData = [];
        this.matchedAgents = [];
        this.skippedAgents = [];
        
        // Initialize
        this.init();
    }

    init() {
        this.loadRoster();
        this.bindEvents();
        this.renderRoster();
        this.updateFilterState();
    }

    // ============================================
    // LOCAL STORAGE / DATA PERSISTENCE
    // ============================================

    loadRoster() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.roster = JSON.parse(stored);
            } else {
                // Initialize with default roster from sample data
                this.roster = this.getDefaultRoster();
                this.saveRoster();
            }
        } catch (e) {
            console.error('Error loading roster:', e);
            this.roster = this.getDefaultRoster();
        }
    }

    getDefaultRoster() {
        // Pre-populated roster based on sample agent data
        return [
            // TIJ Agents
            { initials: 'AZN', branch: 'TIJ', position: 'CLOSER' },
            { initials: 'DXL', branch: 'TIJ', position: 'CLOSER' },
            { initials: 'HXR', branch: 'TIJ', position: 'CLOSER' },
            { initials: 'JXM', branch: 'TIJ', position: 'DIALER' },
            { initials: 'JXR', branch: 'TIJ', position: 'CLOSER' },
            { initials: 'JXT', branch: 'TIJ', position: 'DIALER' },
            { initials: 'NXS', branch: 'TIJ', position: 'CLOSER' },
            { initials: 'WXA', branch: 'TIJ', position: 'DIALER' },
            // RSA Agents
            { initials: 'FFS', branch: 'RSA', position: 'DIALER' },
            { initials: 'JGF', branch: 'RSA', position: 'CLOSER' },
            { initials: 'MEM', branch: 'RSA', position: 'DIALER' },
            { initials: 'MRV', branch: 'RSA', position: 'DIALER' },
            { initials: 'OEL', branch: 'RSA', position: 'DIALER' },
            { initials: 'SCG', branch: 'RSA', position: 'DIALER' },
            { initials: 'SVJ', branch: 'RSA', position: 'CLOSER' },
            // OVS Agents (Overseas)
            { initials: 'AXE', branch: 'OVS', position: 'DIALER' },
            { initials: 'AXM', branch: 'OVS', position: 'DIALER' },
            { initials: 'AXY', branch: 'OVS', position: 'DIALER' },
            { initials: 'EXM', branch: 'OVS', position: 'DIALER' },
            { initials: 'GXC', branch: 'OVS', position: 'DIALER' },
            { initials: 'HXS', branch: 'OVS', position: 'DIALER' },
            { initials: 'JAU', branch: 'OVS', position: 'DIALER' },
            { initials: 'JQM', branch: 'OVS', position: 'DIALER' },
            { initials: 'JYF', branch: 'OVS', position: 'DIALER' },
            { initials: 'MXG', branch: 'OVS', position: 'DIALER' },
            { initials: 'PGA', branch: 'OVS', position: 'DIALER' },
            { initials: 'RBD', branch: 'OVS', position: 'DIALER' },
            { initials: 'RJB', branch: 'OVS', position: 'DIALER' },
            { initials: 'RTM', branch: 'OVS', position: 'DIALER' },
            { initials: 'RXM', branch: 'OVS', position: 'DIALER' },
            { initials: 'RXY', branch: 'OVS', position: 'DIALER' },
            { initials: 'SJC', branch: 'OVS', position: 'DIALER' },
            { initials: 'WJC', branch: 'OVS', position: 'DIALER' },
            { initials: 'YXY', branch: 'OVS', position: 'DIALER' }
        ].sort((a, b) => a.initials.localeCompare(b.initials));
    }

    saveRoster() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.roster));
        } catch (e) {
            console.error('Error saving roster:', e);
            this.showToast('Error saving roster', true);
        }
    }

    // ============================================
    // EVENT BINDINGS
    // ============================================

    bindEvents() {
        // Add Agent
        document.getElementById('addAgentBtn').addEventListener('click', () => this.addAgent());
        document.getElementById('agentInitials').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addAgent();
        });

        // Export/Import Roster
        document.getElementById('exportRosterBtn').addEventListener('click', () => this.exportRoster());
        document.getElementById('importRosterBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });
        document.getElementById('importFileInput').addEventListener('change', (e) => this.importRoster(e));

        // CSV Upload
        const uploadZone = document.getElementById('uploadZone');
        const csvFileInput = document.getElementById('csvFileInput');
        
        document.getElementById('browseBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            csvFileInput.click();
        });
        
        uploadZone.addEventListener('click', () => csvFileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.processCSVFile(e.dataTransfer.files[0]);
            }
        });
        csvFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processCSVFile(e.target.files[0]);
            }
        });

        // View Skipped Agents
        document.getElementById('viewSkippedBtn').addEventListener('click', () => this.showSkippedModal());
        document.getElementById('closeSkippedModal').addEventListener('click', () => this.hideSkippedModal());
        document.getElementById('skippedModal').addEventListener('click', (e) => {
            if (e.target.id === 'skippedModal') this.hideSkippedModal();
        });

        // Filters
        document.getElementById('branchAll').addEventListener('change', (e) => this.handleAllBranchesChange(e));
        document.getElementById('positionAll').addEventListener('change', (e) => this.handleAllPositionsChange(e));
        
        document.querySelectorAll('.branch-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.handleBranchCheckboxChange());
        });
        document.querySelectorAll('.position-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.handlePositionCheckboxChange());
        });

        // Calculate Button
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateAverages());

        // Export Results
        document.getElementById('exportResultsBtn').addEventListener('click', () => this.exportResults());
    }

    // ============================================
    // ROSTER MANAGEMENT
    // ============================================

    addAgent() {
        const initialsInput = document.getElementById('agentInitials');
        const branchSelect = document.getElementById('agentBranch');
        const positionSelect = document.getElementById('agentPosition');

        const initials = initialsInput.value.trim().toUpperCase();
        const branch = branchSelect.value;
        const position = positionSelect.value;

        // Validation
        if (!initials) {
            this.showToast('Please enter agent initials', true);
            initialsInput.focus();
            return;
        }
        if (!branch) {
            this.showToast('Please select a branch', true);
            branchSelect.focus();
            return;
        }
        if (!position) {
            this.showToast('Please select a position', true);
            positionSelect.focus();
            return;
        }

        // Check for duplicate
        if (this.roster.some(a => a.initials === initials)) {
            this.showToast('Agent with these initials already exists', true);
            initialsInput.focus();
            return;
        }

        // Add agent
        this.roster.push({ initials, branch, position });
        this.roster.sort((a, b) => a.initials.localeCompare(b.initials));
        this.saveRoster();
        this.renderRoster();

        // Clear form
        initialsInput.value = '';
        branchSelect.value = '';
        positionSelect.value = '';
        initialsInput.focus();

        this.showToast(`Agent ${initials} added to roster`);
        
        // Re-process sales data if loaded
        if (this.salesData.length > 0) {
            this.matchAgentsToRoster();
        }
    }

    removeAgent(initials) {
        const index = this.roster.findIndex(a => a.initials === initials);
        if (index > -1) {
            this.roster.splice(index, 1);
            this.saveRoster();
            this.renderRoster();
            this.showToast(`Agent ${initials} removed`);
            
            // Re-process sales data if loaded
            if (this.salesData.length > 0) {
                this.matchAgentsToRoster();
            }
        }
    }

    renderRoster() {
        const tbody = document.getElementById('rosterBody');
        const emptyState = document.getElementById('emptyRoster');
        const countEl = document.getElementById('rosterCount');

        if (this.roster.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'flex';
            countEl.textContent = '0 agents';
            return;
        }

        emptyState.style.display = 'none';
        countEl.textContent = `${this.roster.length} agent${this.roster.length !== 1 ? 's' : ''}`;

        tbody.innerHTML = this.roster.map(agent => `
            <tr>
                <td class="agent-initials">${agent.initials}</td>
                <td><span class="branch-tag ${agent.branch}">${agent.branch}</span></td>
                <td><span class="position-tag ${agent.position}">${agent.position === 'CLOSER' ? 'Closer' : 'Dialer'}</span></td>
                <td>
                    <button class="remove-btn" onclick="app.removeAgent('${agent.initials}')" title="Remove agent">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    exportRoster() {
        if (this.roster.length === 0) {
            this.showToast('No agents to export', true);
            return;
        }

        const data = JSON.stringify(this.roster, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent_roster_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Roster exported successfully');
    }

    importRoster(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                if (!Array.isArray(imported)) {
                    throw new Error('Invalid format');
                }

                // Validate each agent
                const validAgents = imported.filter(a => 
                    a.initials && 
                    ['TIJ', 'RSA', 'OVS'].includes(a.branch) &&
                    ['CLOSER', 'DIALER'].includes(a.position)
                );

                if (validAgents.length === 0) {
                    throw new Error('No valid agents found');
                }

                // Merge with existing roster (avoid duplicates)
                let addedCount = 0;
                validAgents.forEach(agent => {
                    if (!this.roster.some(a => a.initials === agent.initials.toUpperCase())) {
                        this.roster.push({
                            initials: agent.initials.toUpperCase(),
                            branch: agent.branch,
                            position: agent.position
                        });
                        addedCount++;
                    }
                });

                this.roster.sort((a, b) => a.initials.localeCompare(b.initials));
                this.saveRoster();
                this.renderRoster();
                
                this.showToast(`Imported ${addedCount} new agent${addedCount !== 1 ? 's' : ''}`);
                
                // Re-process sales data if loaded
                if (this.salesData.length > 0) {
                    this.matchAgentsToRoster();
                }

            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Error importing roster: Invalid file format', true);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    // ============================================
    // CSV PROCESSING
    // ============================================

    processCSVFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showToast('Please select a CSV file', true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
                this.matchAgentsToRoster();
                this.showToast('CRM report loaded successfully');
            } catch (error) {
                console.error('CSV parsing error:', error);
                this.showToast('Error parsing CSV file', true);
            }
        };
        reader.readAsText(file);
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV file appears to be empty');
        }

        const headers = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
        
        // Find relevant column indices
        const agentIndex = headers.findIndex(h => 
            h === 'agent' || h === 'agent initials' || h === 'initials' || h === 'name'
        );
        const collectedIndex = headers.findIndex(h => 
            h.includes('collected') || h.includes('total') || h.includes('sales') || h.includes('amount')
        );

        if (agentIndex === -1) {
            throw new Error('Could not find Agent column');
        }
        if (collectedIndex === -1) {
            throw new Error('Could not find Collected/Sales column');
        }

        this.salesData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const agent = values[agentIndex]?.trim().toUpperCase();
            const collectedRaw = values[collectedIndex]?.trim();
            
            // Skip header rows or empty rows
            if (!agent || agent.includes('AGENT') || agent.includes('TOTAL')) continue;
            
            const collected = this.parseCurrency(collectedRaw);
            
            if (agent) {
                this.salesData.push({ agent, collected });
            }
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    parseCurrency(value) {
        if (!value) return 0;
        // Remove currency symbols, commas, and whitespace
        const cleaned = value.replace(/[$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    matchAgentsToRoster() {
        this.matchedAgents = [];
        this.skippedAgents = [];

        this.salesData.forEach(sale => {
            const rosterAgent = this.roster.find(a => a.initials === sale.agent);
            
            if (rosterAgent) {
                this.matchedAgents.push({
                    initials: sale.agent,
                    branch: rosterAgent.branch,
                    position: rosterAgent.position,
                    collected: sale.collected
                });
            } else {
                this.skippedAgents.push(sale.agent);
            }
        });

        this.updateUploadStatus();
        this.updateCalculateButton();
    }

    updateUploadStatus() {
        const statusEl = document.getElementById('uploadStatus');
        const matchedCountEl = document.getElementById('matchedCount');
        const skippedCountEl = document.getElementById('skippedCount');
        const viewSkippedBtn = document.getElementById('viewSkippedBtn');

        statusEl.style.display = 'flex';
        matchedCountEl.textContent = this.matchedAgents.length;
        skippedCountEl.textContent = this.skippedAgents.length;
        viewSkippedBtn.style.display = this.skippedAgents.length > 0 ? 'inline-flex' : 'none';
    }

    showSkippedModal() {
        const modal = document.getElementById('skippedModal');
        const list = document.getElementById('skippedList');
        
        list.innerHTML = this.skippedAgents.map(agent => `<li>${agent}</li>`).join('');
        modal.classList.add('show');
    }

    hideSkippedModal() {
        document.getElementById('skippedModal').classList.remove('show');
    }

    // ============================================
    // FILTER HANDLING
    // ============================================

    handleAllBranchesChange(e) {
        const isChecked = e.target.checked;
        document.querySelectorAll('.branch-checkbox').forEach(cb => {
            cb.checked = false;
            cb.disabled = isChecked;
        });
    }

    handleAllPositionsChange(e) {
        const isChecked = e.target.checked;
        document.querySelectorAll('.position-checkbox').forEach(cb => {
            cb.checked = false;
            cb.disabled = isChecked;
        });
    }

    handleBranchCheckboxChange() {
        const branchCheckboxes = document.querySelectorAll('.branch-checkbox');
        const anyChecked = Array.from(branchCheckboxes).some(cb => cb.checked);
        document.getElementById('branchAll').checked = !anyChecked;
    }

    handlePositionCheckboxChange() {
        const positionCheckboxes = document.querySelectorAll('.position-checkbox');
        const anyChecked = Array.from(positionCheckboxes).some(cb => cb.checked);
        document.getElementById('positionAll').checked = !anyChecked;
    }

    updateFilterState() {
        // Ensure "All" checkboxes start checked
        document.getElementById('branchAll').checked = true;
        document.getElementById('positionAll').checked = true;
        
        document.querySelectorAll('.branch-checkbox').forEach(cb => cb.disabled = true);
        document.querySelectorAll('.position-checkbox').forEach(cb => cb.disabled = true);
    }

    updateCalculateButton() {
        const btn = document.getElementById('calculateBtn');
        btn.disabled = this.matchedAgents.length === 0;
    }

    getSelectedBranches() {
        if (document.getElementById('branchAll').checked) {
            return ['TIJ', 'RSA', 'OVS'];
        }
        return Array.from(document.querySelectorAll('.branch-checkbox:checked'))
            .map(cb => cb.value);
    }

    getSelectedPositions() {
        if (document.getElementById('positionAll').checked) {
            return ['CLOSER', 'DIALER'];
        }
        return Array.from(document.querySelectorAll('.position-checkbox:checked'))
            .map(cb => cb.value);
    }

    // ============================================
    // AVERAGE CALCULATIONS
    // ============================================

    calculateAverages() {
        const selectedBranches = this.getSelectedBranches();
        const selectedPositions = this.getSelectedPositions();

        if (selectedBranches.length === 0 || selectedPositions.length === 0) {
            this.showToast('Please select at least one branch and one position', true);
            return;
        }

        // Filter agents based on selections
        const filteredAgents = this.matchedAgents.filter(agent =>
            selectedBranches.includes(agent.branch) &&
            selectedPositions.includes(agent.position)
        );

        if (filteredAgents.length === 0) {
            this.showToast('No agents match the selected filters', true);
            return;
        }

        // Calculate overall average
        const overallAvg = this.calculateAverage(filteredAgents);

        // Calculate averages by branch
        const branchAverages = {};
        selectedBranches.forEach(branch => {
            const branchAgents = filteredAgents.filter(a => a.branch === branch);
            if (branchAgents.length > 0) {
                branchAverages[branch] = {
                    average: this.calculateAverage(branchAgents),
                    count: branchAgents.length
                };
            }
        });

        // Calculate averages by position
        const positionAverages = {};
        selectedPositions.forEach(position => {
            const positionAgents = filteredAgents.filter(a => a.position === position);
            if (positionAgents.length > 0) {
                positionAverages[position] = {
                    average: this.calculateAverage(positionAgents),
                    count: positionAgents.length
                };
            }
        });

        // Calculate combined averages (branch + position)
        const combinedAverages = {};
        selectedBranches.forEach(branch => {
            selectedPositions.forEach(position => {
                const combinedAgents = filteredAgents.filter(
                    a => a.branch === branch && a.position === position
                );
                if (combinedAgents.length > 0) {
                    const key = `${branch} ${position === 'CLOSER' ? 'Closers' : 'Dialers'}`;
                    combinedAverages[key] = {
                        average: this.calculateAverage(combinedAgents),
                        count: combinedAgents.length
                    };
                }
            });
        });

        // Store results for export
        this.lastResults = {
            filteredAgents,
            overallAvg,
            branchAverages,
            positionAverages,
            combinedAverages,
            selectedBranches,
            selectedPositions
        };

        // Render results
        this.renderResults(
            filteredAgents,
            overallAvg,
            branchAverages,
            positionAverages,
            combinedAverages
        );
    }

    calculateAverage(agents) {
        if (agents.length === 0) return 0;
        const total = agents.reduce((sum, a) => sum + a.collected, 0);
        return total / agents.length;
    }

    // ============================================
    // RESULTS DISPLAY
    // ============================================

    renderResults(filteredAgents, overallAvg, branchAverages, positionAverages, combinedAverages) {
        const resultsPanel = document.getElementById('resultsPanel');
        const statsGrid = document.getElementById('statsGrid');
        const breakdownBody = document.getElementById('breakdownBody');

        // Show results panel
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth' });

        // Build stats cards
        let cardsHTML = `
            <div class="stat-card highlight">
                <div class="stat-label">Overall Average</div>
                <div class="stat-value">${this.formatCurrency(overallAvg)}</div>
                <div class="stat-count">${filteredAgents.length} agents</div>
            </div>
        `;

        // Branch cards
        Object.entries(branchAverages).forEach(([branch, data]) => {
            cardsHTML += `
                <div class="stat-card">
                    <div class="stat-label">${branch} Average</div>
                    <div class="stat-value">${this.formatCurrency(data.average)}</div>
                    <div class="stat-count">${data.count} agents</div>
                </div>
            `;
        });

        // Position cards
        Object.entries(positionAverages).forEach(([position, data]) => {
            const label = position === 'CLOSER' ? 'Closers' : 'Dialers';
            cardsHTML += `
                <div class="stat-card">
                    <div class="stat-label">${label} Average</div>
                    <div class="stat-value">${this.formatCurrency(data.average)}</div>
                    <div class="stat-count">${data.count} agents</div>
                </div>
            `;
        });

        // Combined cards
        Object.entries(combinedAverages).forEach(([label, data]) => {
            cardsHTML += `
                <div class="stat-card">
                    <div class="stat-label">${label}</div>
                    <div class="stat-value">${this.formatCurrency(data.average)}</div>
                    <div class="stat-count">${data.count} agents</div>
                </div>
            `;
        });

        statsGrid.innerHTML = cardsHTML;

        // Sort agents by collected (descending) for breakdown
        const sortedAgents = [...filteredAgents].sort((a, b) => b.collected - a.collected);

        // Build breakdown table
        breakdownBody.innerHTML = sortedAgents.map((agent, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            const diff = agent.collected - overallAvg;
            const diffPercent = overallAvg > 0 ? (diff / overallAvg * 100) : 0;
            const comparisonClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
            const comparisonText = diff >= 0 
                ? `+${this.formatCurrency(diff)} (+${diffPercent.toFixed(0)}%)`
                : `${this.formatCurrency(diff)} (${diffPercent.toFixed(0)}%)`;

            return `
                <tr>
                    <td class="rank ${rankClass}">#${rank}</td>
                    <td class="agent-initials">${agent.initials}</td>
                    <td><span class="branch-tag ${agent.branch}">${agent.branch}</span></td>
                    <td><span class="position-tag ${agent.position}">${agent.position === 'CLOSER' ? 'Closer' : 'Dialer'}</span></td>
                    <td class="collected">${this.formatCurrency(agent.collected)}</td>
                    <td class="comparison ${comparisonClass}">${comparisonText}</td>
                </tr>
            `;
        }).join('');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // ============================================
    // EXPORT RESULTS
    // ============================================

    exportResults() {
        if (!this.lastResults) {
            this.showToast('No results to export', true);
            return;
        }

        const { filteredAgents, overallAvg, branchAverages, positionAverages, combinedAverages } = this.lastResults;

        let csv = 'Agent Averages Report\n';
        csv += `Generated: ${new Date().toLocaleString()}\n\n`;

        // Overall
        csv += 'OVERALL AVERAGE\n';
        csv += `Average,${this.formatCurrency(overallAvg)}\n`;
        csv += `Agents,${filteredAgents.length}\n\n`;

        // Branch averages
        csv += 'BRANCH AVERAGES\n';
        csv += 'Branch,Average,Agents\n';
        Object.entries(branchAverages).forEach(([branch, data]) => {
            csv += `${branch},${this.formatCurrency(data.average)},${data.count}\n`;
        });
        csv += '\n';

        // Position averages
        csv += 'POSITION AVERAGES\n';
        csv += 'Position,Average,Agents\n';
        Object.entries(positionAverages).forEach(([position, data]) => {
            csv += `${position},${this.formatCurrency(data.average)},${data.count}\n`;
        });
        csv += '\n';

        // Combined averages
        csv += 'COMBINED AVERAGES\n';
        csv += 'Category,Average,Agents\n';
        Object.entries(combinedAverages).forEach(([label, data]) => {
            csv += `${label},${this.formatCurrency(data.average)},${data.count}\n`;
        });
        csv += '\n';

        // Agent breakdown
        csv += 'AGENT BREAKDOWN\n';
        csv += 'Rank,Agent,Branch,Position,Collected,vs Average\n';
        const sortedAgents = [...filteredAgents].sort((a, b) => b.collected - a.collected);
        sortedAgents.forEach((agent, index) => {
            const diff = agent.collected - overallAvg;
            const diffPercent = overallAvg > 0 ? (diff / overallAvg * 100).toFixed(0) : 0;
            const comparison = diff >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;
            csv += `${index + 1},${agent.initials},${agent.branch},${agent.position},${this.formatCurrency(agent.collected)},${comparison}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent_averages_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Results exported successfully');
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================

    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.toggle('error', isError);
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app
const app = new AgentAveragesDashboard();

