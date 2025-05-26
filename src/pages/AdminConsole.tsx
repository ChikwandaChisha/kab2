
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import UserManagement from '@/components/UserManagement';
import { userService } from '@/services/userService';

const AdminConsole = () => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [systemHealth, setSystemHealth] = useState('Optimal');
  const [activeTab, setActiveTab] = useState('Users');
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const fetchData = async () => {
      // Get active users count
      const count = userService.getActiveUsersCount();
      setActiveUsers(count);
    };
    
    fetchData();
  }, []);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Users':
        return <UserManagement initialUsers={userService.getAllUsers()} />;
      case 'Keys':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Encryption Keys Management</h2>
            <p className="text-gray-600">
              This section allows for the management of public/private key pairs for secure messaging.
            </p>
          </div>
        );
      case 'Policies':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">System Policies</h2>
            <p className="text-gray-600">
              Configure system-wide policies and security settings.
            </p>
          </div>
        );
      case 'Audit':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
            <p className="text-gray-600">
              Review complete system audit trail for security compliance.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="Admin Console" 
        userIdentifier="System Admin" 
      />
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 mb-2">Active Users</div>
            <div className="text-4xl font-bold text-primary">{activeUsers}</div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <div className="text-gray-600 mb-2">System Health</div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-success rounded-full mr-2"></div>
              <span className="text-xl font-bold text-gray-700">{systemHealth}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex rounded-md shadow-sm">
            {['Users', 'Keys', 'Policies', 'Audit'].map(tab => (
              <button
                key={tab}
                className={`px-8 py-3 ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {renderTabContent()}
        
        <div className="mt-6">
          <button 
            className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Rotate System Keys
          </button>
        </div>
        
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <svg className="h-6 w-6 text-yellow-800 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
            <div>
              <h3 className="font-bold text-yellow-800">Security Notice</h3>
              <p className="text-yellow-700 mt-1">
                All user data is end-to-end encrypted. Admin actions are logged and audited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
