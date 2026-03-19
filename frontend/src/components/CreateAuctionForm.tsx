import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, type AuctionItem } from '../services/api';
import { compressImage } from '../utils/image-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, X, ArrowRight, Sparkles, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateAuctionFormProps {
  onCreated: () => void;
  initialData?: AuctionItem | null;
  onCancel?: () => void;
}

export default function CreateAuctionForm({ onCreated, initialData, onCancel }: CreateAuctionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice?.toString() || '');
  const [date, setDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return d;
  });
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!initialData;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      toast.error('Limit: 3 high-fidelity images per listing.');
      return;
    }

    const compressedFiles = await Promise.all(files.map(file => compressImage(file)));
    const newImages = [...images, ...compressedFiles];
    setImages(newImages);

    const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startingPrice) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('startingPrice', startingPrice);
      if (!isEdit && date) {
        const resolutionDate = new Date(date);
        resolutionDate.setHours(parseInt(hours), parseInt(minutes));
        
        const durationInSeconds = Math.floor((resolutionDate.getTime() - Date.now()) / 1000);
        if (durationInSeconds < 60) {
          toast.error('Duration must exceed 60 seconds.');
          setIsSubmitting(false);
          return;
        }
        formData.append('duration', durationInSeconds.toString());
      }
      
      images.forEach((image: File) => {
        formData.append('images', image);
      });

      if (isEdit) {
        await api.updateAuction(initialData.id, formData);
        toast.success('Asset record updated.');
      } else {
        await api.createAuction(formData);
        toast.success('Asset publicized to global exchange.');
      }
      
      if (!isEdit) {
        setName('');
        setDescription('');
        setStartingPrice('');
        const d = new Date();
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
        setDate(d);
        setHours('12');
        setMinutes('00');
        setImages([]);
        setPreviews([]);
      }
      onCreated();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || `Curation error. Failed to ${isEdit ? 'update' : 'publish'} asset.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-zinc-900 bg-zinc-950/20 rounded-none shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-20" />
      
      <CardContent className="p-8 sm:p-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
             <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-zinc-400" />
                    <h2 className="text-xs font-black tracking-[0.3em] text-zinc-100 uppercase">Curation Intelligence</h2>
                 </div>
                <h3 className="text-3xl font-black tracking-tighter text-white glow-text italic uppercase">
                  {isEdit ? 'Refine Listing' : 'Submit Asset'}
                </h3>
             </div>
              <p className="text-xs font-bold text-zinc-400 tracking-widest max-w-[250px] md:text-right uppercase leading-relaxed">
                 All submissions are final and subject to global verification.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
                <Label htmlFor="auction-name" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Asset Nomenclature *</Label>
              <Input
                id="auction-name"
                placeholder="UNIQUE_ASSET_IDENTIFIER"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-zinc-900/30 border-zinc-800 rounded-none text-white placeholder:text-zinc-800 focus-visible:ring-zinc-600 font-mono text-xs tracking-widest"
              />
            </div>

            <div className="space-y-4">
                <Label htmlFor="starting-price" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Opening Valuation ($) *</Label>
              <Input
                id="starting-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                required
                className="h-12 bg-zinc-900/30 border-zinc-800 rounded-none text-white placeholder:text-zinc-800 focus-visible:ring-zinc-600 font-mono text-xs tracking-widest"
              />
            </div>

            {!isEdit && (
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Market Resolution Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-mono text-xs tracking-wider rounded-none border-zinc-800 bg-zinc-900/30 text-white hover:bg-zinc-900/50 hover:text-white transition-all",
                        !date && "text-zinc-600"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-zinc-100" />
                      {date ? (
                        <>
                          {format(date, "PPP")} AT {hours}:{minutes}
                        </>
                      ) : (
                        <span>SELECT_RESOLUTION_DATE</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0 bg-zinc-950 border-zinc-800 rounded-none shadow-2xl overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-zinc-950 text-zinc-100"
                    />
                    <div className="p-4 border-t border-zinc-900 bg-zinc-950 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Resolution Time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={hours} onValueChange={setHours}>
                          <SelectTrigger className="w-[70px] bg-zinc-900 border-zinc-800 rounded-none h-8 font-mono text-[10px] text-white">
                            <SelectValue placeholder="HH" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-none min-w-[70px]">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, '0')} className="font-mono text-[10px]">
                                {i.toString().padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-zinc-700 font-bold">:</span>
                        <Select value={minutes} onValueChange={setMinutes}>
                          <SelectTrigger className="w-[70px] bg-zinc-900 border-zinc-800 rounded-none h-8 font-mono text-[10px] text-white">
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-none min-w-[70px]">
                            {['00', '15', '30', '45'].map((m) => (
                              <SelectItem key={m} value={m} className="font-mono text-[10px]">
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest ml-auto">24H</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            <div className={`space-y-4 ${!isEdit ? '' : 'md:col-span-2'}`}>
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100">Asset Provenance</Label>
              <textarea
                id="description"
                className="flex w-full rounded-none border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-xs font-medium text-white shadow-sm placeholder:text-zinc-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 transition-all min-h-[140px] resize-none leading-loose"
                placeholder="PROVIDE_HISTORICAL_RECORD_AND_SPECIFICATIONS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
             <h4 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-100 flex items-center gap-4">
                Visual Archives <div className="flex-grow h-[1px] bg-zinc-800" />
             </h4>
            
            <div className="flex flex-wrap gap-6">
              {previews.map((src: string, idx: number) => (
                <div key={idx} className="relative group w-32 h-32 rounded-none border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <img src={src} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)} 
                    className="absolute top-2 right-2 bg-black/80 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <div className="w-32 h-32 relative rounded-none border border-zinc-800 border-dashed hover:border-zinc-500 hover:bg-zinc-900/50 transition-all bg-zinc-950/40 flex items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="Upload images"
                  />
                   <div className="flex flex-col items-center text-zinc-400 group-hover:text-white transition-colors">
                     <ImagePlus className="h-8 w-8 mb-2 opacity-40" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">ADD_REC</span>
                   </div>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
               Max: 3 High-Fidelity JPEGs. Minimum Resolution: 1080px.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-900">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !startingPrice}
               className="flex-grow h-14 bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-black text-xs uppercase tracking-[0.3em] rounded-none group"
            >
              {isSubmitting ? 'PROCESSING...' : (
                <span className="flex items-center gap-2">
                  {isEdit ? 'Finalize Revisions' : 'Initialize Exchange'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                 className="h-14 px-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-black text-xs uppercase tracking-[0.3em] rounded-none transition-all"
              >
                Terminate
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
