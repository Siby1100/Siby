import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Send, Globe, Lock, Plus } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  isPublic: boolean;
  createdAt: string;
}

const Messages: React.FC = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<Message[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newMessage, setNewMessage] = useState({
    content: '',
    receiverId: '',
    isPublic: true
  });
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchMessages();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classesData = await response.json();
      setClasses(classesData);
      if (classesData.length > 0) {
        setSelectedClass(classesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedClass) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/classes/${selectedClass}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messagesData = await response.json();
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !newMessage.content.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/classes/${selectedClass}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.content,
          receiverId: newMessage.receiverId || null,
          isPublic: newMessage.isPublic
        })
      });
      
      if (response.ok) {
        setNewMessage({ content: '', receiverId: '', isPublic: true });
        setShowCompose(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };




  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const selectedClassName = classes.find(c => c.id === selectedClass)?.name || '';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communiquez avec vos classes</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau message
        </button>
      </div>

      {classes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une classe</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{selectedClassName}</h2>
          <p className="text-gray-600 text-sm">Messages de la classe</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucun message dans cette classe</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.senderId === user?.id ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{message.senderName}</span>
                      {message.isPublic ? (
                        <Globe className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau message</h2>
            <form onSubmit={sendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={newMessage.isPublic}
                      onChange={() => setNewMessage({ ...newMessage, isPublic: true, receiverId: '' })}
                      className="mr-2"
                    />
                    <Globe className="w-4 h-4 mr-1 text-green-500" />
                    Message public
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!newMessage.isPublic}
                      onChange={() => setNewMessage({ ...newMessage, isPublic: false })}
                      className="mr-2"
                    />
                    <Lock className="w-4 h-4 mr-1 text-orange-500" />
                    Message privé
                  </label>
                </div>
              </div>

              {!newMessage.isPublic && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destinataire (email)</label>
                  <input
                    type="email"
                    value={newMessage.receiverId}
                    onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tapez votre message..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;