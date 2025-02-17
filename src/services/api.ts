import { Car, CarouselImage } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const getToken = () => localStorage.getItem('token');

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  const data = await response.json();
  return { data };
};

// Cars API
export const carsApi = {
  getAll: async (page = 1, filters = {}): Promise<ApiResponse<{ cars: Car[]; hasMore: boolean; total: number }>> => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...filters,
    });
    
    try {
      const response = await fetch(`${API_URL}/cars?${queryParams}`);
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch cars' };
    }
  },

  getById: async (id: number): Promise<ApiResponse<Car>> => {
    try {
      const response = await fetch(`${API_URL}/cars/${id}`);
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch car' };
    }
  },

  create: async (car: Omit<Car, 'id'>): Promise<ApiResponse<Car>> => {
    try {
      const response = await fetch(`${API_URL}/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(car),
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create car' };
    }
  },

  update: async (id: number, car: Partial<Car>): Promise<ApiResponse<Car>> => {
    try {
      const response = await fetch(`${API_URL}/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(car),
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update car' };
    }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/cars/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete car' };
    }
  },
};

// Carousel API
export const carouselApi = {
  getAll: async (): Promise<ApiResponse<CarouselImage[]>> => {
    try {
      const response = await fetch(`${API_URL}/carousel-images`);
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch carousel images' };
    }
  },

  create: async (image: Omit<CarouselImage, 'id'>): Promise<ApiResponse<CarouselImage>> => {
    try {
      const response = await fetch(`${API_URL}/carousel-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(image),
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create carousel image' };
    }
  },

  update: async (id: number, image: Partial<CarouselImage>): Promise<ApiResponse<CarouselImage>> => {
    try {
      const response = await fetch(`${API_URL}/carousel-images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(image),
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update carousel image' };
    }
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/carousel-images/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete carousel image' };
    }
  },

  updateOrder: async (id: number, newOrder: number): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/carousel-images/${id}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ newOrder }),
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update carousel order' };
    }
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to upload image' };
    }
  },
};
