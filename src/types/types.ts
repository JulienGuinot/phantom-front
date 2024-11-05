export interface Participant {
  id: string;
  username: string;
  publicKey: string;
  online?: boolean;
  lastSeen?: number;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    timestamp: number;
    senderId: string;
  };
}

export interface WebSocketClient {
  updateMessage: (id: string, message: Partial<ExtendedMessage>) => void;
  addMessage: (message: ExtendedMessage) => void;
  addNotification: (notification: { id: string; type: string; message: string }) => void;
  resendUnsentMessages: () => void;
}

export interface EncryptedFile {
  encrypted: string;
  fileNonce: string;
  encryptedKey: string;
  keyNonce: string;
  metadata: {
    name: string;
    type: string;
    size: number;
  };
}

export interface EncryptedMessage {
  encrypted: string;
  nonce: string;
  ephemeralPublicKey: string;
}



export interface MessageMetadata {
  fileAttachment?: EncryptedFile;
  isDeleted?: boolean;
  isEdited?: boolean;
  readReceipt?: boolean;
  replyTo?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  timestamp: number;
  encrypted: EncryptedMessage;
  status: 'sent' | 'delivered' | 'read' | 'received';
  fileAttachment?: EncryptedFile;
  isDeleted?: boolean;
  isEdited?: boolean;
  readReceipt?: boolean;
  replyTo?: string;
  isSending?: boolean;
  failed?: boolean;
  decryptedContent?: string;
} 

// Extension du type Message pour inclure decryptedContent
export interface ExtendedMessage extends Message {
  decryptedContent?: string;
  failed?: boolean;
}

export interface Contact {
  id: string;
  publicKey: string;
  signingPublicKey: string;
  lastSeen?: number;
  deviceIds?: string[];
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
}

export interface ChatState {
  userId: string | null;
  publicKey: string | null;
  privateKey: string | null;
  signingPublicKey: string | null;
  signingPrivateKey: string | null;
  contacts: Contact[];
  messages: ExtendedMessage[];
  deletedMessages: Set<string>;
  readReceipts: Set<string>;
  pinnedMessages: Set<string>;
  archivedChats: Set<string>;
  reactions: Map<string, Map<string, number>>;
  wsClient?: WebSocketClient;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  initialize: () => Promise<void>;
  addContact: (contact: Contact) => void;
  addMessage: (message: ExtendedMessage) => void;
  updateMessage: (messageId: string, updatedMessage: Partial<ExtendedMessage>) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (messageId: string) => void;
  searchMessages: (query: string) => ExtendedMessage[];
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
  deleteChat: (contactId: string) => void;
  archiveChat: (contactId: string) => void;
  username: string | null;
  fetchUserProfile: () => Promise<void>;
  conversations: Conversation[];
  currentConversation: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: (username: string) => Promise<Conversation | undefined>;
  sendMessage: (content: string) => Promise<void>;
  fetchInitialData: () => Promise<void>;
  recipientPublicKey: string | null;
  senderSecretKey: string | null;
  decryptMessage: (encryptedMessage: EncryptedMessage) => Promise<string>;
  token: string | null;
  typingStatuses: TypingStatus[];
  setTypingStatus: (status: TypingStatus) => void;
  updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
  unsentMessages: ExtendedMessage[];
  addUnsentMessage: (message: ExtendedMessage) => void;
  resendUnsentMessages: () => void;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}

export interface User {
  username: string;
  passwordHash: string;
}

export interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface EncryptedContent {
  encrypted: string;
  nonce: string;
  ephemeralPublicKey: string;
}

export interface APIMessage {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    publicKey: string;
  };
  content: EncryptedContent;
  // ... autres champs
}

export interface Notification {
  id: string;
  type: string;
  message: string;
}

// WebSocket Handlers
export interface WebSocketHandlers {
  updateMessage: (messageId: string, updatedMessage: Partial<ExtendedMessage>) => void;
  addMessage: (message: ExtendedMessage) => void;
  addNotification: (notification: Notification) => void;
  resendUnsentMessages: () => Promise<void>;
}