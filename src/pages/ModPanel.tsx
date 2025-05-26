
import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import AuditLog from '@/components/AuditLog';
import { useFlaggedMessages } from '@/hooks/useFlaggedMessages';
import { useModeratorStats } from '@/hooks/useModeratorStats';
import { ModStats } from '@/components/mod/ModStats';
import { ModNavigation } from '@/components/mod/ModNavigation';
import { ModGuidelines } from '@/components/mod/ModGuidelines';
import { FlaggedMessagesList } from '@/components/mod/FlaggedMessagesList';

const ModPanel = () => {
  const { user } = useAuth();
  const [showAuditLog, setShowAuditLog] = useState(false);
  
  const { flaggedMessages, isLoading, refreshFlaggedMessages } = useFlaggedMessages();
  const { todayActionsCount, refreshStats } = useModeratorStats();
  
  console.log('ModPanel render - flaggedMessages:', flaggedMessages);
  console.log('ModPanel render - isLoading:', isLoading);
  console.log('ModPanel render - flaggedMessages count:', flaggedMessages.length);
  console.log('ModPanel render - todayActionsCount:', todayActionsCount);
  
  const handleMessageAction = () => {
    console.log('Message action triggered, refreshing...');
    refreshFlaggedMessages();
    refreshStats(); // Refresh the real stats instead of incrementing mock counter
  };

  const toggleAuditLog = () => {
    setShowAuditLog(!showAuditLog);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        title="Mod Panel" 
        userIdentifier={user?.role} 
      />
      
      <div className="p-4">
        <ModStats 
          pendingCount={flaggedMessages.length}
          actionCount={todayActionsCount}
        />
        
        <ModNavigation 
          showAuditLog={showAuditLog}
          onToggle={toggleAuditLog}
        />
        
        {showAuditLog ? (
          <AuditLog limit={15} />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Debug: Found {flaggedMessages.length} flagged messages 
              {isLoading && ' (Loading...)'} 
              {!isLoading && flaggedMessages.length === 0 && ' (No pending flags)'}
            </div>
            <FlaggedMessagesList
              messages={flaggedMessages}
              isLoading={isLoading}
              onAction={handleMessageAction}
            />
          </>
        )}
        
        {!showAuditLog && <ModGuidelines />}
      </div>
    </div>
  );
};

export default ModPanel;
