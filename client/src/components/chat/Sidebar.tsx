import type { AuthUser, UserSummary } from '../../types';

const getUserId = (user: UserSummary) => user.id ?? user._id ?? '';

interface SidebarProps {
    users: UserSummary[];
    currentUser: AuthUser | null;
    selectedUserId: string | null;
    isLoading: boolean;
    onSelectUser: (userId: string) => void;
    onLogout: () => void;
}

export function Sidebar({
    users,
    currentUser,
    selectedUserId,
    isLoading,
    onSelectUser,
    onLogout,
}: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar__header">
                <div>
                    <p className="eyebrow">Signed in as</p>
                    <h2>{currentUser?.username || 'Chat user'}</h2>
                </div>
                <button className="text-btn" type="button" onClick={onLogout}>
                    Logout
                </button>
            </div>

            <div className="sidebar__body">
                <p className="section-label">People</p>
                {isLoading ? (
                    <p className="empty-state">Loading contacts...</p>
                ) : users.length === 0 ? (
                    <p className="empty-state">No contacts yet.</p>
                ) : (
                    <ul className="user-list">
                        {users.map((user) => (
                            <li key={user.id}>
                                <button
                                    className={`user-pill ${selectedUserId === user.id ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => onSelectUser(getUserId(user))}
                                >
                                    <span className="user-pill__name">{user.username}</span>
                                    <span className={`status-dot ${user.status ? 'online' : 'offline'}`} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
