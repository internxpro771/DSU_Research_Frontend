import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { notificationService } from '../../services/dataService';
import { NotificationItem } from '../../types';
import { useAppDispatch } from '../../hooks/useAppStore';
import { setUnreadCount } from '../../store/notificationSlice';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(0, 100);
      setNotifications(data.content);
      const unread = data.content.filter((item) => !item.isRead).length;
      dispatch(setUnreadCount(unread));
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, isRead: true } : item));
        dispatch(setUnreadCount(updated.filter((item) => !item.isRead).length));
        return updated;
      });
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      dispatch(setUnreadCount(0));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500 mt-1">Track updates for approvals, requests, and workflow actions.</p>
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 bg-dsu-maroon text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-dsu-maroon-hover disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs uppercase text-gray-500">Unread</p>
          <p className="text-2xl font-bold text-dsu-maroon mt-1">{unreadCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No notifications available.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((item) => (
              <div key={item.id} className={`p-4 sm:p-5 ${!item.isRead ? 'bg-amber-50/50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${!item.isRead ? 'bg-dsu-maroon/10' : 'bg-gray-100'}`}>
                    <Bell className={`w-4 h-4 ${!item.isRead ? 'text-dsu-maroon' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full w-fit ${!item.isRead ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {!item.isRead ? 'Unread' : 'Read'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      {!item.isRead && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="text-xs text-dsu-maroon hover:text-dsu-maroon-hover font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
