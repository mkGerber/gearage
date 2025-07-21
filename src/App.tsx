import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import AddVehicle from "./pages/AddVehicle";
import Parts from "./pages/Parts";
import AddPart from "./pages/AddPart";
import PartDetails from "./pages/PartDetails";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TestVehicle from "./pages/TestVehicle";
import { RootState } from "./store";
import { setupStorageBuckets } from "./utils/setupStorage";
import { setUser, setLoading } from "./store/slices/authSlice";
import { supabase } from "./services/supabase";

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log("Setting up auth state listener...");

    let isInitialized = false;

    // Setup auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        // Use basic user data without profile query to avoid hanging
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email?.split("@")[0] || "User",
          subscription: "free" as const,
          createdAt: session.user.created_at,
        };

        console.log("Setting user data from auth state change:", userData);
        dispatch(setUser(userData));
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        dispatch(setUser(null));
      }

      // Mark initialization as complete
      if (!isInitialized) {
        console.log("Completing initialization from auth state change...");
        isInitialized = true;
        setIsInitializing(false);
      }
    });

    // Check for existing session with timeout
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("Found existing session for user:", session.user.id);
          // Set user immediately without waiting for profile
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.email?.split("@")[0] || "User",
            subscription: "free" as const,
            createdAt: session.user.created_at,
          };
          dispatch(setUser(userData));
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        if (!isInitialized) {
          console.log("Completing initialization from session check...");
          isInitialized = true;
          setIsInitializing(false);
        }
      }
    };

    // Run session check with timeout
    const sessionTimeout = setTimeout(() => {
      console.log("Session check timeout - forcing initialization complete");
      if (!isInitialized) {
        isInitialized = true;
        setIsInitializing(false);
      }
    }, 5000); // 5 seconds

    checkSession().finally(() => {
      clearTimeout(sessionTimeout);
    });

    // Setup storage buckets (non-blocking) - disabled since buckets already exist
    // setupStorageBuckets().catch(console.error);

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log("Fallback timeout - forcing initialization complete");
      if (!isInitialized) {
        isInitialized = true;
        setIsInitializing(false);
      }
    }, 8000); // 8 seconds

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
      clearTimeout(sessionTimeout);
    };
  }, [dispatch]);

  // Show loading while checking session
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
          <p className="text-xs text-secondary-400 mt-2">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/add" element={<AddVehicle />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/parts/add" element={<AddPart />} />
        <Route path="/parts/:id" element={<PartDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test" element={<TestVehicle />} />
      </Routes>
    </Layout>
  );
}

export default App;
