import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Edit, Trash2, ExternalLink, Wrench } from "lucide-react";
import { RootState } from "@/store";

export default function PartDetails() {
  const { id } = useParams<{ id: string }>();
  const { parts } = useSelector((state: RootState) => state.parts);
  const { vehicles } = useSelector((state: RootState) => state.vehicles);

  const part = parts.find((p) => p.id === id);
  const vehicle = part ? vehicles.find((v) => v.id === part.vehicleId) : null;

  if (!part) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
          Part not found
        </h2>
        <p className="text-secondary-600 mb-4">
          The part you're looking for doesn't exist.
        </p>
        <Link to="/parts" className="btn-primary">
          Back to Parts
        </Link>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/parts"
            className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {part.name}
            </h1>
            <p className="text-secondary-600">
              {vehicle?.name} •{" "}
              {part.category.charAt(0).toUpperCase() + part.category.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/parts/${part.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {part.images.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {part.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-secondary-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`${part.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Part Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary-500">Category</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      categoryColors[part.category]
                    }`}
                  >
                    {part.category.charAt(0).toUpperCase() +
                      part.category.slice(1)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Brand</p>
                  <p className="font-medium text-secondary-900">
                    {part.brand || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Part Number</p>
                  <p className="font-medium text-secondary-900">
                    {part.partNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Warranty</p>
                  <p className="font-medium text-secondary-900">
                    {part.warranty || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary-500">
                    Installation Date
                  </p>
                  <p className="font-medium text-secondary-900">{part.date}</p>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">
                    Mileage at Installation
                  </p>
                  <p className="font-medium text-secondary-900">
                    {part.mileage.toLocaleString()} mi
                  </p>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Vehicle</p>
                  <Link
                    to={`/vehicles/${part.vehicleId}`}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    {vehicle?.name}
                  </Link>
                </div>

                <div>
                  <p className="text-sm text-secondary-500">Added</p>
                  <p className="font-medium text-secondary-900">
                    {new Date(part.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {part.description && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="font-medium text-secondary-900 mb-2">
                  Description
                </h3>
                <p className="text-secondary-600">{part.description}</p>
              </div>
            )}

            {part.notes && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <h3 className="font-medium text-secondary-900 mb-2">Notes</h3>
                <p className="text-secondary-600">{part.notes}</p>
              </div>
            )}
          </div>

          {/* Links */}
          {part.links.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Links
              </h2>
              <div className="space-y-2">
                {part.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Cost Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-secondary-700">Part Cost</span>
                </div>
                <span className="font-semibold text-secondary-900">
                  ${part.cost.toLocaleString()}
                </span>
              </div>

              {part.installationCost && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <span className="text-green-600">🔧</span>
                    </div>
                    <span className="text-secondary-700">Installation</span>
                  </div>
                  <span className="font-semibold text-secondary-900">
                    ${part.installationCost.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-secondary-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-secondary-900">
                    Total Cost
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ${part.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full btn-secondary">Export Part Data</button>
              <button className="w-full btn-secondary">Add to Wishlist</button>
              <button className="w-full btn-secondary">Share Part</button>
            </div>
          </div>

          {/* Vehicle Info */}
          {vehicle && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Vehicle
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-secondary-500">Vehicle</p>
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    {vehicle.name}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Make & Model</p>
                  <p className="font-medium text-secondary-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Current Mileage</p>
                  <p className="font-medium text-secondary-900">
                    {vehicle.mileage.toLocaleString()} mi
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
