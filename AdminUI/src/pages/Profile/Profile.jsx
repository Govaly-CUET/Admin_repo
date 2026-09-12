import { useEffect, useRef, useState } from "react";
import "./Profile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23e5876b"/><circle cx="40" cy="32" r="14" fill="%23fff"/><path d="M14 72c4-16 18-24 26-24s22 8 26 24" fill="%23fff"/></svg>'
  );

export default function Profile() {
  const [photo, setPhoto] = useState(DEFAULT_AVATAR);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [adminInfo, setAdminInfo] = useState({
    department: "",
    designation: "",
    id: "",
  });

  /*
   * Get logged-in admin profile
   */
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(
        "govaly_admin_token"
      );

      if (!token) {
        setError("You are not authenticated.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load profile."
          );
        }

        const admin = data.data;

        setForm({
          name: admin.name || "",
          phone: admin.phone || "",
          email: admin.email || "",
        });

        setAdminInfo({
          department: admin.dept || "",
          designation: admin.designation || "",
          id: admin.id || "",
        });

        if (admin.image) {
          setPhoto(admin.image);
        }
      } catch (err) {
        setError(
          err.message || "Failed to load profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFieldChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Temporary local preview.
     *
     * Later:
     * 1. Upload file to Cloudinary.
     * 2. Receive Cloudinary URL.
     * 3. Save that URL to MongoDB.
     */
    const previewUrl = URL.createObjectURL(file);

    setPhoto(previewUrl);

    setSuccess("");
    setError("");
  };

  const handleRemovePhoto = () => {
    setPhoto(DEFAULT_AVATAR);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSuccess("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setIsSaving(true);

    const token = localStorage.getItem(
      "govaly_admin_token"
    );

    if (!token) {
      setError("You are not authenticated.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,

            /*
             * Currently not sent because your backend
             * profile service does not allow email updates.
             */

            dept: adminInfo.department,
            designation: adminInfo.designation,

            /*
             * If photo is a Cloudinary URL,
             * this will be saved as a string.
             */
            image:
              photo === DEFAULT_AVATAR
                ? ""
                : photo,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update profile."
        );
      }

      const admin = data.data;

      setForm({
        name: admin.name || "",
        phone: admin.phone || "",
        email: admin.email || "",
      });

      setAdminInfo({
        department: admin.dept || "",
        designation: admin.designation || "",
        id: admin.id || "",
      });

      if (admin.image) {
        setPhoto(admin.image);
      }

      setSuccess(
        data.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-profile-page">
        <h1 className="admin-profile-title">
          My Profile
        </h1>

        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <h1 className="admin-profile-title">
        My Profile
      </h1>

      {error && (
        <p className="admin-profile-error">
          {error}
        </p>
      )}

      {success && (
        <p className="admin-profile-success">
          {success}
        </p>
      )}

      <div className="admin-profile-picture-row">
        <img
          src={photo}
          alt="Profile"
          className="admin-profile-avatar"
        />

        <div>
          <p className="admin-profile-picture-label">
            Profile Picture
          </p>

          <div className="admin-profile-picture-actions">
            <button
              type="button"
              className="admin-profile-btn admin-profile-btn-upload"
              onClick={handleUploadClick}
              disabled={isSaving}
            >
              Upload Image
            </button>

            <button
              type="button"
              className="admin-profile-btn admin-profile-btn-secondary"
              onClick={handleRemovePhoto}
              disabled={isSaving}
            >
              Remove
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="admin-profile-file-input"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <form
        className="admin-profile-form"
        onSubmit={handleSave}
      >
        <label
          className="admin-profile-field-label"
          htmlFor="fullName"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          className="admin-profile-input"
          value={form.name}
          onChange={handleFieldChange("name")}
          disabled={isSaving}
        />

        <label
          className="admin-profile-field-label"
          htmlFor="phone"
        >
          Phone
        </label>

        <input
          id="phone"
          type="tel"
          className="admin-profile-input"
          value={form.phone}
          onChange={handleFieldChange("phone")}
          disabled={isSaving}
        />

        <label
          className="admin-profile-field-label"
          htmlFor="email"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          className="admin-profile-input admin-profile-input-readonly"
          value={form.email}
          disabled
        />

        <label
          className="admin-profile-field-label"
          htmlFor="department"
        >
          Department
        </label>

        <input
          id="department"
          type="text"
          className="admin-profile-input admin-profile-input-readonly"
          value={adminInfo.department}
          disabled
        />

        <label
          className="admin-profile-field-label"
          htmlFor="designation"
        >
          Designation
        </label>

        <input
          id="designation"
          type="text"
          className="admin-profile-input admin-profile-input-readonly"
          value={adminInfo.designation}
          disabled
        />

        {/* <label
          className="admin-profile-field-label"
          htmlFor="adminId"
        >
          ID
        </label>

        <input
          id="adminId"
          type="text"
          className="admin-profile-input admin-profile-input-readonly"
          value={adminInfo.id}
          disabled
        /> */}

        <button
          type="submit"
          className="admin-profile-btn admin-profile-btn-save"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}