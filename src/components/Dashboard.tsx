import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, FileText, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    classes: 0,
    groups: 0,
    tasks: 0,
    messages: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classes = await response.json();
      setStats(prev => ({ ...prev, classes: classes.length }));
      // setStats(prev => ({ ...prev, groups: groups.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    try {
      const response = await fetch('http://localhost:3001/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const groups = await response.json();
      setStats(prev => ({ ...prev, groups: groups.length }));
      // setStats(prev => ({ ...prev, groups: groups.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
     try {
      const response = await fetch('http://localhost:3001/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasks = await response.json();
      setStats(prev => ({ ...prev, tasks: tasks.length }));
      // setStats(prev => ({ ...prev, groups: groups.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
      try {
      const response = await fetch('http://localhost:3001/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = await response.json();
      setStats(prev => ({ ...prev, messages: messages.length }));
      // setStats(prev => ({ ...prev, groups: groups.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard: React.FC<{ icon: React.ElementType; title: string; value: number; color: string }> = 
    ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.name} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de votre activité sur EduClass Pro
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          title="Classes"
          value={stats.classes}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Groupes"
          value={stats.groups}
          color="bg-green-500"
        />
        <StatCard
          icon={FileText}
          title="Tâches"
          value={stats.tasks}
          color="bg-purple-500"
        />
        <StatCard
          icon={MessageSquare}
          title="Messages"
          value={stats.messages}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Nouvelle classe créée</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Groupe formé</p>
                <p className="text-xs text-gray-500">Il y a 1 jour</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Tâche assignée</p>
                <p className="text-xs text-gray-500">Il y a 2 jours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Progression des projets</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Soumission du thème</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Terminé</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Validation du thème</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Terminé</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Chapitre 1</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En cours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Chapitre 2</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">À venir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;