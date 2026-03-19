import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, type AuctionItem } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import CreateAuctionForm from '../components/CreateAuctionForm';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackageOpen, Sparkles, LayoutGrid, History, PenTool } from 'lucide-react';

interface DashboardProps {
  onAuctionCreated?: () => void;
  externalAuctions?: AuctionItem[];
}

export default function Dashboard({ onAuctionCreated, externalAuctions }: DashboardProps) {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!window.confirm('Confirm permanent removal of this listing?')) return;
    try {
      await api.deleteAuction(id);
      toast.success('Listing removed from collection');
      fetchAuctions();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Error removing listing');
    }
  };

  const availableAuctions = useMemo(() => auctions.filter(a => a.status === 'active'), [auctions]);
  const pastAuctions = useMemo(() => auctions.filter(a => a.status === 'ended'), [auctions]);
  const userAuctions = useMemo(() => auctions.filter(a => a.createdByUserId === user?.id), [auctions, user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 border-2 border-zinc-800 border-t-white animate-spin rounded-none" />
          <p className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Synchronizing Archives</p>
        </div>
      </div>
    );
  }

  const renderEmptyState = (type: 'available' | 'past' | 'manage') => (
    <div className="flex flex-col items-center justify-center py-32 text-center border border-zinc-900 bg-zinc-950/20">
      <div className="h-20 w-20 bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <PackageOpen className="h-8 w-8 text-zinc-700" />
      </div>
      <h3 className="text-sm font-black tracking-[0.2em] text-zinc-300 uppercase mb-3">
        {type === 'available' ? 'Collection Empty' : 
         type === 'past' ? 'No Historical Data' : 
         'Curation Required'}
      </h3>
      <p className="text-[10px] font-bold text-zinc-600 tracking-widest max-w-xs uppercase leading-relaxed">
        {type === 'manage' ? 'You have no active listings. Start curating to populate your private vault.' : 'New items are currently being appraised. Please return shortly.'}
      </p>
    </div>
  );

  return (
    <div className="space-y-16 max-w-[1600px] mx-auto">
      {/* Dynamic Intro Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-zinc-900">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-[1px] w-8 bg-white opacity-30" />
             <span className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Current Market</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white glow-text italic">
            BidMaster <span className="not-italic text-zinc-800">Elite</span>
          </h1>
          <p className="text-xs font-bold text-zinc-500 tracking-widest max-w-xl uppercase leading-loose">
            Accessing a worldwide network of high-fidelity real-time auction assets. Every bid is final. Every item is unique.
          </p>
        </div>
        
        <div className="flex gap-4 p-1 bg-zinc-900 rounded-none border border-zinc-800">
           <div className="px-6 py-3 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">Live Slots</span>
              <span className="text-xl font-black text-white">{availableAuctions.length}</span>
           </div>
           <div className="w-[1px] bg-zinc-800 my-2" />
           <div className="px-6 py-3 flex flex-col items-center min-w-[120px]">
              <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">Archive</span>
              <span className="text-xl font-black text-zinc-600 italic">{pastAuctions.length}</span>
           </div>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full space-y-12">
        <TabsList className="bg-transparent h-auto p-0 flex space-x-12 border-b border-zinc-900 rounded-none w-full justify-start overflow-x-auto no-scrollbar pb-0">
          <TabsTrigger 
            value="available" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-3 w-3" />
              <span>COLLECTION</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all"
          >
            <div className="flex items-center gap-2">
              <History className="h-3 w-3" />
              <span>ARCHIVES</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="manage" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] pb-4 transition-all"
          >
            <div className="flex items-center gap-2">
              <PenTool className="h-3 w-3" />
              <span>CURATION</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="m-0 outline-none">
          {availableAuctions.length === 0 ? renderEmptyState('available') : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {availableAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="m-0 outline-none">
          {pastAuctions.length === 0 ? renderEmptyState('past') : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              {pastAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="m-0 outline-none space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
             <div className="lg:col-span-4 sticky top-32">
                <div className="p-8 border border-zinc-900 bg-zinc-950/20 space-y-6">
                   <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-zinc-500" />
                      <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white">Curator Panel</h2>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase leading-loose">
                      Submit new assets to the global exchange. Ensure all appraisals are verified before submission.
                   </p>
                </div>
             </div>
             <div className="lg:col-span-8">
                <CreateAuctionForm 
                  onCreated={handleCreated} 
                  initialData={editingAuction}
                  onCancel={() => setEditingAuction(null)}
                  key={editingAuction?.id || 'new'}
                />
             </div>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
               <h3 className="text-lg font-black tracking-[0.3em] text-white uppercase flex items-center gap-4">
                 Vault Items <span className="text-zinc-800">/</span> <span className="text-zinc-500 font-bold tracking-normal italic text-sm">{userAuctions.length} Listings</span>
               </h3>
               <div className="flex-grow h-[1px] bg-zinc-900" />
            </div>
            
            {userAuctions.length === 0 ? renderEmptyState('manage') : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {userAuctions.map((auction) => (
                  <AuctionCard 
                    key={auction.id} 
                    auction={auction} 
                    showActions={true}
                    onDelete={handleDelete}
                    onEdit={setEditingAuction}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
