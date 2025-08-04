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

    // Basic validation
    if (!userInfo) return toast.error('Please log in first.')
    if (!userInfo.isSeller)
      return toast.error('Only approved sellers can upload art.')
    if (!name.trim()) return toast.error('Art Name is required.')
    if (!description.trim()) return toast.error('Description is required.')
    if (!category) return toast.error('Category is required.')
    if (!medium) return toast.error('Medium is required.')
    if (!style) return toast.error('Style is required.')
    if (!type) return toast.error('Product Type is required.')
    if (!price || isNaN(price)) return toast.error('Valid price is required.')
    if (!countInStock || isNaN(countInStock))
      return toast.error('Valid quantity is required.')
    if (!images.length) return toast.error('Please select at least one image.')

    try {
      // 1️⃣ Upload images
      const uploaded = []
      for (const file of images) {
        const fd = new FormData()
        fd.append('image', file)
        const { image } = await uploadProductImage(fd).unwrap()
        uploaded.push(image)
      }

      // 2️⃣ Build payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        medium,
        style,
        type,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        countInStock: parseInt(countInStock, 10),
        image: uploaded[0],
        images: uploaded.slice(1),
        brand: brand.trim() || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        specifications: specifications
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        weight: weight ? parseFloat(weight) : null,
        dimensions: {
          length: length ? parseFloat(length) : undefined,
          width: width ? parseFloat(width) : undefined,
          height: height ? parseFloat(height) : undefined,
        },
        sku: undefined, // if you want sku add state & bind here
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        isFeaturedCollection: false, // or add a toggle if you like
      }

      console.log('✅ Payload:', payload)
if (!payload.sku?.trim()) {
  delete payload.sku
}
      // 3️⃣ Send to the API
      await createProduct(payload).unwrap()
      toast.success('Art uploaded successfully!')

      // 4️⃣ Reset form
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
      document.getElementById('imageInput').value = ''
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || err.error || 'Upload failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload Your Art</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full border p-2 rounded"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Sale Price */}
            {/* <div>
              <label className="block mb-1">Sale Price (₦)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border p-2 rounded"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div> */}

            {/* Stock */}
            <div>
              <label className="block mb-1">Quantity *</label>
              <input
                type="number"
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
                      className="w-full border p-2 rounded"
                      value={vals[idx]}
                      onChange={(e) => setters[idx](e.target.value)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Brand */}
            {/* <div className="md:col-span-2">
              <label className="block mb-1">Tags (comma-sep)</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="abstract, vibrant, oil"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div> */}

            {/* Specs */}
            {/* <div className="md:col-span-2">
              <label className="block mb-1">Specifications (comma-sep)</label>
              <input
                className="w-full border p-2 rounded"
                placeholder="Material: oil, Frame: wood"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
              />
            </div> */}

            {/* SEO */}
            {/* <div className="md:col-span-2">
              <label className="block mb-1">Meta Title</label>
              <input
                className="w-full border p-2 rounded"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">Meta Description</label>
              <textarea
                className="w-full border p-2 rounded"
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />
            </div> */}
          </div>
        </div>

        <button
          type="submit"
          disabled={creating || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating || uploading ? 'Uploading…' : 'Upload Artwork'}
        </button>
      </form>
    </div>
  )
}

export default UploadArtScreen
