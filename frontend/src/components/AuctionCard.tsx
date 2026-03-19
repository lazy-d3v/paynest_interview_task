import { Link } from 'react-router-dom';
import { api, type AuctionItem } from '../services/api';
import CountdownTimer from './CountdownTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Image as ImageIcon, ArrowUpRight } from 'lucide-react';

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
    <div className="relative group">
      <Link to={`/auction/${auction.id}`} className="block h-full group">
        <Card className="h-full flex flex-col premium-card overflow-hidden group/card bg-zinc-950">
          {/* Image Section with Overlay */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
            {auction.imageUrls && auction.imageUrls.length > 0 ? (
              <img 
                src={api.getImageUrl(auction.id, 0)} 
                alt={auction.name} 
                className="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-700 gap-2">
                <ImageIcon className="h-10 w-10 opacity-30" />
                <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-30">ARCHIVE EMPTY</span>
              </div>
            )}
            
            {/* Status Badge Over Image */}
            <div className="absolute top-4 left-4">
              <Badge className={`text-xs font-black tracking-widest px-2 py-0.5 rounded-none border-0 ${
                auction.status === 'active' 
                  ? 'bg-white text-black glow-text' 
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {auction.status.toUpperCase()}
              </Badge>
            </div>

            {/* Price Overlay on Hover or Static */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Live Bid</span>
                  <span className="text-xl font-black text-white glow-text tracking-tight">
                    {currentBid ? `$${currentBid.toLocaleString()}` : `$${startPrice.toLocaleString()}`}
                  </span>
               </div>
               <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 transform translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4 text-white" />
               </div>
            </div>
          </div>
          
          <CardContent className="p-5 space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-100 tracking-tight leading-none group-hover/card:text-white transition-colors duration-300">
                {auction.name}
              </h3>
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed h-10">
                {auction.description || 'No description provided by the curator.'}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {auction.currentHighestBidder ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-none bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-900 border border-zinc-100">
                      {auction.currentHighestBidder.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-widest truncate max-w-[100px]">
                      {auction.currentHighestBidder.username}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reserve Pending</span>
                )}
              </div>
              <div className="font-mono text-xs tracking-tight text-white font-bold bg-zinc-900 px-2 py-1 rounded">
                <CountdownTimer endTime={auction.endTime} status={auction.status} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {showActions && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 bg-black border border-zinc-800 text-white hover:bg-zinc-100 hover:text-black transition-colors rounded-none"
            onClick={(e) => handleAction(e, 'edit')}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-8 w-8 bg-zinc-900 border border-zinc-800 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-none"
            onClick={(e) => handleAction(e, 'delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
