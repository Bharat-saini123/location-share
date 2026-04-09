export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface FriendLocation {
  id: string;
  user_id: string;
  name: string;
  email: string;
  image: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  updated_at: string;
  is_sharing: boolean;
}

export interface LocationUpdate {
  user_id: string;
  latitude: number;
  longitude: number;
  city?: string;
}
