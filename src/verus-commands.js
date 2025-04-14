export const verusCommands = {
  documentation: `# VerusID Management

## Overview

VerusID is a blockchain-based identity system that provides self-sovereign identity capabilities. This guide covers the complete lifecycle of a VerusID, from initial name commitment to advanced multi-signature configurations.

## Identity Lifecycle

### 1. Name Commitment

Before registering an identity, you must first commit to the name. This prevents front-running attacks where someone could see your intended name and register it before you.

\`\`\`bash
verus namecommitment "myidentity" "" "" 0.0001
\`\`\`

### 2. Identity Registration

Once your name commitment is confirmed, you can register the identity:

\`\`\`bash
verus registeridentity "myidentity" '{"primaryaddresses":["RYourVerusAddress"],"minimumsignatures":1,"revocationauthority":"RYourVerusAddress","recoveryauthority":"RYourVerusAddress"}' "" "" "namecommitmenttxid"
\`\`\`

### 3. Multi-Signature Configuration

For enhanced security, configure your identity with multiple primary addresses:

\`\`\`bash
verus registeridentity "myidentity" '{"primaryaddresses":["RAddress1","RAddress2","RAddress3"],"minimumsignatures":2,"revocationauthority":"RAddress1","recoveryauthority":"RAddress1"}' "" "" "namecommitmenttxid"
\`\`\`

### 4. Identity Updates

Modify your identity attributes after registration:

\`\`\`bash
verus updateidentity "myidentity@" '{"primaryaddresses":["RNewAddress1","RNewAddress2"],"minimumsignatures":2}'
\`\`\`

## Data Storage

### Using contentmap

Store single values in your identity:

\`\`\`bash
verus setidentitycontent "myidentity@" '{"vdxf.key.hash":"value"}'
\`\`\`

### Using contentmultimap

Store collections of data:

\`\`\`bash
verus setidentitycontentmultimap "myidentity@" '{"vdxf.key.hash":["value1","value2","value3"]}'
\`\`\`

## Identity Queries

Retrieve identity information:

\`\`\`bash
verus getidentity "myidentity@"
\`\`\`

## Security Considerations

- Always back up your private keys
- For multi-signature identities, ensure key holders are reliable
- Consider using different devices for different keys
- Test recovery procedures before relying on them

## Best Practices

- Use descriptive identity names
- Implement appropriate security based on the identity's importance
- Regularly review and update identity configurations
- Document your identity structure and recovery procedures`,

  generateNameCommitmentCommand: (identityName, parentNamespace, referralIdentity) => {
    let command = `verus namecommitment "${identityName}"`;
    
    // Add parent namespace if provided
    if (parentNamespace) {
      command += ` "${parentNamespace}@"`;
    } else {
      command += ` ""`;
    }
    
    // Add referral identity if provided
    if (referralIdentity) {
      command += ` "${referralIdentity}"`;
    } else {
      command += ` ""`;
    }
    
    // Add fee
    command += ` 0.0001`;
    
    return command;
  },
  
  generateRegisterIdentityCommand: (identityName, parentNamespace, primaryAddresses, recoveryAddresses, revocationAuthority, referralIdentity, commitmentTxid, minSignatures) => {
    // Create the identity control parameters
    const controlParams = {
      primaryaddresses: primaryAddresses,
      minimumsignatures: minSignatures || 1,
      recoveryauthority: recoveryAddresses[0]
    };
    
    // Add revocation authority if provided
    if (revocationAuthority) {
      controlParams.revocationauthority = revocationAuthority;
    }
    
    // Build the command
    let command = `verus registeridentity "${identityName}"`;
    
    // Add control parameters
    command += ` '${JSON.stringify(controlParams)}'`;
    
    // Add parent namespace if provided
    if (parentNamespace) {
      command += ` "${parentNamespace}@"`;
    } else {
      command += ` ""`;
    }
    
    // Add referral identity if provided
    if (referralIdentity) {
      command += ` "${referralIdentity}"`;
    } else {
      command += ` ""`;
    }
    
    // Add commitment txid
    command += ` "${commitmentTxid}"`;
    
    return command;
  },
  
  generateUpdateIdentityCommand: (identityName, primaryAddresses, recoveryAddresses, revocationAuthority, minSignatures) => {
    // Create the update parameters
    const updateParams = {};
    
    // Add parameters that are being updated
    if (primaryAddresses) {
      updateParams.primaryaddresses = primaryAddresses;
    }
    
    if (minSignatures) {
      updateParams.minimumsignatures = minSignatures;
    }
    
    if (recoveryAddresses) {
      updateParams.recoveryauthority = recoveryAddresses[0];
    }
    
    if (revocationAuthority) {
      updateParams.revocationauthority = revocationAuthority;
    }
    
    // Build the command
    let command = `verus updateidentity "${identityName}" '${JSON.stringify(updateParams)}'`;
    
    return command;
  }
};
