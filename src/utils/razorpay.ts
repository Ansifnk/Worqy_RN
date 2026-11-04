import RazorpayCheckout, { CheckoutOptions } from 'react-native-razorpay';
import { colors } from './colors';

export interface RazorpayOrderData {
  orderId: string;
  amount: number; // in paise (e.g. 49900)
  currency: string;
  keyId: string;
}

export interface PaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: number;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
}

/**
 * Launch native Razorpay checkout modal.
 */
export const openRazorpayCheckout = async (
  orderData: RazorpayOrderData,
  planName: string,
  userProfile?: {
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
  }
): Promise<PaymentSuccessResponse> => {
  if (!orderData.keyId) {
    throw new Error('Razorpay Key ID is missing from order data.');
  }
  if (!orderData.orderId) {
    throw new Error('Razorpay Order ID is missing from order data.');
  }

  // Ensure any in-flight iOS modal dismissals (like UIAlertController) complete cleanly
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  const amountPaise = Math.round(Number(orderData.amount));

  const prefill: CheckoutOptions['prefill'] = {};
  if (userProfile?.email?.trim()) {
    prefill.email = userProfile.email.trim();
  }
  if (userProfile?.mobile?.trim()) {
    prefill.contact = userProfile.mobile.trim();
  }
  if (userProfile?.name?.trim()) {
    prefill.name = userProfile.name.trim();
  }

  const options: CheckoutOptions = {
    description: `${planName} Subscription`,
    currency: orderData.currency || 'INR',
    key: orderData.keyId,
    amount: amountPaise,
    name: 'Wyzo',
    order_id: orderData.orderId,
    theme: {
      color: colors.primary,
    },
    ...(Object.keys(prefill).length > 0 ? { prefill } : {}),
  };

  return RazorpayCheckout.open(options);
};
