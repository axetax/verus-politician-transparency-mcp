export const arweaveIntegration = {
  documentation: `# Arweave Integration

## Overview

Arweave provides permanent, decentralized storage for large data sets that would be impractical to store directly on the Verus blockchain. This module outlines how to integrate Arweave with VerusID and VDXF for efficient data management.

## Key Concepts

### 1. Data Storage Strategy

- **On-Chain Data**: Small, frequently accessed data stored directly in VerusID contentmap/contentmultimap
- **Off-Chain Data**: Large files, historical records, and evidence stored on Arweave
- **Hash References**: Arweave Transaction IDs (TXIDs) stored on-chain to reference off-chain data

### 2. Data Upload Process

1. Prepare data for Arweave storage
2. Upload data to Arweave network
3. Obtain Arweave TXID
4. Store TXID in VerusID contentmultimap
5. Verify successful storage

### 3. Data Retrieval Process

1. Retrieve TXID from VerusID contentmultimap
2. Fetch data from Arweave using TXID
3. Verify data integrity using cryptographic hashes
4. Process and display the retrieved data

### 4. Integrity Verification

- Use SHA-256 hashing to verify data integrity
- Compare original hash with hash of retrieved data
- Store verification metadata alongside Arweave TXIDs

## Implementation Considerations

1. **Data Chunking**: Break large datasets into manageable chunks
2. **Metadata Management**: Store descriptive metadata with each Arweave transaction
3. **Redundancy**: Implement fallback mechanisms for data retrieval
4. **Cost Management**: Optimize for Arweave storage costs

## Security Considerations

1. **Data Encryption**: Encrypt sensitive data before uploading to Arweave
2. **Access Control**: Implement access controls for sensitive data
3. **Hash Verification**: Always verify data integrity upon retrieval`,

  // Generate commands for uploading data to Arweave
  generateArweaveUploadCommands: (dataFile, walletFile, dataType, metadata) => {
    return `# Arweave Data Upload Process

## Step 1: Prepare your Arweave wallet and data
# Ensure you have an Arweave wallet JSON file (${walletFile})
# Prepare your data file (${dataFile})

## Step 2: Calculate data hash for integrity verification
DATA_HASH=$(sha256sum ${dataFile} | awk '{print $1}')
echo "Data hash: $DATA_HASH"

## Step 3: Prepare metadata
cat > metadata.json << EOF
{
  "Content-Type": "application/json",
  "data-type": "${dataType}",
  "original-hash": "$DATA_HASH",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  ${metadata ? `"custom-metadata": ${metadata},` : ''}
  "version": "1.0"
}
EOF

## Step 4: Upload data to Arweave
# Install arweave-js if not already installed
npm install arweave

# Create upload script
cat > upload-to-arweave.js << EOF
const Arweave = require('arweave');
const fs = require('fs');

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function uploadData() {
  try {
    // Load wallet
    const wallet = JSON.parse(fs.readFileSync('${walletFile}'));
    
    // Read data and metadata
    const data = fs.readFileSync('${dataFile}');
    const metadata = JSON.parse(fs.readFileSync('metadata.json'));
    
    // Create transaction
    const transaction = await arweave.createTransaction({ data: data }, wallet);
    
    // Add metadata tags
    Object.entries(metadata).forEach(([key, value]) => {
      transaction.addTag(key, value.toString());
    });
    
    // Sign transaction
    await arweave.transactions.sign(transaction, wallet);
    
    // Submit transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200 || response.status === 202) {
      console.log('Data uploaded successfully to Arweave');
      console.log('Transaction ID (TXID):', transaction.id);
      
      // Save TXID to file for later use
      fs.writeFileSync('arweave-txid.txt', transaction.id);
      
      // Create Verus command to store TXID
      const verusCommand = \`verus setidentitycontentmultimap "IDENTITY_NAME@" '{"VDXF_KEY":["arweave://${transaction.id}"]}';\`;
      fs.writeFileSync('verus-store-txid.sh', verusCommand);
      
      console.log('Verus command saved to verus-store-txid.sh');
      console.log('Replace IDENTITY_NAME and VDXF_KEY with your actual values');
    } else {
      console.error('Upload failed:', response);
    }
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
  }
}

uploadData();
EOF

## Step 5: Run the upload script
node upload-to-arweave.js

## Step 6: Store the Arweave TXID in Verus
# The TXID is saved in arweave-txid.txt
# Edit and run the generated verus-store-txid.sh script
ARWEAVE_TXID=$(cat arweave-txid.txt)
echo "Arweave TXID: $ARWEAVE_TXID"

# Replace placeholders in the Verus command
sed -i 's/IDENTITY_NAME/your-identity-name/g' verus-store-txid.sh
sed -i 's/VDXF_KEY/your-vdxf-key/g' verus-store-txid.sh

# Execute the Verus command
chmod +x verus-store-txid.sh
./verus-store-txid.sh`;
  },
  
  // Generate commands for retrieving data from Arweave
  generateArweaveRetrievalCommands: (identityName, vdxfKey) => {
    return `# Arweave Data Retrieval Process

## Step 1: Retrieve the Arweave TXID from Verus
# Get the TXID from the identity's contentmultimap
ARWEAVE_TXID=$(verus getidentity "${identityName}" | jq -r '.contentmultimap."${vdxfKey}"[0]' | sed 's|arweave://||')
echo "Arweave TXID: $ARWEAVE_TXID"

## Step 2: Create a script to retrieve and verify the data
cat > retrieve-from-arweave.js << EOF
const Arweave = require('arweave');
const fs = require('fs');
const crypto = require('crypto');

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function retrieveData() {
  try {
    const txid = process.argv[2];
    if (!txid) {
      console.error('Please provide an Arweave TXID as argument');
      process.exit(1);
    }
    
    // Get transaction data
    console.log('Retrieving data from Arweave...');
    const data = await arweave.transactions.getData(txid, {decode: true});
    
    // Get transaction tags (metadata)
    const transaction = await arweave.transactions.get(txid);
    const tags = {};
    transaction.get('tags').forEach(tag => {
      const key = tag.get('name', {decode: true, string: true});
      const value = tag.get('value', {decode: true, string: true});
      tags[key] = value;
    });
    
    // Save data to file
    const outputFile = \`arweave-data-\${txid}.json\`;
    fs.writeFileSync(outputFile, data);
    console.log(\`Data saved to \${outputFile}\`);
    
    // Verify data integrity
    const retrievedHash = crypto.createHash('sha256').update(data).digest('hex');
    const originalHash = tags['original-hash'];
    
    if (retrievedHash === originalHash) {
      console.log('Data integrity verified: Hash matches original');
    } else {
      console.error('Data integrity check failed: Hash mismatch');
      console.error('Original hash:', originalHash);
      console.error('Retrieved hash:', retrievedHash);
    }
    
    // Save metadata
    const metadataFile = \`arweave-metadata-\${txid}.json\`;
    fs.writeFileSync(metadataFile, JSON.stringify(tags, null, 2));
    console.log(\`Metadata saved to \${metadataFile}\`);
    
    console.log('Retrieval complete');
  } catch (error) {
    console.error('Error retrieving from Arweave:', error);
  }
}

retrieveData();
EOF

## Step 3: Run the retrieval script
node retrieve-from-arweave.js $ARWEAVE_TXID

## Step 4: Process the retrieved data
echo "Data retrieved and saved to arweave-data-$ARWEAVE_TXID.json"
echo "Metadata saved to arweave-metadata-$ARWEAVE_TXID.json"`;
  },
  
  // Generate commands for verifying data integrity
  generateIntegrityVerificationCommands: (dataFile, txid) => {
    return `# Data Integrity Verification Process

## Step 1: Calculate hash of local data file
LOCAL_HASH=$(sha256sum ${dataFile} | awk '{print $1}')
echo "Local data hash: $LOCAL_HASH"

## Step 2: Retrieve original hash from Arweave metadata
# Create a script to get the metadata
cat > get-arweave-metadata.js << EOF
const Arweave = require('arweave');

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function getMetadata() {
  try {
    const txid = process.argv[2];
    if (!txid) {
      console.error('Please provide an Arweave TXID as argument');
      process.exit(1);
    }
    
    // Get transaction tags (metadata)
    const transaction = await arweave.transactions.get(txid);
    const tags = {};
    transaction.get('tags').forEach(tag => {
      const key = tag.get('name', {decode: true, string: true});
      const value = tag.get('value', {decode: true, string: true});
      tags[key] = value;
    });
    
    console.log(JSON.stringify(tags, null, 2));
  } catch (error) {
    console.error('Error retrieving metadata:', error);
  }
}

getMetadata();
EOF

# Run the script to get metadata
node get-arweave-metadata.js ${txid} > arweave-metadata.json

# Extract the original hash
ORIGINAL_HASH=$(cat arweave-metadata.json | jq -r '.["original-hash"]')
echo "Original hash from Arweave: $ORIGINAL_HASH"

## Step 3: Compare hashes
if [ "$LOCAL_HASH" = "$ORIGINAL_HASH" ]; then
  echo "✅ Integrity verification successful: Hashes match"
else
  echo "❌ Integrity verification failed: Hash mismatch"
  echo "This indicates the data may have been corrupted or tampered with"
fi`;
  }
};
