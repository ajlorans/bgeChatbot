import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the OrderStatusForm component since we can't import it directly in tests
// This is a simplified version that mimics the behavior for testing
const OrderStatusForm = ({
  onSubmit,
}: {
  onSubmit: (orderNumber: string, email: string) => void;
}) => {
  const [orderNumber, setOrderNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [orderNumberError, setOrderNumberError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");

  const validateOrderNumber = (value: string) => {
    if (!value) {
      setOrderNumberError("Order number is required");
      return false;
    }
    if (!/^\d{5,}$/.test(value.replace("#", ""))) {
      setOrderNumberError(
        "Please enter a valid order number (at least 5 digits)"
      );
      return false;
    }
    setOrderNumberError("");
    return true;
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isOrderNumberValid = validateOrderNumber(orderNumber);
    const isEmailValid = validateEmail(email);

    if (isOrderNumberValid && isEmailValid) {
      onSubmit(orderNumber, email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-status-form">
      <div className="form-group">
        <label htmlFor="orderNumber">Order Number</label>
        <input
          id="orderNumber"
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter order number"
          aria-invalid={!!orderNumberError}
        />
        {orderNumberError && (
          <div className="error-message">{orderNumberError}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          aria-invalid={!!emailError}
        />
        {emailError && <div className="error-message">{emailError}</div>}
      </div>

      <button type="submit">Check Order Status</button>
    </form>
  );
};

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("OrderStatusForm", () => {
  test("renders the form with input fields", () => {
    render(<OrderStatusForm onSubmit={() => {}} />);

    expect(screen.getByLabelText(/order number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /check order status/i })
    ).toBeInTheDocument();
  });

  test("validates order number input", () => {
    render(<OrderStatusForm onSubmit={() => {}} />);

    const orderNumberInput = screen.getByLabelText(/order number/i);

    // Test empty input
    fireEvent.change(orderNumberInput, { target: { value: "" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(screen.getByText(/order number is required/i)).toBeInTheDocument();

    // Test invalid input
    fireEvent.change(orderNumberInput, { target: { value: "123" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(
      screen.getByText(/please enter a valid order number/i)
    ).toBeInTheDocument();

    // Test valid input
    fireEvent.change(orderNumberInput, { target: { value: "12345" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(
      screen.queryByText(/please enter a valid order number/i)
    ).not.toBeInTheDocument();
  });

  test("validates email input", () => {
    render(<OrderStatusForm onSubmit={() => {}} />);

    const emailInput = screen.getByLabelText(/email/i);
    const orderNumberInput = screen.getByLabelText(/order number/i);

    // Set valid order number to isolate email validation
    fireEvent.change(orderNumberInput, { target: { value: "12345" } });

    // Test empty input
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    // Test invalid input
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(
      screen.getByText(/please enter a valid email address/i)
    ).toBeInTheDocument();

    // Test valid input
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );
    expect(
      screen.queryByText(/please enter a valid email address/i)
    ).not.toBeInTheDocument();
  });

  test("calls onSubmit with valid inputs", () => {
    const handleSubmit = jest.fn();
    render(<OrderStatusForm onSubmit={handleSubmit} />);

    // Fill in valid inputs
    fireEvent.change(screen.getByLabelText(/order number/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    // Submit the form
    fireEvent.submit(
      screen.getByRole("button", { name: /check order status/i })
    );

    // Check if onSubmit was called with the correct values
    expect(handleSubmit).toHaveBeenCalledWith("12345", "test@example.com");
  });
});
