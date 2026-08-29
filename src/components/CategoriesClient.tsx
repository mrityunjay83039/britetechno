'use client';

import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/admin';
import { Plus, Trash2, Edit3, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setIsActive(true);
    setEditingCategory(null);
    setError(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setError(null);
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      isActive,
    };

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory._id, payload);
    } else {
      res = await createCategory(payload);
    }

    if (res.success && res.data) {
      setSuccess(
        editingCategory
          ? 'Category successfully updated!'
          : 'Category successfully created!'
      );

      const savedCategory = res.data as Category;
      if (editingCategory) {
        setCategories(
          categories.map((cat) => (cat._id === editingCategory._id ? savedCategory : cat))
        );
      } else {
        setCategories([savedCategory, ...categories]);
      }

      resetForm();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 1500);
    } else {
      setError(res.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await deleteCategory(cat._id);

    if (res.success) {
      setSuccess('Category deleted successfully.');
      setCategories(categories.filter((c) => c._id !== cat._id));
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } else {
      setError(res.error || 'Failed to delete category.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0066B4] hover:bg-[#005293] text-white font-sans text-xs font-bold tracking-wider rounded-lg shadow-sm transition-all duration-200 cursor-pointer uppercase"
        >
          <Plus className="w-4 h-4" />
          Create New Category
        </button>
      </div>

      {/* Global Toast notifications inside page */}
      {error && !isModalOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="font-sans text-xs font-semibold text-red-800">{error}</p>
        </div>
      )}

      {success && !isModalOpen && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="font-sans text-xs font-semibold text-green-800">{success}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Slug / Reference</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-sm">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No categories found. Create a category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  return (
                    <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-800 font-mono rounded-md font-semibold">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate font-medium">
                        {cat.description || '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 text-slate-500 hover:text-[#0066B4] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-sans text-base font-bold text-white tracking-tight">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="font-sans text-xs text-slate-400 font-medium mt-0.5">
                  Organize and manage lighting fixture categories
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="font-sans text-xs font-semibold text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="font-sans text-xs font-semibold text-green-800">{success}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. High Bay Lighting"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg shadow-xs placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. high-bay-lighting (auto-generated if empty)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg font-mono shadow-xs placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this category's specifications and lighting applications..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#0066B4] focus:ring-1 focus:ring-[#0066B4] text-xs font-sans text-slate-900 outline-none rounded-lg shadow-xs placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 border-slate-300 text-[#0066B4] focus:ring-[#0066B4] rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="font-sans text-xs font-bold text-slate-800 select-none cursor-pointer">
                  Category is Active (Visible on Storefront Catalog)
                </label>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 pt-4 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-sans text-xs font-bold tracking-wider rounded-lg transition-colors cursor-pointer uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0066B4] hover:bg-[#005293] text-white disabled:opacity-50 font-sans text-xs font-bold tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer uppercase flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
