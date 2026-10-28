"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Mic,
  ScanLine,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createProduct, getProduct, updateProduct, uploadProductImage, uploadProductImages } from "@/lib/apiProduct";
import Combobox from "@/components/vendor/listing/Combobox";
import AiAssist, { type AssistMode } from "@/components/vendor/listing/AiAssist";
import type { ExtractedListing } from "@/lib/apiAi";
import { useListingOptions } from "@/lib/listingOptions";
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
    origin: "",
    vin: "",
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
  const [customSpecs, setCustomSpecs] = useState<{key: string, value: string}[]>([]);
  const {
    COLORS,
    CONDITIONS,
    PART_BRANDS,
    TRANSMISSIONS,
    VEHICLE_MAKES,
    YEARS,
    colorHexFor,
    nameOptions,
    specKeyOptions,
    specValueOptions,
  } = useListingOptions();
  const SUGGESTED_SPECS = specKeyOptions(category);
  const [method, setMethod] = useState<"manual" | AssistMode>("manual");
  const [aiNote, setAiNote] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  /** Merges accepted AI suggestions into the form, then highlights what changed. */
  const applyAiSuggestions = (fields: ExtractedListing, photos: File[]) => {
    const updates: Partial<typeof formData> = {};
    const changed: string[] = [];
    const scalar = ["name", "make", "price", "year", "mileage", "colorName", "colorHex", "description", "transmission", "origin", "vin", "horsepower", "torque", "topSpeed", "acceleration", "stockQuantity"] as const;
    for (const key of scalar) {
      const v = fields[key];
      if (v === undefined) continue;
      (updates as Record<string, string>)[key] = String(v);
      changed.push(key);
    }
    if (fields.colorName && !fields.colorHex) {
      const hex = colorHexFor(fields.colorName);
      if (hex) updates.colorHex = hex;
    }
    setFormData((prev) => ({ ...prev, ...updates }));

    if (fields.extraSpecs?.length) {
      setCustomSpecs((prev) => {
        const next = prev.filter((s) => s.key.trim() || s.value.trim());
        for (const spec of fields.extraSpecs!) {
          const i = next.findIndex((s) => s.key.trim().toLowerCase() === spec.key.toLowerCase());
          if (i >= 0) next[i] = { key: next[i].key, value: spec.value };
          else next.push({ ...spec });
        }
        return next;
      });
      changed.push(...fields.extraSpecs.map((s) => `spec:${s.key.toLowerCase()}`));
    }

    if (photos.length) {
      setSelectedFiles((prev) => [...prev, ...photos].slice(0, 10));
      setImagePreviews((prev) => [...prev, ...photos.map((f) => URL.createObjectURL(f))].slice(0, 10));
      changed.push("images");
    }

    const count = changed.length;
    setAiNote(
      `Filled ${count} ${count === 1 ? "detail" : "details"}${photos.length ? ` and added ${photos.length} photo${photos.length === 1 ? "" : "s"}` : ""} — check everything below, then add anything missing.`
    );
    setMethod("manual");
    setError(null);

    // Wait for the new values to render, then glow each filled field.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        changed.forEach((key, i) => {
          document.querySelectorAll<HTMLElement>(`[data-field="${key}"]`).forEach((el) => {
            el.style.animationDelay = `${Math.min(i, 12) * 60}ms`;
            el.classList.remove("ai-flash");
            void el.offsetWidth; // restart the animation
            el.classList.add("ai-flash");
          });
        });
      })
    );
  };

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
          origin: product.specs?.origin || "",
          vin: product.specs?.vin || "",
          acceleration: product.specs?.acceleration
            ? String(product.specs.acceleration)
            : "",
          colorName: product.color?.name || "",
          colorHex: product.color?.hex || "#000000",
        });

        const knownSpecKeys = ["horsepower", "torque", "transmission", "topSpeed", "origin", "vin", "acceleration", "range", "battery", "charging", "compatibility", "warranty"];
        const loadedCustomSpecs: {key: string, value: string}[] = [];
        if (product.specs) {
          for (const [key, value] of Object.entries(product.specs)) {
            if (!knownSpecKeys.includes(key) && value !== undefined && value !== null) {
              loadedCustomSpecs.push({ key, value: String(value) });
            }
          }
        }
        setCustomSpecs(loadedCustomSpecs);
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

    if (category === "vehicle" && (!formData.vin || !formData.origin || !formData.transmission)) {
      setError("VIN, Condition (Local/Foreign), and Transmission are compulsory fields for vehicles.");
      return;
    }

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
      if (formData.origin) specs.origin = formData.origin;
      if (formData.vin) specs.vin = formData.vin;
      if (formData.acceleration)
        specs.acceleration = Number(formData.acceleration);

      for (const spec of customSpecs) {
        if (spec.key.trim() && spec.value.trim()) {
          specs[spec.key.trim()] = spec.value.trim();
        }
      }

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
        year: Number(formData.year) || undefined,
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
        origin: "",
        vin: "",
        acceleration: "",
        colorName: "",
        colorHex: "#000000",
      });
      setSelectedFiles([]);
      setImagePreviews([]);
      setCustomSpecs([]);
      setAiNote(null);
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

              <div className="space-y-4">
                <h2 className="text-lg font-medium text-white">
                  How would you like to add it?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { id: "manual", icon: PenLine, title: "Fill in manually", body: "Type with smart suggestions" },
                    { id: "scan", icon: ScanLine, title: "Scan photos", body: category === "vehicle" ? "Car, VIN plate, papers" : "Part, box or label" },
                    { id: "voice", icon: Mic, title: "Speak it", body: "Describe it in your words" },
                  ] as const).map((m) => {
                    const active = method === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        aria-pressed={active}
                        className={`relative text-left p-5 rounded-2xl border transition-colors duration-300 ${
                          active ? "border-accent/60" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="listing-method"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            className="absolute inset-0 rounded-2xl bg-accent/10"
                          />
                        )}
                        <span className="relative flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${
                              active ? "bg-accent text-black border-accent" : "bg-black/40 border-white/10 text-white/60"
                            }`}
                          >
                            <m.icon className="w-5 h-5" />
                          </span>
                          <span>
                            <span className="flex items-center gap-1.5 text-white font-medium">
                              {m.title}
                              {m.id !== "manual" && <Sparkles className="w-3 h-3 text-accent" />}
                            </span>
                            <span className="block text-subtle text-xs mt-0.5">{m.body}</span>
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  {method !== "manual" && (
                    <AiAssist
                      key={`${method}-${category}`}
                      mode={method}
                      category={category}
                      current={{
                        fields: {
                          name: formData.name,
                          make: formData.make,
                          price: formData.price,
                          year: formData.year,
                          mileage: formData.mileage,
                          colorName: formData.colorName,
                          description: formData.description,
                          transmission: formData.transmission,
                          origin: formData.origin,
                          vin: formData.vin,
                          horsepower: formData.horsepower,
                          torque: formData.torque,
                          topSpeed: formData.topSpeed,
                          acceleration: formData.acceleration,
                          stockQuantity: formData.stockQuantity === "1" ? "" : formData.stockQuantity,
                        },
                        specs: Object.fromEntries(customSpecs.map((s) => [s.key, s.value])),
                      }}
                      onApply={applyAiSuggestions}
                      onClose={() => setMethod("manual")}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {aiNote && method === "manual" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[0.06] px-4 py-3 text-sm text-white/80"
                    >
                      <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="flex-1">{aiNote}</span>
                      <button type="button" onClick={() => setAiNote(null)} aria-label="Dismiss" className="text-white/40 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div ref={formTopRef} className="space-y-6 scroll-mt-28">
                <h2 className="text-lg font-medium text-white">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Product Name *
                    </label>
                    <Combobox
                      data-field="name"
                      required
                      placeholder={
                        category === "vehicle"
                          ? "e.g. 2019 Toyota Camry XSE"
                          : "e.g. Brake Pads"
                      }
                      value={formData.name}
                      onChange={(v) => handleInputChange("name", v)}
                      options={nameOptions(category, formData.make, formData.year)}
                      emptyHint={category === "vehicle" ? "Choose a make first to see models" : undefined}
                    />
                  </div>

                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Make/Brand *
                    </label>
                    <Combobox
                      data-field="make"
                      required
                      placeholder={
                        category === "vehicle"
                          ? "Start typing, e.g. Toyota"
                          : "Start typing, e.g. Bosch"
                      }
                      value={formData.make}
                      onChange={(v) => handleInputChange("make", v)}
                      options={category === "vehicle" ? VEHICLE_MAKES : PART_BRANDS}
                    />
                  </div>

                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Price *
                    </label>
                    <input
                        data-field="price"
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
                        <Combobox
                          data-field="year"
                          placeholder="e.g. 2024"
                          inputMode="numeric"
                          maxLength={4}
                          value={formData.year}
                          onChange={(v) => handleInputChange("year", v.replace(/\D/g, ""))}
                          options={YEARS}
                        />
                      </div>

                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Mileage
                        </label>
                        <input
                        data-field="mileage"
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
                        <Combobox
                          data-field="colorName"
                          placeholder="e.g. Midnight Black"
                          value={formData.colorName}
                          onChange={(v) => {
                            handleInputChange("colorName", v);
                            const hex = colorHexFor(v);
                            if (hex) handleInputChange("colorHex", hex);
                          }}
                          options={COLORS}
                        />
                      </div>

                      <div>
                        <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                          Color Hex
                        </label>
                        <div className="flex gap-3">
                          <input
                        data-field="colorHex"
                            type="color"
                            value={formData.colorHex}
                            onChange={(e) =>
                              handleInputChange("colorHex", e.target.value)
                            }
                            className="w-14 h-12 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                          />
                          <input
                        data-field="colorHex"
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
                        data-field="images"
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
                        data-field="description"
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
                        data-field="horsepower"
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
                        data-field="torque"
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
                        Transmission *
                      </label>
                      <Combobox
                        data-field="transmission"
                        placeholder="e.g. Automatic"
                        value={formData.transmission}
                        onChange={(v) => handleInputChange("transmission", v)}
                        options={TRANSMISSIONS}
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        Top Speed
                      </label>
                      <input
                        data-field="topSpeed"
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
                        Condition *
                      </label>
                      <Combobox
                        data-field="origin"
                        placeholder="Brand New, Foreign Used…"
                        value={formData.origin}
                        onChange={(v) => handleInputChange("origin", v)}
                        options={CONDITIONS}
                      />
                    </div>
                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        VIN *
                      </label>
                      <input
                        data-field="vin"
                        type="text"
                        placeholder="17-character VIN"
                        value={formData.vin}
                        onChange={(e) =>
                          handleInputChange("vin", e.target.value)
                        }
                        maxLength={17}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent transition-colors uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                        0-100 km/h (seconds)
                      </label>
                      <input
                        data-field="acceleration"
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

              {/* Custom Specifications UI */}
              <div className="space-y-6">
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-medium text-white">
                        {category === "vehicle" ? "Additional Details" : "Part Details"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCustomSpecs([...customSpecs, { key: "", value: "" }])}
                        className="text-xs text-accent font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Detail
                      </button>
                    </div>
                    
                    {customSpecs.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {customSpecs.map((spec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 md:gap-4 items-start"
                          >
                            <Combobox
                              className="flex-1"
                              placeholder={category === "vehicle" ? "Name (e.g. Fuel Type)" : "Name (e.g. Compatibility)"}
                              value={spec.key}
                              onChange={(v) => {
                                const newSpecs = [...customSpecs];
                                newSpecs[index] = { ...newSpecs[index], key: v };
                                setCustomSpecs(newSpecs);
                              }}
                              options={SUGGESTED_SPECS}
                            />
                            <Combobox
                              className="flex-1"
                              data-field={`spec:${spec.key.trim().toLowerCase()}`}
                              placeholder={category === "vehicle" ? "Value (e.g. Petrol)" : "Value (e.g. Toyota Camry 2018-2022)"}
                              value={spec.value}
                              onChange={(v) => {
                                const newSpecs = [...customSpecs];
                                newSpecs[index] = { ...newSpecs[index], value: v };
                                setCustomSpecs(newSpecs);
                              }}
                              options={specValueOptions(category, spec.key)}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newSpecs = [...customSpecs];
                                newSpecs.splice(index, 1);
                                setCustomSpecs(newSpecs);
                              }}
                              className="mt-3 p-1 text-white/40 hover:text-red-400 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <div>
                      <p className="text-[10px] text-white/40 mb-3 uppercase tracking-widest font-bold">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_SPECS.map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              if (!customSpecs.some(s => s.key.toLowerCase() === suggestion.toLowerCase())) {
                                setCustomSpecs([...customSpecs, { key: suggestion, value: "" }]);
                              }
                            }}
                            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] md:text-xs text-white/70 transition-colors uppercase tracking-wider"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-medium text-white">Inventory</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-subtle text-sm md:text-base font-bold uppercase tracking-widest mb-2">
                      Stock Quantity
                    </label>
                    <input
                        data-field="stockQuantity"
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
                      origin: "",
                      vin: "",
                      acceleration: "",
                      colorName: "",
                      colorHex: "#000000",
                    });
                    setSelectedFiles([]);
                    setImagePreviews([]);
                    setCustomSpecs([]);
                    setAiNote(null);
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
