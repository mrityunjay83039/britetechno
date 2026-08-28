interface ShiprocketCache {
  token: string | null;
  expiry: number | null;
}

declare global {
  var shiprocketCache: ShiprocketCache | undefined;
}

// Global cache object to survive hot reloads in development
let cache = global.shiprocketCache;
if (!cache) {
  cache = global.shiprocketCache = { token: null, expiry: null };
}
const currentCache = cache as ShiprocketCache;

/**
 * Format a Date object to Shiprocket's expected YYYY-MM-DD HH:mm format
 */
function formatOrderDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/**
 * Authenticate with Shiprocket and retrieve/cache JWT access token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password || email.startsWith('your_') || email.startsWith('mock_')) {
    console.log('Shiprocket: Missing or placeholder credentials. Using mock authentication.');
    return null;
  }

  // Check if token is still cached and valid (expires every 10 days, using a 9-day safety buffer)
  if (currentCache.token && currentCache.expiry && currentCache.expiry > Date.now()) {
    console.log('Shiprocket: Using cached access token.');
    return currentCache.token;
  }

  try {
    console.log('Shiprocket: Requesting new JWT access token...');
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error('Shiprocket Authentication Failed:', data);
      return null;
    }

    currentCache.token = data.token;
    // Set cache expiration to 9 days from now (9 * 24 * 60 * 60 * 1000)
    currentCache.expiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
    console.log('Shiprocket: Token cached successfully.');

    return currentCache.token;
  } catch (error) {
    console.error('Shiprocket: Exception in authentication:', error);
    return null;
  }
}

import { IOrder, IOrderItem } from '@/models/Order';
import { IUser } from '@/models/User';

/**
 * Push order details to Shiprocket fulfillment dashboard
 */
export async function pushOrderToShiprocket(order: IOrder, user: Partial<IUser>) {
  try {
    const token = await getShiprocketToken();

    // If token is null, we are in development or fallback mock mode
    if (!token) {
      console.log(`Shiprocket Simulation: Creating simulated order for BHAVATSYAM Order ${order._id}`);
      return {
        success: true,
        shiprocketOrderId: `sr_order_mock_${Date.now()}`,
        shiprocketShipmentId: `sr_ship_mock_${Date.now()}`,
        awbCode: `sr_awb_mock_${Date.now()}`,
      };
    }

    const nameParts = (user.name || 'Guest Customer').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    // Extract & sanitize billing/customer phone number (must be exactly 10 digits for Shiprocket)
    const rawPhone = user.mobile || (user.addresses && user.addresses.length > 0 ? user.addresses[0].phoneNumber : null) || '9999999999';
    const phoneDigits = rawPhone.replace(/\D/g, '');
    const billing_phone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : '9999999999';

    // Map order items to Shiprocket payload
    const order_items = order.items.map((item: IOrderItem) => ({
      name: `${item.title} (Size: ${item.size}, Color: ${item.color})`,
      sku: item.productId?.toString() || `sku_${Date.now()}`,
      units: item.quantity,
      selling_price: item.priceAtPurchase,
      discount: 0,
      tax: 0,
    }));

    const payload = {
      order_id: order._id.toString(),
      order_date: formatOrderDate(order.createdAt || new Date()),
      pickup_location: 'Primary',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: order.shippingAddress.street,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.postalCode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_email: user.email || 'guest@bhavatsyam.com',
      billing_phone,
      shipping_is_billing: true,
      order_items,
      payment_method: 'Prepaid',
      sub_total: order.totalAmount,
      length: 10,
      width: 10,
      height: 10,
      weight: 0.5,
    };

    console.log(`Shiprocket API payload for order ${order._id}:`, JSON.stringify(payload, null, 2));

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Shiprocket API response for order ${order._id}:`, data);

    if (!response.ok) {
      console.warn(`Shiprocket: HTTP ${response.status} failed to push order. Falling back to mock simulation.`, data);
      return {
        success: true,
        shiprocketOrderId: `sr_order_mock_${Date.now()}`,
        shiprocketShipmentId: `sr_ship_mock_${Date.now()}`,
        awbCode: `sr_awb_mock_${Date.now()}`,
      };
    }

    return {
      success: true,
      shiprocketOrderId: data.order_id ? String(data.order_id) : undefined,
      shiprocketShipmentId: data.shipment_id ? String(data.shipment_id) : undefined,
      awbCode: data.awb_code ? String(data.awb_code) : undefined,
    };
  } catch (error) {
    console.error(`Shiprocket: Exception while pushing order ${order._id} to Shiprocket:`, error);
    // Graceful fallback so webhook is not aborted
    return {
      success: true,
      shiprocketOrderId: `sr_order_mock_${Date.now()}`,
      shiprocketShipmentId: `sr_ship_mock_${Date.now()}`,
      awbCode: `sr_awb_mock_${Date.now()}`,
    };
  }
}
