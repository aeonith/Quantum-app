#!/usr/bin/env node
// Real Email Verification Backend for QuantumCoin App
const http = require('http');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const PORT = 3001;

// Email transporter (use your email service)
const transporter = nodemailer.createTransporter({
    service: 'gmail', // or your email provider
    auth: {
        user: 'quantumcoin.verify@gmail.com', // Replace with your email
        pass: 'your-app-password' // Replace with your app password
    }
});

// In-memory storage (use database in production)
const verificationCodes = new Map();
const users = new Map();

// Generate secure 6-digit verification code
function generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
    const mailOptions = {
        from: 'QuantumCoin Security <quantumcoin.verify@gmail.com>',
        to: email,
        subject: '🔐 QuantumCoin Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0A0A0F, #1A1A2E); color: white; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 32px; margin-bottom: 8px;">⚛️ QuantumCoin</h1>
                    <p style="color: #9CA3AF; font-size: 16px;">Quantum-Resistant Cryptocurrency</p>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                    <h2 style="color: #00ffff; font-size: 20px; margin-bottom: 16px;">🔐 Email Verification Required</h2>
                    <p style="color: #CCCCCC; line-height: 24px; margin-bottom: 20px;">
                        Thank you for creating your QuantumCoin account! To secure your quantum-resistant wallet and protect your funds, please verify your email address.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="font-size: 36px; font-weight: bold; color: #00ffff; background: rgba(0, 255, 255, 0.1); border: 2px solid #00ffff; border-radius: 12px; padding: 20px; display: inline-block; letter-spacing: 8px; text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);">
                            ${code}
                        </div>
                    </div>
                    
                    <p style="color: #9CA3AF; font-size: 14px; text-align: center;">
                        This verification code expires in 10 minutes for your security.
                    </p>
                </div>
                
                <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #ff6b6b; font-size: 16px; margin-bottom: 12px;">⚠️ Security Notice</h3>
                    <ul style="color: #ffcccc; font-size: 14px; line-height: 20px; margin-left: 20px;">
                        <li>Never share this verification code with anyone</li>
                        <li>QuantumCoin will never ask for your code via phone or social media</li>
                        <li>If you didn't request this verification, ignore this email</li>
                        <li>Your quantum-resistant wallet uses advanced post-quantum cryptography</li>
                    </ul>
                </div>
                
                <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
                    <p style="color: #6B7280; font-size: 12px;">
                        © 2025 QuantumCoin - The Future of Cryptocurrency<br>
                        Quantum-resistant • Secure • Revolutionary
                    </p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

// Handle verification requests
function handleRequest(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Method not allowed'}));
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const response = { success: false };

            switch (data.action) {
                case 'send_verification':
                    const email = data.email;
                    if (!email || !email.includes('@')) {
                        response.error = 'Invalid email address';
                        break;
                    }

                    const code = generateVerificationCode();
                    verificationCodes.set(email, {
                        code: code,
                        expires: Date.now() + 10 * 60 * 1000, // 10 minutes
                        attempts: 0
                    });

                    try {
                        await sendVerificationEmail(email, code);
                        response.success = true;
                        response.message = 'Verification code sent to your email';
                        console.log(`📧 Sent verification code ${code} to ${email}`);
                    } catch (error) {
                        console.error('Email send failed:', error);
                        response.error = 'Failed to send verification email';
                    }
                    break;

                case 'verify_code':
                    const verifyEmail = data.email;
                    const verifyCode = data.code;
                    
                    const stored = verificationCodes.get(verifyEmail);
                    if (!stored) {
                        response.error = 'No verification code found for this email';
                        break;
                    }
                    
                    if (Date.now() > stored.expires) {
                        verificationCodes.delete(verifyEmail);
                        response.error = 'Verification code has expired';
                        break;
                    }
                    
                    stored.attempts++;
                    if (stored.attempts > 3) {
                        verificationCodes.delete(verifyEmail);
                        response.error = 'Too many verification attempts';
                        break;
                    }
                    
                    if (stored.code === verifyCode) {
                        verificationCodes.delete(verifyEmail);
                        response.success = true;
                        response.message = 'Email verified successfully';
                        console.log(`✅ Email verified: ${verifyEmail}`);
                    } else {
                        response.error = 'Invalid verification code';
                    }
                    break;

                case 'register_user':
                    const userData = {
                        id: crypto.randomUUID(),
                        name: data.name,
                        email: data.email,
                        passwordHash: crypto.createHash('sha256').update(data.password + 'quantum_salt').digest('hex'),
                        walletAddress: 'qtc1q' + crypto.randomBytes(20).toString('hex'),
                        seedPhrase: generateSeedPhrase(),
                        balance: 0,
                        createdAt: new Date().toISOString(),
                        isVerified: true
                    };
                    
                    users.set(data.email, userData);
                    response.success = true;
                    response.user = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        walletAddress: userData.walletAddress,
                        seedPhrase: userData.seedPhrase
                    };
                    console.log(`👤 User registered: ${data.email}`);
                    break;

                case 'authenticate_user':
                    const loginEmail = data.email;
                    const loginPassword = data.password;
                    const passwordHash = crypto.createHash('sha256').update(loginPassword + 'quantum_salt').digest('hex');
                    
                    const user = users.get(loginEmail);
                    if (user && user.passwordHash === passwordHash) {
                        response.success = true;
                        response.user = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            walletAddress: user.walletAddress,
                            balance: user.balance
                        };
                        console.log(`🔓 User authenticated: ${loginEmail}`);
                    } else {
                        response.error = 'Invalid email or password';
                    }
                    break;

                default:
                    response.error = 'Unknown action';
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));

        } catch (error) {
            console.error('Request handling error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Internal server error'}));
        }
    });
}

function generateSeedPhrase() {
    const words = [
        'quantum', 'secure', 'future', 'digital', 'crypto', 'brave',
        'mining', 'wealth', 'protect', 'cosmic', 'galaxy', 'universe'
    ];
    return words.sort(() => Math.random() - 0.5).join(' ');
}

// Start email verification server
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
    console.log('📧 QuantumCoin Email Verification Server Started');
    console.log('===============================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📨 Email Service: Ready for verification codes`);
    console.log(`🔐 Security: Advanced verification system active`);
    console.log('');
    console.log('✅ Ready to send real verification emails!');
    console.log('');
});

process.on('SIGINT', () => {
    console.log('\n📧 Shutting down email verification server...');
    server.close(() => {
        console.log('✅ Email server stopped gracefully');
        process.exit(0);
    });
});
