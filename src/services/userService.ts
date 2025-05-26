
import { User, Role } from '@/types';

// Mock users database
let users: User[] = [
  {
    id: 'WC-2025-089',
    username: 'recipient_user',
    role: 'User',
    isActive: true,
    createdAt: '2025-05-01'
  },
  {
    id: 'WC-2025-088',
    username: 'sender_user',
    role: 'User',
    isActive: false,
    createdAt: '2025-04-28'
  }
];

export const userService = {
  // Get all users (for admin)
  getAllUsers: (): User[] => {
    return users;
  },
  
  // Get active users count (for admin dashboard)
  getActiveUsersCount: (): number => {
    return users.filter(u => u.isActive).length;
  },
  
  // Add a new user (for admin)
  addUser: (username: string, password: string, role: Role): User => {
    const newUser: User = {
      id: `WC-2025-${Math.floor(Math.random() * 900 + 100)}`,
      username,
      role,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    
    // In a real app, we would hash the password and store it securely
    console.log(`User created: ${username} with role ${role}`);
    
    return newUser;
  },
  
  // Suspend a user (for admin)
  suspendUser: (userId: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = false;
      return true;
    }
    return false;
  },
  
  // Activate a user (for admin)
  activateUser: (userId: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = true;
      return true;
    }
    return false;
  },
  
  // Update user role (for admin)
  updateUserRole: (userId: string, role: Role): boolean => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      return true;
    }
    return false;
  }
};
