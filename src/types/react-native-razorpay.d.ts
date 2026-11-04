declare module 'react-native-razorpay' {
  export interface RazorpaySuccessData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayError {
    code: number;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
  }

  export interface CheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
      method?: string;
    };
    theme?: {
      color?: string;
      backdrop_color?: string;
      hide_topbar?: boolean;
    };
    modal?: {
      backdropclose?: boolean;
      escape?: boolean;
      handleback?: boolean;
      confirm_close?: boolean;
      ondismiss?: () => void;
      animation?: boolean;
    };
    notes?: Record<string, string>;
    timeout?: number;
    retry?: {
      enabled?: boolean;
      max_count?: number;
    };
  }

  export default class RazorpayCheckout {
    static open(
      options: CheckoutOptions,
      successCallback?: (data: RazorpaySuccessData) => void,
      errorCallback?: (error: RazorpayError) => void
    ): Promise<RazorpaySuccessData>;
  }
}
