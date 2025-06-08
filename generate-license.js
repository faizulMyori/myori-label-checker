const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Try to load .env file from the appropriate location
try {
  let envPath;
  
  if (isProduction) {
    // In production, the .env file is in the extraResources directory
    const resourcesPath = process.resourcesPath || path.join(__dirname, 'resources');
    envPath = path.join(resourcesPath, '.env');
    console.log('Looking for .env in production path:', envPath);
  } else {
    // In development, use the .env file in the project root
    envPath = path.resolve(__dirname, '.env');
    console.log('Looking for .env in development path:', envPath);
  }
  
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Loaded .env file from:', envPath);
  } else {
    console.warn('Warning: .env file not found at:', envPath);
  }
} catch (error) {
  console.warn('Warning: Could not load .env file:', error.message);
}

// Secret key for encryption/decryption - use environment variable if available
const SECRET_KEY = process.env.LICENSE_SECRET_KEY || 'myori-label-checker-secret-key-2024';

// Log a warning if using the default key
if (!process.env.LICENSE_SECRET_KEY) {
  console.warn('Warning: Using default license secret key. For production, set LICENSE_SECRET_KEY environment variable.');
}

// Generate a license key for a specific machine
function generateLicenseKey(machineId, expiryDate) {
  // Create license data with machine ID
  const licenseData = {
    machineId,
    issuedAt: new Date().toISOString()
  };
  
  // Add expiry date if provided
  if (expiryDate) {
    licenseData.expiryDate = expiryDate;
  }
  
  // Convert to JSON string
  const licenseStr = JSON.stringify(licenseData);
  
  // Generate a secure initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create key buffer from the secret key
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
  
  // Encrypt the license data
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedLicense = cipher.update(licenseStr, 'utf8', 'hex');
  encryptedLicense += cipher.final('hex');
  
  // Prepend the IV to the encrypted data
  const ivHex = iv.toString('hex');
  const encryptedWithIV = `${ivHex}:${encryptedLicense}`;
  
  // Add a checksum
  const checksum = crypto.createHash('md5').update(encryptedWithIV).digest('hex').substring(0, 8);
  
  // Combine encrypted data with checksum
  const licenseKey = `${encryptedWithIV}${checksum}`;
  
  // Format the license key in groups for readability
  return formatLicenseKey(licenseKey);
}

// Format license key in groups of 5 characters
function formatLicenseKey(key) {
  const groups = [];
  for (let i = 0; i < key.length; i += 5) {
    groups.push(key.slice(i, i + 5));
  }
  return groups.join('-');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--machine-id' && i + 1 < args.length) {
      params.machineId = args[i + 1];
      i++;
    } else if (args[i] === '--expiry' && i + 1 < args.length) {
      // Optional expiry date in YYYY-MM-DD format
      params.expiryDate = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      params.help = true;
    }
  }
  
  return params;
}

// Show help message
function showHelp() {
  console.log('\nLicense Key Generator');
  console.log('==================\n');
  console.log('Usage:');
  console.log('  node generate-license.js --machine-id <machine-id> [--expiry YYYY-MM-DD] [--help]\n');
  console.log('Options:');
  console.log('  --machine-id <id>    The machine ID to generate a license for (required)');
  console.log('  --expiry <date>      Optional expiry date in YYYY-MM-DD format');
  console.log('  --help, -h           Show this help message\n');
  console.log('Example:');
  console.log('  node generate-license.js --machine-id f3312259967c680fa17a5e78cebc4b7b9d2f7d8a2db3246e778bb0b47e57b106');
  console.log('  node generate-license.js --machine-id f3312259967c680fa17a5e78cebc4b7b9d2f7d8a2db3246e778bb0b47e57b106 --expiry 2025-12-31\n');
}

// Main function
function main() {
  const params = parseArgs();
  
  // Show help if requested or no machine ID provided
  if (params.help || !params.machineId) {
    showHelp();
    process.exit(params.help ? 0 : 1);
  }
  
  // Generate the license key
  const licenseData = {
    machineId: params.machineId
  };
  
  // Add expiry date if provided
  if (params.expiryDate) {
    try {
      // Validate date format
      const date = new Date(params.expiryDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      licenseData.expiryDate = params.expiryDate;
    } catch (error) {
      console.error('Error: Invalid expiry date format. Please use YYYY-MM-DD format.');
      process.exit(1);
    }
  }
  
  // Generate the license key
  const licenseKey = generateLicenseKey(params.machineId, params.expiryDate);
  
  // Output the results
  console.log('\nLicense Key Generator');
  console.log('==================\n');
  console.log('Machine ID:');
  console.log(params.machineId);
  
  if (params.expiryDate) {
    console.log('\nExpiry Date:');
    console.log(params.expiryDate);
  }
  
  console.log('\nGenerated License Key:');
  console.log(licenseKey);
  console.log('\nStore this license key securely and provide it to the user for activation.\n');
}

// Run the main function
main();