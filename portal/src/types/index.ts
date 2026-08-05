export interface Customer {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

export interface License {
  id: number;
  license_key: string;
  product_name: string;
  status: 'active' | 'suspended' | 'expired' | 'cancelled';
  max_machines: number;
  expires_at: string | null;
  created_at: string;
  customer_name: string;
  customer_id: number;
  active_machine_count: number;
}

export interface Activation {
  id: number;
  machine_id: string;
  app_version: string | null;
  is_active: boolean;
  first_activated_at: string;
  last_seen_at: string;
}

export interface LicenseDetail extends License {
  updated_at: string;
  activations: Activation[];
}

export interface DashboardStats {
  totalCustomers: number;
  totalLicenses: number;
  activeLicenses: number;
  suspendedLicenses: number;
  expiredLicenses: number;
  cancelledLicenses: number;
  totalActiveMachines: number;
}
