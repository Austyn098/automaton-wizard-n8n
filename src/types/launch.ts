
export interface Launch {
  id: string;
  product_name: string;
  slug: string;
  description: string;
  price: number;
  deployed: boolean;
  status: 'pending' | 'live' | 'failed';
  subdomain_url?: string;
  created_at: string;
  launched_by?: string;
  error_message?: string;
  updated_at: string;
  prompt: string;
}

export interface LaunchInsert {
  product_name: string;
  slug: string;
  description: string;
  price: number;
  prompt: string;
  launched_by?: string;
  status?: 'pending' | 'live' | 'failed';
}

export interface Deployment {
  id: string;
  launch_id: string;
  status: 'pending' | 'deploying' | 'success' | 'failed';
  deployment_url?: string;
  error_details?: string;
  started_at: string;
  completed_at?: string;
}
