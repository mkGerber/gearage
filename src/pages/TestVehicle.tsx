import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "@/services/supabase";
import { RootState } from "@/store";
import { addVehicle } from "@/store/slices/vehiclesSlice";
import toast from "react-hot-toast";

export default function TestVehicle() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const testVehicleInsert = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setLoading(true);
    console.log("Testing vehicle insert for user:", user.id);

    try {
      // Simple test vehicle data
      const testVehicle = {
        user_id: user.id,
        name: "Test Vehicle",
        make: "Test",
        model: "Car",
        year: 2024,
        mileage: 1000,
        color: "Red",
        total_spent: 0,
      };

      console.log("Test vehicle data:", testVehicle);

      // Test the insert
      const { data, error } = await supabase
        .from("vehicles")
        .insert([testVehicle])
        .select()
        .single();

      console.log("Test insert result:", { data, error });

      if (error) {
        console.error("Test insert error:", error);
        toast.error(`Insert failed: ${error.message}`);
      } else {
        console.log("Test insert successful:", data);
        toast.success("Test vehicle added successfully!");

        // Add to Redux store
        const newVehicle = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          make: data.make,
          model: data.model,
          year: data.year,
          mileage: data.mileage,
          color: data.color,
          totalSpent: data.total_spent,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        dispatch(addVehicle(newVehicle));
      }
    } catch (error) {
      console.error("Test insert exception:", error);
      toast.error(
        `Exception: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    console.log("Testing database connection...");

    try {
      // Test basic query
      const { data, error } = await supabase
        .from("vehicles")
        .select("id")
        .limit(1);

      console.log("Database connection test:", { data, error });

      if (error) {
        toast.error(`Database connection failed: ${error.message}`);
      } else {
        toast.success("Database connection successful!");
      }
    } catch (error) {
      console.error("Database connection exception:", error);
      toast.error(
        `Connection exception: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vehicle Insert Test</h1>

      <div className="space-y-4">
        <button
          onClick={testDatabaseConnection}
          className="w-full btn-secondary"
        >
          Test Database Connection
        </button>

        <button
          onClick={testVehicleInsert}
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? "Testing..." : "Test Vehicle Insert"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current User:</h3>
        <p className="text-sm text-secondary-600">
          ID: {user?.id}
          <br />
          Email: {user?.email}
          <br />
          Name: {user?.name}
        </p>
      </div>
    </div>
  );
}
