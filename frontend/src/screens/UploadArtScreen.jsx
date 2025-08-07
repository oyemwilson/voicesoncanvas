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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload Your Art</h1>
      <div onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <input
            className="w-full border p-3 rounded mb-3"
            placeholder="Art Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="w-full border p-3 rounded"
            placeholder="Description *"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Classification */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Categories & Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: 'Category *',
                value: category,
                onChange: (e) => setCategory(e.target.value),
                options: [
                  'Abstract',
                  'Realism',
                  'Afro-Futurism',
                  'Contemporary',
                  'Traditional',
                  'Other',
                ],
              },
              {
                label: 'Medium *',
                value: medium,
                onChange: (e) => setMedium(e.target.value),
                options: [
                  'Oil Painting',
                  'Acrylic Painting',
                  'Watercolor',
                  'Digital Print',
                  'Canvas Print',
                  'Sculpture',
                  'Mixed Media',
                  'Photography',
                ],
              },
              {
                label: 'Style *',
                value: style,
                onChange: (e) => setStyle(e.target.value),
                options: [
                  'Abstract',
                  'Realism',
                  'Impressionism',
                  'Minimalism',
                  'Afro-Futurism',
                  'Pop Art',
                  'Surrealism',
                  'Other',
                ],
              },
              {
                label: 'Product Type *',
                value: type,
                onChange: (e) => setType(e.target.value),
                options: [
                  'Original Artwork',
                  'Limited Edition Print',
                  'Open Edition Print',
                  'Digital Download',
                  'Sculpture',
                  'Mixed-Media',
                ],
              },
            ].map(({ label, value, onChange, options }) => (
              <select
                key={label}
                className="border p-3 rounded"
                value={value}
                onChange={onChange}
                required
              >
                <option value="">{label}</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Images *</h2>
          <input
            id="imageInput"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full border p-3 rounded"
            required
          />
          {images.length > 0 && (
            <ul className="mt-2 space-y-1">
              {images.map((img, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white p-2 rounded border"
                >
                  <span>
                    {i === 0 && (
                      <span className="bg-blue-100 text-blue-800 px-2 rounded text-xs mr-2">
                        MAIN
                      </span>
                    )}
                    {img.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block mb-1">Price (₦) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border p-2 rounded"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>


            {/* Stock */}
            <div>
              <label className="block mb-1">Quantity *</label>
              <input
                type="number"
                min="0"
                className="w-full border p-2 rounded"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full border p-2 rounded"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            {/* Dimensions */}
            <div className="md:col-span-2 grid grid-cols-3 gap-2">
              {['Length', 'Width', 'Height'].map((lab, idx) => {
                const setters = [setLength, setWidth, setHeight]
                const vals = [length, width, height]
                return (
                  <div key={lab}>
                    <label className="block mb-1">{lab} (in)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full border p-2 rounded"
                      value={vals[idx]}
                      onChange={(e) => setters[idx](e.target.value)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Brand */}




          </div>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={creating || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating || uploading ? 'Uploading…' : 'Upload Artwork'}
        </button>
      </div>
    </div>
  )
}

export default UploadArtScreen