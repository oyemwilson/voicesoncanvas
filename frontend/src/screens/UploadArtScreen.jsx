import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../slices/productsApiSlice';

const UploadArtScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [uploadProductImage, { isLoading: uploading }] = useUploadProductImageMutation();

  // Form states - all required fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [medium, setMedium] = useState('');
  const [style, setStyle] = useState('');
  const [type, setType] = useState('');
  const [images, setImages] = useState([]);
  
  // Additional fields
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [sku, setSku] = useState('');
  const [metaTitle, setMetaTitle] = useState('');

  const handleImageSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }
    setImages(selectedFiles);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo) return toast.error('Please log in first.');
    if (!userInfo.isSeller) return toast.error('Only approved sellers can upload art.');
    if (images.length === 0) return toast.error('Please select at least one image.');

    try {
      // Upload all images
      const uploadedUrls = [];
      for (const img of images) {
        const fd = new FormData();
        fd.append('image', img);
        const res = await uploadProductImage(fd).unwrap();
        uploadedUrls.push(res.image);
      }

      // Build payload with all fields
      const payload = {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        image: uploadedUrls[0], // Main image
        images: uploadedUrls.slice(1), // Additional images
        brand: brand.trim(),
        category,
        countInStock: parseInt(countInStock),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        specifications: specifications.trim(),
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions.trim(),
        sku: sku.trim(),
        metaTitle: metaTitle.trim(),
        medium,
        style,
        type,
      };

      console.log('=== UPLOAD PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));

      const result = await createProduct(payload).unwrap();
      console.log('Success result:', result);
      
      toast.success('Art uploaded successfully!');

      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setCountInStock('');
      setMedium('');
      setStyle('');
      setType('');
      setImages([]);
      setBrand('');
      setTags('');
      setSpecifications('');
      setWeight('');
      setDimensions('');
      setSku('');
      setMetaTitle('');
      document.getElementById('imageInput').value = '';
      
    } catch (err) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Full error:', err);
      console.error('Error data:', err?.data);
      console.error('Error message:', err?.data?.message);
      
      toast.error(err?.data?.message || err.error || 'Upload failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload Your Art</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Art Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description *"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* <input
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Meta Title (for SEO - optional)"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            /> */}
          </div>
        </div>

        {/* Categories & Classification */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Categories & Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category *</option>
              <option value="Abstract">Abstract</option>
              <option value="Realism">Realism</option>
              <option value="Afro-Futurism">Afro-Futurism</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Traditional">Traditional</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              required
            >
              <option value="">Select Medium *</option>
              <option value="Oil Painting">Oil Painting</option>
              <option value="Acrylic Painting">Acrylic Painting</option>
              <option value="Watercolor">Watercolor</option>
              <option value="Digital Print">Digital Print</option>
              <option value="Canvas Print">Canvas Print</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Mixed Media">Mixed Media</option>
              <option value="Photography">Photography</option>
            </select>

            <select
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
            >
              <option value="">Select Style *</option>
              <option value="Abstract">Abstract</option>
              <option value="Realism">Realism</option>
              <option value="Impressionism">Impressionism</option>
              <option value="Minimalism">Minimalism</option>
              <option value="Afro-Futurism">Afro-Futurism</option>
              <option value="Pop Art">Pop Art</option>
              <option value="Surrealism">Surrealism</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Product Type *</option>
              <option value="Original">Original Artwork</option>
              <option value="Limited Edition Print">Limited Edition Print</option>
              <option value="Open Edition Print">Open Edition Print</option>
              <option value="Digital Download">Digital Download</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Mixed-Media">Mixed-Media</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Images * (first image will be the main display image)
            </label>
            <input
              id="imageInput"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              required
            />
            {images.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected images ({images.length}):</p>
                <ul className="space-y-2">
                  {images.map((img, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                      <span className="text-sm">
                        {idx === 0 && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">MAIN</span>}
                        {img.name}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 px-2 py-1"
                        onClick={() => removeImage(idx)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}

<div className="bg-gray-50 p-6 rounded-lg">
  <h2 className="text-xl font-bold text-gray-800 mb-6">Product Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

    {/* Price */}
    <div>
      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
        Price (₦) *
      </label>
      <input
        id="price"
        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        type="number"
        placeholder="e.g., 50000"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
    </div>

    {/* Stock Quantity */}
    <div>
      <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700 mb-1">
        Available Quantity *
      </label>
      <input
        id="countInStock"
        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        type="number"
        placeholder="e.g., 5"
        value={countInStock}
        onChange={(e) => setCountInStock(e.target.value)}
        required
      />
    </div>



    {/* Dimensions */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Dimensions (inches)
      </label>
      <div className="grid grid-cols-3 gap-4">
        <input
          className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          type="number"
          placeholder="Length"
          // Note: You'll need to update state logic for this, e.g., dimensions.length
        />
        <input
          className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          type="number"
          placeholder="Width"
          // Note: You'll need to update state logic for this, e.g., dimensions.width
        />
        <input
          className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          type="number"
          placeholder="Height"
          // Note: You'll need to update state logic for this, e.g., dimensions.height
        />
      </div>
    </div>
    
    {/* Weight */}
    <div className="md:col-span-2">
       <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
        Weight (kg)
      </label>
      <input
        id="weight"
        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        type="number"
        step="0.1"
        placeholder="e.g., 1.5"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
    </div>

    {/* Tags */}
    <div className="md:col-span-2">
      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
        Tags
      </label>
      <input
        id="tags"
        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="e.g., abstract, oil on canvas, vibrant"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-1">Separate tags with a comma.</p>
    </div>

    {/* Specifications */}
    {/* <div className="md:col-span-2">
      <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
        Additional Specifications
      </label>
      <textarea
        id="specifications"
        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="e.g., Materials: Oil on canvas, Frame: Natural wood"
        rows={4}
        value={specifications}
        onChange={(e) => setSpecifications(e.target.value)}
      />
    </div> */}
  </div>
</div>


        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={creating || uploading}
        >
          {creating || uploading ? 'Uploading Artwork...' : 'Upload Artwork'}
        </button>
      </form>
    </div>
  );
};

export default UploadArtScreen;