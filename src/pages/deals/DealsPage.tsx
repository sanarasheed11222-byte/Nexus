import React, { useEffect, useState } from 'react';
import { Search, DollarSign, TrendingUp, Users, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { dealService } from '../../services/dealService';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';

const statusColors: any = {
  'Due Diligence': 'primary',
  'Term Sheet': 'accent',
  'Negotiation': 'warning',
  'Closed': 'success',
  'Passed': 'error'
};

export const DealsPage: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    entrepreneurId: '',
    startupName: '',
    industry: '',
    amount: '',
    equity: '',
    status: 'Due Diligence',
    stage: 'Seed',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dealsData, entrepreneursData] = await Promise.all([
        dealService.getDeals(),
        profileService.getEntrepreneurs()
      ]);
      setDeals(dealsData);
      setEntrepreneurs(entrepreneursData);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!form.entrepreneurId || !form.startupName || !form.amount || !form.equity) {
      toast.error('Please fill all required fields!');
      return;
    }
    try {
      await dealService.createDeal({
        ...form,
        amount: Number(form.amount),
        equity: Number(form.equity)
      });
      toast.success('Deal created successfully!');
      setShowModal(false);
      setForm({ entrepreneurId: '', startupName: '', industry: '', amount: '', equity: '', status: 'Due Diligence', stage: 'Seed', notes: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to create deal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this deal?')) return;
    try {
      await dealService.deleteDeal(id);
      toast.success('Deal deleted!');
      loadData();
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await dealService.updateDeal(id, { status });
      toast.success('Status updated!');
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchSearch = deal.startupName.toLowerCase().includes(search.toLowerCase()) ||
      deal.industry?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? deal.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalInvestment = deals.reduce((sum, d) => sum + d.amount, 0);
  const activeDeals = deals.filter(d => d.status !== 'Closed' && d.status !== 'Passed').length;
  const closedDeals = deals.filter(d => d.status === 'Closed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-600">Track and manage your investment pipeline</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
          Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">${(totalInvestment / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-500">Total Investment</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{activeDeals}</p>
              <p className="text-sm text-gray-500">Active Deals</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{deals.length}</p>
              <p className="text-sm text-gray-500">Total Deals</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{closedDeals}</p>
              <p className="text-sm text-gray-500">Closed</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals by startup name or industry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['', 'Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            {filterStatus || 'All'} Deals ({filteredDeals.length})
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading deals...</p>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No deals yet</h3>
              <p className="text-gray-500 mt-1">Add your first investment deal!</p>
              <Button className="mt-4" leftIcon={<Plus size={18} />} onClick={() => setShowModal(true)}>
                Add Deal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="pb-3 pr-4">Startup</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Equity</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Stage</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeals.map(deal => (
                    <tr key={deal._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={deal.startupName} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{deal.startupName}</p>
                            <p className="text-xs text-gray-500">{deal.industry}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 font-medium text-gray-900">
                        ${deal.amount.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-gray-700">{deal.equity}%</td>
                      <td className="py-4 pr-4">
                        <select
                          value={deal.status}
                          onChange={e => handleStatusChange(deal._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        >
                          {['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 pr-4 text-gray-700">{deal.stage}</td>
                      <td className="py-4 pr-4 text-sm text-gray-500">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(deal._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Deal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrepreneur</label>
                <select
                  value={form.entrepreneurId}
                  onChange={e => setForm({ ...form, entrepreneurId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select entrepreneur...</option>
                  {entrepreneurs.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startup Name</label>
                <input
                  type="text"
                  value={form.startupName}
                  onChange={e => setForm({ ...form, startupName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. TechWave AI"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={e => setForm({ ...form, industry: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. FinTech"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm({ ...form, stage: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equity (%)</label>
                  <input
                    type="number"
                    value={form.equity}
                    onChange={e => setForm({ ...form, equity: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateDeal}>Create Deal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
