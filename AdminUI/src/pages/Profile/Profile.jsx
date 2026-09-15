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

export default function Profile({ onProfileUpdated }) {
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(DEFAULT_AVATAR);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const [adminInfo, setAdminInfo] = useState({
    department: "",
    designation: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUpdating, setIsImageUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("govaly_admin_token");

      if (!token) {
        setError("Authentication token not found.");
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

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Failed to load profile."
          );
        }

        const admin = result.data;

        setForm({
          fullName: admin.name || "",
          phone: admin.phone || "",
          email: admin.email || "",
        });

        setAdminInfo({
          department: admin.dept || "",
          designation: admin.designation || "",
        });

        setPhoto(admin.image || DEFAULT_AVATAR);
      } catch (err) {
        console.error("Profile loading error:", err);

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
  };

  const handleUploadClick = () => {
    if (!isImageUpdating && !isSaving) {
      fileInputRef.current?.click();
    }
  };

  const updateProfileImage = async (imageUrl) => {
    const token = localStorage.getItem("govaly_admin_token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/profile`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: imageUrl,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message || "Failed to update profile picture."
      );
    }

    return result.data;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const previousPhoto = photo;
    const previewUrl = URL.createObjectURL(file);

    setPhoto(previewUrl);
    setSuccess("");
    setError("");
    setIsImageUpdating(true);

    try {
      const token = localStorage.getItem("govaly_admin_token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const uploadFormData = new FormData();

      uploadFormData.append("file", file);
      uploadFormData.append("folder", "govaly/admin");

      const uploadResponse = await fetch(
        `${API_BASE_URL}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult?.message || "Image upload failed."
        );
      }

      const imageUrl = uploadResult?.data?.url;

      if (!imageUrl) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      const updatedAdmin = await updateProfileImage(imageUrl);

      setPhoto(updatedAdmin.image || DEFAULT_AVATAR);

      if (onProfileUpdated) {
        onProfileUpdated(updatedAdmin);
      }

      setSuccess("Profile picture updated successfully.");
    } catch (err) {
      console.error("Profile picture upload error:", err);

      setPhoto(previousPhoto);

      setError(
        err.message || "Failed to update profile picture."
      );
    } finally {
      URL.revokeObjectURL(previewUrl);
      setIsImageUpdating(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    const previousPhoto = photo;

    setPhoto(DEFAULT_AVATAR);
    setSuccess("");
    setError("");
    setIsImageUpdating(true);

    try {
      const updatedAdmin = await updateProfileImage("");

      setPhoto(updatedAdmin.image || DEFAULT_AVATAR);

      if (onProfileUpdated) {
        onProfileUpdated(updatedAdmin);
      }

      setSuccess("Profile picture removed successfully.");
    } catch (err) {
      console.error("Profile picture removal error:", err);

      setPhoto(previousPhoto);

      setError(
        err.message || "Failed to remove profile picture."
      );
    } finally {
      setIsImageUpdating(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("govaly_admin_token");

    if (!token) {
      setError("Authentication token not found.");
      setIsSaving(false);
      return;
    }

    try {
      const profileResponse = await fetch(
        `${API_BASE_URL}/admin/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.fullName,
            phone: form.phone,
          }),
        }
      );

      const profileResult = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileResult?.message ||
            "Failed to update profile."
        );
      }

      const updatedAdmin = profileResult.data;

      setForm({
        fullName: updatedAdmin.name || "",
        phone: updatedAdmin.phone || "",
        email: updatedAdmin.email || "",
      });

      setAdminInfo({
        department: updatedAdmin.dept || "",
        designation: updatedAdmin.designation || "",
      });

      setPhoto(
        updatedAdmin.image || DEFAULT_AVATAR
      );

      if (onProfileUpdated) {
        onProfileUpdated(updatedAdmin);
      }

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Profile save error:", err);

      setError(
        err.message ||
          "Something went wrong while saving the profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-profile-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">My Profile</h1>
        </div>

        <p className="admin-status-text">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">My Profile</h1>
      </div>

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
              className="admin-profile-btn-upload"
              onClick={handleUploadClick}
              disabled={isSaving || isImageUpdating}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              {isImageUpdating ? "Updating..." : "Upload Image"}
            </button>

            {photo !== DEFAULT_AVATAR && (
              <button
                type="button"
                className="admin-profile-btn-remove"
                onClick={handleRemovePhoto}
                disabled={isSaving || isImageUpdating}
              >
                Remove
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="admin-profile-file-input"
              onChange={handleFileChange}
              disabled={isSaving || isImageUpdating}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="admin-error-text">
          {error}
        </p>
      )}

      {success && (
        <p className="admin-success-text">
          {success}
        </p>
      )}

      <form
        className="admin-profile-form"
        onSubmit={handleSave}
      >
        <label
          className="admin-field-label"
          htmlFor="fullName"
        >
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          className="admin-input admin-profile-input"
          value={form.fullName}
          onChange={handleFieldChange("fullName")}
          disabled={isSaving || isImageUpdating}
        />

        <label
          className="admin-field-label"
          htmlFor="phone"
        >
          Phone
        </label>

        <input
          id="phone"
          type="tel"
          className="admin-input admin-profile-input"
          value={form.phone}
          onChange={handleFieldChange("phone")}
          disabled={isSaving || isImageUpdating}
        />

        <label
          className="admin-field-label"
          htmlFor="email"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          className="admin-input admin-profile-input admin-profile-input-readonly"
          value={form.email}
          disabled
        />

        <label
          className="admin-field-label"
          htmlFor="department"
        >
          Department
        </label>

        <input
          id="department"
          type="text"
          className="admin-input admin-profile-input admin-profile-input-readonly"
          value={adminInfo.department}
          disabled
        />

        <label
          className="admin-field-label"
          htmlFor="designation"
        >
          Designation
        </label>

        <input
          id="designation"
          type="text"
          className="admin-input admin-profile-input admin-profile-input-readonly"
          value={adminInfo.designation}
          disabled
        />

        <button
          type="submit"
          className="admin-profile-btn-save"
          disabled={isSaving || isImageUpdating}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}