
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Rocket, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Launch {
  id: string;
  product_name: string;
  slug: string;
  description: string;
  price: number;
  deployed: boolean;
  status: string;
  subdomain_url?: string;
  created_at: string;
  launched_by?: string;
}

const Launches = () => {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    fetchLaunches();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('launches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'launches'
        },
        () => {
          console.log('Launches table changed, refetching...');
          fetchLaunches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLaunches = async () => {
    try {
      const { data, error } = await supabase
        .from('launches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching launches:', error);
        toast({
          title: "Error",
          description: "Failed to fetch launches",
          variant: "destructive"
        });
        return;
      }

      setLaunches(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchNow = async (launchId: string, slug: string) => {
    setDeploying(launchId);
    console.log('Manually triggering launch for:', slug);

    try {
      const response = await fetch('/api/launch-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launch_id: launchId, manual: true })
      });

      if (response.ok) {
        toast({
          title: "Deployment Started",
          description: `${slug} deployment has been triggered`
        });
      } else {
        throw new Error('Failed to trigger deployment');
      }
    } catch (error) {
      console.error('Launch error:', error);
      toast({
        title: "Launch Failed",
        description: "Failed to trigger deployment",
        variant: "destructive"
      });
    } finally {
      setDeploying(null);
    }
  };

  const getStatusIcon = (status: string, deployed: boolean) => {
    if (deployed && status === 'live') return <CheckCircle className="h-4 w-4" />;
    if (status === 'failed') return <XCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (status: string, deployed: boolean) => {
    if (deployed && status === 'live') return 'bg-green-500';
    if (status === 'failed') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading launches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-4">
      <div className="container mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            Product Launches
          </h1>
          <p className="text-xl text-gray-300">
            Monitor and manage your automated deployments
          </p>
        </div>

        {launches.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 text-center p-8">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Launches Yet</h3>
            <p className="text-gray-400 mb-4">Create your first product launch to get started</p>
            <Button 
              onClick={() => window.location.href = '/launch'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Launch
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {launches.map((launch) => (
              <Card key={launch.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white mb-2">
                        {launch.product_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={`${getStatusColor(launch.status, launch.deployed)} text-white`}
                        >
                          {getStatusIcon(launch.status, launch.deployed)}
                          <span className="ml-1">
                            {launch.deployed && launch.status === 'live' ? 'Live' : 
                             launch.status === 'failed' ? 'Failed' : 'Pending'}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatPrice(launch.price)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">
                    {truncateText(launch.description, 100)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      <p><strong>Slug:</strong> {launch.slug}</p>
                      <p><strong>Created:</strong> {new Date(launch.created_at).toLocaleDateString()}</p>
                      {launch.launched_by && (
                        <p><strong>By:</strong> {launch.launched_by}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {launch.deployed && launch.subdomain_url ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(launch.subdomain_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Live
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleLaunchNow(launch.id, launch.slug)}
                          disabled={deploying === launch.id}
                        >
                          <Rocket className="h-4 w-4 mr-1" />
                          {deploying === launch.id ? 'Launching...' : 'Launch Now'}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://flutterwave.com/pay/${launch.slug}`, '_blank')}
                      >
                        Pay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Launches;
