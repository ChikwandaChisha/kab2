import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.png';

interface HeaderProps {
  title: string;
  userIdentifier?: string;
}

const Header = ({ title, userIdentifier }: HeaderProps) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          {/* Logo */}
          <img src={logo} alt="WhisperChain+ Logo" className="h-8 w-8 mr-3" />
          
          <span className="text-xl font-bold">{title}</span>
        </Link>
      </div>
      
      <div className="flex items-center">
        {userIdentifier && (
          <div className="mr-4 flex items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
            </svg>
            <span>{userIdentifier}</span>
          </div>
        )}
        
        {user && (
          <div className="flex items-center text-gray-600 space-x-2">
            <button 
              onClick={logout}
              className="p-2 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
