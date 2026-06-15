import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign, Calendar, FileText } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { notificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read!');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection': return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment': return <DollarSign size={16} className="text-accent-600" />;
      case 'meeting': return <Calendar size={16} className="text-green-600" />;
      case 'document': return <FileText size={16} className="text-orange-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    return Math.floor(diff / 86400) + ' days ago';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Bell size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
          <p className="text-gray-500 mt-1">When someone interacts with you, you'll see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card
              key={notification._id}
              className={`transition-colors duration-200 cursor-pointer ${!notification.read ? 'bg-primary-50 border-primary-200' : ''}`}
              onClick={() => !notification.read && handleMarkRead(notification._id)}
            >
              <CardBody className="flex items-start p-4">
                <Avatar
                  src={notification.sender?.avatar}
                  name={notification.sender?.name || 'System'}
                  size="md"
                  className="flex-shrink-0 mr-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {notification.sender?.name || 'System'}
                    </span>
                    {!notification.read && (
                      <Badge variant="primary" size="sm">New</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{notification.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}
                    <span>{formatTime(notification.createdAt)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
