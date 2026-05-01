/**
 * Chat and Conversation API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  Conversation,
  ChatMessage,
  ConversationCreateRequest,
  ChatMessageSendRequest,
  ConversationQuery,
  MessageQuery,
} from "@/shared/contracts/chatContract";

export const chatApi = {
  // ==================== CONVERSATIONS ====================

  /**
   * Get user conversations
   */
  getConversations: async (query: ConversationQuery = {}): Promise<ApiResponse<PageResponse<Conversation>>> => {
    const response = await http.get<ApiResponse<PageResponse<Conversation>>>(endpoints.conversations, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get conversation detail with messages
   */
  getConversationDetail: async (conversationId: string): Promise<ApiResponse<Conversation>> => {
    const response = await http.get<ApiResponse<Conversation>>(
      `${endpoints.conversations}/${conversationId}`
    );
    return response.data;
  },

  /**
   * Create new conversation
   */
  createConversation: async (payload: ConversationCreateRequest): Promise<ApiResponse<Conversation>> => {
    const response = await http.post<ApiResponse<Conversation>>(endpoints.conversations, payload);
    return response.data;
  },

  // ==================== MESSAGES ====================

  /**
   * Get messages in conversation
   */
  getMessages: async (
    conversationId: string,
    query: Omit<MessageQuery, "conversationId"> = {}
  ): Promise<ApiResponse<PageResponse<ChatMessage>>> => {
    const response = await http.get<ApiResponse<PageResponse<ChatMessage>>>(
      `${endpoints.conversations}/${conversationId}/messages`,
      { params: { ...query } }
    );
    return response.data;
  },

  /**
   * Send message in conversation
   */
  sendMessage: async (
    conversationId: string,
    payload: Omit<ChatMessageSendRequest, "conversationId">
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await http.post<ApiResponse<ChatMessage>>(
      `${endpoints.conversations}/${conversationId}/messages`,
      payload
    );
    return response.data;
  },
};
