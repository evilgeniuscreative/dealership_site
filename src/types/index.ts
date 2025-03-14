export interface Car {
  id: number;
  make: string;
  model: string;
  model_year: number;
  color: string;
  doors: number;
  engine_size: string;
  horsepower: number;
  mileage: number;
  price: number;
  title: string;
  body_text: string;
  image_name: string;
  car_condition?: string;
  car_status?: string;
  car_transmission?: string;
  car_type?: string;
  featured_car?: number;
}

export interface CarouselImage {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  delay: number;
  displayOrder?: number;
  carousel_type?: string;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  color?: string;
  isAWD?: boolean;
  minYear?: number;
  maxYear?: number;
  query?: string;
}

export interface PageHero {
  title: string;
  subtitle?: string;
  imageUrl: string;
  height: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
