import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './App.css';
import { AuthPanel } from './components/auth/AuthPanel';
import { MessageList } from './components/chat/MessageList';
import { Sidebar } from './components/chat/Sidebar';
import { getConversationMessages, getUsers, loginUser, logoutUser, sendChatMessage, signupUser } from './api/client';
import type { AuthPayload, AuthResponse, AuthUser, SignupPayload, UserSummary, MessageItem } from './types';

function App() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      setUsers(response.data?.users ?? []);
      if (!selectedUserId && (response.data?.users?.length ?? 0) > 0) {
        setSelectedUserId(response.data?.users?.[0].id ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await getConversationMessages(userId);
      setMessages(response.data?.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (payload: AuthPayload | SignupPayload) => {
    try {
      setError('');
      setIsLoading(true);
      const response = payload && 'username' in payload
        ? await signupUser(payload as SignupPayload)
        : await loginUser(payload as AuthPayload);

      const authUser = (response.data as AuthResponse)?.user;
      const token = (response.data as AuthResponse)?.token;
      if (token) {
        window.localStorage.setItem('chat-token', token);
      }
      setCurrentUser(authUser);
      setMode('login');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore logout errors and clear local state
    } finally {
      window.localStorage.removeItem('chat-token');
      setCurrentUser(null);
      setUsers([]);
      setSelectedUserId(null);
      setMessages([]);
      setDraft('');
      setError('');
    }
  };

  const handleSelectUser = async (userId: string) => {
    setSelectedUserId(userId);
    await loadConversation(userId);
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedDraft = draft.trim();
    if (!selectedUserId || !trimmedDraft) {
      return;
    }

    try {
      setError('');
      const response = await sendChatMessage(selectedUserId, trimmedDraft);
      const newMessage = response.data?.message;
      if (newMessage) {
        setMessages((previous) => [...previous, newMessage]);
      }
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    }
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    void loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      void loadConversation(users[0].id);
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  if (!currentUser) {
    return (
      <div className="app-shell app-shell--centered">
        <AuthPanel
          mode={mode}
          onSwitch={() => setMode(mode === 'login' ? 'signup' : 'login')}
          onSubmit={handleAuthSubmit}
          isLoading={isLoading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--chat">
      <Sidebar
        users={users}
        currentUser={currentUser}
        selectedUserId={selectedUserId}
        isLoading={isLoading}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      <main className="chat-panel">
        <header className="chat-panel__header">
          <div>
            <p className="eyebrow">Conversation</p>
            <h2>{selectedUser?.username || 'Select a contact'}</h2>
          </div>
        </header>

        <div className="chat-panel__body">
          <MessageList messages={messages} currentUserId={currentUser.id} />
        </div>

        <form className="composer" onSubmit={handleSendMessage}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder={selectedUser ? `Message ${selectedUser.username}` : 'Select a contact'}
            disabled={!selectedUser}
          />
          <button type="submit" disabled={!selectedUser || !draft.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default App
