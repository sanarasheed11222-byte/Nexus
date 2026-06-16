import React, { useState } from 'react';
import { Search, Book, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const faqs = [
  {
    question: 'How do I connect with investors?',
    answer: 'Browse our investor directory and send connection requests. Once an investor accepts, you can start messaging them directly through our platform.'
  },
  {
    question: 'What should I include in my startup profile?',
    answer: 'Your startup profile should include a compelling pitch, funding needs, team information, market opportunity, and any traction or metrics that demonstrate your progress.'
  },
  {
    question: 'How do I share documents securely?',
    answer: 'Upload documents to your secure document vault and selectively share them with connected investors. All documents are encrypted and access-controlled.'
  },
  {
    question: 'What are collaboration requests?',
    answer: 'Collaboration requests are formal expressions of interest from investors. They indicate that an investor wants to learn more about your startup and potentially discuss investment opportunities.'
  },
  {
    question: 'How does the meeting scheduling work?',
    answer: 'You can schedule meetings directly through the platform. Both parties receive notifications and can accept or reject meeting requests. The system prevents double-booking automatically.'
  },
  {
    question: 'Is my data secure on Nexus?',
    answer: 'Yes! We use industry-standard encryption, JWT authentication, and role-based access control to ensure your data is always secure and private.'
  }
];

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields!');
      return;
    }
    setSending(true);
    try {
      await api.post('/help/contact', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900">How can we help you?</h1>
        <p className="text-gray-600 mt-2">Search our knowledge base or contact support</p>
        <div className="mt-6 max-w-lg mx-auto relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Book size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documentation</h3>
              <p className="text-sm text-gray-500">Read our guides</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <MessageCircle size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-500">Chat with support</p>
            </div>
          </CardBody>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardBody className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Phone size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-500">Call us directly</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">
            Frequently Asked Questions
            {searchQuery && <span className="text-sm font-normal text-gray-500 ml-2">({filteredFaqs.length} results)</span>}
          </h2>
        </CardHeader>
        <CardBody>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8">
              <Search size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                    {openFaq === index
                      ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                      : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                    }
                  </button>
                  {openFaq === index && (
                    <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Still need help?</h2>
          <p className="text-gray-600 text-sm mt-1">Send us a message and we'll get back to you within 24 hours</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="What is your question about?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?"
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={16} />
              <span>support@businessnexus.com</span>
            </div>
            <Button onClick={handleSendMessage} disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
