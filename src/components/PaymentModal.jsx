import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("your_stripe_publishable_key"); // pk_live_xxx or pk_test_xxx
const FLASK_URL = "https://xclass-meeting.herokuapp.com";

function StripeForm({ amount, bookingData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create payment intent from Flask
      const res = await fetch(
        `${FLASK_URL}/api/payments/stripe/create-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, ...bookingData }),
        },
      );
      const { clientSecret } = await res.json();

      // 2. Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: bookingData.studentName },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        onSuccess("stripe");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <CardElement
          options={{ style: { base: { fontSize: "16px", color: "#333" } } }}
        />
      </div>
      {error && (
        <p style={{ color: "red", fontSize: 13, marginBottom: 8 }}>{error}</p>
      )}
      <button
        type='submit'
        disabled={!stripe || loading}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "none",
          background: "#635bff",
          color: "white",
          fontSize: 15,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Processing..." : `Pay $${amount} with Card`}
      </button>
    </form>
  );
}

export default function PaymentModal({
  amount,
  bookingData,
  onSuccess,
  onClose,
}) {
  const [method, setMethod] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

  async function handlePayPal() {
    setPaypalLoading(true);
    try {
      const res = await fetch(`${FLASK_URL}/api/payments/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description: bookingData.description || "xclass session",
          ...bookingData,
        }),
      });
      const data = await res.json();
      if (data.approvalUrl) {
        localStorage.setItem("pendingBooking", JSON.stringify(bookingData));
        window.location.href = data.approvalUrl;
      }
    } catch (err) {
      alert("PayPal error: " + err.message);
    } finally {
      setPaypalLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3 style={{ margin: 0 }}>Complete Payment</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Amount */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>Total amount</p>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>${amount}</p>
          <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
            {bookingData.description}
          </p>
        </div>

        {/* Payment method selection */}
        {!method && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setMethod("stripe")}
              style={{
                padding: 14,
                borderRadius: 10,
                border: "2px solid #635bff",
                background: "white",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "#635bff",
              }}
            >
              💳 Pay with Card (Stripe)
            </button>
            <button
              onClick={handlePayPal}
              disabled={paypalLoading}
              style={{
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: "#009cde",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "white",
              }}
            >
              {paypalLoading
                ? "Redirecting to PayPal..."
                : "🅿 Pay with PayPal"}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: "#f1f1f1",
                cursor: "pointer",
                fontSize: 14,
                color: "#666",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Stripe form */}
        {method === "stripe" && (
          <>
            <Elements stripe={stripePromise}>
              <StripeForm
                amount={amount}
                bookingData={bookingData}
                onSuccess={onSuccess}
              />
            </Elements>
            <button
              onClick={() => setMethod(null)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "none",
                background: "#f1f1f1",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
