import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Check, X, Users } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { meetingService } from '../../services/meetingService';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';

const statusColors: any = {
  'pending': 'warning',
  'accepted': 'success',
  'rejected': 'error',
  'cancelled': 'secondary'
};

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [form, setForm] = useState({
    title: '',
    participant: '',
    date: '',
    time: '',
    duration: '60',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsData, investors, entrepreneurs] = await Promise.all([
        meetingService.getMeetings(),
        profileService.getInvestors(),
        profileService.getEntrepreneurs()
      ]);
      setMeetings(meetingsData);
      const allUsers = [...investors, ...entrepreneurs].filter(u => u._id !== user?.id);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!form.title || !form.participant || !form.date || !form.time) {
      toast.error('Please fill all required fields!');
      return;
    }
    try {
      const dateTime = new Date(`${form.date}T${form.time}`).toISOString();
      await meetingService.createMeeting({
        title: form.title,
        participant: form.participant,
        date: dateTime,
        duration: Number(form.duration),
        notes: form.notes
      });
      toast.success('Meeting scheduled successfully!');
      setShowModal(false);
      setForm({ title: '', participant: '', date: '', time: '', duration: '60', notes: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await meetingService.acceptMeeting(id);
      toast.success('Meeting accepted!');
      loadData();
    } catch (err) {
      toast.error('Failed to accept meeting');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await meetingService.rejectMeeting(id);
      toast.success('Meeting rejected!');
      loadData();
    } catch (err) {
      toast.error('Failed to reject meeting');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this meeting?')) return;
    try {
      await meetingService.cancelMeeting(id);
      toast.success('Meeting cancelled!');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel meeting');
    }
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now && m.status !== 'cancelled' && m.status !== 'rejected');
  const pastMeetings = meetings.filter(m => new Date(m.date) < now || m.status === 'cancelled' || m.status === 'rejected');
  const pendingMeetings = meetings.filter(m => m.status === 'pending');

  const displayMeetings = activeTab === 'upcoming' ? upcomingMeetings : activeTab === 'pending' ? pendingMeetings : pastMeetings;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your meetings</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Check size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingMeetings.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pastMeetings.length}</p>
              <p className="text-sm text-gray-500">Past</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['upcoming', 'pending', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={"px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors " + (
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab}
            {tab === 'pending' && pendingMeetings.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                {pendingMeetings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading meetings...</p>
        </div>
      ) : displayMeetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No {activeTab} meetings</h3>
          <p className="text-gray-500 mt-1">Schedule a meeting to get started!</p>
          <Button className="mt-4" leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
            Schedule Meeting
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayMeetings.map(meeting => (
            <Card key={meeting._id} className="hover:shadow-md transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 rounded-xl">
                      <Calendar size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        <Badge variant={statusColors[meeting.status]}>{meeting.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(meeting.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatTime(meeting.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {meeting.duration} mins
                        </span>
                      </div>
                      {meeting.notes && (
                        <p className="mt-2 text-sm text-gray-600">{meeting.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Avatar
                          name={meeting.organizer?.name}
                          src={meeting.organizer?.avatar}
                          size="sm"
                        />
                        <span className="text-sm text-gray-500">
                          {meeting.organizer?._id === user?.id
                            ? 'You → ' + meeting.participant?.name
                            : meeting.organizer?.name + ' → You'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {meeting.status === 'pending' && meeting.participant?._id === user?.id && (
                      <>
                        <Button size="sm" onClick={() => handleAccept(meeting._id)}>
                          <Check size={16} className="mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(meeting._id)}>
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {meeting.status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => handleCancel(meeting._id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Meeting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Investment Discussion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participant *</label>
                <select
                  value={form.participant}
                  onChange={e => setForm({ ...form, participant: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select participant...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Meeting agenda or notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateMeeting}>Schedule Meeting</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
