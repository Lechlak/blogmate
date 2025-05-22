import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Save, KeyRound, Globe, User, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useWordpressService } from '../services/wordpressService';

const SettingsPage: React.FC = () => {
  const { 
    wordpressConfig,
    setWordpressConfig
  } = useAppContext();

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const dalleApiKey = import.meta.env.VITE_DALLE_API_KEY;
  

  const [localWpSiteUrl, setLocalWpSiteUrl] = useState('');
  const [localWpUsername, setLocalWpUsername] = useState('');
  const [localWpPassword, setLocalWpPassword] = useState('');
  
  const [isTestingWp, setIsTestingWp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { validateCredentials } = useWordpressService();

  // Initialize local state with context values
  useEffect(() => {
    setLocalWpSiteUrl(wordpressConfig.siteUrl);
    setLocalWpUsername(wordpressConfig.username);
    setLocalWpPassword(''); // Don't populate password for security
  }, [geminiApiKey, dalleApiKey, wordpressConfig]);

  

  const handleTestWordPress = async () => {
    setError(null);
    setSuccess(null);
    setIsTestingWp(true);
    
    if (!localWpSiteUrl || !localWpUsername || !localWpPassword) {
      setError('All WordPress fields are required');
      setIsTestingWp(false);
      return;
    }
    
    // Update context with new WordPress config
    setWordpressConfig({
      siteUrl: localWpSiteUrl,
      username: localWpUsername,
      appPassword: localWpPassword,
    });
    
    try {
      const isValid = await validateCredentials();
      
      if (isValid) {
        setSuccess('WordPress credentials are valid!');
      } else {
        setError('Failed to authenticate with WordPress. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while testing WordPress credentials');
    } finally {
      setIsTestingWp(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto">      
      <div className="pt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe size={20} className="mr-2 text-indigo-600" />
            WordPress Configuration
          </h2>
          
          <div className="space-y-4">
            <Input
              id="wpSiteUrl"
              label="WordPress Site URL"
              value={localWpSiteUrl}
              onChange={(e) => setLocalWpSiteUrl(e.target.value)}
              placeholder="https://yourblog.com"
            />
            
            <Input
              id="wpUsername"
              label="WordPress Username"
              value={localWpUsername}
              onChange={(e) => setLocalWpUsername(e.target.value)}
              placeholder="Enter your WordPress username"
              icon={<User size={16} />}
            />
            
            <Input
              id="wpPassword"
              label="WordPress Application Password"
              type="password"
              value={localWpPassword}
              onChange={(e) => setLocalWpPassword(e.target.value)}
              placeholder="Enter your WordPress application password"
              icon={<Lock size={16} />}
            />
            
            <div className="pt-2">
              <Button
                onClick={handleTestWordPress}
                isLoading={isTestingWp}
                disabled={!localWpSiteUrl || !localWpUsername || !localWpPassword || isTestingWp}
              >
                Test & Save WordPress Credentials
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">How to generate an Application Password:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Log in to your WordPress admin dashboard</li>
                <li>Go to Users → Profile</li>
                <li>Scroll down to "Application Passwords"</li>
                <li>Enter a name (e.g., "Blog Generator") and click "Add New"</li>
                <li>Copy the generated password and paste it here</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SettingsPage;