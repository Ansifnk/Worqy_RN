export type ClientType = 'Individual' | 'Company';

export type ClientStatus = 'Lead' | 'Active' | 'Inactive' | 'Completed' | 'On Hold';

export interface ClientFormData {
  // Essential fields
  clientType: ClientType;
  name: string;
  companyName?: string;
  profilePic?: string;
  phone?: string;
  email?: string;

  // Optional fields
  website?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  tags?: string[];
  status: ClientStatus;
  clientSource?: string;
}

export interface ClientItem extends ClientFormData {
  id: string;
  category: string;
  logoType?: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}
