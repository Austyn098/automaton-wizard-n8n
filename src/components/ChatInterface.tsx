
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflow?: any;
}

interface ChatInterfaceProps {
  onWorkflowGenerated: (workflow: any) => void;
}

export const ChatInterface = ({ onWorkflowGenerated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulated API call to Python backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock workflow response
      const mockWorkflow = {
        id: `workflow_${Date.now()}`,
        name: `Auto-Generated: ${input.slice(0, 50)}...`,
        json: {
          name: `Workflow for: ${input}`,
          nodes: [
            {
              id: "trigger1",
              name: "Webhook Trigger",
              type: "n8n-nodes-base.webhook",
              parameters: { httpMethod: "POST", path: "webhook" },
              position: [250, 300]
            },
            {
              id: "action1", 
              name: "Process Data",
              type: "n8n-nodes-base.set",
              parameters: { values: { string: [{ name: "message", value: "Processed!" }] } },
              position: [450, 300]
            }
          ],
          connections: {
            "Webhook Trigger": { "main": [["Process Data"]] }
          },
          active: false
        },
        active: false
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I've created a workflow based on your request: "${input}"`,
        timestamp: new Date(),
        workflow: mockWorkflow,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentWorkflow(mockWorkflow);
      onWorkflowGenerated(mockWorkflow);

      // Log to Supabase (placeholder)
      console.log('Logging to Supabase:', { prompt: input, response: mockWorkflow });

      toast({
        title: "Workflow Generated",
        description: "Your n8n workflow has been created successfully!",
      });

    } catch (error) {
      console.error('Error generating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to generate workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateWorkflow = async (workflow: any, active: boolean) => {
    try {
      // Simulated activation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedWorkflow = { ...workflow, active };
      setCurrentWorkflow(updatedWorkflow);
      
      toast({
        title: active ? "Workflow Activated" : "Workflow Deactivated",
        description: `The workflow has been ${active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-800/30 rounded-t-lg backdrop-blur-sm">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to ODIA AI Agent</h3>
            <p>Start by describing the workflow you'd like to create...</p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="text-blue-400">💡 Try: "Create a workflow to send SMS when new email arrives"</p>
              <p className="text-blue-400">💡 Try: "Set up Slack notifications for form submissions"</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.workflow && (
                <Card className="mt-4 p-4 bg-gray-800 border-gray-600">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-cyan-400">{message.workflow.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Active</span>
                        <Switch
                          checked={message.workflow.active}
                          onCheckedChange={(checked) => handleActivateWorkflow(message.workflow, checked)}
                        />
                        {message.workflow.active ? (
                          <Play className="w-4 h-4 text-green-400" />
                        ) : (
                          <Pause className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      <pre className="text-green-400">
                        {JSON.stringify(message.workflow.json, null, 2)}
                      </pre>
                    </div>
                  </div>
                </Card>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating workflow...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-b-lg border-t border-gray-600">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the workflow you want to create..."
            className="flex-1 min-h-[50px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
