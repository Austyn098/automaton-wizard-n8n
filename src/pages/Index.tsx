
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from '@/components/ChatInterface';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { WorkflowHistory } from '@/components/WorkflowHistory';
import { Header } from '@/components/Header';
import { Rocket, Eye, History, Plus } from 'lucide-react';

const Index = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleWorkflowGenerated = (workflow) => {
    setCurrentWorkflow(workflow);
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
              ODIA n8n AI Agent
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Create powerful workflows with natural language
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                onClick={() => window.location.href = '/launch'}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Launch Product
              </Button>
              <Button 
                onClick={() => window.location.href = '/launches'}
                variant="outline"
                size="lg"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Launches
              </Button>
            </div>
          </div>

          {/* ODIAAA Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <Rocket className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Automated Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Create and deploy products instantly with AI-powered automation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <Eye className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Track deployment status and receive WhatsApp notifications
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <History className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Workflow History</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">
                  Complete audit trail of all deployments and executions
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">
                Chat Interface
              </TabsTrigger>
              <TabsTrigger value="visualizer" className="data-[state=active]:bg-blue-600">
                Workflow Visualizer
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <ChatInterface onWorkflowGenerated={handleWorkflowGenerated} />
            </TabsContent>

            <TabsContent value="visualizer" className="mt-6">
              <WorkflowVisualizer workflow={currentWorkflow} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <WorkflowHistory key={refreshHistory} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
