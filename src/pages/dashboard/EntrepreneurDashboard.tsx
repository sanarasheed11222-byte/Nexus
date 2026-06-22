import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, FileText, MessageCircle, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { meetingService } from '../../services/meetingService';
import { documentService } from '../../services/documentService';
import { messageService } from '../../services/messageService';
import { profileService } from '../../services/profileService';
import { notificationService } from '../../services/notificationService';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsData, docsData, investorsData, notifsData, convsData] = await Promise.all([
        meetingService.getMeetings(),
        documentService.getDocuments(),
        profileService.getInvestors(),
        notificationService.getNotifications(),
        messageService.getConversations()
      ]);
      setMeetings(meetingsData);
      setDocuments(docsData);
      setInvestors(investorsData.slice(0, 3));
      setNotifications(notifsData.filter((n: any) => !n.read));
      setConversations(convsData);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date() && m.status !== 'cancelled');
  const pendingMeetings = meetings.filter(m => m.status === 'pending');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        <Link to="/investors">
          <Button leftIcon={<Plus size={18} />}>Find Investors</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/notifications">
          <Card className="hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
            <CardBody className="flex items-center gap-4 py-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Bell size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-sm text-gray-500">Unread Notifications</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link to="/messages">
          <Card className="hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
            <CardBody className="flex items-center gap-4 py-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <MessageCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                <p className="text-sm text-gray-500">Conversations</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link to="/meetings">
          <Card className="hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
            <CardBody className="flex items-center gap-4 py-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Calendar size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
                <p className="text-sm text-gray-500">Upcoming Meetings</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link to="/documents">
          <Card className="hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
            <CardBody className="flex items-center gap-4 py-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-500">Documents</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
              <Link to="/meetings">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardBody>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No upcoming meetings</p>
                  <Link to="/meetings">
                    <Button size="sm" className="mt-3">Schedule Meeting</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.slice(0, 3).map(meeting => (
                    <Link key={meeting._id} to="/meetings">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-50 rounded-lg">
                            <Calendar size={18} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{meeting.title}</p>
                            <p className="text-xs text-gray-500">{formatDate(meeting.date)} - {meeting.duration} mins</p>
                          </div>
                        </div>
                        <Badge variant={meeting.status === 'accepted' ? 'success' : 'warning'}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
              <Link to="/documents">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No documents yet</p>
                  <Link to="/documents">
                    <Button size="sm" className="mt-3">Upload Document</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.slice(0, 3).map(doc => (
                    <Link key={doc._id} to="/documents">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.fileType?.split('/')[1]?.toUpperCase()}</p>
                          </div>
                        </div>
                        <Badge variant={doc.status === 'signed' ? 'success' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
            </CardHeader>
            <CardBody>
              {investors.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No investors found</p>
              ) : (
                <div className="space-y-4">
                  {investors.map(investor => (
                    <Link key={investor._id} to={"/profile/investor/" + investor._id}>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Avatar src={investor.avatar} name={investor.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{investor.name}</p>
                          <p className="text-xs text-gray-500">{investor.email}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {pendingMeetings.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardBody>
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={18} className="text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Pending Meetings</h3>
                </div>
                <p className="text-sm text-yellow-700">
                  You have {pendingMeetings.length} pending meeting request(s)
                </p>
                <Link to="/meetings">
                  <Button size="sm" className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700">
                    Review Meetings
                  </Button>
                </Link>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
