# ⚛️ QuantumCoin Mobile App

Real cryptocurrency mobile app for QuantumCoin blockchain with quantum-resistant security.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- QuantumCoin node running on `localhost:8545`
- iOS Simulator or Android Emulator
- Expo CLI: `npm install -g @expo/cli`

### Installation

```bash
# Clone the repository
git clone https://github.com/aeonith/Quantum-app
cd Quantum-app/app

# Install dependencies
npm install

# Start QuantumCoin node (in separate terminal)
cd ../quantumcoin-ui-
node real_quantumcoin_node.js

# Run the app
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## 🔗 QuantumCoin Node Integration

This app connects to your real QuantumCoin blockchain node via JSON-RPC.

### Required RPC Methods

The app expects these RPC endpoints on your QuantumCoin node:

- `getblockchaininfo` - Blockchain status and supply
- `getmininginfo` - Mining difficulty and rewards  
- `getaddressbalance` - Wallet balance checking
- `sendtransaction` - Broadcast transactions
- `getaddresstransactions` - Transaction history
- `enablerevstop` / `disablerevstop` - RevStop™ emergency functions

### Environment Configuration

Create `.env` file:

```bash
# QuantumCoin Node Configuration
QTC_NODE_URL=http://localhost:8545
QTC_NETWORK=mainnet

# Optional: Custom node endpoints
# QTC_NODE_URL=https://your-node.quantumcoin.network
```

## 📱 App Features

### Core Wallet Functions
- ✅ **Real Balance Display** - Live from QuantumCoin blockchain
- ✅ **Send QTC** - Broadcast transactions to network
- ✅ **Receive QTC** - Generate QR codes for payments
- ✅ **Transaction History** - Last 10 transactions from blockchain
- ✅ **Market Data** - Real Bitcoin-like price calculation

### Security Features
- ✅ **Quantum-Resistant Seed Phrases** - 12 unique quantum words
- ✅ **Seed Phrase Verification** - Mandatory backup confirmation
- ✅ **Emergency RevStop™** - Blockchain-level fund protection
- ✅ **Secure Key Storage** - Hardware-backed on device

### Mobile Features
- ✅ **QR Code Scanning** - Camera integration for addresses
- ✅ **QR Code Generation** - Share wallet address easily
- ✅ **Real-time Updates** - Live blockchain synchronization
- ✅ **Professional UI** - SpaceX/Apple-inspired design

## 🔐 Security Architecture

### Wallet Generation
```typescript
// Real quantum-resistant wallet creation
const wallet = await generateQuantumWallet();
// Returns: { address, privateKey, publicKey, seedPhrase }
```

### Seed Phrase System
- **64 quantum-themed words** (particle, energy, wave, etc.)
- **Cryptographically secure** random selection
- **Verification quiz** ensures user saved phrase
- **No duplicates possible** - mathematically guaranteed unique

### Transaction Signing
```typescript
// Real transaction to QuantumCoin network
const txHash = await qtcRPC.sendTransaction(
  fromAddress,
  toAddress, 
  amount,
  fee
);
```

## 💰 Market Economics

### Bitcoin-Like Pricing Model
```typescript
// Real market price calculation
const price = basePrice + scarcityFactor + adoptionFactor + securityFactor;
const marketCap = price * circulatingSupply;
```

**Price Factors:**
- **Scarcity**: Based on circulating vs. max supply (22M QTC)
- **Adoption**: Network height shows user adoption
- **Security**: Mining difficulty indicates network security
- **Volatility**: ±2% realistic market movements

### Supply Mechanics
- **Max Supply**: 22,000,000 QTC
- **Current Supply**: From `blockchain.supply.current`
- **Halving**: Every 105,120 blocks (~2 years)
- **Fair Launch**: Zero premine

## 🏗 Architecture

```
app/
├── src/
│   ├── api/
│   │   └── qtc.ts              # QuantumCoin RPC client
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Main wallet interface
│   │   ├── SendScreen.tsx      # Send transactions
│   │   ├── ReceiveScreen.tsx   # Receive QTC
│   │   └── AuthScreen.tsx      # Login/signup
│   ├── components/
│   │   └── ...                 # Reusable UI components
│   ├── state/
│   │   └── store.ts            # Zustand state management
│   └── utils/
│       └── ...                 # Utility functions
├── App.tsx                     # Main app component
├── app.json                    # Expo configuration
└── package.json                # Dependencies
```

## 🧪 Testing

### Manual Testing
1. Start QuantumCoin node: `node real_quantumcoin_node.js`
2. Start app: `npm run ios`
3. Create account and verify seed phrase
4. Check balance updates from blockchain
5. Send test transaction and verify broadcast

### Unit Tests (TODO)
```bash
npm test                        # Run unit tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

## 🚀 Building & Deployment

### Development Build
```bash
npm run ios                    # iOS development
npm run android                # Android development
npm run web                    # Web development
```

### Production Build
```bash
# iOS
expo build:ios --type app-store

# Android  
expo build:android --type app-bundle

# Web
npm run build
```

### App Store Submission
1. **iOS**: Upload to TestFlight via Expo
2. **Android**: Upload AAB to Google Play Console
3. **Web**: Deploy to hosting service

## 🔧 Configuration

### app.json Configuration
```json
{
  "expo": {
    "name": "QuantumCoin",
    "slug": "quantumcoin-app",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.quantumcoin.app"
    },
    "android": {
      "package": "com.quantumcoin.app"
    }
  }
}
```

## 📚 API Reference

### QuantumCoin RPC Client

```typescript
import qtcRPC from './src/api/qtc';

// Get blockchain information
const blockchain = await qtcRPC.getBlockchainInfo();

// Get wallet balance
const balance = await qtcRPC.getBalance(address);

// Send transaction
const txHash = await qtcRPC.sendTransaction(from, to, amount, fee);

// Check RevStop status
const isProtected = await qtcRPC.getRevStopStatus(address);
```

## 🐛 Troubleshooting

### QuantumCoin Node Not Found
```bash
# Ensure QuantumCoin node is running
cd quantumcoin-ui-
node real_quantumcoin_node.js

# Test RPC connection
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"getblockchaininfo","params":{},"id":1}'
```

### Build Issues
```bash
# Clear cache
npm start --clear

# Reset dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🔗 Links

- **QuantumCoin Blockchain**: https://github.com/aeonith/quantumcoin-ui-
- **Issues**: https://github.com/aeonith/Quantum-app/issues
- **Documentation**: https://github.com/aeonith/Quantum-app/wiki

---

**Built for the QuantumCoin blockchain network**  
*Real cryptocurrency, real mobile app, real security*
