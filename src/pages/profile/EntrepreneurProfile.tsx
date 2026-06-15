import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, UserCircle, Calendar } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/entrepreneurs');
        console.log('entrepreneurs:', response.data);
        console.log('looking for id:', id);
        const found = response.data.find((u: any) => u._id === id || u.id === id);
        if (found) {
          setEntrepreneur(found);
        } else {
          setError('Entrepreneur not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Loading profile...</p>
    </div>
  );

  if (error || !entrepreneur) return (
    <div className="text-center py-12">
      <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Entrepreneur not found</h3>
      <p className="mt-1 text-sm text-gray-500">The profile you're looking for doesn't exist.</p>
      <Link to="/dashboard">
        <Button className="mt-4">Back to Dashboard</Button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-start gap-6">
            <Avatar src={entrepreneur.avatar} name={entrepreneur.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
                  <p className="text-gray-500">{entrepreneur.email}</p>
                </div>
                <Badge variant="success">Entrepreneur</Badge>
              </div>
              {entrepreneur.bio && <p className="mt-3 text-gray-600">{entrepreneur.bio}</p>}
              <div className="mt-4 flex gap-3">
                {currentUser?.id !== entrepreneur._id && (
                  <Link to="/messages">
                    <Button>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Profile Details</h2></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <UserCircle className="h-5 w-5" />
              <span>Role: Entrepreneur</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>Joined: {new Date(entrepreneur.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
