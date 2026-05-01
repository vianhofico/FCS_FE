/**
 * Notification contract types
 */

import type { NotificationStatus } from "@/shared/contracts/commonContract";

/**
 * Notification entity
 */
export type Notification = {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  relatedModule?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  createdAt?: string;
  readAt?: string;
};

/**
 * Mark notification as read request
 */
export type NotificationReadRequest = Record<string, unknown>;

/**
 * Notification query filters
 */
export type NotificationQuery = {
  status?: NotificationStatus;
  page?: number;
  size?: number;
  sort?: string;
};
