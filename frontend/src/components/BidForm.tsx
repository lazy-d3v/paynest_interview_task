import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, type AuctionItem } from '../services/api';

interface BidFormProps {
  auctionId: string;
  auction: AuctionItem;
  onBidPlaced: () => void;
}

export default function BidForm({
  auctionId,
  auction,
  onBidPlaced,
}: BidFormProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minimumBid = auction.currentHighestBid
    ? Number(auction.currentHighestBid) + 1
    : Number(auction.startingPrice) + 1;

  const isEnded = auction.status === 'ended' || new Date(auction.endTime) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    try {
      await api.placeBid(auctionId, {
        amount: parseFloat(amount),
      });
      toast.success(`Bid of $${parseFloat(amount).toLocaleString()} placed!`);
      setAmount('');
      onBidPlaced();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEnded) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        This auction has ended
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Minimum bid: <strong style={{ color: 'var(--accent-primary-hover)' }}>${minimumBid.toLocaleString()}</strong>
      </div>
      <div className="bid-form">
        <input
          className="form-input"
          type="number"
          step="0.01"
          min={minimumBid}
          placeholder={`$${minimumBid.toLocaleString()} or higher`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !amount}
        >
          {isSubmitting ? '...' : '💰 Bid'}
        </button>
      </div>
    </form>
  );
}
