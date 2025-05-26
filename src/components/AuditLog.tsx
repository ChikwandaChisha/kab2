
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAuditLogs } from '@/services/auditLogger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AuditEntry = {
  id: string;
  event_type: string;
  timestamp: string;
  sender_token_id?: string;
  recipient_id?: string;
  metadata?: any;
};

interface AuditLogProps {
  limit?: number;
}

const AuditLog = ({ limit = 20 }: AuditLogProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching audit logs...');
        
        // First try using the audit service helper
        const serviceData = await getAuditLogs('all', limit);
        console.log('Audit logs from service:', serviceData);
        
        // Also try direct database query for comparison
        const { data: directData, error: directError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);

        console.log('Direct database query result:', { directData, directError });
        
        // Try to get a count of total records
        const { count, error: countError } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total audit log count:', { count, countError });
        
        // Set debug info
        setDebugInfo(`Service returned: ${serviceData?.length || 0} logs. Direct query returned: ${directData?.length || 0} logs. Total count: ${count || 0}`);
        
        if (directError) {
          console.error('Error fetching audit logs:', directError);
          setAuditLogs([]);
        } else {
          console.log('Retrieved audit logs from database:', directData);
          setAuditLogs(directData || []);
        }
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        setAuditLogs([]);
        setDebugInfo(`Error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [limit]);

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('flag')) return 'bg-red-100 text-red-800';
    if (eventType.includes('login') || eventType.includes('signup')) return 'bg-blue-100 text-blue-800';
    if (eventType.includes('send') || eventType.includes('message')) return 'bg-green-100 text-green-800';
    if (eventType.includes('decrypt')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTokenId = (log: AuditEntry) => {
    return log.sender_token_id || log.metadata?.token_id || '-';
  };

  const getDetails = (log: AuditEntry) => {
    if (log.metadata?.action) return log.metadata.action;
    if (log.metadata?.reason) return log.metadata.reason;
    if (log.recipient_id) return `Target: ${log.recipient_id}`;
    return '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium">System Audit Log</h2>
        <p className="text-sm text-gray-500">Security and activity tracking from database</p>
        {debugInfo && (
          <p className="text-xs text-blue-600 mt-1">Debug: {debugInfo}</p>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading audit logs from database...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Token ID</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(log.event_type)}`}>
                      {formatEventType(log.event_type)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {getTokenId(log)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {getDetails(log)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {!isLoading && auditLogs.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500">No audit logs found in database</p>
          <p className="text-xs text-gray-400 mt-2">Try performing some actions like logging in, sending messages, or flagging content to generate audit logs.</p>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
