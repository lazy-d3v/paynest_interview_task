import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type AuctionItem } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import CreateAuctionForm from '../components/CreateAuctionForm';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface DashboardProps {
  onAuctionCreated?: () => void;
  externalAuctions?: AuctionItem[];
}

type TabType = 'available' | 'past' | 'manage';

export default function Dashboard({ onAuctionCreated, externalAuctions }: DashboardProps) {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [editingAuction, setEditingAuction] = useState<AuctionItem | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      const data = await api.getAuctions();
      setAuctions(data);
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => {
    if (externalAuctions && externalAuctions.length > 0) {
      setAuctions(externalAuctions);
    }
  }, [externalAuctions]);

  const handleCreated = () => {
    fetchAuctions();
    setEditingAuction(null);
    onAuctionCreated?.();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) return;
    try {
      await api.deleteAuction(id);
      toast.success('Auction deleted');
      fetchAuctions();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to delete auction');
    }
  };

  const filteredAuctions = useMemo(() => {
    switch (activeTab) {
      case 'available':
        return auctions.filter(a => a.status === 'active');
      case 'past':
        return auctions.filter(a => a.status === 'ended');
      case 'manage':
        return auctions.filter(a => a.createdByUserId === user?.id);
      default:
        return auctions;
    }
  }, [auctions, activeTab, user]);

  const liveCount = useMemo(() => 
    auctions.filter(a => a.status === 'active').length, 
  [auctions]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Auctions</h1>
        <p className="page-subtitle">
          Discover unique items and manage your own listings
        </p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available <span className="tab-count">{liveCount}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Auctions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Listings
        </button>
      </div>

      {activeTab === 'manage' && (
        <CreateAuctionForm 
          onCreated={handleCreated} 
          initialData={editingAuction}
          onCancel={() => setEditingAuction(null)}
          key={editingAuction?.id || 'new'}
        />
      )}

      {filteredAuctions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-title">
            {activeTab === 'available' ? 'No active auctions' : 
             activeTab === 'past' ? 'No past auctions' : 
             'You haven\'t created any auctions yet'}
          </div>
          <p>
            {activeTab === 'manage' ? 'Start by creating your first listing above!' : 'Check back later for new items!'}
          </p>
        </div>
      ) : (
        <div className="auction-grid">
          {filteredAuctions.map((auction) => (
            <AuctionCard 
              key={auction.id} 
              auction={auction} 
              showActions={activeTab === 'manage'}
              onDelete={handleDelete}
              onEdit={setEditingAuction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
