const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
}

export interface AuctionItem {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  currentHighestBid: number | null;
  currentHighestBidderId: number | null;
  currentHighestBidder: User | null;
  createdByUserId: number;
  createdByUser: User | null;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended';
  version: number;
  imageUrls: string[];
  createdAt: string;
}

export interface Bid {
  id: string;
  amount: number;
  userId: number;
  user: User;
  auctionItemId: string;
  createdAt: string;
}

export interface PlaceBidResponse {
  bid: Bid;
  auction: AuctionItem;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Auto logout on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    console.error('API Error:', {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      message: data.message || 'Something went wrong',
      data
    });
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

function getOptions(options: RequestInit = {}): RequestInit {
  const token = localStorage.getItem('token');
  return {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }): Promise<LoginResponse> =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => handleResponse<LoginResponse>(r)),

  // Users
  getUsers: (): Promise<User[]> =>
    fetch(`${API_BASE}/users`, getOptions()).then((r) => handleResponse<User[]>(r)),

  // Auctions
  getAuctions: (): Promise<AuctionItem[]> =>
    fetch(`${API_BASE}/auctions`, getOptions()).then((r) => handleResponse<AuctionItem[]>(r)),

  getAuction: (id: string): Promise<AuctionItem> =>
    fetch(`${API_BASE}/auctions/${id}`, getOptions()).then((r) => handleResponse<AuctionItem>(r)),

  createAuction: (formData: FormData): Promise<AuctionItem> => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/auctions`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then((r) => handleResponse<AuctionItem>(r));
  },

  // Bids
  getBids: (auctionId: string): Promise<Bid[]> =>
    fetch(`${API_BASE}/auctions/${auctionId}/bids`, getOptions()).then((r) =>
      handleResponse<Bid[]>(r),
    ),

  placeBid: (
    auctionId: string,
    data: { amount: number },
  ): Promise<PlaceBidResponse> =>
    fetch(`${API_BASE}/auctions/${auctionId}/bids`, getOptions({
      method: 'POST',
      body: JSON.stringify(data),
    })).then((r) => handleResponse<PlaceBidResponse>(r)),

  updateAuction: (
    id: string,
    formData: FormData,
  ): Promise<AuctionItem> => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}/auctions/${id}`, {
      method: 'PUT',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then((r) => handleResponse<AuctionItem>(r));
  },

  deleteAuction: (id: string): Promise<void> =>
    fetch(`${API_BASE}/auctions/${id}`, getOptions({
      method: 'DELETE',
    })).then((r) => handleResponse<void>(r)),

  getImageUrl: (auctionId: string, index: number): string => 
    `${API_BASE}/auctions/image/${auctionId}/${index}`,
};
