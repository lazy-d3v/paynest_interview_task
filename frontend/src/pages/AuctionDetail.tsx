import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type AuctionItem, type Bid } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';

interface NewBidData {
  bid: Bid;
  auction: AuctionItem;
}

interface AuctionEndedData {
  auctionId: string;
}

interface AuctionDetailProps {
  joinAuction: (id: string) => void;
  leaveAuction: (id: string) => void;
  onNewBid: (callback: (data: NewBidData) => void) => (() => void) | undefined;
  onAuctionEnded: (
    callback: (data: AuctionEndedData) => void,
  ) => (() => void) | undefined;
}

export default function AuctionDetail({
  joinAuction,
  leaveAuction,
  onNewBid,
  onAuctionEnded,
}: AuctionDetailProps) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [auctionData, bidsData] = await Promise.all([
        api.getAuction(id),
        api.getBids(id),
      ]);
      setAuction(auctionData);
      setBids(bidsData);
    } catch (err) {
      console.error('Failed to fetch auction data:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Join/leave WebSocket room
  useEffect(() => {
    if (!id) return;
    joinAuction(id);
    return () => leaveAuction(id);
  }, [id, joinAuction, leaveAuction]);

  // Listen for real-time bid updates
  useEffect(() => {
    const cleanup = onNewBid((data: NewBidData) => {
      if (data.auction && data.bid) {
        setAuction(data.auction);
        setBids((prev) => [data.bid, ...prev]);
      }
    });
    return cleanup;
  }, [onNewBid]);

  // Listen for auction end
  useEffect(() => {
    const cleanup = onAuctionEnded((data: AuctionEndedData) => {
      if (data.auctionId === id) {
        setAuction((prev) =>
          prev ? { ...prev, status: 'ended' as const } : prev,
        );
      }
    });
    return cleanup;
  }, [onAuctionEnded, id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-title">Auction not found</div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentBid = auction.currentHighestBid
    ? Number(auction.currentHighestBid)
    : null;

  const isOwner = user?.id === auction.createdByUserId;

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="auction-detail">
        {/* Main Content */}
        <div className="auction-detail-main">
          {auction.imageUrls && auction.imageUrls.length > 0 && (
            <div className="detail-gallery">
              <div className="main-image">
                <img src={api.getImageUrl(auction.id, selectedImageIndex)} alt={auction.name} />
              </div>
              {auction.imageUrls.length > 1 && (
                <div className="thumbnail-row">
                  {auction.imageUrls.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`thumbnail-item ${selectedImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <img src={api.getImageUrl(auction.id, idx)} alt={`Thumbnail ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hero */}
          <div className="auction-hero">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h1>{auction.name}</h1>
              <span className={`status-badge ${auction.status}`}>
                <span className="status-badge-dot" />
                {auction.status}
              </span>
            </div>
            {auction.description && (
              <p className="auction-hero-description">{auction.description}</p>
            )}
            <div className="auction-hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-label">Current Bid</span>
                <span className="hero-stat-value">
                  {currentBid ? `$${currentBid.toLocaleString()}` : 'No bids'}
                </span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Starting Price</span>
                <span className="hero-stat-value">
                  ${Number(auction.startingPrice).toLocaleString()}
                </span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Time Left</span>
                <span className="hero-stat-value" style={{ fontSize: '1.5rem' }}>
                  <CountdownTimer endTime={auction.endTime} status={auction.status} />
                </span>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div className="detail-card">
            <h2 className="detail-card-title">📜 Bid History ({bids.length})</h2>
            {bids.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No bids yet. Be the first!</p>
              </div>
            ) : (
              <div className="bid-list">
                {bids.map((bid, index) => (
                  <div className="bid-item" key={bid.id}>
                    <div className="bid-item-left">
                      <div className="bidder-avatar">
                        {bid.user?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="bid-item-amount">
                          ${Number(bid.amount).toLocaleString()}
                          {index === 0 && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--accent-success)',
                              }}
                            >
                              🏆 Highest
                            </span>
                          )}
                        </div>
                        <div className="bid-item-user">
                          {bid.user?.username || `User #${bid.userId}`}
                          {bid.userId === user?.id && ' (You)'}
                        </div>
                      </div>
                    </div>
                    <div className="bid-item-time">
                      {new Date(bid.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="auction-detail-sidebar">
          {/* Place Bid */}
          <div className="detail-card">
            <h3 className="detail-card-title">💰 Place a Bid</h3>
            {isOwner ? (
               <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--accent-warning)', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>
                 You cannot bid on your own auction.
               </div>
            ) : (
               <BidForm
                 auctionId={auction.id}
                 auction={auction}
                 onBidPlaced={fetchData}
               />
            )}
          </div>

          {/* Auction Info */}
          <div className="detail-card">
            <h3 className="detail-card-title">ℹ️ Auction Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created By</span>
                <span>{auction.createdByUser?.username || 'Unknown'} {isOwner && '(You)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created Date</span>
                <span>{new Date(auction.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                <span>{Math.floor(auction.duration / 60)}m {auction.duration % 60}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start Time</span>
                <span>{new Date(auction.startTime).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>End Time</span>
                <span>{new Date(auction.endTime).toLocaleTimeString()}</span>
              </div>
              {auction.currentHighestBidder && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Highest Bidder</span>
                  <span style={{ color: 'var(--accent-primary-hover)' }}>
                    {auction.currentHighestBidder.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
