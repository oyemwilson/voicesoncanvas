import { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../slices/productsApiSlice'

const UploadArtScreen = () => {
  const { userInfo } = useSelector((state) => state.auth)

  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [uploadProductImage, { isLoading: uploading }] =
    useUploadProductImageMutation()

  // Basic info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Classification
  const [category, setCategory] = useState('')
  const [medium, setMedium] = useState('')
  const [style, setStyle] = useState('')
  const [type, setType] = useState('')

  // Pricing & stock
  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [countInStock, setCountInStock] = useState('')

  // Pricing & stock – keep existing lines above
const [framed, setFramed] = useState('');

  // Images
  const [images, setImages] = useState([])

  // Extras
  const [brand, setBrand] = useState('')
  const [tags, setTags] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [weight, setWeight] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  // Dimensions broken out
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) {
      return toast.error('Please select at least one image.')
    }
    setImages(files)
  }

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('🔍 Form submission started...')

    // Basic validation
    if (!userInfo) return toast.error('Please log in first.')
    if (!userInfo.isSeller)
      return toast.error('Only approved sellers can upload art.')
    
    // Enhanced validation with detailed logging
    if (!name.trim()) {
      console.error('❌ Name validation failed:', name)
      return toast.error('Art Name is required.')
    }
    if (!description.trim()) {
      console.error('❌ Description validation failed:', description)
      return toast.error('Description is required.')
    }
    if (!category) {
      console.error('❌ Category validation failed:', category)
      return toast.error('Category is required.')
    }
    if (!medium) {
      console.error('❌ Medium validation failed:', medium)
      return toast.error('Medium is required.')
    }
    if (!style) {
      console.error('❌ Style validation failed:', style)
      return toast.error('Style is required.')
    }
    if (!type) {
      console.error('❌ Product Type validation failed:', type)
      return toast.error('Product Type is required.')
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      console.error('❌ Price validation failed:', price)
      return toast.error('Valid price is required.')
    }
    if (!countInStock || isNaN(parseInt(countInStock)) || parseInt(countInStock) < 0) {
      console.error('❌ Stock validation failed:', countInStock)
      return toast.error('Valid quantity is required.')
    }
    if (!images.length) {
      console.error('❌ Images validation failed:', images)
      return toast.error('Please select at least one image.')
    }
if (framed === '') {
  console.error('❌ Framed validation failed:', framed);
  return toast.error('Please choose if the artwork is framed.');
}

    console.log('✅ All validations passed')

    try {
  // 1️⃣ Upload images
  console.log('📤 Starting image upload...')
  const uploaded = []
  for (const [index, file] of images.entries()) {
    console.log(`📷 Uploading image ${index + 1}/${images.length}: ${file.name}`)
    const fd = new FormData()
    fd.append('image', file)
    const response = await uploadProductImage(fd).unwrap()
    console.log(`✅ Image ${index + 1} uploaded:`, response)
    console.log(`📋 Response type:`, typeof response)
    console.log(`📋 Response keys:`, Object.keys(response))
    
    // Fix: Handle your specific API response structure
    let imageUrl
    if (typeof response === 'string') {
      // If response is directly a URL string
      imageUrl = response
    } else if (response.image) {
      // Your API returns: { message: '...', image: 'cloudinary-url', filename: '...' }
      imageUrl = response.image
    } else if (response.url) {
      // Fallback for other possible formats
      imageUrl = response.url
    } else if (response.path) {
      // Another fallback
      imageUrl = response.path
    } else {
      // Log the actual response to debug
      console.error('❌ Unexpected upload response format:', response)
      console.error('❌ Available properties:', Object.keys(response))
      throw new Error(`Image upload failed: No valid image URL found in response for ${file.name}`)
    }
    
    // Validate that we got a valid URL string
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error('❌ Invalid image URL extracted:', imageUrl)
      throw new Error(`Image upload failed: Invalid image URL for ${file.name}`)
    }
    
    console.log(`📷 Extracted image URL:`, imageUrl)
    uploaded.push(imageUrl)
  }

  console.log('✅ All images uploaded:', uploaded)

      // 2️⃣ Build payload - ensure all required fields are included
      const payload = {
        // Core required fields
        name: name.trim(),
        price: parseFloat(price),
        image: uploaded[0], // Main image (required)
        category,
        
        // Additional required/important fields
        description: description.trim(),
        medium,
        style,
        type,
        countInStock: parseInt(countInStock, 10),
        framed: framed === 'true',
        
        
        // Optional fields
        ...(uploaded.length > 1 && { images: uploaded.slice(1) }),
        ...(salePrice && { salePrice: parseFloat(salePrice) }),
        ...(brand.trim() && { brand: brand.trim() }),
        ...(weight && { weight: parseFloat(weight) }),
        
        // Arrays - only include if not empty
        ...(tags.trim() && {
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        }),
        ...(specifications.trim() && {
          specifications: specifications
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        }),
        
        // Dimensions - only include if at least one dimension is provided
        ...((length || width || height) && {
          dimensions: {
            ...(length && { length: parseFloat(length) }),
            ...(width && { width: parseFloat(width) }),
            ...(height && { height: parseFloat(height) }),
          }
        }),
        
        // SEO fields
        ...(metaTitle.trim() && { metaTitle: metaTitle.trim() }),
        ...(metaDescription.trim() && { metaDescription: metaDescription.trim() }),
        
        // Default values
        isFeaturedCollection: false,
      }



      // Log the payload for debugging
      console.log('📋 Final payload:', JSON.stringify(payload, null, 2))

      // Validate payload has required fields before sending
      const requiredFields = ['name', 'price', 'image', 'category']
      const missingFields = requiredFields.filter(field => !payload[field])
      
      if (missingFields.length > 0) {
        console.error('❌ Missing required fields in payload:', missingFields)
        return toast.error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      console.log('✅ Payload validation passed, sending to API...')

      // 3️⃣ Send to the API
      const result = await createProduct(payload).unwrap()
      console.log('✅ Product created successfully:', result)
      toast.success('Art uploaded successfully!')

      // 4️⃣ Reset form
      console.log('🔄 Resetting form...')
      setName('')
      setDescription('')
      setCategory('')
      setMedium('')
      setStyle('')
      setType('')
      setPrice('')
      setSalePrice('')
      setCountInStock('')
      setBrand('')
      setTags('')
      setSpecifications('')
      setWeight('')
      setMetaTitle('')
      setMetaDescription('')
      setLength('')
      setWidth('')
      setHeight('')
      setImages([])
      setFramed('')
      
      const imageInput = document.getElementById('imageInput')
      if (imageInput) {
        imageInput.value = ''
      }
      
      console.log('✅ Form reset complete')
      
    } catch (err) {
      console.error('❌ Upload failed:', err)
      
      // Enhanced error logging
      if (err.data) {
        console.error('API Error Data:', err.data)
      }
      if (err.status) {
        console.error('API Error Status:', err.status)
      }
      
      const errorMessage = err?.data?.message || err?.message || err?.error || 'Upload failed.'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Artwork</h1>
        <p className="text-gray-600">Share your creativity with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artwork Title *</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter artwork title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell the story behind your artwork..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Classification */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Classification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Category *', value: category, onChange: setCategory, options: ['Abstract', 'Realism', 'Afro-Futurism', 'Contemporary', 'Traditional', 'Other'] },
              { label: 'Medium *', value: medium, onChange: setMedium, options: ['Oil Painting', 'Acrylic Painting', 'Watercolor', 'Digital Print', 'Canvas Print', 'Sculpture', 'Mixed Media', 'Photography'] },
              { label: 'Style *', value: style, onChange: setStyle, options: ['Abstract', 'Realism', 'Impressionism', 'Minimalism', 'Afro-Futurism', 'Pop Art', 'Surrealism', 'Other'] },
              { label: 'Product Type *', value: type, onChange: setType, options: ['Original Artwork', 'Limited Edition Print', 'Open Edition Print', 'Digital Download', 'Sculpture', 'Mixed-Media'] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  required
                >
                  <option value="">Select {label.split(' ')[0]}</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Images */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Images
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images *
                <span className="text-xs text-gray-500 ml-1">(First image will be main display)</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="imageInput"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="imageInput"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="sr-only"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Selected Files</h3>
                <ul className="divide-y divide-gray-200">
                  {images.map((img, i) => (
                    <li key={i} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        {i === 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            Main
                          </span>
                        )}
                        <span className="text-sm text-gray-600 truncate max-w-xs">{img.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Pricing & Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Pricing & Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pricing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Framed Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Framed *</label>

<select
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  value={framed}
  onChange={(e) => setFramed(e.target.value)}
  required
>
  <option value="">Select option</option>
  <option value="true">Yes (Framed)</option>
  <option value="false">No (Unframed)</option>
</select>

            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* Dimensions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (inches)</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Length', value: length, setter: setLength },
                  { label: 'Width', value: width, setter: setWidth },
                  { label: 'Height', value: height, setter: setHeight },
                ].map((dim) => (
                  <div key={dim.label}>
                    <label className="sr-only">{dim.label}</label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        {dim.label}
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.0"
                        value={dim.value}
                        onChange={(e) => dim.setter(e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={creating || uploading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-950 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {creating || uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Upload Artwork'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadArtScreen;