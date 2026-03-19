import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type AuctionItem, type Bid } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CountdownTimer from '../components/CountdownTimer';
import BidForm from '../components/BidForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, History, Info, Trophy, Clock, Image as ImageIcon, ShieldCheck } from 'lucide-react';

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

  useEffect(() => {
    if (!id) return;
    joinAuction(id);
    return () => leaveAuction(id);
  }, [id, joinAuction, leaveAuction]);

  useEffect(() => {
    const cleanup = onNewBid((data: NewBidData) => {
      if (data.auction && data.bid) {
        setAuction(data.auction);
        setBids((prev) => [data.bid, ...prev]);
      }
    });
    return cleanup;
  }, [onNewBid]);

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
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 border-2 border-zinc-700 border-t-white animate-spin rounded-none" />
          <p className="text-xs font-black tracking-[0.4em] text-zinc-400 uppercase">ACCESSING SECURE ASSET DATA</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center border border-zinc-900 bg-zinc-950/20">
        <div className="h-20 w-20 bg-zinc-900 flex items-center justify-center mb-6">
          <Info className="h-8 w-8 text-zinc-700" />
        </div>
        <h3 className="text-sm font-black tracking-[0.2em] text-zinc-300 uppercase mb-4">ASSET NOT FOUND</h3>
        <Button variant="outline" asChild className="rounded-none border-zinc-700 text-xs uppercase tracking-widest font-black">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> RE-ENTER VAULT</Link>
        </Button>
      </div>
    );
  }

  const currentBid = auction.currentHighestBid ? Number(auction.currentHighestBid) : null;
  const isOwner = user?.id === auction.createdByUserId;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-6">
          <Button variant="ghost" asChild className="text-zinc-400 hover:text-white px-0 hover:bg-transparent tracking-[0.2em] text-xs font-black uppercase">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> BACK TO COLLECTION</Link>
          </Button>
         <div className="flex-grow h-[1px] bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Gallery & Description */}
        <div className="lg:col-span-7 space-y-12">
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className="h-[1px] w-8 bg-white opacity-40" />
                     <span className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">Auction Item</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white glow-text leading-[0.9]">
                    {auction.name}
                  </h1>
               </div>
                <Badge className={`text-xs font-black tracking-[0.2em] px-3 py-1 rounded-none border-0 h-fit ${
                  auction.status === 'active' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {auction.status.toUpperCase()}
                </Badge>
            </div>

            {/* Gallery */}
            <div className="space-y-6">
              <div className="premium-card overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center relative shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                {auction.imageUrls && auction.imageUrls.length > 0 ? (
                   <img 
                     src={api.getImageUrl(auction.id, selectedImageIndex)} 
                     alt={auction.name} 
                     className="w-full h-full object-contain"
                   />
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-800 gap-4">
                       <ImageIcon className="h-16 w-16 opacity-40" />
                       <span className="text-xs uppercase tracking-[0.3em] font-black opacity-40">NO IMAGE RECORDED</span>
                    </div>
                )}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10">
                   <ShieldCheck className="h-3 w-3 text-white" />
                   <span className="text-xs font-black tracking-widest text-white uppercase">Authenticated Asset</span>
                </div>
              </div>
              
              {auction.imageUrls && auction.imageUrls.length > 1 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {auction.imageUrls.map((_, idx) => (
                    <button 
                      key={idx} 
                      className={`relative rounded-none overflow-hidden border-2 transition-all w-24 h-24 flex-shrink-0 bg-zinc-900 ${
                        selectedImageIndex === idx ? 'border-white scale-105 z-10' : 'border-zinc-800 opacity-40 hover:opacity-100'
                      }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <img 
                        src={api.getImageUrl(auction.id, idx)} 
                        alt={`Record ${idx}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
                <h2 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400 flex items-center gap-4">
                   Collector's Note <div className="flex-grow h-[1px] bg-zinc-800" />
                </h2>
               <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                {auction.description || 'No detailed record available for this specific asset. High-fidelity verification suggested.'}
               </p>
            </div>
          </div>

          <Separator className="bg-zinc-900" />

          {/* Bid History - Architectural View */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                 <History className="h-5 w-5 text-zinc-700" />
                 Transaction Logs
               </h2>
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{bids.length} RECORDS</span>
            </div>
            
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="p-16 text-center border border-zinc-900 bg-zinc-950/20 text-zinc-400 uppercase text-xs font-black tracking-[0.2em]">
                  No sequence data available. Reserve price active.
                </div>
              ) : (
                <div className="grid gap-2">
                  {bids.map((bid, index) => (
                    <div key={bid.id} className={`p-6 flex items-center justify-between transition-all duration-300 ${
                      index === 0 ? 'bg-white text-black glow-text scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-zinc-950/40 border border-zinc-900 hover:border-zinc-700'
                    }`}>
                      <div className="flex items-center gap-6">
                        <div className={`text-xs font-black tracking-widest uppercase w-14 ${index === 0 ? 'text-black' : 'text-zinc-400'}`}>
                          #{bids.length - index}
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'text-black/60' : 'text-zinc-500'}`}>Collector ID</span>
                           <span className="text-sm font-black uppercase break-all">
                              {bid.user?.username || `USER_${bid.userId}`} {bid.userId === user?.id && '(YOU)'}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12 text-right">
                         <div className="hidden sm:flex flex-col items-end">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'text-black/60' : 'text-zinc-500'}`}>Timestamp</span>
                            <span className="text-xs font-mono font-bold">{new Date(bid.createdAt).toLocaleTimeString()}</span>
                         </div>
                          <div className="flex flex-col items-end min-w-[120px]">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? 'text-black/60' : 'text-zinc-500'}`}>Amount</span>
                              <span className="text-2xl font-black tracking-tighter">
                                ${Number(bid.amount).toLocaleString()}
                              </span>
                          </div>
                         {index === 0 && <Trophy className="h-5 w-5 ml-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Financial Controls */}
        <div className="lg:col-span-5 space-y-10">
          
          {/* Main Status & Timer Card */}
          <div className="p-10 border border-zinc-900 bg-zinc-950/40 space-y-10 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-20" />
             
             <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1.5">
                    <span className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">Opening Bid</span>
                    <p className="text-2xl font-black text-zinc-100">${Number(auction.startingPrice).toLocaleString()}</p>
                </div>
                <div className="space-y-1.5 text-right">
                    <span className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">Market Price</span>
                    <p className="text-3xl font-black text-white glow-text italic">
                      {currentBid ? `$${currentBid.toLocaleString()}` : `- - -`}
                    </p>
                </div>
             </div>

             <div className="pt-10 border-t border-zinc-800 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="text-xs font-black tracking-[0.3em] text-zinc-100 uppercase">Market Resolution In</span>
                </div>
                <div className="text-5xl font-black tracking-tighter text-white font-mono lowercase">
                   <CountdownTimer endTime={auction.endTime} status={auction.status} />
                </div>
             </div>

             <div className="pt-10 space-y-6 relative z-10">
                {isOwner ? (
                  <div className="p-6 text-center bg-zinc-900/50 border border-zinc-800">
                    <p className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">
                      Curator Ownership Active. Bidding Disabled.
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/20 p-6 border border-zinc-900">
                    <BidForm
                      auctionId={auction.id}
                      auction={auction}
                      onBidPlaced={fetchData}
                    />
                  </div>
                )}
             </div>

             <div className="pt-10 flex items-center justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] relative z-10">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted Gateway
                </span>
                <span>v1.0.5-ELITE</span>
             </div>
          </div>

          {/* Detailed Metadata Card */}
          <div className="p-10 border border-zinc-900 bg-zinc-950/20 space-y-10">
             <div className="flex items-center gap-3">
                 <Info className="h-4 w-4 text-zinc-400" />
                 <h3 className="text-xs font-black tracking-[0.3em] text-zinc-200 uppercase">Financial Intelligence</h3>
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end pb-4 border-b border-zinc-900/50">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Asset Curator</span>
                   <span className="text-xs font-black text-zinc-200 uppercase tracking-tight">
                     {auction.createdByUser?.username || 'ANONYMOUS'} {isOwner && ' (VIEWER)'}
                   </span>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-zinc-900/50">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Initial Listing</span>
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      {new Date(auction.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-zinc-900/50">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Listing Duration</span>
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      {Math.floor(auction.duration / 60)}M {auction.duration % 60}S
                    </span>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-zinc-900/50">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Start Time</span>
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      {new Date(auction.startTime).toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-zinc-900/50">
                   <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">End Time</span>
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      {new Date(auction.endTime).toLocaleString()}
                    </span>
                </div>
             </div>
             
             <p className="text-[9px] font-medium text-zinc-700 uppercase tracking-widest leading-relaxed">
               All transactions are processed through the BidMaster high-fidelity network. Verify all asset credentials before placing a binding bid.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
