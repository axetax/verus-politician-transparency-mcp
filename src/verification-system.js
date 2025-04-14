export const verificationSystem = {
  documentation: `# Verification System

## Overview

The Verification System is a critical component of the Politician Digital ID Module that ensures data integrity and trustworthiness. It implements a multi-signature approval process for all data updates, with different verification levels based on the source and evidence provided.

## Verification Levels

1. **Unverified**: Data has been submitted but not yet reviewed
2. **Partially Verified**: Data has been reviewed by some but not all required verifiers
3. **Verified**: Data has been fully verified by the required number of authorized verifiers

## Verification Workflow

1. **Submission**: Data is submitted with supporting evidence
2. **Queue**: Submission enters the verification queue
3. **Review**: Authorized verifiers review the submission and evidence
4. **Approval/Rejection**: Verifiers approve or reject the submission
5. **Consensus**: When sufficient approvals are reached, the data is marked as verified
6. **Publication**: Verified data is published to the blockchain

## Implementation Components

1. **Verification Queue**: Manages pending submissions
2. **Evidence Storage**: Maintains links to supporting documentation
3. **Approval Tracking**: Records verifier decisions
4. **Notification System**: Alerts verifiers of pending submissions
5. **Audit Trail**: Maintains a record of the verification process

## Security Considerations

1. **Verifier Authentication**: Ensures only authorized individuals can verify data
2. **Evidence Validation**: Checks that evidence is authentic and relevant
3. **Conflict Resolution**: Handles disagreements between verifiers
4. **Revocation Process**: Allows removal of incorrectly verified data

## Integration Points

1. **Blockchain Updates**: Publishes verified data to the blockchain
2. **Frontend Interface**: Provides verification dashboard for authorized users
3. **API Access**: Allows programmatic access to verification status`,

  // Generate a command to submit data for verification
  generateSubmissionCommand: (politicianId, dataType, data, evidence, submitter) => {
    const country = politicianId.split('@')[1];
    
    // Create a verification request object
    const verificationRequest = {
      data_type: dataType,
      data: data,
      evidence: evidence,
      submitter: submitter,
      timestamp: new Date().toISOString(),
      status: "unverified",
      approvals: [],
      rejections: []
    };
    
    // Generate the command to add the verification request to the queue
    const command = `
# Get the verification queue VDXF key
VERIFICATION_QUEUE_KEY=$(verus calcvdxfkey "system.verification.queue" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')

# Get the current verification queue
CURRENT_QUEUE=$(verus getidentity "${country}@" | jq -r '.contentmultimap."$VERIFICATION_QUEUE_KEY" // []')

# Add the new verification request to the queue
UPDATED_QUEUE=$(echo $CURRENT_QUEUE | jq '. += [${JSON.stringify(JSON.stringify(verificationRequest))}]')

# Update the verification queue
verus setidentitycontentmultimap "${country}@" '{"$VERIFICATION_QUEUE_KEY":'"$UPDATED_QUEUE"'}'
`;
    
    return command;
  },
  
  // Generate a command to approve or reject a verification request
  generateVerificationCommand: (country, requestIndex, verifier, approve, comments) => {
    const action = approve ? "approve" : "reject";
    
    // Create the verification decision object
    const decision = {
      verifier: verifier,
      timestamp: new Date().toISOString(),
      action: action,
      comments: comments
    };
    
    // Generate the command to update the verification request
    const command = `
# Get the verification queue VDXF key
VERIFICATION_QUEUE_KEY=$(verus calcvdxfkey "system.verification.queue" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')

# Get the current verification queue
CURRENT_QUEUE=$(verus getidentity "${country}@" | jq -r '.contentmultimap."$VERIFICATION_QUEUE_KEY"')

# Get the verification request
REQUEST=$(echo $CURRENT_QUEUE | jq '.[${requestIndex}]')

# Parse the request (it's stored as a JSON string within JSON)
PARSED_REQUEST=$(echo $REQUEST | jq -r '.')

# Add the decision to the appropriate array
UPDATED_REQUEST=$(echo $PARSED_REQUEST | jq '.${approve ? "approvals" : "rejections"} += [${JSON.stringify(decision)}]')

# Update the status if necessary
REQUIRED_APPROVALS=$(verus getidentity "${country}@" | jq -r '.contentmap."$VERIFICATION_CONFIG_KEY".required_signatures')
APPROVAL_COUNT=$(echo $UPDATED_REQUEST | jq '.approvals | length')

if [ $APPROVAL_COUNT -ge $REQUIRED_APPROVALS ]; then
  UPDATED_REQUEST=$(echo $UPDATED_REQUEST | jq '.status = "verified"')
elif [ $APPROVAL_COUNT -gt 0 ]; then
  UPDATED_REQUEST=$(echo $UPDATED_REQUEST | jq '.status = "partially_verified"')
fi

# Update the queue
UPDATED_QUEUE=$(echo $CURRENT_QUEUE | jq '.[${requestIndex}] = "${UPDATED_REQUEST}"')

# Update the verification queue
verus setidentitycontentmultimap "${country}@" '{"$VERIFICATION_QUEUE_KEY":'"$UPDATED_QUEUE"'}'

# If fully verified, update the politician's data
if [ $APPROVAL_COUNT -ge $REQUIRED_APPROVALS ]; then
  DATA_TYPE=$(echo $UPDATED_REQUEST | jq -r '.data_type')
  DATA=$(echo $UPDATED_REQUEST | jq -r '.data')
  POLITICIAN_ID=$(echo $UPDATED_REQUEST | jq -r '.politician_id')
  
  ${dataType.toUpperCase()}_KEY=$(verus calcvdxfkey "politician.$DATA_TYPE" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')
  
  # Get current data
  CURRENT_DATA=$(verus getidentity "$POLITICIAN_ID" | jq -r '.contentmultimap."$${dataType.toUpperCase()}_KEY" // []')
  
  # Add verified data
  VERIFIED_DATA=$(echo $DATA | jq '. += {"verification": {"status": "verified", "timestamp": "${new Date().toISOString()}", "verifiers": '"$APPROVAL_COUNT"'}}')
  UPDATED_DATA=$(echo $CURRENT_DATA | jq '. += [$VERIFIED_DATA]')
  
  # Update politician's data
  verus setidentitycontentmultimap "$POLITICIAN_ID" '{"$${dataType.toUpperCase()}_KEY":'"$UPDATED_DATA"'}'
fi
`;
    
    return command;
  },
  
  // Generate a command to get the verification queue
  generateGetQueueCommand: (country, status) => {
    let statusFilter = '';
    if (status) {
      statusFilter = ` | map(select(.status == "${status}"))`;
    }
    
    return `
# Get the verification queue VDXF key
VERIFICATION_QUEUE_KEY=$(verus calcvdxfkey "system.verification.queue" "vdxf.${country.toLowerCase()}" "1.0" | jq -r '.vdxfkey')

# Get the verification queue
verus getidentity "${country}@" | jq '.contentmultimap."$VERIFICATION_QUEUE_KEY" | map(fromjson)${statusFilter}'
`;
  }
};
