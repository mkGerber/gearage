import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Upload, X, Plus, Link as LinkIcon } from "lucide-react";
import { addPart } from "@/store/slices/partsSlice";
import { RootState } from "@/store";
import { Part, PartCategory } from "@/types";
import { supabase } from "@/services/supabase";
import toast from "react-hot-toast";

const partCategories: {
  value: PartCategory;
  label: string;
  color: string;
  estimatedInstallCost: number;
}[] = [
  {
    value: "engine",
    label: "Engine",
    color: "bg-red-100 text-red-800",
    estimatedInstallCost: 800,
  },
  {
    value: "exhaust",
    label: "Exhaust",
    color: "bg-orange-100 text-orange-800",
    estimatedInstallCost: 300,
  },
  {
    value: "suspension",
    label: "Suspension",
    color: "bg-blue-100 text-blue-800",
    estimatedInstallCost: 600,
  },
  {
    value: "wheels",
    label: "Wheels",
    color: "bg-gray-100 text-gray-800",
    estimatedInstallCost: 200,
  },
  {
    value: "tires",
    label: "Tires",
    color: "bg-black text-white",
    estimatedInstallCost: 150,
  },
  {
    value: "brakes",
    label: "Brakes",
    color: "bg-red-100 text-red-800",
    estimatedInstallCost: 400,
  },
  {
    value: "interior",
    label: "Interior",
    color: "bg-purple-100 text-purple-800",
    estimatedInstallCost: 250,
  },
  {
    value: "exterior",
    label: "Exterior",
    color: "bg-green-100 text-green-800",
    estimatedInstallCost: 350,
  },
  {
    value: "electronics",
    label: "Electronics",
    color: "bg-yellow-100 text-yellow-800",
    estimatedInstallCost: 200,
  },
  {
    value: "audio",
    label: "Audio",
    color: "bg-pink-100 text-pink-800",
    estimatedInstallCost: 300,
  },
  {
    value: "performance",
    label: "Performance",
    color: "bg-indigo-100 text-indigo-800",
    estimatedInstallCost: 500,
  },
  {
    value: "maintenance",
    label: "Maintenance",
    color: "bg-teal-100 text-teal-800",
    estimatedInstallCost: 200,
  },
  {
    value: "other",
    label: "Other",
    color: "bg-gray-100 text-gray-800",
    estimatedInstallCost: 150,
  },
];

export default function AddPart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: "",
    name: "",
    category: "" as PartCategory,
    brand: "",
    partNumber: "",
    cost: "",
    installationCost: "",
    mileage: "",
    date: "",
    description: "",
    warranty: "",
    notes: "",
    images: [] as string[],
    links: [""],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addLink = () => {
    setFormData((prev) => ({ ...prev, links: [...prev.links, ""] }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) => (i === index ? value : link)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add a part");
      return;
    }

    setLoading(true);

    try {
      const totalCost =
        parseFloat(formData.cost) +
        (parseFloat(formData.installationCost) || 0);

      // Upload images if provided
      const imageUrls: string[] = [];
      if (formData.images.length > 0) {
        for (const imageUrl of formData.images) {
          // Convert blob URL to file
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `part-${Date.now()}.jpg`, {
            type: blob.type,
          });

          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("part-images").upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("part-images")
            .getPublicUrl(fileName);

          imageUrls.push(urlData.publicUrl);
        }
      }

      // Create part in database
      const { data: partData, error: partError } = await supabase
        .from("parts")
        .insert([
          {
            vehicle_id: formData.vehicleId,
            name: formData.name,
            category: formData.category,
            brand: formData.brand || null,
            part_number: formData.partNumber || null,
            cost: parseFloat(formData.cost),
            installation_cost: parseFloat(formData.installationCost) || null,
            total_cost: totalCost,
            mileage: parseInt(formData.mileage),
            date: formData.date,
            description: formData.description || null,
            images: imageUrls,
            links: formData.links.filter((link) => link.trim() !== ""),
            warranty: formData.warranty || null,
            notes: formData.notes || null,
          },
        ])
        .select()
        .single();

      if (partError) throw partError;

      // Add to Redux store
      const newPart: Part = {
        id: partData.id,
        vehicleId: partData.vehicle_id,
        name: partData.name,
        category: partData.category,
        brand: partData.brand || undefined,
        partNumber: partData.part_number || undefined,
        cost: partData.cost,
        installationCost: partData.installation_cost || undefined,
        totalCost: partData.total_cost,
        mileage: partData.mileage,
        date: partData.date,
        description: partData.description || undefined,
        images: partData.images || [],
        links: partData.links || [],
        warranty: partData.warranty || undefined,
        notes: partData.notes || undefined,
        createdAt: partData.created_at,
        updatedAt: partData.updated_at,
      };

      dispatch(addPart(newPart));
      toast.success("Part added successfully!");
      navigate("/parts");
    } catch (error) {
      console.error("Error adding part:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add part. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/parts")}
          className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Add Part</h1>
          <p className="text-secondary-600">Track a new modification or part</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicleId"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Vehicle *
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                required
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.year} {vehicle.make}{" "}
                    {vehicle.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select category</option>
                {partCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} (~${category.estimatedInstallCost} est.
                    install)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Part Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Turbocharger"
              />
            </div>

            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Garrett"
              />
            </div>

            <div>
              <label
                htmlFor="partNumber"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Part Number
              </label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., GTX2863R"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Installation Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Cost Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Cost Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="cost"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Part Cost *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                  $
                </span>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  required
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="input-field pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="installationCost"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Installation Cost
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500">
                  $
                </span>
                <input
                  type="number"
                  id="installationCost"
                  name="installationCost"
                  min="0"
                  step="0.01"
                  value={formData.installationCost}
                  onChange={handleInputChange}
                  className="input-field pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mileage"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Mileage at Installation *
              </label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                required
                min="0"
                value={formData.mileage}
                onChange={handleInputChange}
                className="input-field"
                placeholder="50000"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
            <p className="text-sm text-secondary-600">
              Total Cost:{" "}
              <span className="font-semibold text-secondary-900">
                $
                {(
                  parseFloat(formData.cost) +
                  (parseFloat(formData.installationCost) || 0)
                ).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Additional Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Describe the part and its features..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="warranty"
                  className="block text-sm font-medium text-secondary-700 mb-1"
                >
                  Warranty
                </label>
                <input
                  type="text"
                  id="warranty"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., 2 years"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-secondary-700 mb-1"
                >
                  Notes
                </label>
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Images
          </h2>
          <div className="space-y-4">
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Part ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-secondary-400 mb-2" />
              <p className="text-sm text-secondary-600 mb-2">
                Upload photos of the part
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="part-images"
              />
              <label
                htmlFor="part-images"
                className="btn-secondary cursor-pointer inline-flex"
              >
                Choose Images
              </label>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Links
          </h2>
          <div className="space-y-3">
            {formData.links.map((link, index) => (
              <div key={index} className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>
                {formData.links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="btn-secondary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/parts")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Adding Part..." : "Add Part"}
          </button>
        </div>
      </form>
    </div>
  );
}
