import type { MessageItem } from '../../types';

interface MessageListProps {
    messages: MessageItem[];
    currentUserId: string | null;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    if (messages.length === 0) {
        return <div className="empty-state">Choose a person and send the first message.</div>;
    }

    return (
        <div className="message-list">
            {messages.map((message) => {
                const isMine = message.sender?.id === currentUserId;

                return (
                    <div key={message._id} className={`message-bubble ${isMine ? 'mine' : 'their'}`}>
                        <p>{message.content}</p>
                        <span>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default MessageList;
