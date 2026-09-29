import { useEffect, useState } from 'react'
import { AlertCircle, PlusCircle, X, Sprout } from 'lucide-react'
import { createNewBatch } from '../data/batches'

const EMPTY_FORM = {
  product: '',
  variety: '',
  category: 'Produce',
  quantity: '',
  farmerName: '',
  farmLocation: '',
  destinationName: '',
  transporterName: '',
  vehicleNumber: '',
  buyerName: '',
  minTemp: '4',
  maxTemp: '10'
}

const REQUIRED_FIELDS = [
  { name: 'product', label: 'Crop / Product Name' },
  { name: 'quantity', label: 'Quantity' },
  { name: 'farmerName', label: 'Farmer Name' },
  { name: 'farmLocation', label: 'Farm Origin Location' },
  { name: 'destinationName', label: 'Destination Market / Warehouse' }
]

export default function RegisterBatchModal({ isOpen, onClose, onBatchCreated }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [missing, setMissing] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fresh slate every time the form is opened, so a re-login never inherits
  // the previous batch's details or warnings.
  useEffect(() => {
    if (!isOpen) return
    setFormData(EMPTY_FORM)
    setMissing([])
    setIsSubmitting(false)
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Audit the form before anything is minted. Demo build: blank details fall
    // back to sensible placeholders so the journey can always be started, but
    // the gaps are called out on screen first.
    const gaps = REQUIRED_FIELDS.filter((f) => !String(formData[f.name] || '').trim()).map((f) => f.label)
    const min = Number(formData.minTemp)
    const max = Number(formData.maxTemp)
    if (Number.isNaN(min) || Number.isNaN(max) || min >= max) {
      gaps.push('Valid temperature range (min below max)')
    }
    setMissing(gaps)

    setIsSubmitting(true)

    try {
      const newBatch = createNewBatch({
        product: formData.product || 'Fresh Harvest Crop',
        variety: formData.variety || 'Grade A Certified',
        category: formData.category,
        quantity: formData.quantity || '1,000 kg',
        farmerName: formData.farmerName || 'Registered Producer',
        farmLocation: formData.farmLocation || 'Organic Farm, Nashik',
        destinationName: formData.destinationName || 'Central APMC Wholesale Market',
        transporterName: formData.transporterName || 'Kisan Agro Cold Logistics',
        vehicleNumber: formData.vehicleNumber || 'MH-14-CL-7721',
        buyerName: formData.buyerName || 'Fresh Wholesale Corp',
        tempRange: [Number(formData.minTemp) || 4, Number(formData.maxTemp) || 10]
      })

      setIsSubmitting(false)
      onBatchCreated(newBatch)
      onClose()
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="anim-pop relative my-4 sm:my-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Register Food Batch (Farmer)</h3>
            <p className="text-xs text-slate-500">
              Fill in harvest details to mint a Batch ID & generate a tracking QR code
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Section: Product Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Crop / Product Name *
              </label>
              <input
                type="text"
                name="product"
                required
                placeholder="e.g. Alphonso Mangoes, Organic Tomatoes"
                value={formData.product}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Variety / Grade
              </label>
              <input
                type="text"
                name="variety"
                placeholder="e.g. Ratnagiri Grade A+, Desi Select"
                value={formData.variety}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Quantity (kg or crates) *
              </label>
              <input
                type="text"
                name="quantity"
                required
                placeholder="e.g. 1,500 kg (120 crates)"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full"
              >
                <option value="Produce">Fresh Produce / Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains & Pulses</option>
                <option value="Dairy">Dairy Products</option>
              </select>
            </div>
          </div>

          {/* Section: Farm & Destination */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Farmer Name *
              </label>
              <input
                type="text"
                name="farmerName"
                required
                placeholder="e.g. Rajesh Patil"
                value={formData.farmerName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Farm Origin Location *
              </label>
              <input
                type="text"
                name="farmLocation"
                required
                placeholder="e.g. Devgad Orchards, Ratnagiri, MH"
                value={formData.farmLocation}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Destination Market / Warehouse *
            </label>
            <input
              type="text"
              name="destinationName"
              required
              placeholder="e.g. Vashi APMC Cold Storage Terminal, Navi Mumbai"
              value={formData.destinationName}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Section: Logistics Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Transporter Name (Optional)
              </label>
              <input
                type="text"
                name="transporterName"
                placeholder="e.g. Kisan Cold-Chain Logistics"
                value={formData.transporterName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Vehicle No. (Reefer Truck)
              </label>
              <input
                type="text"
                name="vehicleNumber"
                placeholder="e.g. MH-08-AG-4921"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Receiving Buyer / Retailer
              </label>
              <input
                type="text"
                name="buyerName"
                placeholder="e.g. FreshBazaar Hypermarkets"
                value={formData.buyerName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Safe Temperature (°C)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minTemp"
                  value={formData.minTemp}
                  onChange={handleChange}
                  className="w-20"
                  placeholder="Min"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  name="maxTemp"
                  value={formData.maxTemp}
                  onChange={handleChange}
                  className="w-20"
                  placeholder="Max"
                />
                <span className="text-slate-500 text-xs font-medium">°C</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition-all hover:bg-emerald-500 shadow-md disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Batch & Generate QR Code'}</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              You will instantly receive a shareable QR Code and Batch ID for the Transporter & Buyer.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
