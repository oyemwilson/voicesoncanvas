// src/pages/ShipOrderScreen.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetOrderDetailsQuery, useShipOrderMutation } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ShipOrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  // Fetch order to verify state
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [shipOrder, { isLoading: loadingShip }] = useShipOrderMutation();

  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || error.error);
    }
  }, [error]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await shipOrder({ orderId, carrier, trackingNumber }).unwrap();
      toast.success('Order marked as shipped!');
      navigate(`/order/${orderId}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message}</Message>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Ship Order {orderId}</h1>
      <form onSubmit={submitHandler} className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
        <div className="mb-4">
          <label className="block font-medium mb-1">Carrier</label>
          <input
            type="text"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. FedEx"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Tracking Number</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. 1Z999..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={loadingShip}
          className="w-full bg-gray-950 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          {loadingShip ? 'Processing...' : 'Confirm Shipment'}
        </button>
      </form>
    </div>
  );
};

export default ShipOrderScreen;
