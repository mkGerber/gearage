import { useState } from "react";
import { useSelector } from "react-redux";
import { Crown, Download, User, Bell, Shield } from "lucide-react";
import { RootState } from "@/store";

export default function Settings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    maintenance: true,
    newFeatures: true,
  });

  const handleNotificationChange = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Profile
            </h2>
            <p className="text-secondary-600">
              Manage your account information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={user?.name || ""}
              className="input-field"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              className="input-field"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-secondary-900">
              Subscription
            </h2>
            <p className="text-secondary-600">Manage your subscription plan</p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.subscription === "premium"
                  ? "bg-accent-100 text-accent-800"
                  : "bg-secondary-100 text-secondary-800"
              }`}
            >
              {user?.subscription === "premium" ? "Premium" : "Free"}
            </span>
          </div>
        </div>

        {user?.subscription === "free" ? (
          <div className="bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-900 mb-2">
              Upgrade to Premium
            </h3>
            <p className="text-accent-700 mb-4">
              Unlock unlimited vehicles, cloud sync, PDF exports, and more
              features.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-accent-700">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                Unlimited vehicles (vs 1 free)
              </div>
              <div className="flex items-center text-accent-700">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                Cloud sync across devices
              </div>
              <div className="flex items-center text-accent-700">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                Export to PDF
              </div>
              <div className="flex items-center text-accent-700">
                <span className="w-2 h-2 bg-accent-500 rounded-full mr-2"></span>
                Advanced analytics
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="btn-accent">$4.99/month</button>
              <button className="btn-secondary">$39.99/year (Save 33%)</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">
                  Premium Plan Active
                </p>
                <p className="text-sm text-green-700">
                  Next billing: January 15, 2025
                </p>
              </div>
              <button className="btn-secondary">Manage Billing</button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Notifications
            </h2>
            <p className="text-secondary-600">
              Choose what notifications you receive
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">
                Email Notifications
              </p>
              <p className="text-sm text-secondary-600">
                Receive updates via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationChange("email")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">
                Push Notifications
              </p>
              <p className="text-sm text-secondary-600">
                Receive updates in your browser
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationChange("push")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">
                Maintenance Reminders
              </p>
              <p className="text-sm text-secondary-600">
                Get notified about upcoming maintenance
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.maintenance}
                onChange={() => handleNotificationChange("maintenance")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">New Features</p>
              <p className="text-sm text-secondary-600">
                Learn about new features and updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.newFeatures}
                onChange={() => handleNotificationChange("newFeatures")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Export */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Data & Export
            </h2>
            <p className="text-secondary-600">
              Export your data and manage backups
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Export to CSV</p>
              <p className="text-sm text-secondary-600">
                Download all your data as CSV files
              </p>
            </div>
            <button className="btn-secondary">Export</button>
          </div>

          {user?.subscription === "premium" && (
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div>
                <p className="font-medium text-secondary-900">Export to PDF</p>
                <p className="text-sm text-secondary-600">
                  Generate professional PDF reports
                </p>
              </div>
              <button className="btn-primary">Generate PDF</button>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div>
              <p className="font-medium text-secondary-900">Backup Data</p>
              <p className="text-sm text-secondary-600">
                Create a backup of your data
              </p>
            </div>
            <button className="btn-secondary">Backup</button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Privacy & Security
            </h2>
            <p className="text-secondary-600">
              Manage your privacy and security settings
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full text-left p-4 hover:bg-secondary-50 rounded-lg transition-colors">
            <p className="font-medium text-secondary-900">Change Password</p>
            <p className="text-sm text-secondary-600">
              Update your account password
            </p>
          </button>

          <button className="w-full text-left p-4 hover:bg-secondary-50 rounded-lg transition-colors">
            <p className="font-medium text-secondary-900">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-secondary-600">
              Add an extra layer of security
            </p>
          </button>

          <button className="w-full text-left p-4 hover:bg-secondary-50 rounded-lg transition-colors">
            <p className="font-medium text-secondary-900">Privacy Policy</p>
            <p className="text-sm text-secondary-600">
              Read our privacy policy
            </p>
          </button>

          <button className="w-full text-left p-4 hover:bg-secondary-50 rounded-lg transition-colors">
            <p className="font-medium text-secondary-900">Terms of Service</p>
            <p className="text-sm text-secondary-600">
              Read our terms of service
            </p>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Danger Zone
            </h2>
            <p className="text-secondary-600">
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
