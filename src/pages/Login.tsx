import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SignUp } from '@/components/SignUp';
import Header from '@/components/Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Don't try to redirect while authentication is still loading
  if (authLoading) {
    return null;
  }

  if (isAuthenticated) {
    // Use Navigate component for redirection
    return <Navigate to="/messages" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setIsLoading(false);
      }
      // Don't set isLoading to false on success as the page will redirect
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loginAsModerator = async () => {
    setIsLoading(true);
    try {
      // Use the actual moderator credentials from your database
      const success = await login('chikwanda.chisha.26@dartmouth.edu', '123456');
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setIsLoading(true);
    try {
      // Use pre-set admin credentials
      const success = await login('admin@example.com', 'admin123');
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setShowSignUp(!showSignUp);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="WhisperChain+" />

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {showSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600">Secure, anonymous messaging platform</p>
        </div>

        {showSignUp ? (
          <SignUp onToggleView={toggleView} />
        ) : (
          <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="w-full"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <Label htmlFor="password" className="block text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Secure Login'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={toggleView}
                className="text-primary hover:underline text-sm"
                type="button"
              >
                Need an account? Sign up
              </button>
            </div>
            
            <div className="mt-2 text-center">
              <Link
                to="/moderator-signup"
                className="text-blue-600 hover:underline text-sm"
              >
                Register as Moderator
              </Link>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <p className="text-sm text-center text-gray-500 mb-4">Quick Access Profiles</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loginAsModerator}
                  disabled={isLoading}
                >
                  Login as Moderator
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loginAsAdmin}
                  disabled={isLoading}
                >
                  Login as Admin
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-gray-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          End-to-end encrypted messaging
        </div>
      </div>
    </div>
  );
};

export default Login;
