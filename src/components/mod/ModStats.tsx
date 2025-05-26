
interface ModStatsProps {
  pendingCount: number;
  actionCount: number;
}

export const ModStats = ({ pendingCount, actionCount }: ModStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <div className="text-gray-600 mb-2">Pending Review</div>
        <div className="text-4xl font-bold text-primary">{pendingCount}</div>
      </div>
      
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <div className="text-gray-600 mb-2">Today's Actions</div>
        <div className="text-4xl font-bold text-gray-700">{actionCount}</div>
      </div>
    </div>
  );
};
