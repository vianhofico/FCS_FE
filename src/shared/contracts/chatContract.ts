/**
 * Chat and conversation contract types
 */

/**
 * Conversation entity
 */
export type Conversation = {
  id: string;
  participantIds: string[];
  participants?: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Chat message
 */
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  messageType?: "TEXT" | "IMAGE" | "FILE";
  attachmentUrl?: string;
  status?: "SENT" | "DELIVERED" | "READ";
  createdAt?: string;
};

/**
 * Create conversation request
 */
export type ConversationCreateRequest = {
  participantIds: string[];
  participantId?: string; // Alternative single participant
};

/**
 * Send message request
 */
export type ChatMessageSendRequest = {
  conversationId: string;
  content: string;
  messageType?: "TEXT" | "IMAGE" | "FILE";
  attachmentUrl?: string;
};

/**
 * Conversation query filters
 */
export type ConversationQuery = {
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * Message query filters
 */
export type MessageQuery = {
  conversationId: string;
  page?: number;
  size?: number;
};

/**
 * STOMP message subscription payload
 */
export type StompChatMessage = ChatMessage & {
  deliveredAt?: string;
};
