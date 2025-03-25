export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  type: 'client';
  createdAt?: Date | string;
  updatedAt?: Date | string;
} 