
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Settings, Mail } from 'lucide-react';

interface WorkflowVisualizerProps {
  workflow: any;
}

export const WorkflowVisualizer = ({ workflow }: WorkflowVisualizerProps) => {
  if (!workflow) {
    return (
      <Card className="p-8 text-center bg-gray-800/30 backdrop-blur-sm border-gray-600">
        <div className="text-gray-400">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Workflow Selected</h3>
          <p>Generate a workflow in the Chat tab to visualize it here.</p>
        </div>
      </Card>
    );
  }

  const getNodeIcon = (nodeType: string) => {
    if (nodeType.includes('webhook')) return <Zap className="w-6 h-6" />;
    if (nodeType.includes('email')) return <Mail className="w-6 h-6" />;
    return <Settings className="w-6 h-6" />;
  };

  const getNodeColor = (nodeType: string) => {
    if (nodeType.includes('webhook')) return 'bg-yellow-500';
    if (nodeType.includes('email')) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  return (
    <Card className="p-6 bg-gray-800/30 backdrop-blur-sm border-gray-600">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Workflow Visualizer</h3>
        <p className="text-gray-300">{workflow.name}</p>
        <Badge variant={workflow.active ? "default" : "secondary"} className="mt-2">
          {workflow.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Workflow Flow */}
        <div className="flex items-center justify-center space-x-4 overflow-x-auto min-h-[200px] p-4 bg-gray-900/50 rounded-lg">
          {workflow.json?.nodes?.map((node: any, index: number) => (
            <div key={node.id} className="flex items-center">
              <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                <div className={`w-16 h-16 ${getNodeColor(node.type)} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  {getNodeIcon(node.type)}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{node.name}</p>
                  <p className="text-xs text-gray-400">{node.type.split('.').pop()}</p>
                </div>
              </div>
              
              {index < workflow.json.nodes.length - 1 && (
                <ArrowRight className="w-6 h-6 text-blue-400 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Node Details */}
        <div className="grid gap-4 md:grid-cols-2">
          {workflow.json?.nodes?.map((node: any) => (
            <Card key={node.id} className="p-4 bg-gray-900/50 border-gray-600">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 ${getNodeColor(node.type)} rounded-full flex items-center justify-center text-white`}>
                  {getNodeIcon(node.type)}
                </div>
                <div>
                  <h4 className="font-medium text-white">{node.name}</h4>
                  <p className="text-xs text-gray-400">{node.type}</p>
                </div>
              </div>
              
              {node.parameters && Object.keys(node.parameters).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-300">Parameters:</p>
                  <div className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                    <pre className="text-green-400">
                      {JSON.stringify(node.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Connections */}
        {workflow.json?.connections && Object.keys(workflow.json.connections).length > 0 && (
          <Card className="p-4 bg-gray-900/50 border-gray-600">
            <h4 className="font-medium text-white mb-3">Connections</h4>
            <div className="space-y-2">
              {Object.entries(workflow.json.connections).map(([from, connections]: [string, any]) => (
                <div key={from} className="text-sm">
                  <span className="text-blue-400">{from}</span>
                  <span className="text-gray-400"> → </span>
                  {connections.main?.[0]?.map((to: string, index: number) => (
                    <span key={index} className="text-cyan-400">
                      {to}{index < connections.main[0].length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
};
