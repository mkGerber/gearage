import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { RootState } from "@/store";
import { setAnalytics } from "@/store/slices/analyticsSlice";

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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
];

export default function Analytics() {
  const dispatch = useDispatch();
  const { parts, loading: partsLoading } = useSelector(
    (state: RootState) => state.parts
  );
  const { vehicles, loading: vehiclesLoading } = useSelector(
    (state: RootState) => state.vehicles
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const calculatedAnalytics = useMemo(() => {
    const totalSpent = parts.reduce((sum, part) => sum + part.totalCost, 0);
    const totalParts = parts.length;
    const averagePartCost = totalParts > 0 ? totalSpent / totalParts : 0;

    // Spending by category
    const spendingByCategory: Record<string, number> = {};
    parts.forEach((part) => {
      spendingByCategory[part.category] =
        (spendingByCategory[part.category] || 0) + part.totalCost;
    });

    // Parts by category
    const partsByCategory: Record<string, number> = {};
    parts.forEach((part) => {
      partsByCategory[part.category] =
        (partsByCategory[part.category] || 0) + 1;
    });

    // Spending by month (last 12 months)
    const spendingByMonth: Array<{ month: string; amount: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthParts = parts.filter((part) => {
        const partDate = new Date(part.date);
        return (
          partDate.getMonth() === date.getMonth() &&
          partDate.getFullYear() === date.getFullYear()
        );
      });
      const monthTotal = monthParts.reduce(
        (sum, part) => sum + part.totalCost,
        0
      );
      spendingByMonth.push({ month: monthName, amount: monthTotal });
    }

    return {
      totalSpent,
      totalParts,
      averagePartCost,
      spendingByCategory,
      spendingByMonth,
      partsByCategory,
    };
  }, [parts]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load vehicles first
        dispatch(setVehiclesLoading(true));
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

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

        // Load parts
        dispatch(setPartsLoading(true));
        const { data: partsData, error: partsError } = await supabase
          .from("parts")
          .select("*")
          .in("vehicle_id", vehiclesData?.map((v) => v.id) || [])
          .order("created_at", { ascending: false });

        if (partsError) throw partsError;

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
      } catch (error) {
        console.error("Error loading analytics data:", error);
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

  useEffect(() => {
    dispatch(setAnalytics(calculatedAnalytics));
  }, [calculatedAnalytics, dispatch]);

  if (!user || partsLoading || vehiclesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(
    calculatedAnalytics.spendingByCategory
  ).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
  }));

  const partsByCategoryData = Object.entries(
    calculatedAnalytics.partsByCategory
  ).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
        <p className="text-secondary-600">
          Track your spending and modification trends
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                ${calculatedAnalytics.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Total Parts
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {calculatedAnalytics.totalParts}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">
                Avg Part Cost
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                ${calculatedAnalytics.averagePartCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <span className="text-2xl">🚗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Vehicles</p>
              <p className="text-2xl font-bold text-secondary-900">
                {vehicles.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Month */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Spending by Month
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calculatedAnalytics.spendingByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Spending by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Parts by Category */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Parts by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partsByCategoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Spending */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Spending by Vehicle
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={vehicles.map((vehicle) => ({
                name: vehicle.name,
                value: vehicle.totalSpent,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Category Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 font-medium text-secondary-700">
                  Category
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-700">
                  Parts
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-700">
                  Total Spent
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-700">
                  Avg Cost
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-700">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) => {
                const partCount =
                  calculatedAnalytics.partsByCategory[
                    category.name.toLowerCase()
                  ] || 0;
                const avgCost = partCount > 0 ? category.value / partCount : 0;
                const percentage =
                  calculatedAnalytics.totalSpent > 0
                    ? (category.value / calculatedAnalytics.totalSpent) * 100
                    : 0;

                return (
                  <tr
                    key={category.name}
                    className="border-b border-secondary-100"
                  >
                    <td className="py-3 px-4 font-medium text-secondary-900">
                      {category.name}
                    </td>
                    <td className="py-3 px-4 text-right text-secondary-600">
                      {partCount}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-secondary-900">
                      ${category.value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-secondary-600">
                      ${avgCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-secondary-600">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
