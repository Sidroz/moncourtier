export interface Courtier {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  specialties?: string[];
  firmName?: string; // Ancien champ à conserver pour compatibilité
  firmAddress?: string; // Ancien champ à conserver pour compatibilité
  cabinetId?: string; // Référence au cabinet auquel le courtier appartient
  role?: 'admin' | 'manager' | 'associate' | 'employee'; // Rôle dans le cabinet
  website?: string;
  type: 'courtier';
  location?: { lat: number; lng: number };
  description?: string;
  experience?: { value: number; unit: string };
  languages?: string[];
  paymentMethods?: string[];
  education?: string[];
  certifications?: string[];
  services?: string[];
  accessMethods?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
} 