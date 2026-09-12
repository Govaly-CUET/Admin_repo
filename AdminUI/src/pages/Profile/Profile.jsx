import { useRef, useState } from "react";
import "./Profile.css";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23e5876b"/><circle cx="40" cy="32" r="14" fill="%23fff"/><path d="M14 72c4-16 18-24 26-24s22 8 26 24" fill="%23fff"/></svg>'
  );

export default function Profile() {
  const [photo, setPhoto] = useState(DEFAULT_AVATAR);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  /*
   * These values are assigned when the admin account is created.
   * They are read-only and cannot be edited from the profile page.
   */
  const [adminInfo] = useState({
    department: "",
    designation: "",
    id: "",
  });

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

    setPhoto(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhoto(DEFAULT_AVATAR);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setIsSaving(true);

    try {
      /*
       * Backend API will be connected here later.
       *
       * Example:
       *
       * PATCH /api/v1/admin/auth/me
       *
       * with:
       * {
       *   name,
       *   phone,
       *   email,
       *   image
       * }
       */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-profile-page">
      <h1 className="admin-profile-title">My Profile</h1>

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
            >
              Upload Image
            </button>

            <button
              type="button"
              className="admin-profile-btn admin-profile-btn-secondary"
              onClick={handleRemovePhoto}
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
          value={form.fullName}
          onChange={handleFieldChange("fullName")}
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
          className="admin-profile-input"
          value={form.email}
          onChange={handleFieldChange("email")}
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

        <label
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