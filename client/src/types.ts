export interface AuthUser {
  id: string;
  username: string;
  email: string;
  status: boolean;
}

export interface UserSummary {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  status: boolean;
  createdAt?: string;
}

export interface Participant {
  id: string;
  username: string;
  status: boolean;
}

export interface MessageItem {
  _id: string;
  content: string;
  createdAt?: string;
  status?: string;
  sender?: Participant | null;
  receiver?: Participant | null;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthPayload {
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface UserListResponse {
  users: UserSummary[];
}

export interface ConversationResponse {
  messages: MessageItem[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface SendMessageResponse {
  message: MessageItem;
}
