import React, { useEffect, useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { paymentService } from '../../services/paymentService';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const [balance, setBalance] = useState({ balance: 0, depositsTotal: 0, withdrawalsTotal: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, historyData, investorsData, entrepreneursData] = await Promise.all([
        paymentService.getBalance(),
        paymentService.getHistory(),
        profileService.getInvestors(),
        profileService.getEntrepreneurs()
      ]);
      setBalance(balanceData);
      setTransactions(historyData);
      setUsers([...investorsData, ...entrepreneursData]);
    } catch (err) {
      console.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount!');
      return;
    }
    setProcessing(true);
    try {
      if (modalType === 'deposit') {
        await paymentService.deposit(Number(amount), description);
        toast.success('Deposit successful!');
      } else if (modalType === 'withdraw') {
        await paymentService.withdraw(Number(amount), description);
        toast.success('Withdrawal successful!');
      } else if (modalType === 'transfer') {
        if (!receiverId) {
          toast.error('Please select a receiver!');
          setProcessing(false);
          return;
        }
        await paymentService.transfer(receiverId, Number(amount), description);
        toast.success('Transfer successful!');
      }
      setShowModal(false);
      setAmount('');
      setDescription('');
      setReceiverId('');
      loadData();
    } catch (err) {
      toast.error('Transaction failed!');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (type: 'deposit' | 'withdraw' | 'transfer') => {
    setModalType(type);
    setAmount('');
    setDescription('');
    setReceiverId('');
    setShowModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={18} className="text-green-600" />;
      case 'withdrawal': return <ArrowUpRight size={18} className="text-red-600" />;
      case 'transfer': return <ArrowLeftRight size={18} className="text-blue-600" />;
      default: return <DollarSign size={18} className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'transfer': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage your transactions and balance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <CardBody className="py-6">
            <p className="text-primary-100 text-sm">Total Balance</p>
            <p className="text-3xl font-bold mt-1">${balance.balance.toLocaleString()}</p>
            <p className="text-primary-200 text-xs mt-2">Available funds</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-6">
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowDownLeft size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">${balance.depositsTotal.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 py-6">
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowUpRight size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">${balance.withdrawalsTotal.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button leftIcon={<ArrowDownLeft size={18} />} onClick={() => openModal('deposit')} className="bg-green-600 hover:bg-green-700">
          Deposit
        </Button>
        <Button leftIcon={<ArrowUpRight size={18} />} onClick={() => openModal('withdraw')} variant="outline">
          Withdraw
        </Button>
        <Button leftIcon={<ArrowLeftRight size={18} />} onClick={() => openModal('transfer')} variant="outline">
          Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
              <p className="text-gray-500 mt-1">Make your first deposit to get started!</p>
              <Button className="mt-4" onClick={() => openModal('deposit')}>Make a Deposit</Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <div key={tx._id} className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={"p-2 rounded-lg " + (tx.type === 'deposit' ? 'bg-green-50' : tx.type === 'withdrawal' ? 'bg-red-50' : 'bg-blue-50')}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500">{tx.description || 'No description'}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                      {tx.type === 'transfer' && (
                        <p className="text-xs text-blue-500">
                          To: {tx.receiver?.name || 'Unknown'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={"text-lg font-bold " + getTransactionColor(tx.type)}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} size="sm">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">{modalType}</h2>
            <div className="space-y-4">
              {modalType === 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receiver *</label>
                  <select
                    value={receiverId}
                    onChange={e => setReceiverId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select receiver...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount..."
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleTransaction} disabled={processing}>
                {processing ? 'Processing...' : 'Confirm ' + modalType}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
