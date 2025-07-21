import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Car,
  Wrench,
  DollarSign,
  TrendingUp,
  Plus,
  Calendar,
  BarChart3,
} from "lucide-react";
import { RootState } from "@/store";
import {
  setVehicles,
  setLoading,
  setError,
} from "@/store/slices/vehiclesSlice";
import {
  setParts,
  setLoading as setPartsLoading,
  setError as setPartsError,
} from "@/store/slices/partsSlice";
import { supabase } from "@/services/supabase";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { vehicles, loading: vehiclesLoading } = useSelector(
    (state: RootState) => state.vehicles
  );
  const { parts, loading: partsLoading } = useSelector(
    (state: RootState) => state.parts
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load vehicles
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

        // Load parts
        dispatch(setPartsLoading(true));
        const { data: partsData, error: partsError } = await supabase
          .from("parts")
          .select("*")
          .in("vehicle_id", vehiclesData?.map((v) => v.id) || [])
          .order("created_at", { ascending: false });

        if (partsError) throw partsError;

        // Transform database data to match frontend types
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
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        dispatch(
          setError(
            error instanceof Error ? error.message : "Failed to load data"
          )
        );
        dispatch(
          setPartsError(
            error instanceof Error ? error.message : "Failed to load data"
          )
        );
      } finally {
        dispatch(setLoading(false));
        dispatch(setPartsLoading(false));
      }
    };

    loadData();
  }, [dispatch, user]);

  const totalSpent = vehicles.reduce(
    (sum, vehicle) => sum + vehicle.totalSpent,
    0
  );
  const totalParts = parts.length;
  const averagePartCost = totalParts > 0 ? totalSpent / totalParts : 0;
  // Define estimated installation costs by category
  const estimatedInstallCosts: Record<PartCategory, number> = {
    engine: 800,
    exhaust: 300,
    suspension: 600,
    wheels: 200,
    tires: 150,
    brakes: 400,
    interior: 250,
    exterior: 350,
    electronics: 200,
    audio: 300,
    performance: 500,
    maintenance: 200,
    other: 150,
  };

  const totalMoneySaved = parts.reduce((sum, part) => {
    // If user specified an installation cost, use that
    if (part.installationCost && part.installationCost > 0) {
      return sum + part.installationCost;
    }

    // Otherwise, use estimated cost for the category
    return sum + (estimatedInstallCosts[part.category] || 150);
  }, 0);

  const recentParts = parts.slice(0, 5);

  if (!user || vehiclesLoading || partsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Welcome back, {user?.name}</p>
        </div>
        <Link to="/vehicles/add" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Vehicles</p>
              <p className="text-2xl font-bold text-secondary-900">
                {vehicles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Wrench className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Parts</p>
              <p className="text-2xl font-bold text-secondary-900">
                {totalParts}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
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

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Parts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">
              Recent Parts
            </h2>
            <Link
              to="/parts"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentParts.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-secondary-900">{part.name}</p>
                  <p className="text-sm text-secondary-600">{part.brand}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-secondary-900">
                    ${part.totalCost}
                  </p>
                  <p className="text-sm text-secondary-600">{part.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/parts/add"
              className="flex items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-primary-900">Add New Part</p>
                <p className="text-sm text-primary-700">
                  Track a new modification
                </p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="flex items-center p-3 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-accent-600 mr-3" />
              <div>
                <p className="font-medium text-accent-900">View Analytics</p>
                <p className="text-sm text-accent-700">
                  See your spending trends
                </p>
              </div>
            </Link>

            <Link
              to="/vehicles"
              className="flex items-center p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Car className="w-5 h-5 text-secondary-600 mr-3" />
              <div>
                <p className="font-medium text-secondary-900">
                  Manage Vehicles
                </p>
                <p className="text-sm text-secondary-700">
                  View and edit your cars
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {user?.subscription === "free" && (
        <div className="card bg-gradient-to-r from-accent-50 to-accent-100 border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-accent-900">
                Upgrade to Premium
              </h3>
              <p className="text-accent-700">
                Track unlimited vehicles, export to PDF, and sync across devices
              </p>
            </div>
            <button className="btn-accent">Upgrade Now</button>
          </div>
        </div>
      )}
    </div>
  );
}
