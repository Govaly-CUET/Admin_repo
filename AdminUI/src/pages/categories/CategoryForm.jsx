import { useState } from "react";
import CategoryImageUpload from
  "../../components/category/CategoryImageUpload";

const CategoryForm = ({
  initialData,
  availableCategories = [],
  onSubmit,
  onCancel,
  loading,
}) => {

  const [name, setName] =
    useState(
      initialData?.name || ""
    );

  const [subcategories, setSubcategories] =
    useState(
      initialData?.subcategory || []
    );


  const addSubcategory = () => {
    setSubcategories((prev) => [
      ...prev,
      {
        name: "",
        image: "",
      },
    ]);
  };


  const removeSubcategory = (index) => {
    setSubcategories((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };


  const updateSubcategory = (
    index,
    field,
    value
  ) => {
    setSubcategories((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };


  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert(
        "Category name is required."
      );
      return;
    }

    for (const item of subcategories) {
      if (!item.name.trim()) {
        alert(
          "Every subcategory needs a name."
        );
        return;
      }

    }

    await onSubmit({
      name: name.trim(),

      subcategory:
        subcategories.map((item) => ({
          ...(item._id
            ? { _id: item._id }
            : {}),

          name: item.name.trim(),

          image: item.image,
        })),
    });
  };


  return (
    <form
      className="admin-card category-form"
      onSubmit={submit}
    >

      <div className="form-field">

        <label className="admin-field-label">
          Category Name
        </label>

        <input
          type="text"
          className="admin-input"
          list="available-category-names"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="Enter category name"
        />

        <datalist id="available-category-names">
          {availableCategories.map((category) => (
            <option
              key={category._id}
              value={category.name}
            />
          ))}
        </datalist>

      </div>


      <div className="subcategory-section">

        <div className="subcategory-header">

          <h3>
            Subcategories
          </h3>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={addSubcategory}
          >
            + Add Subcategory
          </button>

        </div>


        {subcategories.length === 0 && (
          <p>
            No subcategories added.
          </p>
        )}


        {subcategories.map(
          (item, index) => (
            <div
              className="subcategory-item"
              key={
                item._id ||
                `new-${index}`
              }
            >

              <div>
                <label className="admin-field-label">
                  Subcategory Name
                </label>

                <input
                  type="text"
                  className="admin-input"
                  value={item.name}
                  onChange={(e) =>
                    updateSubcategory(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Subcategory name"
                />
              </div>


              <div>

                <label className="admin-field-label">
                  Image
                </label>

                <CategoryImageUpload
                  value={item.image}
                  onChange={(url) =>
                    updateSubcategory(
                      index,
                      "image",
                      url
                    )
                  }
                />

              </div>


              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() =>
                  removeSubcategory(
                    index
                  )
                }
              >
                Remove
              </button>

            </div>
          )
        )}

      </div>


      <div className="form-actions">

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialData
            ? "Update Category"
            : "Create Category"}
        </button>

      </div>

    </form>
  );
};

export default CategoryForm;