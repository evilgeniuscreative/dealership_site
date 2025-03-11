import React, { useState, useEffect } from 'react';
import { Car } from '../../types';
import '../../styles/components/admin/InventoryManager.scss';

const InventoryManager: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    make: '',
    model: '',
    model_year: new Date().getFullYear(),
    color: '',
    doors: 4,
    engine_size: '',
    horsepower: 0,
    mileage: 0,
    price: 0,
    body_text: '',
    image_name: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
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
      setNewCar(prev => ({ ...prev, image_name: data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCar) {
        await fetch(`/api/cars/${selectedCar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCar),
        });
      } else {
        await fetch('/api/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCar),
        });
      }
      
      fetchCars();
      resetForm();
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return; // Early return if id is undefined
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete car');
      }

      await fetchCars();
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setNewCar(car);
  };

  const resetForm = () => {
    setSelectedCar(null);
    setNewCar({
      make: '',
      model: '',
      model_year: new Date().getFullYear(),
      color: '',
      doors: 4,
      engine_size: '',
      horsepower: 0,
      mileage: 0,
      price: 0,
      body_text: '',
      image_name: ''
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCar(prev => ({
      ...prev,
      [name]: ['model_year', 'doors', 'horsepower', 'mileage', 'price'].includes(name)
        ? Number(value)
        : value
    }));
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
    <div className="inventory-manager">
      <h2>{selectedCar ? 'Edit Car' : 'Add New Car'}</h2>

      <form onSubmit={handleSubmit} className="inventory-manager__form">
        <div className="inventory-manager__form-grid">
          <div className="inventory-manager__field">
            <label htmlFor="make">Make</label>
            <input
              type="text"
              id="make"
              name="make"
              value={newCar.make}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={newCar.model}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="model_year">Year</label>
            <input
              type="number"
              id="model_year"
              name="model_year"
              value={newCar.model_year}
              onChange={handleInputChange}
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={newCar.color}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="doors">Number of Doors</label>
            <input
              type="number"
              id="doors"
              name="doors"
              value={newCar.doors}
              onChange={handleInputChange}
              required
              min="2"
              max="5"
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="engine_size">Engine Size</label>
            <input
              type="text"
              id="engine_size"
              name="engine_size"
              value={newCar.engine_size}
              onChange={handleInputChange}
              required
              placeholder="e.g., 2.0L"
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="horsepower">Horsepower</label>
            <input
              type="number"
              id="horsepower"
              name="horsepower"
              value={newCar.horsepower}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="mileage">Mileage</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={newCar.mileage}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={newCar.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="inventory-manager__field">
            <label htmlFor="image_name">Image</label>
            <input
              type="file"
              id="image_name"
              accept="image/*"
              onChange={handleImageUpload}
              required={!selectedCar}
            />
          </div>
        </div>

        <div className="inventory-manager__field inventory-manager__field--full">
          <label htmlFor="body_text">Summary (300 characters max)</label>
          <textarea
            id="body_text"
            name="body_text"
            value={newCar.body_text}
            onChange={handleInputChange}
            required
            maxLength={300}
            rows={3}
          />
        </div>

        <div className="inventory-manager__field inventory-manager__field--full">
          <label htmlFor="body_text_full">Full Description</label>
          <textarea
            id="body_text_full"
            name="body_text"
            value={newCar.body_text}
            onChange={handleInputChange}
            required
            rows={6}
          />
        </div>

        <div className="inventory-manager__actions">
          <button type="submit" className="inventory-manager__submit">
            {selectedCar ? 'Update Car' : 'Add Car'}
          </button>
          {selectedCar && (
            <button
              type="button"
              className="inventory-manager__cancel"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="inventory-manager__list">
        <h3>Current Inventory</h3>
        <div className="inventory-manager__table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>
                    <img 
                      src={getImageUrl(car.image_name)} 
                      alt={`${car.model_year} ${car.make} ${car.model}`}
                      className="inventory-manager__car-image"
                    />
                  </td>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td>{car.model_year}</td>
                  <td>${car.price.toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleEdit(car)}>Edit</button>
                    <button onClick={() => handleDelete(car.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
