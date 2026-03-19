import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, type AuctionItem } from '../services/api';
import { compressImage } from '../utils/image-utils';

interface CreateAuctionFormProps {
  onCreated: () => void;
  initialData?: AuctionItem | null;
  onCancel?: () => void;
}

export default function CreateAuctionForm({ onCreated, initialData, onCancel }: CreateAuctionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice?.toString() || '');
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [endDate, setEndDate] = useState(getDefaultDateTime());
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!initialData;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    // Compress images to JPEG 0.8
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
      if (!isEdit) {
        const durationInSeconds = Math.floor((new Date(endDate).getTime() - Date.now()) / 1000);
        if (durationInSeconds < 60) {
          toast.error('End time must be at least 1 minute in the future');
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
        toast.success('Auction updated!');
      } else {
        await api.createAuction(formData);
        toast.success('Auction created!');
      }
      
      if (!isEdit) {
        setName('');
        setDescription('');
        setStartingPrice('');
        setEndDate(getDefaultDateTime());
        setImages([]);
        setPreviews([]);
      }
      onCreated();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(
        error.message || `Failed to ${isEdit ? 'update' : 'create'} auction`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-section">
      <h2 className="form-section-title">
        {isEdit ? '✏️ Edit Auction' : '➕ Create New Auction'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="auction-name">
              Item Name *
            </label>
            <input
              id="auction-name"
              className="form-input"
              type="text"
              placeholder="e.g. Vintage Watch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="starting-price">
              Starting Price ($) *
            </label>
            <input
              id="starting-price"
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              required
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label" htmlFor="endDate">
                Auction End Date & Time *
              </label>
              <input
                id="endDate"
                className="form-input"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                required
              />
            </div>
          )}

          <div className="form-group full-width">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="Describe the item being auctioned..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Images (Max 3)</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={images.length >= 3}
                id="file-upload"
                className="hidden-input"
              />
              <label htmlFor="file-upload" className={`upload-box ${images.length >= 3 ? 'disabled' : ''}`}>
                <span className="upload-icon">📸</span>
                <span className="upload-text">Click to upload</span>
              </label>

              <div className="preview-gallery">
                {previews.map((src: string, idx: number) => (
                  <div key={idx} className="preview-item">
                    <img src={src} alt="Preview" />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-preview">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !name.trim() || !startingPrice}
          >
            {isSubmitting ? 'Saving...' : (isEdit ? '💾 Save Changes' : '🚀 Create Auction')}
          </button>
          
          {isEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
