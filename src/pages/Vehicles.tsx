import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { RootState } from "@/store";
import { Vehicle } from "@/types";
import {
  setVehicles,
  setLoading,
  setError,
} from "@/store/slices/vehiclesSlice";
import { supabase } from "@/services/supabase";

export default function Vehicles() {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadVehicles = async () => {
      if (!user) return;

      try {
        dispatch(setLoading(true));
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (vehiclesError) throw vehiclesError;

        // Transform database data to match frontend types
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
      } catch (error) {
        console.error("Error loading vehicles:", error);
        dispatch(
          setError(
            error instanceof Error ? error.message : "Failed to load vehicles"
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadVehicles();
  }, [dispatch, user]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Vehicles</h1>
          <p className="text-secondary-600">Manage your car collection</p>
        </div>
        <Link to="/vehicles/add" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Link>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No vehicles yet
          </h3>
          <p className="text-secondary-600 mb-6">
            Start by adding your first vehicle to track modifications and costs.
          </p>
          <Link to="/vehicles/add" className="btn-primary">
            Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Vehicle Image */}
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
        {vehicle.image ? (
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-primary-600 text-4xl font-bold">
            {(vehicle.make || "").charAt(0)}
            {(vehicle.model || "").charAt(0)}
          </div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">
            {vehicle.name}
          </h3>
          <p className="text-secondary-600">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-secondary-500">Color</p>
            <p className="font-medium text-secondary-900">{vehicle.color}</p>
          </div>
          <div>
            <p className="text-secondary-500">Mileage</p>
            <p className="font-medium text-secondary-900">
              {(vehicle.mileage || 0).toLocaleString()} mi
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Spent</p>
              <p className="text-lg font-bold text-green-600">
                ${(vehicle.totalSpent || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/vehicles/${vehicle.id}`}
                className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <button className="p-2 text-secondary-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-secondary-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
