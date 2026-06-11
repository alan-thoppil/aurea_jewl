import axios from 'axios';

async function testRazorpay() {
  console.log("=== TESTING RAZORPAY BACKEND ENDPOINTS ===");

  try {
    console.log("\n1. Testing order creation via POST /api/razorpay/create-order...");
    // Create order with a small test amount (INR 10)
    const orderRes = await axios.post("http://localhost:5000/api/razorpay/create-order", {
      amount: 10,
      currency: "INR"
    });
    console.log("✅ Success! Razorpay order created successfully:");
    console.log(JSON.stringify(orderRes.data, null, 2));

  } catch (error) {
    console.log("❌ Order Creation Failed (Expected if using dummy/invalid API credentials):");
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }

  try {
    console.log("\n2. Testing payment verification via POST /api/razorpay/verify-payment...");
    // Test with simulated values
    const verifyRes = await axios.post("http://localhost:5000/api/razorpay/verify-payment", {
      razorpay_order_id: "order_mock123",
      razorpay_payment_id: "pay_mock123",
      razorpay_signature: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" // dummy hash
    });
    console.log("✅ Verification API call succeeded:");
    console.log("Verification Result:", verifyRes.data);

  } catch (error) {
    console.log("❌ Verification Failed:");
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log("Response:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }
  }
}

testRazorpay();
