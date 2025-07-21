import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Upload, X } from "lucide-react";
import { addVehicle } from "@/store/slices/vehiclesSlice";
import { Vehicle } from "@/types";
import { RootState } from "@/store";
import { supabase } from "@/services/supabase";
import toast from "react-hot-toast";

export default function AddVehicle() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    vin: "",
    mileage: "",
    color: "",
    description: "",
    image: null as File | null,
    imagePreview: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Image selected:", file);
    if (file) {
      console.log("Image file details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      console.log("No file selected");
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add a vehicle");
      return;
    }

    setLoading(true);

    try {
      // Check authentication status
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        throw new Error("Authentication required. Please log in again.");
      }

      console.log("Current user:", currentUser.id);
      console.log("Redux user:", user.id);

      // Upload image if provided
      let imageUrl = undefined;
      if (formData.image) {
        console.log("=== IMAGE UPLOAD DEBUG ===");
        console.log("Image file:", formData.image);
        console.log("Image name:", formData.image.name);
        console.log("Image size:", formData.image.size);
        console.log("Image type:", formData.image.type);

        // Show upload loading state
        toast.loading("Uploading image to storage...", { id: "image-upload" });
        console.log("Upload started - showing loading state");

        try {
          // Try to upload directly without checking bucket first
          const fileName = `vehicle-${Date.now()}-${formData.image.name}`;
          console.log("Attempting direct upload to:", fileName);
          console.log("File object:", formData.image);

          console.log("Starting upload...");

          // Add timeout to prevent hanging
          const uploadPromise = supabase.storage
            .from("vehicle-images")
            .upload(fileName, formData.image);

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Upload timeout after 30 seconds")),
              30000
            )
          );

          const { data: uploadData, error: uploadError } = (await Promise.race([
            uploadPromise,
            timeoutPromise,
          ])) as any;

          console.log("Upload response:", { uploadData, uploadError });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            console.error("Upload error details:", {
              message: uploadError.message,
              statusCode: uploadError.statusCode,
              error: uploadError.error,
            });

            // If upload fails, try to check bucket and show specific error
            const { data: bucket, error: bucketError } =
              await supabase.storage.getBucket("vehicle-images");
            console.log("Bucket check after failed upload:", {
              bucket,
              bucketError,
            });

            toast.error(`Image upload failed: ${uploadError.message}`, {
              id: "image-upload",
            });
            console.log("Skipping image upload due to upload error");
          } else {
            console.log("Upload successful:", uploadData);
            console.log("Getting public URL...");

            const { data: urlData } = supabase.storage
              .from("vehicle-images")
              .getPublicUrl(fileName);

            console.log("URL data:", urlData);
            imageUrl = urlData.publicUrl;
            console.log("Image uploaded successfully:", imageUrl);
            toast.success("Image uploaded successfully!", {
              id: "image-upload",
            });
          }
        } catch (error) {
          console.error("Image upload exception:", error);
          console.error("Exception details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
          toast.error(
            `Image upload error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            { id: "image-upload" }
          );
          console.log("Skipping image upload due to exception");
        }
        console.log("=== END IMAGE UPLOAD DEBUG ===");
      } else {
        console.log("No image provided, skipping upload");
      }

      // Create vehicle in database
      const vehicleData = {
        user_id: currentUser.id,
        name: formData.name,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        vin: formData.vin || null,
        mileage: parseInt(formData.mileage),
        color: formData.color,
        description: formData.description || null,
        image: imageUrl,
        total_spent: 0,
      };

      console.log("Inserting vehicle:", vehicleData);

      // First, let's test if we can access the vehicles table at all
      console.log("Testing vehicles table access...");
      try {
        const { data: testData, error: testError } = await supabase
          .from("vehicles")
          .select("id")
          .limit(1);

        console.log("Test query result:", { testData, testError });
      } catch (testError) {
        console.error("Test query failed:", testError);
      }

      console.log("About to insert vehicle...");

      let vehicleResult: any;

      try {
        // Add timeout to prevent hanging
        const insertPromise = supabase
          .from("vehicles")
          .insert([vehicleData])
          .select()
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Insert timeout after 10 seconds")),
            10000
          )
        );

        const result = (await Promise.race([
          insertPromise,
          timeoutPromise,
        ])) as any;

        vehicleResult = result.data;
        const vehicleError = result.error;

        console.log("Insert result:", { vehicleResult, vehicleError });

        if (vehicleError) {
          console.error("Vehicle insert error:", vehicleError);
          throw vehicleError;
        }
      } catch (insertError) {
        console.error("Insert operation failed:", insertError);
        throw insertError;
      }

      // Add to Redux store
      const newVehicle: Vehicle = {
        id: vehicleResult.id,
        userId: vehicleResult.user_id,
        name: vehicleResult.name,
        make: vehicleResult.make,
        model: vehicleResult.model,
        year: vehicleResult.year,
        vin: vehicleResult.vin || undefined,
        mileage: vehicleResult.mileage,
        color: vehicleResult.color,
        description: vehicleResult.description || undefined,
        image: vehicleResult.image || undefined,
        totalSpent: vehicleResult.total_spent || 0,
        createdAt: vehicleResult.created_at,
        updatedAt: vehicleResult.updated_at,
      };

      dispatch(addVehicle(newVehicle));
      toast.success("Vehicle added successfully!");
      navigate("/vehicles");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add vehicle. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/vehicles")}
          className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Add Vehicle</h1>
          <p className="text-secondary-600">
            Add a new vehicle to your collection
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Image */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Vehicle Image
          </h2>
          <div className="space-y-4">
            {formData.imagePreview ? (
              <div className="relative">
                <img
                  src={formData.imagePreview}
                  alt="Vehicle preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-secondary-600">
                    Upload a photo of your vehicle
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="vehicle-image"
                  />
                  <label
                    htmlFor="vehicle-image"
                    className="btn-secondary cursor-pointer inline-flex"
                  >
                    Choose Image
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Vehicle Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Project RX-7"
              />
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Year *
              </label>
              <input
                type="number"
                id="year"
                name="year"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleInputChange}
                className="input-field"
                placeholder="2020"
              />
            </div>

            <div>
              <label
                htmlFor="make"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Make *
              </label>
              <input
                type="text"
                id="make"
                name="make"
                required
                value={formData.make}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Mazda"
              />
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Model *
              </label>
              <input
                type="text"
                id="model"
                name="model"
                required
                value={formData.model}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., RX-7"
              />
            </div>

            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Color *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                required
                value={formData.color}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Red"
              />
            </div>

            <div>
              <label
                htmlFor="mileage"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Current Mileage *
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
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Additional Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="vin"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                VIN (Optional)
              </label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleInputChange}
                className="input-field"
                placeholder="17-character VIN"
                maxLength={17}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-secondary-700 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Tell us about your vehicle..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/vehicles")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? formData.image
                ? "Uploading Image & Adding Vehicle..."
                : "Adding Vehicle..."
              : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
