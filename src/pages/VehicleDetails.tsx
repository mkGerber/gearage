import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { RootState } from "@/store";
import { setCurrentVehicle } from "@/store/slices/vehiclesSlice";
import { Part } from "@/types";

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { vehicles } = useSelector((state: RootState) => state.vehicles);
  const { parts } = useSelector((state: RootState) => state.parts);

  const vehicle = vehicles.find((v) => v.id === id);
  const vehicleParts = parts.filter((p) => p.vehicleId === id);

  useEffect(() => {
    if (vehicle) {
      dispatch(setCurrentVehicle(vehicle));
    }
  }, [vehicle, dispatch]);

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Vehicle not found
        </h2>
        <p className="text-secondary-600 mb-4">
          The vehicle you're looking for doesn't exist.
        </p>
        <Link to="/vehicles" className="btn-primary">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  const totalParts = vehicleParts.length;
  const averagePartCost = totalParts > 0 ? vehicle.totalSpent / totalParts : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/vehicles"
            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {vehicle.name}
            </h1>
            <p className="text-secondary-600">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Vehicle Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Image and Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-6 flex items-center justify-center">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-primary-600 text-6xl font-bold">
                  {vehicle.make.charAt(0)}
                  {vehicle.model.charAt(0)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-secondary-500">Color</p>
                <p className="font-medium text-secondary-900">
                  {vehicle.color}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Mileage</p>
                <p className="font-medium text-secondary-900">
                  {vehicle.mileage.toLocaleString()} mi
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">VIN</p>
                <p className="font-medium text-secondary-900">
                  {vehicle.vin || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Total Spent</p>
                <p className="font-medium text-green-600">
                  ${vehicle.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="font-medium text-secondary-900 mb-2">
                  Description
                </h3>
                <p className="text-secondary-600">{vehicle.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-accent-100 rounded-lg mr-3">
                    <span className="text-accent-600">🔧</span>
                  </div>
                  <span className="text-secondary-700">Total Parts</span>
                </div>
                <span className="font-semibold text-secondary-900">
                  {totalParts}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-secondary-700">Total Spent</span>
                </div>
                <span className="font-semibold text-green-600">
                  ${vehicle.totalSpent.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <span className="text-blue-600">📊</span>
                  </div>
                  <span className="text-secondary-700">Avg Part Cost</span>
                </div>
                <span className="font-semibold text-secondary-900">
                  ${averagePartCost.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-secondary-700">Added</span>
                </div>
                <span className="font-semibold text-secondary-900">
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/parts/add"
                className="w-full btn-primary flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Part
              </Link>
              <button className="w-full btn-secondary">Export Data</button>
              <button className="w-full btn-secondary">Generate Report</button>
            </div>
          </div>
        </div>
      </div>

      {/* Parts List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">
            Parts & Modifications
          </h2>
          <Link to="/parts/add" className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Link>
        </div>

        {vehicleParts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No parts yet
            </h3>
            <p className="text-secondary-600 mb-6">
              Start tracking modifications and parts for this vehicle.
            </p>
            <Link to="/parts/add" className="btn-primary">
              Add Your First Part
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicleParts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PartCardProps {
  part: Part;
}

function PartCard({ part }: PartCardProps) {
  const categoryColors: Record<string, string> = {
    engine: "bg-red-100 text-red-800",
    exhaust: "bg-orange-100 text-orange-800",
    suspension: "bg-blue-100 text-blue-800",
    wheels: "bg-gray-100 text-gray-800",
    tires: "bg-black text-white",
    brakes: "bg-red-100 text-red-800",
    interior: "bg-purple-100 text-purple-800",
    exterior: "bg-green-100 text-green-800",
    electronics: "bg-yellow-100 text-yellow-800",
    audio: "bg-pink-100 text-pink-800",
    performance: "bg-indigo-100 text-indigo-800",
    maintenance: "bg-teal-100 text-teal-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">
              {part.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                categoryColors[part.category]
              }`}
            >
              {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
            <div>
              <p className="text-secondary-500">Warranty</p>
              <p className="font-medium text-secondary-900">
                {part.warranty || "N/A"}
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
        </div>
      </div>
    </div>
  );
}
