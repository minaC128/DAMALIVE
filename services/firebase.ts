
/**
 * Mock Firebase Authentication Service
 * Enhanced to support custom user data input and profile updates.
 */

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

type AuthCallback = (user: User | null) => void;
const subscribers: AuthCallback[] = [];

const getStoredUser = (): User | null => {
  const data = localStorage.getItem('damalive_mock_user');
  return data ? JSON.parse(data) : null;
};

let currentUser: User | null = getStoredUser();

export const auth = {
  get currentUser() { return currentUser; }
};

export const onAuthStateChanged = (authObj: any, callback: AuthCallback) => {
  subscribers.push(callback);
  callback(currentUser);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) subscribers.splice(index, 1);
  };
};

const notifySubscribers = () => {
  subscribers.forEach(cb => cb(currentUser));
};

export const updateMockProfile = (updates: Partial<User>) => {
  if (currentUser) {
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem('damalive_mock_user', JSON.stringify(currentUser));
    notifySubscribers();
  }
};

export const loginWithGoogle = async (customData?: { name: string, email: string }) => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      const name = customData?.name || '準媽媽 Sarah';
      const email = customData?.email || 'sarah.mom@example.com';
      
      const mockPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f7870&color=fff&size=128`;

      const mockUser: User = {
        uid: 'google-mock-id-' + Math.random().toString(36).substr(2, 9),
        displayName: name,
        email: email,
        photoURL: customData ? mockPhoto : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpG9yWL_l_8M77rEUq9GkNpEHAXuVpsMnZ5RXhf21TxVJzkQz76-lpHQ_Qm8meorxPOqqBdLHIlq7CN3otV0Pbnt5CE79RgyFLgGML9CuVq6Eq749WnTkQM6NjLIk4_BPUWOG29_vRZQ8Wu_kVOzS9oQjyj_bK7IOpF5hoB9b0pJWmqtIHI-pzo5KIksTy84bJsepe4WJkgdRSrqFUkOXk-cL8tl3TiWNdDw9VRchpr-67yxyP22Hvz9QcbU8Kt9N2mfl_-9vKUA4U'
      };
      
      currentUser = mockUser;
      localStorage.setItem('damalive_mock_user', JSON.stringify(mockUser));
      notifySubscribers();
      resolve({ user: mockUser });
    }, 800);
  });
};

export const logout = async () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('damalive_mock_user');
      notifySubscribers();
      resolve();
    }, 400);
  });
};
