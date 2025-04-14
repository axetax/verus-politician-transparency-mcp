export const testnetSetup = {
  documentation: `# Private Verus Testnet Setup

## Overview

Setting up a private Verus testnet is the first step in implementing VerusID and VDXF. This environment provides a safe, controlled space for development and testing without using real cryptocurrency.

## Prerequisites

- Linux or macOS environment (Windows with WSL also works)
- Git
- Build tools (gcc, g++, make)
- Boost libraries
- Berkeley DB 4.8
- At least 4GB RAM and 20GB disk space

## Setup Process

1. **Clone the Verus repository**:
   \`\`\`bash
   git clone https://github.com/VerusCoin/VerusCoin.git
   cd VerusCoin
   \`\`\`

2. **Build Verus**:
   \`\`\`bash
   ./zcutil/build.sh -j$(nproc)
   \`\`\`

3. **Create testnet directories**:
   \`\`\`bash
   mkdir -p ~/verus-testnet/node1
   mkdir -p ~/verus-testnet/node2
   \`\`\`

4. **Create configuration files**:
   For each node, create a verus.conf file with testnet settings.

5. **Initialize the testnet**:
   Start the first node with mining enabled to generate the initial blocks.

6. **Connect additional nodes**:
   Start additional nodes and connect them to the first node.

7. **Generate test coins**:
   Mine blocks to generate test coins for transactions.

## Detailed Commands

See the \`setup_testnet\` tool for specific commands based on your environment.

## Verification

To verify your testnet is working correctly:

1. Check that blocks are being generated
2. Verify that nodes are connected
3. Confirm that you can send test coins between addresses
4. Validate that you can create and manage identities

## References

- [Official Verus Testnet Guide](https://monkins1010.github.io/verustestnet/getting-started/)
- [Verus Build Instructions](https://github.com/VerusCoin/VerusCoin/blob/master/doc/build-unix.md)`,

  generateSetupCommands: (dataDir, nodes) => {
    const commands = [];
    
    // Clone and build Verus
    commands.push(`# Clone and build Verus`);
    commands.push(`git clone https://github.com/VerusCoin/VerusCoin.git`);
    commands.push(`cd VerusCoin`);
    commands.push(`./zcutil/build.sh -j$(nproc)`);
    commands.push(``);
    
    // Create directories
    commands.push(`# Create testnet directories`);
    commands.push(`mkdir -p ${dataDir}`);
    
    for (let i = 1; i <= nodes; i++) {
      commands.push(`mkdir -p ${dataDir}/node${i}`);
    }
    commands.push(``);
    
    // Create configuration files
    commands.push(`# Create configuration files`);
    for (let i = 1; i <= nodes; i++) {
      const rpcPort = 27485 + i;
      const p2pPort = 27485 + 100 + i;
      
      commands.push(`cat > ${dataDir}/node${i}/verus.conf << EOF`);
      commands.push(`testnet=1`);
      commands.push(`rpcuser=user${i}`);
      commands.push(`rpcpassword=pass${i}`);
      commands.push(`rpcport=${rpcPort}`);
      commands.push(`port=${p2pPort}`);
      commands.push(`rpcallowip=127.0.0.1`);
      commands.push(`server=1`);
      commands.push(`daemon=1`);
      commands.push(`txindex=1`);
      commands.push(`addnode=127.0.0.1:${nodes > 1 ? 27486 + 100 : p2pPort}`);
      commands.push(`EOF`);
    }
    commands.push(``);
    
    // Start nodes
    commands.push(`# Start nodes`);
    for (let i = 1; i <= nodes; i++) {
      commands.push(`cd VerusCoin`);
      commands.push(`./src/verusd -datadir=${dataDir}/node${i}`);
    }
    commands.push(``);
    
    // Generate initial blocks on first node
    commands.push(`# Generate initial blocks on first node`);
    commands.push(`cd VerusCoin`);
    commands.push(`./src/verus -datadir=${dataDir}/node1 setgenerate true 1`);
    commands.push(`# Wait for 100 blocks to be mined`);
    commands.push(`./src/verus -datadir=${dataDir}/node1 setgenerate false`);
    commands.push(``);
    
    // Create wallet addresses
    commands.push(`# Create wallet addresses`);
    commands.push(`cd VerusCoin`);
    commands.push(`ADDR1=$(./src/verus -datadir=${dataDir}/node1 getnewaddress)`);
    if (nodes > 1) {
      commands.push(`ADDR2=$(./src/verus -datadir=${dataDir}/node2 getnewaddress)`);
      commands.push(`# Send some coins to second node`);
      commands.push(`./src/verus -datadir=${dataDir}/node1 sendtoaddress $ADDR2 1000`);
    }
    
    return commands.join('\n');
  }
};
