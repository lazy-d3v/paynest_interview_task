import { Link } from 'react-router-dom';
import { api, type AuctionItem } from '../services/api';
import CountdownTimer from './CountdownTimer';

interface AuctionCardProps {
  auction: AuctionItem;
  showActions?: boolean;
  onEdit?: (auction: AuctionItem) => void;
  onDelete?: (id: string) => void;
}

export default function AuctionCard({ auction, showActions, onEdit, onDelete }: AuctionCardProps) {
  const currentBid = auction.currentHighestBid
    ? Number(auction.currentHighestBid)
    : null;
  const startPrice = Number(auction.startingPrice);

  const handleAction = (e: React.MouseEvent, action: 'edit' | 'delete') => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'edit') onEdit?.(auction);
    if (action === 'delete') onDelete?.(auction.id);
  };

  return (
    <div className="auction-card-wrapper">
      <Link to={`/auction/${auction.id}`} className="auction-card" id={`auction-${auction.id}`}>
        <div className="card-image-container">
          {auction.imageUrls && auction.imageUrls.length > 0 ? (
            <img src={api.getImageUrl(auction.id, 0)} alt={auction.name} />
          ) : (
            <div className="no-image-placeholder">🖼️</div>
          )}
        </div>
        <div className="auction-card-header">
          <h3 className="auction-card-title">{auction.name}</h3>
          <span className={`status-badge ${auction.status}`}>
            <span className="status-badge-dot" />
            {auction.status}
          </span>
        </div>

      {auction.description && (
        <p className="auction-card-description">{auction.description}</p>
      )}

      <div className="auction-card-stats">
        <div className="stat-item">
          <span className="stat-label">Starting Price</span>
          <span className="stat-value">${startPrice.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Bid</span>
          <span className="stat-value highlight">
            {currentBid ? `$${currentBid.toLocaleString()}` : 'No bids'}
          </span>
        </div>
      </div>

        <div className="auction-card-footer">
          {auction.currentHighestBidder ? (
            <div className="bidder-info">
              <div className="bidder-avatar">
                {auction.currentHighestBidder.username.charAt(0).toUpperCase()}
              </div>
              {auction.currentHighestBidder.username}
            </div>
          ) : (
            <div className="bidder-info">No bidders yet</div>
          )}
          <CountdownTimer endTime={auction.endTime} status={auction.status} />
        </div>
      </Link>

      {showActions && (
        <div className="auction-card-actions">
          <button 
            className="action-btn edit" 
            onClick={(e) => handleAction(e, 'edit')}
            title="Edit Auction"
          >
            ✏️
          </button>
          <button 
            className="action-btn delete" 
            onClick={(e) => handleAction(e, 'delete')}
            title="Delete Auction"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
