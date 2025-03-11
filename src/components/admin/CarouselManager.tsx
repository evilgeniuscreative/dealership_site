import React, { useState, useEffect } from 'react';
import { CarouselImage } from '../../types';
import '../../styles/components/admin/CarouselManager.scss';

const CarouselManager: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [newImage, setNewImage] = useState<Partial<CarouselImage>>({
    title: '',
    subtitle: '',
    image_name: '',
    delay: 7000, // Default delay
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
      setNewImage(prev => ({ ...prev, image_name: data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageData = {
        ...newImage,
        delay: newImage.delay || 7000 // Ensure delay has a default value
      };

      if (selectedImage) {
        await fetch(`/api/carousel-images/${selectedImage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imageData),
        });
      } else {
        await fetch('/api/carousel-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imageData),
        });
      }
      
      fetchCarouselImages();
      setNewImage({
        title: '',
        subtitle: '',
        image_name: '',
        delay: 7000,
      });
      setSelectedImage(null);
    } catch (error) {
      console.error('Error saving carousel image:', error);
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setSelectedImage(image);
    setNewImage({
      title: image.title,
      subtitle: image.subtitle,
      image_name: image.image_name,
      delay: image.delay || 7000, // Ensure delay has a default value when editing
    });
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return; // Early return if id is undefined
    
    try {
      const response = await fetch(`/api/carousel-images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete carousel image');
      }

      await fetchCarouselImages();
    } catch (error) {
      console.error('Error deleting carousel image:', error);
    }
  };

  // Get image URL with REACT_APP_BASE_URL if it's a relative path
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) {
      // Use a fallback image if no image path is provided
      const baseUrl = process.env.REACT_APP_BASE_URL || '';
      return `${baseUrl}/img/placeholder.jpg`;
    }
    
    if (!imagePath.startsWith('http')) {
      // If it's a relative path, prepend REACT_APP_BASE_URL
      const baseUrl = process.env.REACT_APP_BASE_URL || '';
      
      // Get just the file extension from the image path
      const fileExtension = imagePath.split('.').pop() || 'jpg';
      
      // If the imagePath is a number, use that number to find a matching image
      if (/^\d+$/.test(imagePath)) {
        // Handle case where REACT_APP_BASE_URL is just '/' or ends with '/'
        if (baseUrl.endsWith('/')) {
          return `${baseUrl}img/car_images/${imagePath}.${fileExtension}`;
        }
        return `${baseUrl}/img/car_images/${imagePath}.${fileExtension}`;
      }
      
      // Handle case where REACT_APP_BASE_URL is just '/' or ends with '/'
      if (baseUrl.endsWith('/')) {
        return `${baseUrl}img/car_images/${imagePath}`;
      }
      return `${baseUrl}/img/car_images/${imagePath}`;
    }
    return imagePath;
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
            onChange={(e) => setNewImage(prev => ({ ...prev, delay: parseInt(e.target.value, 10) }))}
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
                image_name: '',
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
            <img src={getImageUrl(image.image_name)} alt={image.title} />
            <div className="carousel-manager__image-info">
              <h3>{image.title}</h3>
              <p>{image.subtitle}</p>
              <p>Delay: {image.delay || 7000}ms</p>
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
