import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, type AuctionItem } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

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
      toast.success(`Success. Bid of $${parseFloat(amount).toLocaleString()} authorized.`);
      setAmount('');
      onBidPlaced();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Authorization failed. Bid rejected.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEnded) {
    return (
      <div className="p-6 text-center text-zinc-400 bg-zinc-900/40 border border-zinc-800 font-black text-xs tracking-[0.2em] uppercase">
        Listing Finalized
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">Input Amount</span>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Minimum Stake</span>
           <span className="text-sm font-black text-white font-mono tracking-tighter">
             ${minimumBid.toLocaleString()}
           </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xs">$</span>
          <Input
            type="number"
            step="0.01"
            min={minimumBid}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="h-14 pl-8 bg-zinc-950/50 border-zinc-800 rounded-none text-white placeholder:text-zinc-800 focus-visible:ring-white transition-all font-mono text-lg font-black tracking-tighter"
          />
        </div>
        
        <Button
          type="submit"
          className="w-full h-14 bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-black text-xs uppercase tracking-[0.3em] rounded-none group"
          disabled={isSubmitting || !amount}
        >
          {isSubmitting ? 'Authorizing...' : (
            <span className="flex items-center gap-2">
              Confirm Bid <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </div>
      
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center leading-relaxed">
        By clicking confirm, you agree to the binding terms of the BidMaster selective exchange.
      </p>
    </form>
  );
}
