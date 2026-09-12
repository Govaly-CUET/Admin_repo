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
  const [selectedFile, setSelectedFile] = useState(null);

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
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);

    setPhoto(previewUrl);
    setSuccess("");
    setError("");
  };

  const handleRemovePhoto = () => {
    setPhoto(DEFAULT_AVATAR);
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSuccess("");
    setError("");
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
      let imageUrl =
        photo === DEFAULT_AVATAR ? "" : photo;

      if (selectedFile) {
        const uploadFormData = new FormData();

        uploadFormData.append("file", selectedFile);
        uploadFormData.append(
          "folder",
          "govaly/admin"
        );

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

        const uploadResult =
          await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadResult?.message ||
              "Image upload failed."
          );
        }

        imageUrl = uploadResult?.data?.url;

        if (!imageUrl) {
          throw new Error(
            "Cloudinary did not return an image URL."
          );
        }
      }

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
            image: imageUrl,
          }),
        }
      );

      const profileResult =
        await profileResponse.json();

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

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="admin-profile-file-input"
              onChange={handleFileChange}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

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
          value={form.fullName}
          onChange={handleFieldChange("fullName")}
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

