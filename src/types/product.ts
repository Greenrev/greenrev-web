export type ProductCategory = "vehicle" | "part";

export interface ProductSpecs {
  horsepower?: number;
  torque?: string;
  transmission?: string;
  topSpeed?: string;
  acceleration?: number;
  range?: string;
  battery?: string;
  charging?: string;
  compatibility?: string;
  warranty?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  make: string;
  category: ProductCategory;
  price: string;
  priceValue?: number;
  year?: number;
  mileage?: string;
  color?: ProductColor;
  image: string;
  images?: string[];
  specs?: ProductSpecs;
  description?: string;
  inStock?: boolean;
  stockQuantity?: number;
  vendorId: string;
  vendorName?: string;
  vendorPhone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductInput {
  name: string;
  make: string;
  category: ProductCategory;
  price: string;
  priceValue?: number;
  year?: number;
  mileage?: string;
  color?: ProductColor;
  image: string;
  images?: string[];
  specs?: ProductSpecs;
  description?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
