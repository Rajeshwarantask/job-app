import { useGmailApi } from '../hooks/useGmailApi';

export const InboxViewer = ({ searchQuery, dateRange }) => {
  const { messages } = useGmailApi(); // or your context logic

  const filteredEmails = messages.filter((email) => {
    const matchQuery =
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDate =
      !dateRange ||
      (email.date >= dateRange.from && email.date <= dateRange.to);

    return matchQuery && matchDate;
  });

  return (
    <div className="space-y-3">
      {filteredEmails.map((email) => (
        <div key={email.id} className="bg-white/5 p-3 rounded-md border border-white/10">
          <div className="text-white font-medium">{email.subject}</div>
          <div className="text-gray-400 text-sm">
            {email.sender} • {new Date(email.date).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};
