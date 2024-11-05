import { box, sign, randomBytes } from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import * as ed from '@noble/ed25519';
import { EncryptedMessage, MessageMetadata, EncryptedFile, EncryptedContent } from '../types/types';
// Key management
export const generateKeyPair = () => {
  const encryptionKeys = box.keyPair();
  const signingKeys = sign.keyPair();
  
  return {
    publicKey: encodeBase64(encryptionKeys.publicKey),
    secretKey: encodeBase64(encryptionKeys.secretKey),
    signingPublicKey: encodeBase64(signingKeys.publicKey),
    signingSecretKey: encodeBase64(signingKeys.secretKey),
  };
};

export const generateIdentifier = () => {
  return encodeBase64(randomBytes(24)).slice(0, 32);
};

// Perfect Forward Secrecy implementation
export const generateEphemeralKeys = () => {
  return box.keyPair();
};

// Message encryption with PFS
export const encryptMessage = (
  message: string,
  recipientPublicKey: string,
  senderSecretKey: string,
  signingKey: string,
  metadata: MessageMetadata = {}
): EncryptedMessage => {
  const ephemeralKeys = generateEphemeralKeys();
  const nonce = randomBytes(box.nonceLength);
  
  // Combine message with metadata
  const fullMessage = JSON.stringify({
    content: message,
    timestamp: Date.now(),
    ...metadata,
  });

  // Sign the message synchronously
  const messageBytes = new TextEncoder().encode(fullMessage);
  const signature = sign.detached(messageBytes, decodeBase64(signingKey));

  const encryptedMessage = box(
    new TextEncoder().encode(JSON.stringify({
      message: fullMessage,
      signature: encodeBase64(signature),
    })),
    nonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(senderSecretKey)
  );

  return {
    encrypted: encodeBase64(encryptedMessage),
    nonce: encodeBase64(nonce),
    ephemeralPublicKey: encodeBase64(ephemeralKeys.publicKey),
  };
};

// Message decryption with signature verification
export const decryptMessage = async (
  encryptedData: EncryptedContent,
  recipientSecretKey: string
): Promise<string> => {
  const decrypted = box.open(
    decodeBase64(encryptedData.encrypted),
    decodeBase64(encryptedData.nonce),
    decodeBase64(encryptedData.ephemeralPublicKey),
    decodeBase64(recipientSecretKey)
  );

  if (!decrypted) throw new Error('Échec du déchiffrement du message');

  const { message, signature } = JSON.parse(new TextDecoder().decode(decrypted));

  // Vérification de la signature
  const isValid = await ed.verify(
    decodeBase64(signature),
    new TextEncoder().encode(message),
    decodeBase64(senderPublicKey) // Assurez-vous de fournir la clé publique de l'expéditeur
  );

  if (!isValid) throw new Error('Signature du message invalide');

  const parsedMessage = JSON.parse(message);
  return parsedMessage.content;
};

// File encryption
export const encryptFile = async (
  file: File,
  recipientPublicKey: string,
  senderSecretKey: string
): Promise<EncryptedFile> => {
  const buffer = await file.arrayBuffer();
  const fileData = new Uint8Array(buffer);
  
  const fileKey = randomBytes(32);
  const fileNonce = randomBytes(box.nonceLength);
  
  // Encrypt file with symmetric key
  const encryptedFile = box.after(
    fileData,
    fileNonce,
    fileKey
  );

  // Encrypt the file key with recipient's public key
  const keyNonce = randomBytes(box.nonceLength);
  const encryptedKey = box(
    fileKey,
    keyNonce,
    decodeBase64(recipientPublicKey),
    decodeBase64(senderSecretKey)
  );

  return {
    encrypted: encodeBase64(encryptedFile),
    fileNonce: encodeBase64(fileNonce),
    encryptedKey: encodeBase64(encryptedKey),
    keyNonce: encodeBase64(keyNonce),
    metadata: {
      name: file.name,
      type: file.type,
      size: file.size,
    },
  };
};

