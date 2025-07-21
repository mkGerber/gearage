import { useSelector, useDispatch } from "react-redux";
import { supabase } from "@/services/supabase";
import { RootState } from "@/store";
import { setUser } from "@/store/slices/authSlice";

export default function AuthDebug() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const clearAuth = async () => {
    console.log("Clearing auth state...");
    try {
      await supabase.auth.signOut();
      dispatch(setUser(null));
      console.log("Auth cleared successfully");
    } catch (error) {
      console.error("Error clearing auth:", error);
    }
  };

  const checkSession = async () => {
    console.log("Checking current session...");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Session check result:", { session, error });

      if (session?.user) {
        console.log("Current session user:", session.user);
      } else {
        console.log("No active session");
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  const refreshSession = async () => {
    console.log("Refreshing session...");
    try {
      const { data, error } = await supabase.auth.refreshSession();
      console.log("Session refresh result:", { data, error });
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  const createStorageBucket = async () => {
    console.log("Creating storage bucket...");
    try {
      // First check if bucket already exists
      const { data: existingBucket, error: checkError } =
        await supabase.storage.getBucket("vehicle-images");
      console.log("Existing bucket check:", { existingBucket, checkError });

      if (existingBucket) {
        alert("Bucket already exists!");
        return;
      }

      const { data, error } = await supabase.storage.createBucket(
        "vehicle-images",
        {
          public: true,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
          fileSizeLimit: 5242880, // 5MB
        }
      );
      console.log("Bucket creation result:", { data, error });

      if (error) {
        console.error("Bucket creation error details:", error);
        alert(`Bucket creation failed: ${error.message}`);
      } else {
        console.log("Bucket created successfully:", data);
        alert("Storage bucket created successfully!");

        // Test if we can access it
        const { data: testData, error: testError } =
          await supabase.storage.getBucket("vehicle-images");
        console.log("Test bucket access:", { testData, testError });
      }
    } catch (error) {
      console.error("Bucket creation exception:", error);
      alert(
        `Bucket creation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testImageUpload = async () => {
    console.log("Testing image upload...");
    try {
      // Create a simple test file
      const testBlob = new Blob(["test"], { type: "text/plain" });
      const testFile = new File([testBlob], "test.txt", { type: "text/plain" });

      const fileName = `test-${Date.now()}.txt`;
      console.log("Uploading test file:", fileName);

      const { data, error } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, testFile);

      console.log("Test upload result:", { data, error });

      if (error) {
        alert(`Test upload failed: ${error.message}`);
      } else {
        alert("Test upload successful!");

        // Try to get the public URL
        const { data: urlData } = supabase.storage
          .from("vehicle-images")
          .getPublicUrl(fileName);
        console.log("Public URL:", urlData.publicUrl);
      }
    } catch (error) {
      console.error("Test upload exception:", error);
      alert(
        `Test upload error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testVehicleImageUpload = async () => {
    console.log("Testing vehicle image upload...");
    try {
      // First check if we can access the bucket
      console.log("Checking bucket access...");
      const { data: bucketData, error: bucketError } =
        await supabase.storage.getBucket("vehicle-images");
      console.log("Bucket access result:", { bucketData, bucketError });

      if (bucketError) {
        alert(`Cannot access bucket: ${bucketError.message}`);
        return;
      }

      // Create a test image file (small PNG)
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("TEST", 25, 55);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testImageFile = new File([blob], "test-vehicle.png", {
            type: "image/png",
          });
          const fileName = `vehicle-${Date.now()}-test-vehicle.png`;

          console.log("Uploading test vehicle image:", fileName);
          console.log("File details:", {
            name: testImageFile.name,
            size: testImageFile.size,
            type: testImageFile.type,
          });

          const { data, error } = await supabase.storage
            .from("vehicle-images")
            .upload(fileName, testImageFile);

          console.log("Vehicle image upload result:", { data, error });

          if (error) {
            alert(`Vehicle image upload failed: ${error.message}`);
          } else {
            alert("Vehicle image upload successful!");

            const { data: urlData } = supabase.storage
              .from("vehicle-images")
              .getPublicUrl(fileName);
            console.log("Vehicle image URL:", urlData.publicUrl);
          }
        }
      }, "image/png");
    } catch (error) {
      console.error("Vehicle image upload exception:", error);
      alert(
        `Vehicle image upload error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-semibold text-sm mb-2">Auth Debug</h3>
      <div className="space-y-2">
        <div className="text-xs">
          <strong>User:</strong> {user ? `${user.name} (${user.id})` : "None"}
        </div>
        <button
          onClick={checkSession}
          className="block w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Check Session
        </button>
        <button
          onClick={refreshSession}
          className="block w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Refresh Session
        </button>
        <button
          onClick={clearAuth}
          className="block w-full text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear Auth
        </button>
        <button
          onClick={createStorageBucket}
          className="block w-full text-xs bg-purple-500 text-white px-2 py-1 rounded"
        >
          Create Storage Bucket
        </button>
        <button
          onClick={testImageUpload}
          className="block w-full text-xs bg-orange-500 text-white px-2 py-1 rounded"
        >
          Test Image Upload
        </button>
        <button
          onClick={testVehicleImageUpload}
          className="block w-full text-xs bg-yellow-500 text-white px-2 py-1 rounded"
        >
          Test Vehicle Image
        </button>
      </div>
    </div>
  );
}
