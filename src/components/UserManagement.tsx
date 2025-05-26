
import { useState } from 'react';
import { User, Role } from '@/types';
import { userService } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';

interface UserManagementProps {
  initialUsers?: User[];
}

const UserManagement = ({ initialUsers = [] }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  // In a real app, these functions would make API calls
  const handleSuspendUser = (userId: string) => {
    try {
      userService.suspendUser(userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: false } 
          : user
      ));
      
      toast({
        title: "User Suspended",
        description: `User ${userId} has been suspended`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not suspend the user",
        variant: "destructive"
      });
    }
  };

  const handleActivateUser = (userId: string) => {
    try {
      userService.activateUser(userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: true } 
          : user
      ));
      
      toast({
        title: "User Activated",
        description: `User ${userId} has been activated`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not activate the user",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = (userId: string, role: Role) => {
    try {
      userService.updateUserRole(userId, role);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role } 
          : user
      ));
      
      toast({
        title: "Role Updated",
        description: `User ${userId} is now ${role}`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Could not update the user's role",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
        >
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add User
        </button>
      </div>
      
      {users.map(user => (
        <div key={user.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium block">{user.username}</span>
                  {user.email && (
                    <span className="text-sm text-gray-500">{user.email}</span>
                  )}
                </div>
                <span className={`ml-4 px-3 py-1 text-xs rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="text-gray-600 flex items-center mb-2">
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Role: {user.role}
              </div>
              
              <div className="text-gray-600 flex items-center">
                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Created: {user.createdAt}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <select 
                  className="border border-gray-300 rounded-md px-4 py-2 bg-white appearance-none pr-10 w-32"
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                >
                  <option value="Recipient">Recipient</option>
                  <option value="Sender">Sender</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
              
              {user.isActive ? (
                <button 
                  onClick={() => handleSuspendUser(user.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-center"
                >
                  Suspend
                </button>
              ) : (
                <button 
                  onClick={() => handleActivateUser(user.id)}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-center"
                >
                  Activate
                </button>
              )}
              
              <button 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
