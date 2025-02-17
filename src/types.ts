export interface Car {
  id?: number;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CarouselImage {
  id?: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  delay?: number;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
