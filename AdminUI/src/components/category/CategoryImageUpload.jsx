import { useRef, useState } from "react";
import { categoryService } from "../../services/categoryService";

const CategoryImageUpload = ({
  value,
  onChange,
}) => {
  const inputRef = useRef(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleFile = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");

      const response =
        await categoryService.uploadImage(
          file
        );

      const url =
        response.data?.url;

      if (!url) {
        throw new Error(
          "Image URL was not returned."
        );
      }

      onChange(url);
    } catch (err) {
      setError(
        err.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };


  return (
    <div className="category-image-upload">

      {value ? (
        <img
          src={value}
          alt="subcategory"
          className="subcategory-preview"
        />
      ) : (
        <div className="subcategory-placeholder">
          No image
        </div>
      )}

      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : value
          ? "Change Image"
          : "Upload Image"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFile}
      />

      {error && (
        <small className="upload-error">
          {error}
        </small>
      )}

    </div>
  );
};

export default CategoryImageUpload;