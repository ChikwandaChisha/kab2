import * as forge from 'node-forge';

// Store private keys locally for the current session
const privateKeys: Record<string, string> = {};

// Load stored private keys from localStorage
const loadStoredPrivateKeys = () => {
  try {
    const storedKeys = JSON.parse(localStorage.getItem('userPrivateKeys') || '{}') as Record<string, string>;
    // Convert all email keys to lowercase
    Object.entries(storedKeys).forEach(([email, key]) => {
      privateKeys[email.toLowerCase()] = key;
    });
  } catch (error) {
    console.error('Error loading stored private keys:', error);
  }
};

// Initialize by loading stored keys
loadStoredPrivateKeys();

// Improved base64 validation function with detailed logging
const isValidBase64 = (str: string): boolean => {
  if (!str) {
    console.error('Base64 validation failed: Input is empty');
    return false;
  }
  
  // Trim the string to remove any leading/trailing whitespace
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    console.error('Base64 validation failed: Input is only whitespace');
    return false;
  }
  
  // Check if the string length is valid for base64 (multiple of 4)
  if (trimmed.length % 4 !== 0) {
    console.error('Base64 validation failed: Length not multiple of 4:', trimmed.length);
    return false;
  }
  
  // Check if the string matches the base64 pattern
  const regex = /^[A-Za-z0-9+/]*={0,3}$/;
  const isValid = regex.test(trimmed);
  if (!isValid) {
    console.error('Base64 validation failed: Invalid characters in string');
  }
  
  return isValid;
};

export const encryptionService = {
  // Generate a new key pair for a user when they sign up
  generateKeyPair: async (userEmail: string) => {
    try {
      // Convert email to lowercase for consistency
      const normalizedEmail = userEmail.toLowerCase();
      
      // Generate RSA key pair
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      
      // Store the private key locally
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
      privateKeys[normalizedEmail] = privateKeyPem;
      
      // Store in localStorage for persistence
      const storedKeys = JSON.parse(localStorage.getItem('userPrivateKeys') || '{}');
      storedKeys[normalizedEmail] = privateKeyPem;
      localStorage.setItem('userPrivateKeys', JSON.stringify(storedKeys));
      
      // Store the public key in the database
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      
      return { 
        success: true, 
        publicKey: publicKeyPem 
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      return { 
        success: false 
      };
    }
  },

  // Get user's private key
  getPrivateKey: (userEmail: string) => {
    // Convert email to lowercase for consistency
    const normalizedEmail = userEmail.toLowerCase();
    
    // Try to get from memory first
    let privateKey = privateKeys[normalizedEmail];
    
    // If not in memory, try to load from localStorage
    if (!privateKey) {
      const storedKeys = JSON.parse(localStorage.getItem('userPrivateKeys') || '{}');
      privateKey = storedKeys[normalizedEmail];
      if (privateKey) {
        privateKeys[normalizedEmail] = privateKey;
      }
    }
    
    return privateKey;
  },

  // Encrypt a message using the recipient's public key
  encryptMessage: (message: string, recipientPublicKey: string) => {
    try {
      console.log('Starting encryption process...');
      
      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message: must be a non-empty string');
      }
      
      if (!recipientPublicKey) {
        throw new Error('Recipient public key is required for encryption');
      }
      
      // Parse the public key
      const publicKey = forge.pki.publicKeyFromPem(recipientPublicKey);
      console.log('Successfully loaded recipient public key');
      
      // Encrypt the message
      const encrypted = publicKey.encrypt(message, 'RSA-OAEP');
      console.log('Message encrypted successfully');
      
      // Convert to base64 for storage
      const base64Encrypted = forge.util.encode64(encrypted);
      console.log('Message converted to base64:', base64Encrypted.substring(0, 20) + '...');
      
      return base64Encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  },

  // Improved decryption function with better error handling
  decryptMessage: (encryptedMessage: string, userEmail: string) => {
    try {
      // Convert email to lowercase for consistency
      const normalizedEmail = userEmail.toLowerCase();
      console.log(`Attempting to decrypt message for user: ${normalizedEmail}`);
      
      // Get the user's private key
      const privateKeyPem = encryptionService.getPrivateKey(normalizedEmail);
      if (!privateKeyPem) {
        console.error(`No private key found for user: ${normalizedEmail}`);
        return 'Failed to decrypt: No private key available';
      }
      
      // Validate input is non-empty
      if (!encryptedMessage || typeof encryptedMessage !== 'string') {
        console.error('Empty or invalid encrypted message');
        return 'Failed to decrypt: Empty or invalid message';
      }
      
      // Convert PEM to private key object
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      
      // Trim any whitespace
      const trimmedMessage = encryptedMessage.trim();
      
      // Validate the input is proper base64
      if (!isValidBase64(trimmedMessage)) {
        console.error('Invalid base64 format in encrypted message');
        return 'Failed to decrypt message: Invalid format';
      }
      
      try {
        // Decode base64 and decrypt
        const encrypted = forge.util.decode64(trimmedMessage);
        
        // Check if the decoded data has valid length
        if (!encrypted || encrypted.length === 0) {
          console.error('Decoded encrypted message has zero length');
          return 'Failed to decrypt message: Empty message after decoding';
        }
        
        const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP');
        console.log('Message decrypted successfully');
        return decrypted;
      } catch (decryptionError) {
        console.error('Error during decryption process:', decryptionError);
        return 'Failed to decrypt message: Invalid format or wrong key';
      }
    } catch (error) {
      console.error('Error in decryptMessage:', error);
      return 'Failed to decrypt message: Unexpected error';
    }
  },

  // Generate a random token ID
  generateToken: () => {
    return `${Math.random().toString(36).substring(2, 8)}-${Math.random().toString(36).substring(2, 5)}`.toUpperCase();
  }
};
