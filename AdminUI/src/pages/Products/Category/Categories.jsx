import { useEffect, useState } from "react";

import {
  categoryService,
} from "../../../services/categoryService";

import CategoryForm from "./CategoryForm";

import "./Categories.css";


const Categories = () => {

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [saving, setSaving] =
    useState(false);


  const loadCategories = async () => {

    try {
      setLoading(true);
      setError("");

      const response =
        await categoryService.list();

      setCategories(
        response.data || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Failed to load categories"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const initializeCategories = async () => {
      await loadCategories();
    };

    initializeCategories();
  }, []);


  const visibleCategories = categories.filter(
    (category) =>
      !search.trim() ||
      category.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );

  const categoryRows = visibleCategories.flatMap(
    (category) => {
      const subcategories = category.subcategory || [];

      if (subcategories.length === 0) {
        return [
          {
            category,
            subcategory: null,
          },
        ];
      }

      return subcategories.map((subcategory) => ({
        category,
        subcategory,
      }));
    }
  );


  const openCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };


  const openEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };


  const handleSubmit = async (data) => {

    try {

      setSaving(true);

      if (editingCategory) {

        await categoryService.update(
          editingCategory._id,
          data
        );

      } else {
        const existingCategory = categories.find(
          (category) =>
            category.name.trim().toLowerCase() ===
            data.name.trim().toLowerCase()
        );

        if (existingCategory) {
          const existingSubcategories =
            existingCategory.subcategory || [];
          const existingNames = new Set(
            existingSubcategories.map((item) =>
              item.name.trim().toLowerCase()
            )
          );

          const newSubcategories = data.subcategory.filter(
            (item) =>
              !existingNames.has(
                item.name.trim().toLowerCase()
              )
          );

          await categoryService.update(
            existingCategory._id,
            {
              name: existingCategory.name,
              subcategory: [
                ...existingSubcategories,
                ...newSubcategories,
              ],
            }
          );
        } else {
          await categoryService.create(data);
        }
      }

      setShowForm(false);
      setEditingCategory(null);

      await loadCategories();

    } catch (err) {

      alert(
        err.message ||
          "Failed to save category"
      );

    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (category) => {

    const confirmed =
      window.confirm(
        `Delete category "${category.name}"?`
      );

    if (!confirmed) return;


    try {

      await categoryService.remove(
        category._id
      );

      await loadCategories();

    } catch (err) {

      alert(
        err.message ||
          "Failed to delete category"
      );
    }
  };


  if (showForm) {

    return (
      <div className="categories-page">

        <div className="admin-page-header">

          <div>
            <h1 className="admin-page-title">
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </h1>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          >
            Back
          </button>

        </div>


        <CategoryForm
          initialData={
            editingCategory
          }
          availableCategories={
            categories
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          loading={saving}
        />

      </div>
    );
  }


  return (
    <div className="categories-page">

      <div className="admin-page-header">

        <div>
          <h1 className="admin-page-title">
            Categories
          </h1>

          <p className="admin-page-subtitle">
            Manage categories and
            subcategories
          </p>
        </div>


        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={openCreate}
        >
          + Add Category
        </button>

      </div>


      <div className="admin-toolbar">

        <div className="admin-search">
          <input
            type="search"
            className="admin-input"
            placeholder="Search category..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

      </div>


      {error && (
        <div className="admin-error-text category-error">
          {error}
        </div>
      )}


      {loading ? (

        <p className="admin-status-text">
          Loading categories...
        </p>

      ) : (

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>No.</th>
                <th>Image</th>
                <th>Subcategory</th>
                <th>Category</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>


            <tbody>

              {categoryRows.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="admin-table-empty"
                  >
                    No categories found
                  </td>
                </tr>

              ) : (

                categoryRows.map(
                  ({ category, subcategory }, index) => (

                    <tr
                      key={
                        `${category._id}-${subcategory?._id || "empty"}`
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {subcategory?.image ? (
                          <img
                            className="category-table-image"
                            src={subcategory.image}
                            alt={subcategory.name}
                          />
                        ) : (
                          <span className="subcategory-no-image">
                            No image
                          </span>
                        )}
                      </td>

                      <td>
                        {subcategory?.name || "No subcategory"}
                      </td>

                      <td>
                        <strong>
                          {category.name}
                        </strong>
                      </td>

                      <td>
                        -
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary category-row-btn"
                          onClick={() =>
                            openEdit(
                              category
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-btn admin-btn-danger category-row-btn"
                          onClick={() =>
                            handleDelete(
                              category
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
};


export default Categories;