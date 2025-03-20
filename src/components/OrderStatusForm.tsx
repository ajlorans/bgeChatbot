import React, { useState } from "react";

interface OrderStatusFormProps {
  onSubmit: (orderNumber: string, email: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  primaryColor: string;
}

const OrderStatusForm: React.FC<OrderStatusFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  primaryColor,
}) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ orderNumber: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = { orderNumber: "", email: "" };
    let hasError = false;

    if (!orderNumber.trim()) {
      newErrors.orderNumber = "Order number is required";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onSubmit(orderNumber, email);
  };

  return (
    <div className="order-status-form">
      <style jsx>{`
        .order-status-form {
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
        }
        .form-header {
          padding: 16px;
          background-color: ${primaryColor};
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .form-header h3 {
          margin: 0;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        .form-header svg {
          color: white;
        }
        .form-content {
          padding: 16px;
        }
        .form-description {
          color: #4a5568;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #2d3748;
          margin-bottom: 6px;
        }
        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 3px rgba(0, 104, 56, 0.1);
        }
        .form-input.error {
          border-color: #e53e3e;
        }
        .error-message {
          font-size: 12px;
          color: #e53e3e;
          margin-top: 4px;
        }
        .form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 24px;
        }
        .btn-cancel {
          padding: 8px 16px;
          background-color: #f7fafc;
          border: 1px solid #cbd5e0;
          color: #4a5568;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background-color: #edf2f7;
        }
        .btn-submit {
          padding: 8px 16px;
          background-color: ${primaryColor};
          border: none;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:hover {
          opacity: 0.9;
        }
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="form-header">
        <h3>Track Your Order</h3>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.0001 8.00001V6.00001C20.0001 4.90001 19.1001 4.00001 18.0001 4.00001H15.0001C15.0001 2.90001 14.1001 2.00001 13.0001 2.00001H11.0001C9.90005 2.00001 9.00005 2.90001 9.00005 4.00001H6.00005C4.90005 4.00001 4.00005 4.90001 4.00005 6.00001V8.00001H20.0001Z"
            fill="currentColor"
          />
          <path
            d="M4 10V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V10H4ZM13 17H11V15H13V17ZM13 13H11V11H13V13Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="form-content">
        <p className="form-description">
          Enter your order number and email address to check the status of your
          order.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="orderNumber" className="form-label">
              Order Number
            </label>
            <input
              style={{ color: "black" }}
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. #123456"
              className={`form-input ${errors.orderNumber ? "error" : ""}`}
              disabled={isLoading}
            />
            {errors.orderNumber && (
              <p className="error-message">{errors.orderNumber}</p>
            )}
          </div>

          <div className="form-group text-gray-800">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`form-input ${errors.email ? "error" : ""}`}
              disabled={isLoading}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Checking..." : "Check Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusForm;
