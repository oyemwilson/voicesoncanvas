import React from 'react';
import { Link } from 'react-router-dom';
import { useGetSellerOrdersQuery } from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const SellerOrdersScreen = () => {
  const { data: orders, isLoading, error } = useGetSellerOrdersQuery();

  if (isLoading) return <Loader />;
  if (error)   return <Message variant="danger">{error.data?.message || error.error}</Message>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Sales</h1>
      {orders.length === 0 ? (
        <Message>You haven’t sold anything yet.</Message>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white shadow rounded p-4 flex justify-between items-center">
              <div>
                <Link
                  to={`/order/${order._id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Order {order._id.slice(-8).toUpperCase()}
                </Link>
                <p className="text-sm text-gray-600">
                  Placed: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-x-2">
                {!order.isPaid && <span className="text-yellow-600">Awaiting Payment</span>}
                {order.isPaid && !order.isShipped && (
                  <span className="text-purple-600">Ready to Ship</span>
                )}
                {order.isShipped && !order.isReceived && (
                  <span className="text-indigo-600">Shipped – Awaiting Receipt</span>
                )}
                {order.isReceived && <span className="text-green-600">Completed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrdersScreen;
