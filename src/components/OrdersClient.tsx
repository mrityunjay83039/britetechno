'use client';

import React, { useState } from 'react';
import { updateOrderStatus } from '@/app/actions/admin';
import { Calendar, User as UserIcon, MapPin, Package, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  productId: string;
  title: string;
  size: string;
  color: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | string | null;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

interface OrdersClientProps {
  initialOrders: Order[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStatusChange = async (orderId: string, newStatus: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    setUpdatingId(orderId);
    setFeedback(null);

    const res = await updateOrderStatus(orderId, newStatus);

    if (res.success && res.data) {
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      setFeedback({
        type: 'success',
        message: `Order status successfully updated to ${newStatus}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update order status.',
      });
      setTimeout(() => setFeedback(null), 4000);
    }
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'ALL') return true;
    return order.orderStatus === filterStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPaymentBadgeClass = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getOrderStatusBadgeClass = (status: Order['orderStatus']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Feedbacks */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tab-style */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 border rounded-sm font-sans text-xs font-bold tracking-wider transition-all cursor-pointer uppercase ${
                filterStatus === status
                  ? 'bg-[#1E3A8A] text-[#FFFFFF] border-[#1E3A8A]'
                  : 'bg-white text-[#64748B] border-[#1E3A8A]/15 hover:border-[#1E3A8A]/35 hover:text-[#1E3A8A]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Global Floating-style feedback */}
        {feedback && (
          <div className={`p-3 border rounded-sm flex items-center gap-2 max-w-md ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p className="font-sans text-xs font-semibold">{feedback.message}</p>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-[#1E3A8A]/15 rounded-sm p-12 text-center text-[#64748B] font-sans font-medium">
            No orders found matching status: <strong className="text-[#1E3A8A] uppercase">{filterStatus}</strong>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const customerName = typeof order.userId === 'object' && order.userId ? order.userId.name : 'Guest Customer';
            const customerEmail = typeof order.userId === 'object' && order.userId ? order.userId.email : 'N/A';
            const isExpanded = !!expandedOrders[order._id];
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="bg-white border border-[#1E3A8A]/15 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
              >
                {/* Card Header (always visible) */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#FFFFFF]/40 border-b border-[#1E3A8A]/10">
                  {/* Order Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Order ID</span>
                      <span className="font-mono text-xs font-bold text-[#1E3A8A]">{order._id}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Customer</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#1E3A8A] font-semibold">
                        <UserIcon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>{customerName}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] block">{customerEmail}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Date & Time</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#1E3A8A]">
                        <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>{orderDate}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Total Amount</span>
                      <div className="flex items-center gap-1 text-base font-bold text-[#1E3A8A]">
                        <span>{formatCurrency(order.totalAmount)}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded-sm border text-[9px] uppercase font-bold ml-1.5 ${getPaymentBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status dropdown */}
                  <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1E3A8A]/10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">Fulfillment Status</span>
                      <div className="flex items-center gap-2">
                        <select
                          disabled={updatingId === order._id}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED')}
                          className={`px-3 py-1.5 border border-[#1E3A8A]/20 rounded-sm font-sans text-xs font-bold uppercase tracking-wider outline-none bg-white text-[#1E3A8A] cursor-pointer focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all ${
                            updatingId === order._id ? 'opacity-50' : ''
                          }`}
                        >
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        {updatingId === order._id ? (
                          <Loader2 className="w-4 h-4 text-[#1E3A8A] animate-spin" />
                        ) : (
                          <span className={`inline-block px-2 py-1 rounded-sm border text-[10px] font-bold tracking-wider ${getOrderStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="p-2 border border-[#1E3A8A]/20 rounded-sm hover:bg-blue-900 text-[#64748B] hover:text-[#1E3A8A] transition-all cursor-pointer mt-4 self-end"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Expandable Body (Items and Shipping address) */}
                {isExpanded && (
                  <div className="p-6 bg-[#FFFFFF]/10 border-t border-[#1E3A8A]/10 space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Items Details */}
                      <div className="md:col-span-8 space-y-3">
                        <h4 className="font-sans text-sm font-bold text-[#1E3A8A] tracking-wide flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#1E3A8A]" /> Ordered Items ({order.items.length})
                        </h4>

                        <div className="border border-[#1E3A8A]/15 rounded-sm overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-[#FFFFFF] text-[#64748B] font-bold uppercase tracking-wider border-b border-[#1E3A8A]/10">
                                <th className="py-2 px-4">Item description</th>
                                <th className="py-2 px-4">Size / Color</th>
                                <th className="py-2 px-4 text-right">Price</th>
                                <th className="py-2 px-4 text-center">Qty</th>
                                <th className="py-2 px-4 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1E3A8A]/10 font-sans">
                              {order.items.map((item, idx) => (
                                <tr key={idx} className="text-[#1E3A8A]">
                                  <td className="py-2.5 px-4 font-semibold">{item.title}</td>
                                  <td className="py-2.5 px-4">
                                    <span className="bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#1E3A8A]/15 text-[#64748B] font-bold mr-1.5">
                                      {item.size}
                                    </span>
                                    <span className="text-[#64748B]">{item.color}</span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-medium">{formatCurrency(item.priceAtPurchase)}</td>
                                  <td className="py-2.5 px-4 text-center font-bold text-[#64748B]">{item.quantity}</td>
                                  <td className="py-2.5 px-4 text-right font-semibold text-[#1E3A8A]">
                                    {formatCurrency(item.priceAtPurchase * item.quantity)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="md:col-span-4 space-y-3">
                        <h4 className="font-sans text-sm font-bold text-[#1E3A8A] tracking-wide flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#1E3A8A]" /> Shipping Destination
                        </h4>

                        <div className="bg-white p-4 border border-[#1E3A8A]/15 rounded-sm space-y-1 text-xs font-sans text-[#1E3A8A]">
                          <p className="font-semibold">{customerName}</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                          <p className="font-bold text-[#1E3A8A] tracking-wider uppercase text-[10px] mt-1">
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
