"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  User,
  Settings,
  Car,
  Wrench,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createProduct, getProduct, updateProduct, uploadProductImage, uploadProductImages } from "@/lib/apiProduct";
import type {
  ProductCategory,
  ProductColor,
  ProductSpecs,
} from "@/types/product";

const VENDOR_NAV = [
  { name: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/vendor/products", icon: Package },
  { name: "Add Product", href: "/vendor/products/add", icon: PlusCircle },
  { name: "Profile", href: "/vendor/profile", icon: User },
  { name: "Requests", href: "/vendor/requests", icon: ShoppingCart },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export default function VendorAddProductPage() {
  const [category, setCategory] = useState<ProductCategory>("vehicle");
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = Boolean(editId);

  const [formData, setFormData] = useState({
    name: "",
    make: "",
    price: "",
    year: "",
    mileage: "",
    image: "",
    images: [] as string[],
    description: "",
    inStock: true,
    stockQuantity: "1",
    horsepower: "",
    torque: "",
    transmission: "",
    topSpeed: "",
    acceleration: "",
    colorName: "",
    colorHex: "#000000",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditId(params.get("edit") || params.get("id"));
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (!editId) return;

      setIsLoadingProduct(true);
      setError(null);

      try {
        const product = await getProduct(editId);
        setCategory(product.category);
        setFormData({
          name: product.name || "",
          make: product.make || "",
          price: product.price || "",
          year: product.year ? String(product.year) : "",
          mileage: product.mileage || "",
          image: product.image || "",
          images: product.images || [],
          description: product.description || "",
          inStock: product.inStock !== false,
          stockQuantity: String(product.stockQuantity ?? 1),
          horsepower: product.specs?.horsepower
            ? String(product.specs.horsepower)
            : "",
          torque: product.specs?.torque || "",
          transmission: product.specs?.transmission || "",
          topSpeed: product.specs?.topSpeed || "",
          acceleration: product.specs?.acceleration
            ? String(product.specs.acceleration)
            : "",
          colorName: product.color?.name || "",
          colorHex: product.color?.hex || "#000000",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoadingProduct(false);
      }
    }

    loadProduct();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let finalImageUrl = formData.image;
      let finalImageUrls = formData.images;

      if (selectedFiles.length > 0) {
        setIsUploadingImage(true);
        try {
          const uploadedUrls = await uploadProductImages(selectedFiles);
          finalImageUrl = uploadedUrls[0];
          finalImageUrls = uploadedUrls;
        } catch (uploadErr) {
          setError("Image upload failed. Please try again.");
          setIsSubmitting(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const specs: ProductSpecs = {};
      if (formData.horsepower) specs.horsepower = Number(formData.horsepower);
      if (formData.torque) specs.torque = formData.torque;
      if (formData.transmission) specs.transmission = formData.transmission;
      if (formData.topSpeed) specs.topSpeed = formData.topSpeed;
      if (formData.acceleration)
        specs.acceleration = Number(formData.acceleration);

      const color: ProductColor | undefined = formData.colorName
        ? { name: formData.colorName, hex: formData.colorHex }
        : undefined;

      const priceValue = parseFloat(formData.price.replace(/[^0-9.]/g, ""));

      const payload = {
        name: formData.name,
        make: formData.make,
        category,
        price: formData.price,
        priceValue: isNaN(priceValue) ? undefined : priceValue,
        year: formData.year ? Number(formData.year) : undefined,
        mileage: formData.mileage || undefined,
        image: finalImageUrl,
        images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        specs: Object.keys(specs).length > 0 ? specs : undefined,
        color,
        description: formData.description || undefined,
        inStock: formData.inStock,
        stockQuantity: Number(formData.stockQuantity),
      };

      if (editId) {
        await updateProduct({ id: editId, ...payload });
        setSuccess(true);
        router.push("/vendor/products");
        return;
      }

      await createProduct(payload);

      setSuccess(true);
      setFormData({
        name: "",
        make: "",
        price: "",
        year: "",
        mileage: "",
        image: "",
        images: [],
        description: "",
        inStock: true,
        stockQuantity: "1",
        horsepower: "",
        torque: "",
        transmission: "",
        topSpeed: "",
        acceleration: "",
        colorName: "",
        colorHex: "#000000",
      });
      setSelectedFiles([]);
      setImagePreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validExtensions = ["jpg", "jpeg", "png", "avif", "webp", "glb", "gltf"];
    const validFiles: File[] = [];
    
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        setError(`Unsupported file extension for ${file.name}. Please use jpg, png, avif, webp, glb, or gltf.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File size exceeds 10MB limit for ${file.name}.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles(validFiles);
    setImagePreviews(validFiles.map(file => URL.createObjectURL(file)));
    setError(null);
  };

  return (
    <DashboardLayout navItems={VENDOR_NAV} role="vendor" title="Vendor Portal">
      <div className="space-y-8 pb-12">
        <header>
          <h1 className="text-3xl font-display text-white mb-2">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-subtle text-base md:text-lg">
            {isEditMode
              ? "Update your listing details."
              : "List a new vehicle or performance part."}
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-12"
        >
          {isLoadingProduct ? (
            <div className="min-h-[320px] flex items-center justify-center">
              <p className="text-subtle text-base md:text-lg">Loading product...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-lg font-medium text-white mb-4">
                  Product Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCategory("vehicle")}
                    className={`p-6 rounded-2xl border transition-all ${
                      category === "vehicle"
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Car
                      className={`w-8 h-8 mb-2 ${category === "vehicle" ? "text-accent" : "text-white/60"}`}
                    />
                    <p className="text-white font-medium">Vehicle</p>
                    <p className="text-subtle text-sm md:text-base mt-1">
                      Add a car or motorcycle
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("part")}
                    className={`p-6 rounded-2xl border transition-all ${
                      category === "part"
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Wrench
                      className={`w-8 h-8 mb-2 ${category === "part" ? "text-accent" : "text-white/60"}`}
                    />
                    <p className="text-white font-medium">Part</p>
                    <p className="text-subtle text-sm md:text-base mt-1">
                      Add performance parts
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-medium text-white">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        category === "vehicle"
                          ? "e.g. Mercedes-Benz G63 AMG"
                          : "e.g. Racing Air Filter"
                      }
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Make/Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        category === "vehicle"
                          ? "e.g. Mercedes-Benz"
                          : "e.g. BMW"
                      }
                      value={formData.make}
                      onChange={(e) =>
                        handleInputChange("make", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Price *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₦50,000,000"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {category === "vehicle" && (
                    <>
                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Year
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2024"
                          min="1900"
                          max="2030"
                          value={formData.year}
                          onChange={(e) =>
                            handleInputChange("year", e.target.value)
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Mileage
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 15,000 km"
                          value={formData.mileage}
                          onChange={(e) =>
                            handleInputChange("mileage", e.target.value)
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Color Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Obsidian Black"
                          value={formData.colorName}
                          onChange={(e) =>
                            handleInputChange("colorName", e.target.value)
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Color Hex
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={formData.colorHex}
                            onChange={(e) =>
                              handleInputChange("colorHex", e.target.value)
                            }
                            className="w-14 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder="#000000"
                            value={formData.colorHex}
                            onChange={(e) =>
                              handleInputChange("colorHex", e.target.value)
                            }
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                    Product Image *
                  </label>
                  <div className="flex flex-col gap-4">
                    <div className="relative group">
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.avif,.webp,.glb,.gltf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className={`flex flex-col items-center justify-center w-full min-h-[8rem] p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          imagePreviews.length > 0 || formData.image
                            ? "border-accent bg-accent/5"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {imagePreviews.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {imagePreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-white/10">
                                <img
                                  src={preview}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : formData.image || (formData.images && formData.images.length > 0) ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {(formData.images?.length ? formData.images : [formData.image]).map((img, idx) => (
                              <div key={idx} className="relative aspect-square w-full rounded-lg overflow-hidden border border-white/10 opacity-70">
                                <img
                                  src={img}
                                  alt={`Current Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <PlusCircle className="w-8 h-8 text-white/40 mb-2" />
                            <p className="text-white/60 text-base md:text-lg">Click to upload multiple</p>
                            <p className="text-subtle text-sm md:text-base mt-1 text-center">
                              Select multiple files (Max 10MB each)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                    {isUploadingImage && (
                      <p className="text-accent text-sm md:text-base animate-pulse">
                        Uploading image to Cloudinary...
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed description of the product..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
              </div>

              {category === "vehicle" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-white">
                    Specifications
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        Horsepower (HP)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 577"
                        value={formData.horsepower}
                        onChange={(e) =>
                          handleInputChange("horsepower", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        Torque
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 850 Nm"
                        value={formData.torque}
                        onChange={(e) =>
                          handleInputChange("torque", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        Transmission
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9-Speed Automatic"
                        value={formData.transmission}
                        onChange={(e) =>
                          handleInputChange("transmission", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        Top Speed
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 220 km/h"
                        value={formData.topSpeed}
                        onChange={(e) =>
                          handleInputChange("topSpeed", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        0-100 km/h (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 4.5"
                        value={formData.acceleration}
                        onChange={(e) =>
                          handleInputChange("acceleration", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-lg font-medium text-white">Inventory</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        handleInputChange("stockQuantity", e.target.value)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Availability
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange("inStock", true)}
                        className={`flex-1 p-4 rounded-xl border transition-all ${
                          formData.inStock
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        In Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("inStock", false)}
                        className={`flex-1 p-4 rounded-xl border transition-all ${
                          !formData.inStock
                            ? "border-red-500 bg-red-500/10 text-red-400"
                            : "border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        Out of Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 text-base md:text-lg font-medium">Error</p>
                    <p className="text-red-300/80 text-sm md:text-base mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-200 text-base md:text-lg font-medium">
                      Success!
                    </p>
                    <p className="text-green-300/80 text-sm md:text-base mt-1">
                      Product has been created successfully.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditMode) {
                      router.push("/vendor/products");
                      return;
                    }
                    setFormData({
                      name: "",
                      make: "",
                      price: "",
                      year: "",
                      mileage: "",
                      image: "",
                      images: [],
                      description: "",
                      inStock: true,
                      stockQuantity: "1",
                      horsepower: "",
                      torque: "",
                      transmission: "",
                      topSpeed: "",
                      acceleration: "",
                      colorName: "",
                      colorHex: "#000000",
                    });
                    setError(null);
                    setSuccess(false);
                  }}
                  className="px-6 py-3 border border-white/10 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all text-base md:text-lg font-medium"
                >
                  {isEditMode ? "Cancel" : "Clear Form"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm md:text-base hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
