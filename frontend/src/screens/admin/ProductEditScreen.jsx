// src/pages/ProductEditScreen.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useUpdateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // core fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [medium, setMedium] = useState('');
  const [type, setType] = useState('');
  const [style, setStyle] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState(''); // comma-sep
  const [specifications, setSpecifications] = useState(''); // JSON or free-text
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [sku, setSku] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isFeaturedCollection, setIsFeaturedCollection] = useState(false);
  const [approved, setApproved] = useState(false);

  const { data: product, isLoading, error, refetch } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading: loadingUpdate }] = useUpdateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();

  // dropdown options
  const categoryOptions = ['Abstract', 'Realism', 'Afro-Futurism', 'Other'];
  const mediumOptions   = [    'Oil Painting',
    'Acrylic Painting',
    'Watercolor',
    'Digital Print',
    'Canvas Print',
    'Sculpture',
    'Mixed Media',
    'Photography'];
  const typeOptions     = [    'Original Artwork',
    'Limited Edition Print',
    'Open Edition Print',
    'Digital Download',
    'Sculpture',
    'Mixed-Media'];
  const styleOptions    = [        'Abstract',
        'Realism',
        'Impressionism',
        'Minimalism',
        'Afro-Futurism',
        'Pop Art',
        'Surrealism',
        'Other'];

  useEffect(() => {
    if (!product) return;
    setName(product.name || '');
    setPrice(product.price || '');
    setSalePrice(product.salePrice || '');
    setBrand(product.brand || '');
    setCategory(product.category || '');
    setMedium(product.medium || '');
    setType(product.type || '');
    setStyle(product.style || '');
    setCountInStock(product.countInStock || '');
    setDescription(product.description || '');
    setImage(product.image || '');
    setTags((product.tags || []).join(', '));
    setSpecifications(
      product.specifications
        ? product.specifications.map(s => `${s.key}:${s.value}`).join('\n')
        : ''
    );
    setWeight(product.weight || '');
    setDimensions({
      length: product.dimensions?.length || '',
      width:  product.dimensions?.width  || '',
      height: product.dimensions?.height || '',
    });
    setSku(product.sku || '');
    setMetaTitle(product.metaTitle || '');
    setMetaDescription(product.metaDescription || '');
    setIsFeatured(product.isFeatured || false);
    setIsOnSale(product.isOnSale || false);
    setIsFeaturedCollection(product.isFeaturedCollection || false);
    setApproved(product.approved || false);
  }, [product]);

  const submitHandler = async e => {
    e.preventDefault();
    try {
      await updateProduct({
        productId,
        name,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : undefined,
        brand,
        category,
        medium,
        type,
        style,
        countInStock: parseInt(countInStock),
        description,
        image,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        specifications: specifications
          .split('\n')
          .map(line => {
            const [key, ...rest] = line.split(':');
            return { key: key.trim(), value: rest.join(':').trim() };
          })
          .filter(s => s.key && s.value),
        weight: weight ? parseFloat(weight) : undefined,
        dimensions,
        sku,
        metaTitle,
        metaDescription,
        isFeatured,
        isOnSale,
        isFeaturedCollection,
        approved,
      }).unwrap();

      toast.success('✅ Product updated successfully');
      refetch();
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async e => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to="/admin/productlist" className="inline-block mb-4 text-blue-600 hover:underline">
        ← Back to Products
      </Link>
      <FormContainer>
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
        {(isLoading || loadingUpdate) && <Loader />}
        {error && <Message variant="danger">{error?.data?.message || error.error}</Message>}
        {!isLoading && (
          <form onSubmit={submitHandler} className="space-y-6">
            {/* Basic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  className="w-full border rounded p-2"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              {/* <div>
                <label className="block mb-1">Brand</label>
                <input
                  className="w-full border rounded p-2"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                />
              </div> */}
              <div>
                <label className="block mb-1">SKU</label>
                <input
                  className="w-full border rounded p-2"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Price (₦)*</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Sale Price</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1">Stock*</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={countInStock}
                  onChange={e => setCountInStock(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Category', value: category, setter: setCategory, options: categoryOptions },
                { label: 'Medium',   value: medium,   setter: setMedium,   options: mediumOptions   },
                { label: 'Type',     value: type,     setter: setType,     options: typeOptions     },
                { label: 'Style',    value: style,    setter: setStyle,    options: styleOptions    },
              ].map(({ label, value, setter, options }) => (
                <div key={label}>
                  <label className="block mb-1">{label}</label>
                  <select
                    className="w-full border rounded p-2"
                    value={value}
                    onChange={e => setter(e.target.value)}
                    required
                  >
                    <option value="">Select {label}</option>
                    {options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Images */}
            <div>
              <label className="block mb-1">Image URL or upload</label>
              <input
                type="text"
                className="w-full border rounded p-2 mb-2"
                value={image}
                onChange={e => setImage(e.target.value)}
              />
              <input
                type="file"
                className="w-full border rounded p-2"
                onChange={uploadFileHandler}
              />
              {loadingUpload && <Loader />}
              {image && <img src={image} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />}
            </div>

            {/* Descriptions & SEO */}
            {/* <div>
              <label className="block mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2"
                rows="4"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Meta Title</label>
                <input
                  className="w-full border rounded p-2"
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1">Meta Description</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows="2"
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                />
              </div>
            </div> */}

            {/* Tags & Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Tags (comma-separated)</label>
                <input
                  className="w-full border rounded p-2"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                />
              </div>
              {/* <div>
                <label className="block mb-1">Specifications (key:value per line)</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows="3"
                  value={specifications}
                  onChange={e => setSpecifications(e.target.value)}
                />
              </div> */}
            </div>

            {/* Weight & Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border rounded p-2"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>
              {['length','width','height'].map(dim => (
                <div key={dim}>
                  <label className="block mb-1 capitalize">{dim} (in)</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={dimensions[dim]}
                    onChange={e => setDimensions(prev => ({
                      ...prev, [dim]: e.target.value
                    }))}
                  />
                </div>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Featured', state: isFeatured, setter: setIsFeatured },
                { label: 'On Sale', state: isOnSale, setter: setIsOnSale },
                { label: 'Featured Collection', state: isFeaturedCollection, setter: setIsFeaturedCollection },
                { label: 'Approved', state: approved, setter: setApproved },
              ].map(({ label, state, setter }) => (
                <label key={label} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={e => setter(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="bg-gray-950 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Product
            </button>
          </form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
