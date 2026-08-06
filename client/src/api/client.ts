import type {
  ApiResponse,
  AuthPayload,
  AuthResponse,
  ConversationResponse,
  SendMessageResponse,
  SignupPayload,
  UserListResponse,
} from "../types";

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("chat-token");
};

const api = async <T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const response = await fetch(`/api${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Something went wrong.");
  }

  return payload as ApiResponse<T>;
};

export const loginUser = (payload: AuthPayload) =>
  api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const signupUser = (payload: SignupPayload) =>
  api<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const logoutUser = () => api<void>("/auth/logout", { method: "POST" });

export const getUsers = () => api<UserListResponse>("/chat/users");

export const getConversationMessages = (userId: string) =>
  api<ConversationResponse>(`/chat/conversation/${userId}`);

export const sendChatMessage = (userId: string, content: string) => {
  const clientMessageId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1000)}`;

  return api<SendMessageResponse>(`/chat/conversation/${userId}/message`, {
    method: "POST",
    body: JSON.stringify({ content, clientMessageId }),
  });
};
