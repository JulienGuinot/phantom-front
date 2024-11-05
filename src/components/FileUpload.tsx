import React, { useCallback } from 'react';
import { FileUp, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { encryptFile } from '../lib/crypto';

interface FileUploadProps {
  recipientId: string;
  onFileEncrypted: (encryptedFile: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ recipientId, onFileEncrypted }) => {
  const { contacts, privateKey } = useStore();
  const recipient = contacts.find(c => c.id === recipientId);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !recipient || !privateKey) return;

    try {
      const encryptedFile = await encryptFile(
        file,
        recipient.publicKey,
        privateKey
      );
      
      onFileEncrypted(encryptedFile);
    } catch (error) {
      console.error('Failed to encrypt file:', error);
    }
  }, [recipient, privateKey, onFileEncrypted]);

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center space-x-2 text-primary hover:text-primary-dark cursor-pointer transition-colors"
      >
        <FileUp className="w-5 h-5" />
        <span className="text-sm">Attach File</span>
      </label>
    </div>
  );
};