
interface FlaggedMessageActionsProps {
  onFreeze: () => void;
  onDismiss: () => void;
  viewContentButton: React.ReactNode;
}

export const FlaggedMessageActions = ({ 
  onFreeze, 
  onDismiss,
  viewContentButton 
}: FlaggedMessageActionsProps) => {
  return (
    <div className="flex space-x-2">
      {viewContentButton}
      <button 
        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        onClick={onFreeze}
      >
        Freeze Token
      </button>
      <button 
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
};
