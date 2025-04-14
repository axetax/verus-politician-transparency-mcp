export const auditability = {
  documentation: `# Auditability and Integrity Assurance

## Overview

The Auditability module provides mechanisms to ensure transparency, integrity, and historical tracking of all data in the Politician Digital ID Module. It implements blockchain-based audit trails, correction workflows, and verification processes.

## Key Components

### 1. Historical State Tracking

- Complete history of all identity updates preserved on the blockchain
- Timestamped records of all data changes
- Cryptographic proof of each historical state

### 2. Correction Workflow

- Transparent process for correcting erroneous data
- Original data preserved for historical reference
- Clear audit trail of corrections with justifications

### 3. Verification Status Tracking

- Immutable record of verification decisions
- Complete history of approvals and rejections
- Transparent view of verification process

### 4. Public Audit Trail

- Public access to historical data changes
- Cryptographic verification of data integrity
- Comprehensive metadata for each update

## Implementation Approach

1. **Append-Only Updates**: Never overwrite data; always append corrections
2. **Metadata Enrichment**: Include detailed metadata with each update
3. **Blockchain Verification**: Leverage blockchain properties for immutability
4. **Transparent Corrections**: Implement formal correction process

## Best Practices

1. Include detailed justifications for all corrections
2. Maintain complete metadata for all updates
3. Implement cryptographic verification of historical states
4. Provide user-friendly interfaces for audit trail access`,

  // Generate commands for retrieving identity history
  generateIdentityHistoryCommand: (identityName) => {
    return `# Retrieve Complete Identity History

## Step 1: Get the identity history from the blockchain
verus getidentityhistory "${identityName}" > identity_history.json

## Step 2: Process the history data for better readability
cat > process_history.js << EOF
const fs = require('fs');

// Read the identity history
const history = JSON.parse(fs.readFileSync('identity_history.json', 'utf8'));

// Process and format the history
const formattedHistory = history.map((entry, index) => {
  return {
    update_number: index + 1,
    block_height: entry.height,
    timestamp: new Date(entry.time * 1000).toISOString(),
    txid: entry.txid,
    changes: {
      primary_addresses: entry.identity.primaryaddresses,
      content_map: entry.identity.contentmap,
      content_multimap: entry.identity.contentmultimap
    }
  };
});

// Write the formatted history to a file
fs.writeFileSync('formatted_history.json', JSON.stringify(formattedHistory, null, 2));

// Generate a summary report
const summary = {
  identity_name: "${identityName}",
  total_updates: formattedHistory.length,
  first_update: formattedHistory[0].timestamp,
  latest_update: formattedHistory[formattedHistory.length - 1].timestamp,
  update_frequency: formattedHistory.length > 1 
    ? Math.round((new Date(formattedHistory[formattedHistory.length - 1].timestamp) - new Date(formattedHistory[0].timestamp)) / (1000 * 60 * 60 * 24 * formattedHistory.length))
    : 'N/A'
};

fs.writeFileSync('history_summary.json', JSON.stringify(summary, null, 2));

console.log('Identity history processed successfully');
console.log('Full history saved to formatted_history.json');
console.log('Summary saved to history_summary.json');
EOF

## Step 3: Run the processing script
node process_history.js

## Step 4: Analyze specific updates if needed
cat > analyze_update.js << EOF
const fs = require('fs');

// Read the formatted history
const history = JSON.parse(fs.readFileSync('formatted_history.json', 'utf8'));

// Function to analyze a specific update
function analyzeUpdate(updateNumber) {
  const update = history.find(entry => entry.update_number === updateNumber);
  if (!update) {
    console.error(\`Update #\${updateNumber} not found\`);
    return;
  }
  
  console.log(\`Analysis of Update #\${updateNumber}:\`);
  console.log(\`Timestamp: \${update.timestamp}\`);
  console.log(\`Block Height: \${update.block_height}\`);
  console.log(\`Transaction ID: \${update.txid}\`);
  
  // Compare with previous update if available
  if (updateNumber > 1) {
    const prevUpdate = history.find(entry => entry.update_number === updateNumber - 1);
    
    console.log('\\nChanges from previous update:');
    
    // Compare primary addresses
    const addedAddresses = update.changes.primary_addresses.filter(addr => !prevUpdate.changes.primary_addresses.includes(addr));
    const removedAddresses = prevUpdate.changes.primary_addresses.filter(addr => !update.changes.primary_addresses.includes(addr));
    
    if (addedAddresses.length > 0) {
      console.log('Added primary addresses:', addedAddresses);
    }
    
    if (removedAddresses.length > 0) {
      console.log('Removed primary addresses:', removedAddresses);
    }
    
    // Compare content maps
    console.log('\\nContent map changes:');
    const prevContentKeys = Object.keys(prevUpdate.changes.content_map || {});
    const currentContentKeys = Object.keys(update.changes.content_map || {});
    
    const addedContentKeys = currentContentKeys.filter(key => !prevContentKeys.includes(key));
    const removedContentKeys = prevContentKeys.filter(key => !currentContentKeys.includes(key));
    const modifiedContentKeys = currentContentKeys.filter(key => 
      prevContentKeys.includes(key) && 
      JSON.stringify(prevUpdate.changes.content_map[key]) !== JSON.stringify(update.changes.content_map[key])
    );
    
    if (addedContentKeys.length > 0) {
      console.log('Added content keys:', addedContentKeys);
    }
    
    if (removedContentKeys.length > 0) {
      console.log('Removed content keys:', removedContentKeys);
    }
    
    if (modifiedContentKeys.length > 0) {
      console.log('Modified content keys:', modifiedContentKeys);
    }
    
    // Compare content multimaps
    console.log('\\nContent multimap changes:');
    const prevMultimapKeys = Object.keys(prevUpdate.changes.content_multimap || {});
    const currentMultimapKeys = Object.keys(update.changes.content_multimap || {});
    
    const addedMultimapKeys = currentMultimapKeys.filter(key => !prevMultimapKeys.includes(key));
    const modifiedMultimapKeys = currentMultimapKeys.filter(key => {
      if (!prevMultimapKeys.includes(key)) return false;
      
      const prevValues = prevUpdate.changes.content_multimap[key] || [];
      const currentValues = update.changes.content_multimap[key] || [];
      
      if (prevValues.length !== currentValues.length) return true;
      
      for (let i = 0; i < currentValues.length; i++) {
        if (JSON.stringify(prevValues[i]) !== JSON.stringify(currentValues[i])) {
          return true;
        }
      }
      
      return false;
    });
    
    if (addedMultimapKeys.length > 0) {
      console.log('Added multimap keys:', addedMultimapKeys);
    }
    
    if (modifiedMultimapKeys.length > 0) {
      console.log('Modified multimap keys:', modifiedMultimapKeys);
      
      // Detailed analysis of multimap changes
      modifiedMultimapKeys.forEach(key => {
        const prevValues = prevUpdate.changes.content_multimap[key] || [];
        const currentValues = update.changes.content_multimap[key] || [];
        
        const addedValues = currentValues.filter(val => 
          !prevValues.some(prevVal => JSON.stringify(prevVal) === JSON.stringify(val))
        );
        
        const removedValues = prevValues.filter(val => 
          !currentValues.some(currVal => JSON.stringify(currVal) === JSON.stringify(val))
        );
        
        console.log(\`\\nChanges in multimap key "\${key}":\`);
        if (addedValues.length > 0) {
          console.log('Added values:', JSON.stringify(addedValues, null, 2));
        }
        
        if (removedValues.length > 0) {
          console.log('Removed values:', JSON.stringify(removedValues, null, 2));
        }
      });
    }
  }
}

// Get update number from command line argument
const updateNumber = parseInt(process.argv[2], 10);
if (isNaN(updateNumber)) {
  console.error('Please provide a valid update number');
  process.exit(1);
}

analyzeUpdate(updateNumber);
EOF

## Step 5: Analyze a specific update (replace X with the update number)
# node analyze_update.js X

echo "Identity history analysis complete"
echo "Use 'node analyze_update.js X' to analyze a specific update"`;
  },
  
  // Generate commands for implementing a correction workflow
  generateCorrectionWorkflowCommands: (identityName, dataType, correctionData, reason) => {
    return `# Data Correction Workflow

## Step 1: Retrieve current data
# Get the current data for the specified data type
VDXF_KEY=$(verus calcvdxfkey "politician.${dataType}" "vdxf.${identityName.split('@')[1].toLowerCase()}" "1.0" | jq -r '.vdxfkey')
CURRENT_DATA=$(verus getidentity "${identityName}" | jq -r '.contentmultimap."'$VDXF_KEY'" // []')

## Step 2: Create correction entry
# Prepare the correction data with metadata
cat > correction_data.json << EOF
{
  "correction_of": ${correctionData},
  "correction_metadata": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "reason": "${reason}",
    "corrector": "CORRECTOR_ID",
    "original_data_hash": "$(echo $CURRENT_DATA | sha256sum | awk '{print $1}')"
  }
}
EOF

## Step 3: Get the public_corrections VDXF key
CORRECTIONS_KEY=$(verus calcvdxfkey "politician.public_corrections" "vdxf.${identityName.split('@')[1].toLowerCase()}" "1.0" | jq -r '.vdxfkey')

## Step 4: Add the correction to the public_corrections multimap
# Get current corrections
CURRENT_CORRECTIONS=$(verus getidentity "${identityName}" | jq -r '.contentmultimap."'$CORRECTIONS_KEY'" // []')

# Add new correction
CORRECTION=$(cat correction_data.json)
UPDATED_CORRECTIONS=$(echo $CURRENT_CORRECTIONS | jq '. += ['$CORRECTION']')

# Update the public_corrections multimap
verus setidentitycontentmultimap "${identityName}" '{"'$CORRECTIONS_KEY'":'$UPDATED_CORRECTIONS'}'

## Step 5: Update the original data with a correction reference
# Get the corrected data
CORRECTED_DATA=${correctionData}

# Add correction reference to the data
CORRECTION_REF=$(echo $CORRECTED_DATA | jq '. += {"correction_reference": {"timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'", "reason": "'${reason}'", "details_in_public_corrections": true}}')

# Update the original data
UPDATED_DATA=$(echo $CURRENT_DATA | jq '. += ['$CORRECTION_REF']')
verus setidentitycontentmultimap "${identityName}" '{"'$VDXF_KEY'":'$UPDATED_DATA'}'

## Step 6: Create an audit log entry
cat > audit_log_entry.json << EOF
{
  "action": "correction",
  "data_type": "${dataType}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "corrector": "CORRECTOR_ID",
  "reason": "${reason}",
  "original_data_hash": "$(echo $CURRENT_DATA | sha256sum | awk '{print $1}')",
  "corrected_data_hash": "$(echo $CORRECTED_DATA | sha256sum | awk '{print $1}')"
}
EOF

# Get the audit log VDXF key
AUDIT_KEY=$(verus calcvdxfkey "system.audit_log" "vdxf.${identityName.split('@')[1].toLowerCase()}" "1.0" | jq -r '.vdxfkey')

# Get current audit log
CURRENT_AUDIT=$(verus getidentity "${identityName.split('@')[1]}@" | jq -r '.contentmultimap."'$AUDIT_KEY'" // []')

# Add new audit entry
AUDIT_ENTRY=$(cat audit_log_entry.json)
UPDATED_AUDIT=$(echo $CURRENT_AUDIT | jq '. += ['$AUDIT_ENTRY']')

# Update the audit log
verus setidentitycontentmultimap "${identityName.split('@')[1]}@" '{"'$AUDIT_KEY'":'$UPDATED_AUDIT'}'

echo "Correction workflow completed successfully"
echo "The original data has been preserved and a correction has been added"
echo "The correction is referenced in both the original data and the public_corrections record"
echo "An audit log entry has been created for transparency"`;
  },
  
  // Generate commands for auditing verification decisions
  generateVerificationAuditCommands: (country) => {
    return `# Verification Decision Audit Process

## Step 1: Get the verification queue
VERIFICATION_QUEUE_KEY=$(verus calcvdxfkey "system.verification.queue" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')
VERIFICATION_QUEUE=$(verus getidentity "${country}@" | jq -r '.contentmultimap."'$VERIFICATION_QUEUE_KEY'" // []')
echo $VERIFICATION_QUEUE > verification_queue.json

## Step 2: Create an audit analysis script
cat > audit_verification.js << EOF
const fs = require('fs');

// Read the verification queue
const queue = JSON.parse(fs.readFileSync('verification_queue.json', 'utf8'));

// Parse each entry (they are stored as JSON strings within JSON)
const parsedQueue = queue.map(entry => JSON.parse(entry));

// Generate verification statistics
const stats = {
  total_requests: parsedQueue.length,
  status_counts: {
    unverified: parsedQueue.filter(req => req.status === 'unverified').length,
    partially_verified: parsedQueue.filter(req => req.status === 'partially_verified').length,
    verified: parsedQueue.filter(req => req.status === 'verified').length
  },
  by_data_type: {},
  by_verifier: {},
  average_verification_time: 0
};

// Calculate statistics by data type
parsedQueue.forEach(req => {
  if (!stats.by_data_type[req.data_type]) {
    stats.by_data_type[req.data_type] = {
      total: 0,
      verified: 0,
      rejected: 0
    };
  }
  
  stats.by_data_type[req.data_type].total++;
  
  if (req.status === 'verified') {
    stats.by_data_type[req.data_type].verified++;
  }
  
  if (req.rejections && req.rejections.length > 0) {
    stats.by_data_type[req.data_type].rejected++;
  }
});

// Calculate statistics by verifier
parsedQueue.forEach(req => {
  // Process approvals
  if (req.approvals) {
    req.approvals.forEach(approval => {
      if (!stats.by_verifier[approval.verifier]) {
        stats.by_verifier[approval.verifier] = {
          approvals: 0,
          rejections: 0,
          total: 0
        };
      }
      
      stats.by_verifier[approval.verifier].approvals++;
      stats.by_verifier[approval.verifier].total++;
    });
  }
  
  // Process rejections
  if (req.rejections) {
    req.rejections.forEach(rejection => {
      if (!stats.by_verifier[rejection.verifier]) {
        stats.by_verifier[rejection.verifier] = {
          approvals: 0,
          rejections: 0,
          total: 0
        };
      }
      
      stats.by_verifier[rejection.verifier].rejections++;
      stats.by_verifier[rejection.verifier].total++;
    });
  }
});

// Calculate average verification time for verified requests
const verifiedRequests = parsedQueue.filter(req => req.status === 'verified');
if (verifiedRequests.length > 0) {
  let totalTime = 0;
  
  verifiedRequests.forEach(req => {
    const submissionTime = new Date(req.timestamp).getTime();
    const verificationTime = new Date(req.approvals[req.approvals.length - 1].timestamp).getTime();
    const timeDiff = verificationTime - submissionTime;
    totalTime += timeDiff;
  });
  
  stats.average_verification_time = totalTime / verifiedRequests.length / (1000 * 60 * 60); // in hours
}

// Generate detailed audit report
const auditReport = {
  summary: stats,
  verification_requests: parsedQueue.map(req => {
    return {
      data_type: req.data_type,
      politician_id: req.politician_id,
      submitter: req.submitter,
      submission_time: req.timestamp,
      status: req.status,
      approvals: req.approvals || [],
      rejections: req.rejections || [],
      verification_time: req.status === 'verified' && req.approvals && req.approvals.length > 0 
        ? (new Date(req.approvals[req.approvals.length - 1].timestamp).getTime() - new Date(req.timestamp).getTime()) / (1000 * 60 * 60)
        : null
    };
  })
};

// Write the audit report to a file
fs.writeFileSync('verification_audit.json', JSON.stringify(auditReport, null, 2));

// Generate HTML report
const htmlReport = \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Audit Report - ${country}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .stats-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
    .stat-card { background: #f5f5f5; border-radius: 8px; padding: 15px; flex: 1; min-width: 200px; }
    .stat-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f9f9f9; }
    .badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-unverified { background-color: #f8d7da; color: #721c24; }
    .badge-partially { background-color: #fff3cd; color: #856404; }
    .badge-verified { background-color: #d4edda; color: #155724; }
  </style>
</head>
<body>
  <h1>Verification Audit Report - ${country}</h1>
  <p>Generated on \${new Date().toLocaleString()}</p>
  
  <h2>Summary Statistics</h2>
  <div class="stats-container">
    <div class="stat-card">
      <h3>Total Requests</h3>
      <div class="stat-value">\${auditReport.summary.total_requests}</div>
    </div>
    <div class="stat-card">
      <h3>Unverified</h3>
      <div class="stat-value">\${auditReport.summary.status_counts.unverified}</div>
    </div>
    <div class="stat-card">
      <h3>Partially Verified</h3>
      <div class="stat-value">\${auditReport.summary.status_counts.partially_verified}</div>
    </div>
    <div class="stat-card">
      <h3>Verified</h3>
      <div class="stat-value">\${auditReport.summary.status_counts.verified}</div>
    </div>
    <div class="stat-card">
      <h3>Avg. Verification Time</h3>
      <div class="stat-value">\${auditReport.summary.average_verification_time.toFixed(2)} hours</div>
    </div>
  </div>
  
  <h2>By Data Type</h2>
  <table>
    <thead>
      <tr>
        <th>Data Type</th>
        <th>Total</th>
        <th>Verified</th>
        <th>Rejected</th>
        <th>Verification Rate</th>
      </tr>
    </thead>
    <tbody>
      \${Object.entries(auditReport.summary.by_data_type).map(([type, data]) => \`
        <tr>
          <td>\${type}</td>
          <td>\${data.total}</td>
          <td>\${data.verified}</td>
          <td>\${data.rejected}</td>
          <td>\${data.total > 0 ? ((data.verified / data.total) * 100).toFixed(1) + '%' : 'N/A'}</td>
        </tr>
      \`).join('')}
    </tbody>
  </table>
  
  <h2>By Verifier</h2>
  <table>
    <thead>
      <tr>
        <th>Verifier</th>
        <th>Total Actions</th>
        <th>Approvals</th>
        <th>Rejections</th>
        <th>Approval Rate</th>
      </tr>
    </thead>
    <tbody>
      \${Object.entries(auditReport.summary.by_verifier).map(([verifier, data]) => \`
        <tr>
          <td>\${verifier}</td>
          <td>\${data.total}</td>
          <td>\${data.approvals}</td>
          <td>\${data.rejections}</td>
          <td>\${data.total > 0 ? ((data.approvals / data.total) * 100).toFixed(1) + '%' : 'N/A'}</td>
        </tr>
      \`).join('')}
    </tbody>
  </table>
  
  <h2>Recent Verification Requests</h2>
  <table>
    <thead>
      <tr>
        <th>Politician</th>
        <th>Data Type</th>
        <th>Submitted</th>
        <th>Status</th>
        <th>Verification Time</th>
      </tr>
    </thead>
    <tbody>
      \${auditReport.verification_requests
        .sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time))
        .slice(0, 20)
        .map(req => \`
          <tr>
            <td>\${req.politician_id}</td>
            <td>\${req.data_type}</td>
            <td>\${new Date(req.submission_time).toLocaleString()}</td>
            <td>
              <span class="badge badge-\${req.status === 'verified' ? 'verified' : req.status === 'partially_verified' ? 'partially' : 'unverified'}">
                \${req.status}
              </span>
            </td>
            <td>\${req.verification_time ? req.verification_time.toFixed(2) + ' hours' : 'N/A'}</td>
          </tr>
        \`).join('')}
    </tbody>
  </table>
</body>
</html>
\`;

fs.writeFileSync('verification_audit.html', htmlReport);

console.log('Verification audit complete');
console.log('JSON report saved to verification_audit.json');
console.log('HTML report saved to verification_audit.html');
EOF

## Step 3: Run the audit script
node audit_verification.js

echo "Verification audit process completed successfully"
echo "The audit report is available in verification_audit.json and verification_audit.html"`;
  }
};
