
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Play, Pause, Trash2 } from 'lucide-react';

interface WorkflowHistoryItem {
  id: string;
  name: string;
  prompt: string;
  created_at: string;
  active: boolean;
  nodes_count: number;
}

export const WorkflowHistory = () => {
  const [workflows, setWorkflows] = useState<WorkflowHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      // Simulated API call to fetch workflow history
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockWorkflows: WorkflowHistoryItem[] = [
        {
          id: '1',
          name: 'Email to Slack Notification',
          prompt: 'Create a workflow to send Slack notifications when new emails arrive',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          active: true,
          nodes_count: 3
        },
        {
          id: '2', 
          name: 'Form Submission Handler',
          prompt: 'Process form submissions and save to database',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          active: false,
          nodes_count: 4
        },
        {
          id: '3',
          name: 'SMS Alert System',
          prompt: 'Send SMS alerts for critical system events',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          active: true,
          nodes_count: 2
        }
      ];
      
      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = async (id: string, active: boolean) => {
    // Simulated API call
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, active } : w
    ));
  };

  const handleDelete = async (id: string) => {
    // Simulated API call
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center bg-gray-800/30 backdrop-blur-sm border-gray-600">
        <div className="text-gray-400">Loading workflow history...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        <Button onClick={fetchWorkflows} variant="outline" className="border-gray-600">
          Refresh
        </Button>
      </div>

      {filteredWorkflows.length === 0 ? (
        <Card className="p-8 text-center bg-gray-800/30 backdrop-blur-sm border-gray-600">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No Workflows Found</h3>
            <p>
              {searchTerm 
                ? "No workflows match your search criteria."
                : "You haven't created any workflows yet."
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="p-6 bg-gray-800/30 backdrop-blur-sm border-gray-600 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <Badge variant={workflow.active ? "default" : "secondary"}>
                      {workflow.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{workflow.prompt}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span>{workflow.nodes_count} nodes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={workflow.active ? "outline" : "default"}
                    onClick={() => handleToggleActive(workflow.id, !workflow.active)}
                    className="border-gray-600"
                  >
                    {workflow.active ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(workflow.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
