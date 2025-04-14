# VerusID and VDXF Implementation MCP Server

This MCP (Model Context Protocol) server provides a comprehensive guide and tools for implementing VerusID and VDXF on a private Verus testnet, including a Politician Digital ID Module for political transparency.

## Features

- **Private Testnet Setup**: Commands and guidance for setting up a Verus testnet environment
- **Identity Management**: Tools for creating and managing VerusIDs with multi-signature capabilities
- **VDXF Implementation**: Utilities for working with the Verus Data Exchange Format
- **Politician Digital ID Module**: A practical application of VerusID and VDXF for political transparency

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run the server:
   ```
   npm run dev
   ```

3. Test with MCP Inspector:
   ```
   npm run inspect
   ```

## Available Tools

### Testnet Setup
- `setup_testnet`: Generate commands to set up a private Verus testnet

### Identity Management
- `generate_name_commitment`: Create a name commitment for a VerusID
- `register_identity`: Register a VerusID on the blockchain
- `update_identity`: Update an existing VerusID

### VDXF Implementation
- `create_vdxf_key`: Generate a VDXF key from a human-readable name
- `store_identity_data`: Store data in a VerusID using VDXF

### Politician Digital ID Module
- `setup_politician_module`: Set up the Politician Digital ID Module
- `create_politician_profile`: Create a politician profile
- `update_politician_data`: Update politician transparency data
- `query_politician_data`: Query politician transparency data

## Documentation Resources

Access documentation through the `verus://docs/{section}` resource, where `{section}` can be:
- `overview`: General overview of the implementation
- `testnet-setup`: Setting up a private Verus testnet
- `identity-management`: Managing VerusIDs
- `vdxf-implementation`: Working with VDXF
- `politician-module`: Implementing the Politician Digital ID Module

## References

- [VerusID Documentation](https://monkins1010.github.io/verusid/)
- [VerusID Features](https://docs.verus.io/verusid/#feature-list)
- [VDXF Specification](https://monkins1010.github.io/verusvdxf/getting-started-copy/)
- [VerusID Login](https://monkins1010.github.io/veruslogin/)
- [Private Testnet Setup](https://monkins1010.github.io/verustestnet/getting-started/)
