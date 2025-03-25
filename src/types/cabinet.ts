export interface Cabinet {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  website?: string;
  phone?: string;
  email?: string;
  logo?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  adminId: string; // L'ID du courtier administrateur du cabinet
} 