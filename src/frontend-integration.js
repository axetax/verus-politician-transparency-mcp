export const frontendIntegration = {
  documentation: `# Frontend Integration

## Overview

The Frontend Integration module provides the necessary components to build a user interface for the Politician Digital ID Module. It includes templates for politician profiles, data visualization components, and forms for data submission and verification.

## Key Components

### 1. Politician Profile Page

The profile page displays all information about a politician, including:

- Basic profile information (name, position, party, etc.)
- Transparency data (schedule, expenses, voting records, etc.)
- Verification status for each data item
- Timeline of activities and updates

### 2. Data Visualization Components

These components provide visual representations of politician data:

- Expense charts and breakdowns
- Voting record analysis
- Attendance and activity metrics
- Comparison tools for multiple politicians

### 3. Data Submission Forms

Forms for submitting new data or updates, including:

- Structured input fields for each data type
- Evidence upload capabilities
- Submission tracking and status updates
- Notification system for submission results

### 4. Verification Dashboard

A specialized interface for authorized verifiers:

- Queue of pending verification requests
- Evidence review tools
- Approval/rejection workflow
- Verification history and audit trail

### 5. API Endpoints

RESTful API endpoints for programmatic access:

- Data retrieval for all politician information
- Submission endpoints for updates
- Verification status queries
- Search and filtering capabilities

## Implementation Approach

1. **Data Retrieval**: Use the Verus API to fetch identity and content data
2. **Data Processing**: Transform blockchain data into user-friendly formats
3. **User Interface**: Build responsive components using modern web frameworks
4. **Authentication**: Implement VerusID Login for secure access
5. **Real-time Updates**: Use WebSockets for immediate notification of changes

## Integration with AXE TAX AI

The frontend components integrate with AXE TAX AI through:

1. **Data Feeds**: Provide structured data for AI analysis
2. **Visualization Embedding**: Embed AI-generated insights in the interface
3. **Search Enhancement**: Use AI to improve search capabilities
4. **Anomaly Detection**: Highlight unusual patterns identified by AI
5. **Recommendation Engine**: Suggest relevant information based on user interests`,

  // Generate HTML template for a verification dashboard (continued)
  generateVerificationDashboardTemplate: (country) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Dashboard - ${country} Politicians</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    .verification-badge {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
    }
    .verification-unverified {
      background-color: #f8d7da;
      color: #721c24;
    }
    .verification-partially {
      background-color: #fff3cd;
      color: #856404;
    }
    .verification-verified {
      background-color: #d4edda;
      color: #155724;
    }
    .evidence-list {
      max-height: 150px;
      overflow-y: auto;
    }
    .nav-pills .nav-link.active {
      background-color: #0d6efd;
    }
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">${country} Verification Dashboard</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Politicians</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Reports</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Settings</a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="#">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body text-center">
            <h5 class="card-title">Pending Verifications</h5>
            <h2 class="display-4">{{pendingCount}}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body text-center">
            <h5 class="card-title">Partially Verified</h5>
            <h2 class="display-4">{{partiallyCount}}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body text-center">
            <h5 class="card-title">Verified Today</h5>
            <h2 class="display-4">{{verifiedTodayCount}}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body text-center">
            <h5 class="card-title">Total Verified</h5>
            <h2 class="display-4">{{totalVerifiedCount}}</h2>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-3">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Filter Submissions</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="statusFilter" class="form-label">Status</label>
              <select class="form-select" id="statusFilter">
                <option value="all">All</option>
                <option value="unverified" selected>Unverified</option>
                <option value="partially_verified">Partially Verified</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="typeFilter" class="form-label">Data Type</label>
              <select class="form-select" id="typeFilter">
                <option value="all">All</option>
                <option value="schedule">Schedule</option>
                <option value="vacation">Vacation</option>
                <option value="expenses">Expenses</option>
                <option value="daily_logs">Daily Logs</option>
                <option value="voting_records">Voting Records</option>
                <option value="public_statements">Public Statements</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="politicianFilter" class="form-label">Politician</label>
              <select class="form-select" id="politicianFilter">
                <option value="all">All</option>
                {{#each politicians}}
                <option value="{{this.id}}">{{this.name}}</option>
                {{/each}}
              </select>
            </div>
            <div class="mb-3">
              <label for="dateFilter" class="form-label">Date Range</label>
              <div class="input-group mb-2">
                <span class="input-group-text">From</span>
                <input type="date" class="form-control" id="dateFrom">
              </div>
              <div class="input-group">
                <span class="input-group-text">To</span>
                <input type="date" class="form-control" id="dateTo">
              </div>
            </div>
            <button class="btn btn-primary w-100" id="applyFilters">Apply Filters</button>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h5>Verification Stats</h5>
          </div>
          <div class="card-body">
            <canvas id="verificationStats"></canvas>
          </div>
        </div>
      </div>
      
      <div class="col-md-9">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Verification Queue</h5>
            <div class="btn-group" role="group">
              <button type="button" class="btn btn-sm btn-outline-primary">Refresh</button>
              <button type="button" class="btn btn-sm btn-outline-primary">Export</button>
            </div>
          </div>
          <div class="card-body">
            <ul class="nav nav-pills mb-3" id="queueTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="unverified-tab" data-bs-toggle="pill" data-bs-target="#unverified" type="button" role="tab" aria-controls="unverified" aria-selected="true">Unverified ({{pendingCount}})</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="partially-tab" data-bs-toggle="pill" data-bs-target="#partially" type="button" role="tab" aria-controls="partially" aria-selected="false">Partially Verified ({{partiallyCount}})</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="verified-tab" data-bs-toggle="pill" data-bs-target="#verified" type="button" role="tab" aria-controls="verified" aria-selected="false">Verified ({{totalVerifiedCount}})</button>
              </li>
            </ul>
            
            <div class="tab-content" id="queueTabsContent">
              <div class="tab-pane fade show active" id="unverified" role="tabpanel" aria-labelledby="unverified-tab">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Politician</th>
                        <th>Data Type</th>
                        <th>Submitted</th>
                        <th>Submitter</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {{#each unverifiedQueue}}
                      <tr data-bs-toggle="modal" data-bs-target="#verificationModal" data-request-id="{{this.id}}">
                        <td>{{this.id}}</td>
                        <td>{{this.politician}}</td>
                        <td>{{this.dataType}}</td>
                        <td>{{this.timestamp}}</td>
                        <td>{{this.submitter}}</td>
                        <td><span class="badge verification-badge verification-unverified">Unverified</span></td>
                        <td>
                          <button class="btn btn-sm btn-primary">Review</button>
                        </td>
                      </tr>
                      {{/each}}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="tab-pane fade" id="partially" role="tabpanel" aria-labelledby="partially-tab">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Politician</th>
                        <th>Data Type</th>
                        <th>Submitted</th>
                        <th>Approvals</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {{#each partiallyQueue}}
                      <tr data-bs-toggle="modal" data-bs-target="#verificationModal" data-request-id="{{this.id}}">
                        <td>{{this.id}}</td>
                        <td>{{this.politician}}</td>
                        <td>{{this.dataType}}</td>
                        <td>{{this.timestamp}}</td>
                        <td>{{this.approvals}}/{{this.requiredApprovals}}</td>
                        <td><span class="badge verification-badge verification-partially">Partially Verified</span></td>
                        <td>
                          <button class="btn btn-sm btn-primary">Review</button>
                        </td>
                      </tr>
                      {{/each}}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="tab-pane fade" id="verified" role="tabpanel" aria-labelledby="verified-tab">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Politician</th>
                        <th>Data Type</th>
                        <th>Submitted</th>
                        <th>Verified</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {{#each verifiedQueue}}
                      <tr data-bs-toggle="modal" data-bs-target="#verificationModal" data-request-id="{{this.id}}">
                        <td>{{this.id}}</td>
                        <td>{{this.politician}}</td>
                        <td>{{this.dataType}}</td>
                        <td>{{this.timestamp}}</td>
                        <td>{{this.verifiedTimestamp}}</td>
                        <td><span class="badge verification-badge verification-verified">Verified</span></td>
                        <td>
                          <button class="btn btn-sm btn-secondary">View</button>
                        </td>
                      </tr>
                      {{/each}}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Verification Modal -->
  <div class="modal fade" id="verificationModal" tabindex="-1" aria-labelledby="verificationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="verificationModalLabel">Verification Request</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <h6>Request Details</h6>
              <table class="table table-sm">
                <tr>
                  <th>ID:</th>
                  <td>{{currentRequest.id}}</td>
                </tr>
                <tr>
                  <th>Politician:</th>
                  <td>{{currentRequest.politician}}</td>
                </tr>
                <tr>
                  <th>Data Type:</th>
                  <td>{{currentRequest.dataType}}</td>
                </tr>
                <tr>
                  <th>Submitted:</th>
                  <td>{{currentRequest.timestamp}}</td>
                </tr>
                <tr>
                  <th>Submitter:</th>
                  <td>{{currentRequest.submitter}}</td>
                </tr>
                <tr>
                  <th>Status:</th>
                  <td><span class="badge verification-badge verification-{{currentRequest.status}}">{{currentRequest.status}}</span></td>
                </tr>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Evidence</h6>
              <div class="list-group evidence-list">
                {{#each currentRequest.evidence}}
                <a href="{{this}}" class="list-group-item list-group-item-action" target="_blank">{{this}}</a>
                {{/each}}
              </div>
            </div>
          </div>
          
          <h6>Data Content</h6>
          <div class="card mb-3">
            <div class="card-body">
              <pre class="mb-0">{{currentRequest.data}}</pre>
            </div>
          </div>
          
          <h6>Verification History</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Verifier</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {{#each currentRequest.approvals}}
                <tr class="table-success">
                  <td>{{this.verifier}}</td>
                  <td>Approved</td>
                  <td>{{this.timestamp}}</td>
                  <td>{{this.comments}}</td>
                </tr>
                {{/each}}
                {{#each currentRequest.rejections}}
                <tr class="table-danger">
                  <td>{{this.verifier}}</td>
                  <td>Rejected</td>
                  <td>{{this.timestamp}}</td>
                  <td>{{this.comments}}</td>
                </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
          
          {{#if currentRequest.canVerify}}
          <div class="card mt-3">
            <div class="card-header">
              <h6 class="mb-0">Verification Decision</h6>
            </div>
            <div class="card-body">
              <form id="verificationForm">
                <div class="mb-3">
                  <label for="verificationComments" class="form-label">Comments</label>
                  <textarea class="form-control" id="verificationComments" rows="3" placeholder="Add your verification comments here..."></textarea>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-danger me-2" id="rejectBtn">Reject</button>
                  <button type="button" class="btn btn-success" id="approveBtn">Approve</button>
                </div>
              </form>
            </div>
          </div>
          {{/if}}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    // Sample data for charts
    const statsCtx = document.getElementById('verificationStats').getContext('2d');
    new Chart(statsCtx, {
      type: 'bar',
      data: {
        labels: ['Schedule', 'Expenses', 'Voting', 'Statements', 'Vacation'],
        datasets: [
          {
            label: 'Unverified',
            data: [12, 8, 5, 7, 3],
            backgroundColor: '#f8d7da'
          },
          {
            label: 'Partially Verified',
            data: [5, 7, 3, 4, 2],
            backgroundColor: '#fff3cd'
          },
          {
            label: 'Verified',
            data: [25, 32, 18, 29, 15],
            backgroundColor: '#d4edda'
          }
        ]
      },
      options: {
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    });
    
    // Handle verification actions
    document.getElementById('approveBtn')?.addEventListener('click', function() {
      const requestId = document.querySelector('#verificationModal').dataset.requestId;
      const comments = document.getElementById('verificationComments').value;
      
      // In a real app, this would send an API request
      console.log('Approving request:', requestId, 'with comments:', comments);
      alert('Request approved successfully!');
      
      // Close the modal and refresh the queue
      const modal = bootstrap.Modal.getInstance(document.getElementById('verificationModal'));
      modal.hide();
    });
    
    document.getElementById('rejectBtn')?.addEventListener('click', function() {
      const requestId = document.querySelector('#verificationModal').dataset.requestId;
      const comments = document.getElementById('verificationComments').value;
      
      // In a real app, this would send an API request
      console.log('Rejecting request:', requestId, 'with comments:', comments);
      alert('Request rejected!');
      
      // Close the modal and refresh the queue
      const modal = bootstrap.Modal.getInstance(document.getElementById('verificationModal'));
      modal.hide();
    });
    
    // Load request details when modal is opened
    document.getElementById('verificationModal').addEventListener('show.bs.modal', function(event) {
      const button = event.relatedTarget;
      const requestId = button.closest('tr').dataset.requestId;
      this.dataset.requestId = requestId;
      
      // In a real app, this would fetch the request details from an API
      console.log('Loading details for request:', requestId);
      
      // For demo purposes, we're using placeholder data in the template
    });
  </script>
</body>
</html>`;
  },
  
  // Generate API integration code for AXE TAX AI
  generateApiIntegrationCode: () => {
    return `// API Integration for AXE TAX AI
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// API endpoints for AXE TAX AI integration

// Get all politicians
app.get('/api/politicians', async (req, res) => {
  try {
    // In a real implementation, this would query the Verus blockchain
    // For demo purposes, we return mock data
    const politicians = [
      { id: 'smith@Canada@', name: 'Smith', position: 'Minister', party: 'Party A' },
      { id: 'jones@Canada@', name: 'Jones', position: 'Senator', party: 'Party B' },
      { id: 'wilson@Canada@', name: 'Wilson', position: 'Representative', party: 'Party C' }
    ];
    
    res.json({ success: true, data: politicians });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get politician profile
app.get('/api/politicians/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would query the Verus blockchain
    // For demo purposes, we return mock data
    const politician = {
      id,
      name: id.split('@')[0],
      position: 'Minister',
      party: 'Party A',
      region: 'Region 1',
      elected_date: '2022-01-01',
      contact: {
        email: \`\${id.split('@')[0].toLowerCase()}@example.gov\`,
        phone: '+1234567890',
        office: '123 Government St'
      }
    };
    
    res.json({ success: true, data: politician });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get politician data by type
app.get('/api/politicians/:id/:dataType', async (req, res) => {
  try {
    const { id, dataType } = req.params;
    
    // In a real implementation, this would query the Verus blockchain
    // For demo purposes, we return mock data
    let data = [];
    
    switch (dataType) {
      case 'expenses':
        data = [
          { date: '2023-01-15', category: 'Travel', description: 'Flight to Ottawa', amount: 450, evidence: 'https://example.com/receipt1', verification: 'verified' },
          { date: '2023-02-10', category: 'Office', description: 'Office supplies', amount: 120, evidence: 'https://example.com/receipt2', verification: 'verified' },
          { date: '2023-03-05', category: 'Staff', description: 'Staff training', amount: 800, evidence: 'https://example.com/receipt3', verification: 'partially' }
        ];
        break;
      case 'voting_records':
        data = [
          { date: '2023-01-20', bill: 'Bill C-123', description: 'Environmental Protection Act', vote: true, outcome: 'Passed', verification: 'verified' },
          { date: '2023-02-15', bill: 'Bill C-456', description: 'Tax Reform Act', vote: false, outcome: 'Failed', verification: 'verified' },
          { date: '2023-03-10', bill: 'Bill C-789', description: 'Healthcare Funding', vote: true, outcome: 'Passed', verification: 'unverified' }
        ];
        break;
      // Add cases for other data types
      default:
        data = [];
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit data for verification
app.post('/api/submit', async (req, res) => {
  try {
    const { politician_id, data_type, data, evidence, submitter } = req.body;
    
    // Validate required fields
    if (!politician_id || !data_type || !data || !evidence || !submitter) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    // In a real implementation, this would submit to the Verus blockchain
    // For demo purposes, we just return success
    
    res.json({ 
      success: true, 
      message: 'Data submitted for verification',
      request_id: 'req_' + Math.random().toString(36).substr(2, 9)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get verification status
app.get('/api/verification/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // In a real implementation, this would query the Verus blockchain
    // For demo purposes, we return mock data
    const status = {
      id: requestId,
      status: 'partially_verified',
      approvals: 1,
      required_approvals: 2,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`API server running on port \${PORT}\`);
});`;
  }
};
