import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await api.get('/profile/investors');
        setInvestors(response.data);
      } catch (err) {
        console.error('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };
    fetchInvestors();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Loading investors...</p>
    </div>
  );

  if (investors.length === 0) return (
    <div className="text-center py-12">
      <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No investors found</h3>
      <p className="mt-1 text-sm text-gray-500">No investors have registered yet.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Investors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((investor) => (
          <Link key={investor._id} to={`/profile/investor/${investor._id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardBody>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={investor.avatar}
                    name={investor.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{investor.name}</h3>
                    <p className="text-sm text-gray-500">{investor.email}</p>
                    <Badge variant="primary" className="mt-1">Investor</Badge>
                  </div>
                </div>
                {investor.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{investor.bio}</p>
                )}
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};