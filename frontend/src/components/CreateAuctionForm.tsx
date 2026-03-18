import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { compressImage } from '../utils/image-utils';

interface CreateAuctionFormProps {
  onCreated: () => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function CreateAuctionForm({ onCreated, initialData, onCancel }: CreateAuctionFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice?.toString() || '');
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '300');
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
        formData.append('duration', duration);
      }
      
      images.forEach((image) => {
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
        setDuration('300');
        setImages([]);
        setPreviews([]);
      }
      onCreated();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEdit ? 'update' : 'create'} auction`);
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
              <label className="form-label" htmlFor="duration">
                Duration (seconds) *
              </label>
              <input
                id="duration"
                className="form-input"
                type="number"
                min="60"
                placeholder="300"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
                {previews.map((src, idx) => (
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
