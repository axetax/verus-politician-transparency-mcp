export const politicianModule = {
  documentation: `# Politician Digital ID Module

## Overview

The Politician Digital ID Module is a practical application of VerusID and VDXF that creates a transparent system for tracking political activities, expenses, and voting records. It implements a hierarchical identity structure with multi-signature security and standardized data formats.

## Architecture

### Identity Structure

1. **Root Identities**:
   - "Canada@" and "America@" serve as namespace roots
   - Controlled by multi-signature governance

2. **Politician Sub-Identities**:
   - Format: "name@country@" (e.g., "smith@Canada@")
   - Each politician has their own identity under the country namespace
   - Controlled by a combination of the politician and administrative authorities

### Data Structure

Each politician identity contains standardized data categories:

1. **schedule**: Official meetings and public appearances
2. **vacation**: Time away from official duties
3. **expenses**: Financial transactions and expense claims
4. **daily_logs**: Daily activities and engagements
5. **voting_records**: Voting history with timestamps
6. **public_statements**: Official statements with sources

### Security Model

The system implements a multi-layered security approach:

1. **Root Identity Security**:
   - Multi-signature control (e.g., 3-of-5) by administrative authorities
   - Strict governance for namespace management

2. **Politician Identity Security**:
   - Split control between politician and administrative authorities
   - Verification requirements for sensitive updates

3. **Data Verification**:
   - Multi-signature approval for submitted updates
   - Evidence requirements for expense claims and voting records

## Implementation Process

1. **Setup Phase**:
   - Register root country identities
   - Define VDXF data types and schemas
   - Establish governance parameters

2. **Politician Onboarding**:
   - Create sub-identities for politicians
   - Initialize data structures
   - Set up verification controls

3. **Operational Phase**:
   - Regular data updates
   - Verification of submitted information
   - Public access to transparency data

## Integration Points

1. **Frontend Interface**:
   - Profile pages for politicians
   - Data visualization components
   - Update submission forms

2. **AXE TAX AI Integration**:
   - API endpoints for data queries
   - Correlation between expenses and voting records
   - Transparency metrics and analysis

## Best Practices

1. Implement strict verification for all updates
2. Maintain comprehensive version history
3. Require evidence for all financial transactions
4. Ensure timely publication of voting records
5. Implement clear data validation rules`,

  // Generate setup commands for the Politician Digital ID Module
  generateSetupCommands: (country, adminAddresses, minSignatures) => {
    const commands = [];
    
    // Step 1: Create a name commitment for the country identity
    commands.push(`# Step 1: Create a name commitment for ${country}`);
    commands.push(`COMMITMENT_TXID=$(verus namecommitment "${country}" "" "" 0.0001 | jq -r '.txid')`);
    commands.push(`echo "Name commitment transaction ID: $COMMITMENT_TXID"`);
    commands.push(`# Wait for at least one confirmation before proceeding`);
    commands.push(``);
    
    // Step 2: Register the country identity with multi-signature control
    commands.push(`# Step 2: Register the ${country} identity with multi-signature control`);
    const controlParams = {
      primaryaddresses: adminAddresses,
      minimumsignatures: minSignatures,
      recoveryauthority: adminAddresses[0],
      revocationauthority: adminAddresses[0]
    };
    commands.push(`verus registeridentity "${country}" '${JSON.stringify(controlParams)}' "" "" "$COMMITMENT_TXID"`);
    commands.push(`# Wait for at least one confirmation before proceeding`);
    commands.push(``);
    
    // Step 3: Define VDXF keys for politician data
    commands.push(`# Step 3: Define VDXF keys for politician data`);
    const dataTypes = [
      "schedule", "vacation", "expenses", "daily_logs", "voting_records", "public_statements"
    ];
    
    for (const dataType of dataTypes) {
      commands.push(`# Create VDXF key for ${dataType}`);
      commands.push(`${dataType.toUpperCase()}_KEY=$(verus calcvdxfkey "politician.${dataType}" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')`);
      commands.push(`echo "${dataType} VDXF key: $${dataType.toUpperCase()}_KEY"`);
    }
    commands.push(``);
    
    // Step 4: Initialize the verification system
    commands.push(`# Step 4: Initialize the verification system`);
    commands.push(`VERIFICATION_KEY=$(verus calcvdxfkey "system.verification" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')`);
    commands.push(`echo "Verification system VDXF key: $VERIFICATION_KEY"`);
    
    // Create verification system configuration
    const verificationConfig = {
      admins: adminAddresses,
      required_signatures: minSignatures,
      verification_levels: [
        { name: "unverified", description: "Data has been submitted but not verified" },
        { name: "partially_verified", description: "Data has been partially verified" },
        { name: "verified", description: "Data has been fully verified" }
      ]
    };
    
    commands.push(`verus setidentitycontent "${country}@" '{"$VERIFICATION_KEY":${JSON.stringify(verificationConfig)}}'`);
    
    return commands.join('\n');
  },
  
  // Generate commands to create a politician profile
  generatePoliticianProfileCommands: (country, name, position, party, region, primaryAddresses, adminAddresses) => {
    const commands = [];
    
    // Step 1: Create a name commitment for the politician identity
    commands.push(`# Step 1: Create a name commitment for ${name}@${country}@`);
    commands.push(`COMMITMENT_TXID=$(verus namecommitment "${name}" "${country}@" "" 0.0001 | jq -r '.txid')`);
    commands.push(`echo "Name commitment transaction ID: $COMMITMENT_TXID"`);
    commands.push(`# Wait for at least one confirmation before proceeding`);
    commands.push(``);
    
    // Step 2: Register the politician identity
    commands.push(`# Step 2: Register the politician identity`);
    
    // Combine politician's addresses with admin addresses for primary control
    const allPrimaryAddresses = [...primaryAddresses, ...adminAddresses];
    
    const controlParams = {
      primaryaddresses: allPrimaryAddresses,
      minimumsignatures: 2, // Require at least 2 signatures (politician + admin or multiple admins)
      recoveryauthority: adminAddresses[0],
      revocationauthority: adminAddresses[0]
    };
    
    commands.push(`verus registeridentity "${name}" '${JSON.stringify(controlParams)}' "${country}@" "" "$COMMITMENT_TXID"`);
    commands.push(`# Wait for at least one confirmation before proceeding`);
    commands.push(``);
    
    // Step 3: Add basic profile information
    commands.push(`# Step 3: Add basic profile information`);
    commands.push(`PROFILE_KEY=$(verus calcvdxfkey "politician.profile" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')`);
    
    const profileData = {
      name: name,
      position: position,
      party: party,
      region: region,
      elected_date: new Date().toISOString().split('T')[0], // Current date as placeholder
      contact: {
        email: `${name.toLowerCase()}@example.gov`,
        phone: "+1234567890", // Placeholder
        office: "TBD"
      }
    };
    
    commands.push(`verus setidentitycontent "${name}@${country}@" '{"$PROFILE_KEY":${JSON.stringify(profileData)}}'`);
    commands.push(`# Wait for at least one confirmation before proceeding`);
    commands.push(``);
    
    // Step 4: Initialize empty data structures for transparency data
    commands.push(`# Step 4: Initialize empty data structures for transparency data`);
    const dataTypes = [
      "schedule", "vacation", "expenses", "daily_logs", "voting_records", "public_statements"
    ];
    
    for (const dataType of dataTypes) {
      commands.push(`# Initialize ${dataType} data`);
      commands.push(`${dataType.toUpperCase()}_KEY=$(verus calcvdxfkey "politician.${dataType}" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')`);
      
      // Create empty array for each data type
      commands.push(`verus setidentitycontentmultimap "${name}@${country}@" '{"$${dataType.toUpperCase()}_KEY":[]}'`);
    }
    
    return commands.join('\n');
  },
  
  // Generate a command to update politician data
  generateUpdateDataCommand: (politicianId, dataType, data, timestamp) => {
    const country = politicianId.split('@')[1];
    
    // Generate the VDXF key for the data type
    const keyVarName = `${dataType.toUpperCase()}_KEY`;
    
    // Parse the data to ensure it's valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      // If it's not valid JSON, assume it's already a string representation
      parsedData = data;
    }
    
    // Add timestamp if not present
    if (timestamp) {
      if (typeof parsedData === 'object') {
        parsedData.timestamp = timestamp;
      }
    } else {
      if (typeof parsedData === 'object') {
        parsedData.timestamp = new Date().toISOString();
      }
    }
    
    // Create the command to add the data to the contentmultimap
    const command = `
# Get the current ${dataType} data
CURRENT_DATA=$(verus getidentity "${politicianId}" | jq -r '.contentmultimap."$${keyVarName}" // []')

# Add the new data to the array
UPDATED_DATA=$(echo $CURRENT_DATA | jq '. += [${typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData)}]')

# Update the contentmultimap
verus setidentitycontentmultimap "${politicianId}" '{"$${keyVarName}":'"$UPDATED_DATA"'}'
`;
    
    return command;
  },
  
  // Generate a command to query politician data
  generateQueryCommand: (politicianId, dataType) => {
    if (dataType === "all") {
      return `verus getidentity "${politicianId}"`;
    } else {
      const country = politicianId.split('@')[1];
      const keyVarName = `${dataType.toUpperCase()}_KEY`;
      
      return `
# Get the ${dataType} VDXF key
${keyVarName}=$(verus calcvdxfkey "politician.${dataType}" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')

# Query the data
verus getidentity "${politicianId}" | jq '.contentmultimap."$'${keyVarName}'"'
`;
    }
  }
};
