const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
  return (
    <div className="flex items-center space-x-1 text-xs text-gray-400">
      {status === 'sent' && <Check className="w-3 h-3" />}
      {status === 'delivered' && <CheckCheck className="w-3 h-3" />}
      {status === 'read' && <CheckCheck className="w-3 h-3 text-primary" />}
      <span>{status}</span>
    </div>
  );
}; 