import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { verusCommands } from './verus-commands.js';
import { vdxfImplementation } from './vdxf-implementation.js';
import { politicianModule } from './politician-module.js';
import { testnetSetup } from './testnet-setup.js';

// Create an MCP server for VerusID and VDXF implementation
const server = new McpServer({
  name: "VerusID and VDXF Implementation",
  version: "1.0.0",
  description: "A comprehensive guide to VerusID and VDXF implementation on a private Verus testnet"
});

// Add resources for documentation
server.resource(
  "documentation",
  new ResourceTemplate("verus://docs/{section}", { list: undefined }),
  async (uri, { section }) => {
    const docs = {
      "overview": `# VerusID and VDXF Implementation Guide

This guide provides comprehensive instructions for implementing VerusID and VDXF on a private Verus testnet.

## Key Components

1. **Environment Setup**: Setting up a private Verus testnet
2. **Identity Management**: Creating and managing VerusIDs
3. **VDXF Implementation**: Working with the Verus Data Exchange Format
4. **Politician Digital ID Module**: A practical application of VerusID and VDXF

## References

- [VerusID Documentation](https://monkins1010.github.io/verusid/)
- [VDXF Specification](https://monkins1010.github.io/verusvdxf/getting-started-copy/)
- [Private Testnet Setup](https://monkins1010.github.io/verustestnet/getting-started/)`,

      "testnet-setup": testnetSetup.documentation,
      "identity-management": verusCommands.documentation,
      "vdxf-implementation": vdxfImplementation.documentation,
      "politician-module": politicianModule.documentation
    };

    if (!docs[section]) {
      return {
        contents: [{
          uri: uri.href,
          text: `Documentation section "${section}" not found. Available sections: ${Object.keys(docs).join(', ')}`
        }]
      };
    }

    return {
      contents: [{
        uri: uri.href,
        text: docs[section]
      }]
    };
  }
);

// Add tools for testnet setup
server.tool(
  "setup_testnet",
  {
    dataDir: z.string().describe("Directory to store Verus testnet data"),
    nodes: z.number().min(1).max(10).default(2).describe("Number of nodes to create in the testnet")
  },
  async ({ dataDir, nodes }) => {
    const setupCommands = testnetSetup.generateSetupCommands(dataDir, nodes);
    
    return {
      content: [{ 
        type: "text", 
        text: `# Private Verus Testnet Setup Commands

The following commands will set up a private Verus testnet with ${nodes} nodes in the directory "${dataDir}":

\`\`\`bash
${setupCommands}
\`\`\`

Execute these commands in sequence to establish your testnet environment.`
      }]
    };
  },
  { description: "Generate commands to set up a private Verus testnet" }
);

// Add tools for identity management
server.tool(
  "generate_name_commitment",
  {
    identityName: z.string().describe("Desired identity name (without the @ symbol)"),
    parentNamespace: z.string().optional().describe("Optional parent namespace"),
    referralIdentity: z.string().optional().describe("Optional referral identity")
  },
  async ({ identityName, parentNamespace, referralIdentity }) => {
    const command = verusCommands.generateNameCommitmentCommand(identityName, parentNamespace, referralIdentity);
    
    return {
      content: [{ 
        type: "text", 
        text: `# Name Commitment Command

\`\`\`bash
${command}
\`\`\`

This command will create a name commitment for "${identityName}${parentNamespace ? '@' + parentNamespace : ''}@" on the blockchain.

## Next Steps

1. Execute this command in your Verus CLI
2. Wait for at least one confirmation
3. Note the transaction ID returned by the command
4. Use the transaction ID when registering your identity`
      }]
    };
  },
  { description: "Generate a command to create a name commitment for a VerusID" }
);

server.tool(
  "register_identity",
  {
    identityName: z.string().describe("Identity name (without the @ symbol)"),
    parentNamespace: z.string().optional().describe("Optional parent namespace"),
    primaryAddresses: z.array(z.string()).min(1).describe("List of primary addresses"),
    recoveryAddresses: z.array(z.string()).min(1).describe("List of recovery addresses"),
    revocationAuthority: z.string().optional().describe("Optional revocation authority"),
    referralIdentity: z.string().optional().describe("Optional referral identity"),
    commitmentTxid: z.string().describe("Transaction ID of the name commitment"),
    minSignatures: z.number().optional().describe("Minimum signatures required (for multi-sig)")
  },
  async ({ identityName, parentNamespace, primaryAddresses, recoveryAddresses, revocationAuthority, referralIdentity, commitmentTxid, minSignatures }) => {
    const command = verusCommands.generateRegisterIdentityCommand(
      identityName, 
      parentNamespace, 
      primaryAddresses, 
      recoveryAddresses, 
      revocationAuthority, 
      referralIdentity, 
      commitmentTxid, 
      minSignatures
    );
    
    return {
      content: [{ 
        type: "text", 
        text: `# Identity Registration Command

\`\`\`bash
${command}
\`\`\`

This command will register the identity "${identityName}${parentNamespace ? '@' + parentNamespace : ''}@" on the blockchain.

${minSignatures ? `This is configured as a multi-signature identity requiring at least ${minSignatures} signatures from the primary addresses.` : ''}

## Next Steps

1. Execute this command in your Verus CLI
2. Wait for at least one confirmation
3. Verify your identity with \`verus getidentity "${identityName}${parentNamespace ? '@' + parentNamespace : ''}@"\``
      }]
    };
  },
  { description: "Generate a command to register a VerusID" }
);

server.tool(
  "update_identity",
  {
    identityName: z.string().describe("Identity name (with the @ symbol)"),
    primaryAddresses: z.array(z.string()).optional().describe("Updated list of primary addresses"),
    recoveryAddresses: z.array(z.string()).optional().describe("Updated list of recovery addresses"),
    revocationAuthority: z.string().optional().describe("Updated revocation authority"),
    minSignatures: z.number().optional().describe("Updated minimum signatures required")
  },
  async ({ identityName, primaryAddresses, recoveryAddresses, revocationAuthority, minSignatures }) => {
    const command = verusCommands.generateUpdateIdentityCommand(
      identityName, 
      primaryAddresses, 
      recoveryAddresses, 
      revocationAuthority, 
      minSignatures
    );
    
    return {
      content: [{ 
        type: "text", 
        text: `# Identity Update Command

\`\`\`bash
${command}
\`\`\`

This command will update the identity "${identityName}" on the blockchain.

## Next Steps

1. Execute this command in your Verus CLI
2. Wait for at least one confirmation
3. Verify your identity updates with \`verus getidentity "${identityName}"\``
      }]
    };
  },
  { description: "Generate a command to update a VerusID" }
);

// Add tools for VDXF implementation
server.tool(
  "create_vdxf_key",
  {
    keyName: z.string().describe("Human-readable key name"),
    namespace: z.string().optional().describe("Optional namespace for the key"),
    version: z.string().optional().default("1.0").describe("Version of the key")
  },
  async ({ keyName, namespace, version }) => {
    const result = vdxfImplementation.generateVDXFKey(keyName, namespace, version);
    
    return {
      content: [{ 
        type: "text", 
        text: `# VDXF Key Generation

Human-readable key: ${result.humanReadableKey}
VDXF hash key: ${result.hashKey}

## Usage in Verus Commands

You can use this key in content mapping operations:

\`\`\`bash
verus setidentitycontent "${result.identityExample}" '{"${result.hashKey}":"Your data here"}'
\`\`\`

## Key Structure

- Base key: ${keyName}
- Namespace: ${namespace || "none"}
- Version: ${version}
- Full qualified name: ${result.humanReadableKey}`
      }]
    };
  },
  { description: "Generate a VDXF key from a human-readable name" }
);

server.tool(
  "store_identity_data",
  {
    identityName: z.string().describe("Identity name (with the @ symbol)"),
    keyName: z.string().describe("VDXF key name"),
    namespace: z.string().optional().describe("Optional namespace for the key"),
    version: z.string().optional().default("1.0").describe("Version of the key"),
    data: z.string().describe("Data to store (JSON string)"),
    isMultiMap: z.boolean().default(false).describe("Whether to use contentmultimap instead of contentmap")
  },
  async ({ identityName, keyName, namespace, version, data, isMultiMap }) => {
    const command = vdxfImplementation.generateStoreDataCommand(
      identityName, 
      keyName, 
      namespace, 
      version, 
      data, 
      isMultiMap
    );
    
    return {
      content: [{ 
        type: "text", 
        text: `# Store Data in Identity Command

\`\`\`bash
${command}
\`\`\`

This command will store data in the identity "${identityName}" using the VDXF key "${keyName}".

${isMultiMap ? "This uses contentmultimap which is suitable for collections of data." : "This uses contentmap which is suitable for single values."}

## Next Steps

1. Execute this command in your Verus CLI
2. Wait for at least one confirmation
3. Verify your data with \`verus getidentity "${identityName}"\``
      }]
    };
  },
  { description: "Generate a command to store data in a VerusID" }
);

// Add tools for Politician Digital ID Module
server.tool(
  "setup_politician_module",
  {
    country: z.enum(["Canada", "America"]).describe("Country for the politician module"),
    adminAddresses: z.array(z.string()).min(3).describe("Admin addresses for multi-signature control"),
    minSignatures: z.number().min(2).default(2).describe("Minimum signatures required for updates")
  },
  async ({ country, adminAddresses, minSignatures }) => {
    const setupCommands = politicianModule.generateSetupCommands(country, adminAddresses, minSignatures);
    
    return {
      content: [{ 
        type: "text", 
        text: `# Politician Digital ID Module Setup

The following commands will set up the ${country} Politician Digital ID Module with multi-signature control:

\`\`\`bash
${setupCommands}
\`\`\`

This setup creates:
1. A root identity "${country}@" with multi-signature security (${minSignatures}-of-${adminAddresses.length})
2. The necessary VDXF key structures for politician data
3. Initial configuration for the verification system

## Next Steps

1. Execute these commands in sequence
2. Wait for confirmations between commands
3. Proceed to creating politician sub-identities`
      }]
    };
  },
  { description: "Generate commands to set up the Politician Digital ID Module" }
);

server.tool(
  "create_politician_profile",
  {
    country: z.enum(["Canada", "America"]).describe("Country namespace"),
    name: z.string().describe("Politician name (without the @ symbol)"),
    position: z.string().describe("Political position/title"),
    party: z.string().describe("Political party affiliation"),
    region: z.string().describe("Region/district represented"),
    primaryAddresses: z.array(z.string()).min(1).describe("Primary addresses for the politician"),
    adminAddresses: z.array(z.string()).min(1).describe("Admin addresses for verification")
  },
  async ({ country, name, position, party, region, primaryAddresses, adminAddresses }) => {
    const commands = politicianModule.generatePoliticianProfileCommands(
      country, 
      name, 
      position, 
      party, 
      region, 
      primaryAddresses, 
      adminAddresses
    );
    
    return {
      content: [{ 
        type: "text", 
        text: `# Create Politician Profile

The following commands will create a profile for ${name} in the ${country} namespace:

\`\`\`bash
${commands}
\`\`\`

This creates:
1. A name commitment for "${name}@${country}@"
2. The politician identity with appropriate controls
3. Basic profile information using VDXF data structures
4. Initial empty records for transparency data

## Next Steps

1. Execute these commands in sequence
2. Wait for confirmations between commands
3. Use the update tools to add specific transparency data`
      }]
    };
  },
  { description: "Generate commands to create a politician profile" }
);

server.tool(
  "update_politician_data",
  {
    politicianId: z.string().describe("Politician ID (format: name@country@)"),
    dataType: z.enum(["schedule", "vacation", "expenses", "daily_logs", "voting_records", "public_statements"]).describe("Type of data to update"),
    data: z.string().describe("Data to store (JSON string)"),
    timestamp: z.string().optional().describe("Optional timestamp (defaults to current time)")
  },
  async ({ politicianId, dataType, data, timestamp }) => {
    const command = politicianModule.generateUpdateDataCommand(politicianId, dataType, data, timestamp);
    
    return {
      content: [{ 
        type: "text", 
        text: `# Update Politician Data

\`\`\`bash
${command}
\`\`\`

This command will update the "${dataType}" data for politician "${politicianId}".

## Data Structure

The data follows the VDXF specification for the "${dataType}" data type:

\`\`\`json
${data}
\`\`\`

## Next Steps

1. Execute this command in your Verus CLI
2. Wait for at least one confirmation
3. Verify the update with the appropriate query command`
      }]
    };
  },
  { description: "Generate a command to update politician transparency data" }
);

server.tool(
  "query_politician_data",
  {
    politicianId: z.string().describe("Politician ID (format: name@country@)"),
    dataType: z.enum(["all", "schedule", "vacation", "expenses", "daily_logs", "voting_records", "public_statements"]).describe("Type of data to query")
  },
  async ({ politicianId, dataType }) => {
    const command = politicianModule.generateQueryCommand(politicianId, dataType);
    
    return {
      content: [{ 
        type: "text", 
        text: `# Query Politician Data

\`\`\`bash
${command}
\`\`\`

This command will retrieve the ${dataType === "all" ? "complete profile and transparency data" : `"${dataType}" data`} for politician "${politicianId}".

## Response Format

The command will return a JSON object containing the requested data structured according to the VDXF specification.

## Data Processing

You can process the output with jq for better readability:

\`\`\`bash
${command} | jq
\`\`\``
      }]
    };
  },
  { description: "Generate a command to query politician transparency data" }
);

export { server };
