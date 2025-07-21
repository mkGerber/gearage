import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search, Filter, Wrench } from "lucide-react";
import { RootState } from "@/store";
import { Part, PartCategory } from "@/types";
import {
  setParts,
  setLoading as setPartsLoading,
  setError as setPartsError,
} from "@/store/slices/partsSlice";
import {
  setVehicles,
  setLoading as setVehiclesLoading,
  setError as setVehiclesError,
} from "@/store/slices/vehiclesSlice";
import { supabase } from "@/services/supabase";

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

export default function Parts() {
  const dispatch = useDispatch();
  const { parts, loading: partsLoading } = useSelector(
    (state: RootState) => state.parts
  );
  const { vehicles, loading: vehiclesLoading } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PartCategory | "all"
  >("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      console.log("Loading parts data for user:", user.id);

      try {
        // Load vehicles first
        dispatch(setVehiclesLoading(true));
        console.log("Fetching vehicles...");
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        console.log("Vehicles query result:", { vehiclesData, vehiclesError });

        if (vehiclesError) throw vehiclesError;

        // Transform vehicles data
        const transformedVehicles = (vehiclesData || []).map((vehicle) => ({
          id: vehicle.id,
          userId: vehicle.user_id,
          name: vehicle.name,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin,
          mileage: vehicle.mileage,
          color: vehicle.color,
          image: vehicle.image,
          description: vehicle.description,
          totalSpent: vehicle.total_spent || 0,
          createdAt: vehicle.created_at,
          updatedAt: vehicle.updated_at,
        }));

        dispatch(setVehicles(transformedVehicles));

        // Load parts - only if we have vehicles
        if (vehiclesData && vehiclesData.length > 0) {
          dispatch(setPartsLoading(true));
          console.log(
            "Fetching parts for vehicles:",
            vehiclesData.map((v) => v.id)
          );
          const { data: partsData, error: partsError } = await supabase
            .from("parts")
            .select("*")
            .in(
              "vehicle_id",
              vehiclesData.map((v) => v.id)
            )
            .order("created_at", { ascending: false });

          console.log("Parts query result:", { partsData, partsError });

          if (partsError) {
            console.error("Parts query error:", partsError);
            // Don't throw, just set empty array
            dispatch(setParts([]));
          } else {
            // Transform parts data
            const transformedParts = (partsData || []).map((part) => ({
              id: part.id,
              vehicleId: part.vehicle_id,
              name: part.name,
              category: part.category,
              brand: part.brand,
              partNumber: part.part_number,
              cost: part.cost,
              installationCost: part.installation_cost,
              totalCost: part.total_cost,
              mileage: part.mileage,
              date: part.date,
              description: part.description,
              images: part.images || [],
              links: part.links || [],
              warranty: part.warranty,
              notes: part.notes,
              createdAt: part.created_at,
              updatedAt: part.updated_at,
            }));

            dispatch(setParts(transformedParts));
          }
        } else {
          // No vehicles, so no parts
          dispatch(setParts([]));
        }
      } catch (error) {
        console.error("Error loading parts data:", error);
        // Set empty arrays on error instead of throwing
        dispatch(setVehicles([]));
        dispatch(setParts([]));
        dispatch(
          setVehiclesError(
            error instanceof Error ? error.message : "Failed to load vehicles"
          )
        );
        dispatch(
          setPartsError(
            error instanceof Error ? error.message : "Failed to load parts"
          )
        );
      } finally {
        dispatch(setVehiclesLoading(false));
        dispatch(setPartsLoading(false));
      }
    };

    loadData();
  }, [dispatch, user]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || part.category === selectedCategory;
      const matchesVehicle =
        selectedVehicle === "all" || part.vehicleId === selectedVehicle;

      return matchesSearch && matchesCategory && matchesVehicle;
    });
  }, [parts, searchTerm, selectedCategory, selectedVehicle]);

  const totalSpent = filteredParts.reduce(
    (sum, part) => sum + part.totalCost,
    0
  );

  const totalMoneySaved = filteredParts.reduce((sum, part) => {
    // If user specified an installation cost, use that
    if (part.installationCost && part.installationCost > 0) {
      return sum + part.installationCost;
    }

    // Otherwise, use estimated cost for the category
    const category = partCategories.find((c) => c.value === part.category);
    return sum + (category?.estimatedInstallCost || 150);
  }, 0);

  if (!user || partsLoading || vehiclesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading parts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Parts</h1>
          <p className="text-secondary-600">
            Track all your modifications and parts
          </p>
        </div>
        <Link to="/parts/add" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as PartCategory | "all")
              }
              className="input-field"
            >
              <option value="all">All Categories</option>
              {partCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="lg:w-48">
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="input-field"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Wrench className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Total Parts
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {filteredParts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Avg Cost</p>
              <p className="text-2xl font-bold text-secondary-900">
                $
                {filteredParts.length > 0
                  ? (totalSpent / filteredParts.length).toLocaleString()
                  : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <span className="text-2xl">💚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Est. Money Saved
                <span
                  className="ml-1 text-xs text-secondary-400"
                  title="Estimated installation costs based on category averages. Actual savings may vary."
                >
                  ℹ️
                </span>
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ${totalMoneySaved.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parts List */}
      {filteredParts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No parts found
          </h3>
          <p className="text-secondary-600 mb-6">
            {searchTerm ||
            selectedCategory !== "all" ||
            selectedVehicle !== "all"
              ? "Try adjusting your filters or search terms."
              : "Start by adding your first part to track modifications and costs."}
          </p>
          <Link to="/parts/add" className="btn-primary">
            Add Your First Part
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredParts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PartCardProps {
  part: Part;
}

function PartCard({ part }: PartCardProps) {
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const vehicle = vehicles.find((v) => v.id === part.vehicleId);
  const category = partCategories.find((c) => c.value === part.category);

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">
              {part.name}
            </h3>
            {category && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${category.color}`}
              >
                {category.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-secondary-500">Vehicle</p>
              <p className="font-medium text-secondary-900">
                {vehicle?.name || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-secondary-500">Brand</p>
              <p className="font-medium text-secondary-900">
                {part.brand || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-secondary-500">Installed</p>
              <p className="font-medium text-secondary-900">{part.date}</p>
            </div>
            <div>
              <p className="text-secondary-500">Mileage</p>
              <p className="font-medium text-secondary-900">
                {part.mileage.toLocaleString()} mi
              </p>
            </div>
          </div>

          {part.description && (
            <p className="text-secondary-600 mt-3 text-sm">
              {part.description}
            </p>
          )}
        </div>

        <div className="text-right ml-4">
          <p className="text-lg font-bold text-green-600">
            ${part.totalCost.toLocaleString()}
          </p>
          <p className="text-sm text-secondary-500">
            Part: ${part.cost.toLocaleString()}
            {part.installationCost &&
              ` + Install: $${part.installationCost.toLocaleString()}`}
          </p>
          {(!part.installationCost || part.installationCost === 0) && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                💚 Est. Saved ~$
                {(() => {
                  const category = partCategories.find(
                    (c) => c.value === part.category
                  );
                  return category?.estimatedInstallCost || 150;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
