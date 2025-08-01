import React, { useState, useRef } from 'react';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useDeleteBlogMutation,
  useUpdateBlogMutation,
} from '../../slices/blogsApiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Search, Plus, Edit, Trash2, Image, Calendar, User } from 'lucide-react';

const AdminBlogScreen = () => {
  const { data: blogs = [], isLoading, refetch } = useGetBlogsQuery();
  const [createBlog] = useCreateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  const editFormRef = useRef(null);
const [form, setForm] = useState({ title: '', content: '', image: '', writer: '', type: '' });
const [editForm, setEditForm] = useState({ title: '', content: '', image: '', writer: '', type: '' });


  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  // Image upload for create
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, image: data.image }));
      toast.success('✅ Image uploaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  // Image upload for edit
  const uploadFileHandlerEdit = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEdit(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditForm((prev) => ({ ...prev, image: data.image }));
      toast.success('✅ Image uploaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setUploadingEdit(false);
    }
  };

  // Create blog
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createBlog(form).unwrap();
      toast.success('✅ Blog created!');
      setForm({ title: '', content: '', image: '' });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // Update blog
  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      await updateBlog({ id: editId, ...editForm }).unwrap();
      toast.success('✏️ Blog updated!');
      setEditMode(false);
      setEditId(null);
      setEditForm({ title: '', content: '', image: '' });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

const startEdit = (blog) => {
  setEditMode(true);
  setEditId(blog._id);
  setEditForm({
    title: blog.title,
    content: blog.content,
    image: blog.image || '',
  });

  // 🪄 Wait for state to update then scroll
  setTimeout(() => {
    editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};


  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setEditForm({ title: '', content: '', image: '' });
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('🗑️ Blog deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between">
          <div className=''>
            <h1 className="text-3xl font-bold text-gray-900">📰 Blog Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage your blog posts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search blogs..."
                className="pl-10 pr-4 py-2 border rounded-lg "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-gray-500">{blogs.length} total posts</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Form */}
        {!editMode && (
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b flex items-center gap-2">
              <Plus className="w-5 h-5 text-black" />
              <h2 className="text-xl font-semibold text-gray-900">Create New Blog Post</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
              <div className="lg:col-span-2 space-y-6">
                <input
                  type="text"
                  placeholder="Enter blog title"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />

                
                {/* Quill editor */}
<ReactQuill
  value={form.content}
  onChange={(value) => setForm((f) => ({ ...f, content: value }))}
  className="quill-editor"
/>

              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadFileHandler}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && <p className="mt-2 text-sm text-blue-600">Uploading image...</p>}
                  {form.image && (
                    <div className="mt-4">
                      <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                    </div>
                  )}
                </div>
                <button
                  onClick={submitHandler}
                  className="w-full bg-black hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
                >
                  Create Blog Post
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editMode && (
            
          <div   ref={editFormRef} className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b bg-yellow-50 flex items-center gap-2">
              <Edit className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">✏️ Edit Blog Post</h2>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <input
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
                <ReactQuill
                  value={editForm.content}
                  onChange={(value) => setEditForm((f) => ({ ...f, content: value }))}
                  className="quill-editor"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadFileHandlerEdit}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingEdit && <p className="mt-2 text-sm text-blue-600">Uploading image...</p>}
                  {editForm.image && (
                    <div className="mt-4">
                      <img src={editForm.image} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                    </div>
                  )}
                </div>
                <button
                  onClick={updateHandler}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg"
                >
                  Cancel Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog List */}
                {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">All Blog Posts</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="p-6 hover:bg-gray-50 transition-colors flex flex-col lg:flex-row justify-between gap-6"
                >
                  {/* Left: image + details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-grow min-w-0">
                    <div className="flex-shrink-0">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0 text-center lg:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                      <p
                        className="text-gray-600 text-sm mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                      />
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 justify-center lg:justify-start">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{blog.author?.name || 'Unknown Author'}</span>
                        </div>
                        {blog.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 justify-center lg:justify-end">
                    <button
                      onClick={() => startEdit(blog)}
                      className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteHandler(blog._id)}
                      className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogScreen;
