import React, { useState, useEffect } from 'react';
import { CarouselImage } from '../../types';
import '../../styles/components/admin/CarouselManager.scss';

const CarouselManager: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [newImage, setNewImage] = useState<Partial<CarouselImage>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    delay: 7000,
  });
  const [selectedImage, setSelectedImage] = useState<CarouselImage | null>(null);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const response = await fetch('/api/carousel-images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setNewImage(prev => ({ ...prev, imageUrl: data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedImage) {
        await fetch(`/api/carousel-images/${selectedImage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newImage),
        });
      } else {
        await fetch('/api/carousel-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newImage),
        });
      }
      
      fetchCarouselImages();
      setNewImage({
        title: '',
        subtitle: '',
        imageUrl: '',
        delay: 7000,
      });
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving carousel image:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await fetch(`/api/carousel-images/${id}`, {
        method: 'DELETE',
      });
      fetchCarouselImages();
    } catch (error) {
      console.error('Error deleting carousel image:', error);
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setSelectedImage(image);
    setNewImage(image);
  };

  return (
    <div className="carousel-manager">
      <h2>Manage Carousel Images</h2>

      <form onSubmit={handleSubmit} className="carousel-manager__form">
        <div className="carousel-manager__field">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={newImage.title || ''}
            onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="carousel-manager__field">
          <label htmlFor="subtitle">Subtitle</label>
          <input
            type="text"
            id="subtitle"
            value={newImage.subtitle || ''}
            onChange={(e) => setNewImage(prev => ({ ...prev, subtitle: e.target.value }))}
          />
        </div>

        <div className="carousel-manager__field">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageUpload}
            required={!selectedImage}
          />
        </div>

        <div className="carousel-manager__field">
          <label htmlFor="delay">Delay (ms)</label>
          <input
            type="number"
            id="delay"
            value={newImage.delay || 7000}
            onChange={(e) => setNewImage(prev => ({ ...prev, delay: Number(e.target.value) }))}
            min="1000"
            step="1000"
            required
          />
        </div>

        <button type="submit" className="carousel-manager__submit">
          {selectedImage ? 'Update Image' : 'Add Image'}
        </button>

        {selectedImage && (
          <button
            type="button"
            className="carousel-manager__cancel"
            onClick={() => {
              setSelectedImage(null);
              setNewImage({
                title: '',
                subtitle: '',
                imageUrl: '',
                delay: 7000,
              });
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="carousel-manager__images">
        {images.map((image) => (
          <div key={image.id} className="carousel-manager__image-item">
            <img src={image.imageUrl} alt={image.title} />
            <div className="carousel-manager__image-info">
              <h3>{image.title}</h3>
              <p>{image.subtitle}</p>
              <p>Delay: {image.delay}ms</p>
            </div>
            <div className="carousel-manager__image-actions">
              <button onClick={() => handleEdit(image)}>Edit</button>
              <button onClick={() => handleDelete(image.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager;
