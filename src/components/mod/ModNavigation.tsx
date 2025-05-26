
interface ModNavigationProps {
  showAuditLog: boolean;
  onToggle: () => void;
}

export const ModNavigation = ({ showAuditLog, onToggle }: ModNavigationProps) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold">
        {showAuditLog ? "Audit Log" : "Flagged Messages"}
      </h2>
      <button 
        className="text-primary flex items-center hover:underline"
        onClick={onToggle}
      >
        {showAuditLog ? (
          <>
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Flagged Messages
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Audit Log
          </>
        )}
      </button>
    </div>
  );
};
