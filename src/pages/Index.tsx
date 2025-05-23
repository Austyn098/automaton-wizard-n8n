
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from '@/components/ChatInterface';
import { WorkflowVisualizer } from '@/components/WorkflowVisualizer';
import { WorkflowHistory } from '@/components/WorkflowHistory';
import { Header } from '@/components/Header';

const Index = () => {
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleWorkflowGenerated = (workflow) => {
    setCurrentWorkflow(workflow);
    setRefreshHistory(prev => prev + 1); // Trigger history refresh
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
            <p className="text-xl text-gray-300">
              Create powerful workflows with natural language
            </p>
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
