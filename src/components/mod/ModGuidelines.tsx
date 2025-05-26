
export const ModGuidelines = () => {
  return (
    <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
      <div className="flex">
        <svg className="h-6 w-6 text-yellow-800 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div>
          <h3 className="font-bold text-yellow-800">Moderator Guidelines</h3>
          <p className="text-yellow-700 mt-1">
            Review content objectively. User identities are encrypted and inaccessible. Document all actions in the audit log.
          </p>
        </div>
      </div>
    </div>
  );
};
