export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  doors: number;
  engineDisplacement: string;
  horsepower: number;
  mileage: number;
  price: number;
  summary: string;
  description: string;
  imageUrl: string;
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
