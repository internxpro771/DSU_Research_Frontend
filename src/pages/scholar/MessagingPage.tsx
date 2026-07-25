import { useEffect, useState } from 'react';
import { scholarService } from '../../services/dataService';
import { Scholar } from '../../types';
import ChatWindow from '../../components/common/ChatWindow';

const MessagingPage = () => {
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await scholarService.getProfile();
        setScholar(profile);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dsu-maroon"></div>
      </div>
    );
  }

  if (!scholar?.guideName || !scholar?.guideUserId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">No guide assigned yet. Messaging will be available after guide assignment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold text-gray-800">Messaging</h1>
      <ChatWindow otherUserId={scholar.guideUserId} otherUserName={scholar.guideName} />
    </div>
  );
};

export default MessagingPage;
