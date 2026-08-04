export const SOCKET_EVENTS = {
  sendMessage: "send_message",
  typing: "typing",
  messageDelivered: "message_delivered",
  messageRead: "message_read",
  newMessage: "new_message",
  messageStatusUpdated: "message_status_updated",
  joinRoom: "join_room",
  leaveRoom: "leave_room",
  presencePing: "presence:ping",
  presenceReply: "presence:reply",
} as const;
