class ExportManager {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        await this.loadExportHistory();
        this.setDefaultDates();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${this.apiBase}/auth/status`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (!result.authenticated) {
                window.location.href = 'index.html';
                return;
            }

            document.getElementById('userWelcome').textContent = `Welcome, ${result.user.first_name}!`;
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'index.html';
        }
    }

    bindEvents() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('exportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExport();
        });

        // Real-time preview
        document.getElementById('exportFormat').addEventListener('change', () => {
            this.updatePreview();
        });

        document.getElementById('dateFrom').addEventListener('change', () => {
            this.updatePreview();
        });

        document.getElementById('dateTo').addEventListener('change', () => {
            this.updatePreview();
        });
    }

    setDefaultDates() {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        document.getElementById('dateFrom').value = oneWeekAgo.toISOString().split('T')[0];
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    }

    async updatePreview() {
        const format = document.getElementById('exportFormat').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        try {
            // Load sample data for preview
            const response = await fetch(`${this.apiBase}/activities`, {
                credentials: 'include'
            });
            const activities = await response.json();

            const previewData = activities.slice(0, 3); // Show first 3 activities as preview

            this.displayPreview(previewData, format);
        } catch (error) {
            console.error('Preview update error:', error);
        }
    }

    displayPreview(data, format) {
        const previewContainer = document.getElementById('exportPreview');

        if (data.length === 0) {
            previewContainer.innerHTML = '<p>No data available for the selected period.</p>';
            return;
        }

        let previewHtml = '';

        switch(format) {
            case 'csv':
                previewHtml = this.generateCSVPreview(data);
                break;
            case 'pdf':
                previewHtml = this.generatePDFPreview(data);
                break;
            case 'json':
                previewHtml = this.generateJSONPreview(data);
                break;
        }

        previewContainer.innerHTML = previewHtml;
    }

    generateCSVPreview(data) {
        const headers = ['Date', 'Activity', 'Category', 'Quantity', 'Emissions (kg CO₂)'];
        const rows = data.map(activity => [
            new Date(activity.start_date).toLocaleDateString(),
            activity.activity_name,
            activity.category_name,
            `${activity.quantity} ${activity.unit}`,
            activity.CO2_result
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });

        return `
            <div>
                <p><strong>CSV Preview (first 3 records):</strong></p>
                <pre style="background: #f8f9fa; padding: 1rem; border-radius: 5px; overflow-x: auto;">${csv}</pre>
                <small>Total records to export: ${data.length}</small>
            </div>
        `;
    }

    generatePDFPreview(data) {
        return `
            <div>
                <p><strong>PDF Report Preview:</strong></p>
                <div style="border: 1px solid #ddd; padding: 1rem; background: white;">
                    <h4 style="margin: 0 0 1rem 0;">Carbon Footprint Report</h4>
                    <p><strong>Period:</strong> ${document.getElementById('dateFrom').value} to ${document.getElementById('dateTo').value}</p>
                    <p><strong>Total Activities:</strong> ${data.length}</p>
                    <p><strong>Total Emissions:</strong> ${data.reduce((sum, activity) => sum + activity.CO2_result, 0).toFixed(1)} kg CO₂</p>
                    <hr>
                    <p>This PDF will include charts, summaries, and detailed activity breakdown.</p>
                </div>
            </div>
        `;
    }

    generateJSONPreview(data) {
        return `
            <div>
                <p><strong>JSON Preview (first 3 records):</strong></p>
                <pre style="background: #f8f9fa; padding: 1rem; border-radius: 5px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
                <small>Total records to export: ${data.length}</small>
            </div>
        `;
    }

    async handleExport() {
        const formData = new FormData(document.getElementById('exportForm'));
        const exportData = {
            format: formData.get('format'),
            dateFrom: formData.get('dateFrom'),
            dateTo: formData.get('dateTo'),
            dataTypes: formData.getAll('dataType')
        };

        this.showMessage('Generating export...', 'info');

        try {
            // In a real implementation, you would call your backend export endpoint
            // For now, we'll simulate the export process
            
            setTimeout(() => {
                this.simulateExportDownload(exportData);
            }, 2000);

        } catch (error) {
            this.showMessage('Export failed: ' + error.message, 'error');
            console.error('Export error:', error);
        }
    }

    simulateExportDownload(exportData) {
        // Create mock data based on format
        let content, mimeType, filename;

        switch(exportData.format) {
            case 'csv':
                content = this.generateMockCSV();
                mimeType = 'text/csv';
                filename = `carbon_data_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'pdf':
                // In real implementation, this would be a PDF blob from the server
                content = this.generateMockPDF();
                mimeType = 'application/pdf';
                filename = `carbon_report_${new Date().toISOString().split('T')[0]}.pdf`;
                break;
            case 'json':
                content = JSON.stringify(this.generateMockJSON(), null, 2);
                mimeType = 'application/json';
                filename = `carbon_data_${new Date().toISOString().split('T')[0]}.json`;
                break;
        }

        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showMessage('Export downloaded successfully!', 'success');
        this.addToExportHistory(exportData.format);
    }

    generateMockCSV() {
        return `Date,Activity,Category,Quantity,Emissions (kg CO₂)
2024-01-15,Drive to work,Transportation,10 km,1.9
2024-01-15,Electricity usage,Energy,5 kWh,2.1
2024-01-14,Daily meals,Diet,3 meals,5.4`;
    }

    generateMockPDF() {
        return '%PDF-1.4\n1 0 obj\n...'; // Mock PDF content
    }

    generateMockJSON() {
        return {
            exportDate: new Date().toISOString(),
            period: {
                from: document.getElementById('dateFrom').value,
                to: document.getElementById('dateTo').value
            },
            activities: [
                {
                    date: "2024-01-15",
                    activity: "Drive to work",
                    category: "Transportation",
                    quantity: 10,
                    unit: "km",
                    emissions: 1.9
                }
            ],
            summary: {
                totalEmissions: 9.4,
                activityCount: 3,
                averageDaily: 3.13
            }
        };
    }

    async quickExport(format, days) {
        // Set form values
        document.getElementById('exportFormat').value = format;
        
        if (days !== 'all') {
            const today = new Date();
            const fromDate = new Date();
            fromDate.setDate(today.getDate() - days);
            
            document.getElementById('dateFrom').value = fromDate.toISOString().split('T')[0];
            document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        }

        // Trigger export
        this.handleExport();
    }

    addToExportHistory(format) {
        const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
        history.unshift({
            format: format,
            date: new Date().toISOString(),
            size: '~2KB' // Mock size
        });
        
        // Keep only last 10 exports
        if (history.length > 10) {
            history.pop();
        }
        
        localStorage.setItem('exportHistory', JSON.stringify(history));
        this.displayExportHistory(history);
    }

    async loadExportHistory() {
        const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
        this.displayExportHistory(history);
    }

    displayExportHistory(history) {
        const container = document.getElementById('exportHistory');

        if (history.length === 0) {
            container.innerHTML = '<div class="message info">No export history yet.</div>';
            return;
        }

        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Format</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.map(exportItem => `
                        <tr>
                            <td>${new Date(exportItem.date).toLocaleString()}</td>
                            <td>${exportItem.format.toUpperCase()}</td>
                            <td>${exportItem.size}</td>
                            <td>
                                <button onclick="exportManager.redownload('${exportItem.format}')" 
                                        class="btn-secondary" style="padding: 0.25rem 0.5rem;">
                                    Download Again
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    redownload(format) {
        this.quickExport(format, 30);
    }

    async logout() {
        try {
            await fetch(`${this.apiBase}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.marginTop = '1rem';

        const exportForm = document.getElementById('exportForm');
        exportForm.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Initialize export manager
const exportManager = new ExportManager();