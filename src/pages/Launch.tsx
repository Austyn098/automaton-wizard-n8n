
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, DollarSign, Type, FileText } from 'lucide-react';
import { LaunchInsert } from '@/types/launch';

const Launch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    prompt: ''
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validateForm = () => {
    const { product_name, description, price, prompt } = formData;
    return product_name.trim() && description.trim() && price.trim() && prompt.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Submitting launch:', formData);

    try {
      const slug = generateSlug(formData.product_name);
      
      // Check for duplicate slug using raw query since 'launches' isn't in types
      const { data: existing } = await supabase
        .rpc('check_slug_exists', { slug_to_check: slug });

      if (existing) {
        toast({
          title: "Duplicate Product",
          description: "A product with this name already exists",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Insert new launch using raw SQL
      const launchData: LaunchInsert = {
        product_name: formData.product_name.trim(),
        slug: slug,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        prompt: formData.prompt.trim(),
        launched_by: 'admin@odiaaa.com',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('launches' as any)
        .insert(launchData)
        .select()
        .single();

      if (error) {
        console.error('Launch error:', error);
        toast({
          title: "Launch Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Launch created:', data);
      
      toast({
        title: "Launch Queued Successfully!",
        description: `${formData.product_name} has been queued for deployment. Check /launches for status.`
      });

      // Reset form
      setFormData({
        product_name: '',
        description: '',
        price: '',
        prompt: ''
      });

      // Navigate to launches page
      setTimeout(() => navigate('/launches'), 1500);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-4">
      <div className="container mx-auto max-w-2xl pt-20">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Rocket className="h-12 w-12 text-blue-400" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Launch New Product
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Create and deploy your AI-powered product instantly
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product_name" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Product Name
                </Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="WhatsApp CRM Pro"
                  className="bg-gray-700/50 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Advanced WhatsApp automation and CRM system for Nigerian businesses..."
                  className="bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price (₦)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="5000"
                  className="bg-gray-700/50 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  AI Prompt
                </Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Create a WhatsApp CRM system that helps Nigerian businesses manage customer relationships..."
                  className="bg-gray-700/50 border-gray-600 text-white min-h-[120px]"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !validateForm()}
              >
                {loading ? "Launching..." : "🚀 Launch Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Launch;
