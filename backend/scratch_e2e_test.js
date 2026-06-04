import axios from 'axios';

async function runTests() {
  console.log("=== STARTING END-TO-END VERIFICATION ===");

  try {
    // 1. Fetch products from storefront (port 5000) to grab a valid product UUID
    console.log("\n1. Fetching products from http://localhost:5000/api/products...");
    const productsRes = await axios.get("http://localhost:5000/api/products");
    const products = productsRes.data.data;
    console.log(`✅ Fetched products. Count: ${products.length}`);
    if (products.length === 0) {
      throw new Error("No products found in database! Please seed first.");
    }
    const sampleProduct = products.find(p => p.id === '1bda770e-3dc9-46f7-8ae1-5aa6291f7f3e') || products.find(p => p.stock_quantity > 0) || products[0];
    console.log(`Using sample product for checkout: SKU=${sampleProduct.sku}, ID=${sampleProduct.id}, Stock=${sampleProduct.stock_quantity}`);

    // 2. Perform online storefront checkout (port 5000)
    console.log("\n2. Simulating customer checkout on storefront...");
    const orderPayload = {
      customer_details: {
        name: "Devon Lane",
        email: "devon@luxury.com",
        phone: "+91 98765 43210",
        birthday: "1995-06-15"
      },
      items: [
        {
          product_id: sampleProduct.id,
          quantity: 1,
          price: Number(sampleProduct.price)
        }
      ],
      total_amount: Number(sampleProduct.price)
    };

    const orderRes = await axios.post("http://localhost:5000/api/orders", orderPayload);
    const orderData = orderRes.data.data;
    console.log(`✅ Order created successfully on backend! Order ID: ${orderData.order.id}`);

    // 3. Process payment on storefront (port 5000)
    console.log("\n3. Processing payment for order...");
    const paymentPayload = {
      order_id: orderData.order.id,
      amount: Number(sampleProduct.price),
      payment_method: "Razorpay"
    };

    const paymentRes = await axios.post("http://localhost:5000/api/payments", paymentPayload);
    const paymentResult = paymentRes.data.data;
    console.log("✅ Payment processed successfully!");
    console.log("Invoice Number:", paymentResult.invoice.invoice_number);
    console.log("Invoice PDF URL:", paymentResult.invoice.pdf_url);

    // 4. Test admin login and silent token generation (port 5002)
    console.log("\n4. Authenticating admin portal session on http://localhost:5002/api/auth/login...");
    const loginRes = await axios.post("http://localhost:5002/api/auth/login", {
      email: "admin@aurea.com",
      password: "adminpassword"
    });
    const token = loginRes.data.token;
    console.log("✅ Admin logged in. Token:", token.slice(0, 20) + "...");

    // Set auth header for subsequent admin requests
    const adminConfig = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 5. Test rich joined orders fetch (port 5002)
    console.log("\n5. Fetching rich order data from http://localhost:5002/api/admin/orders...");
    const adminOrdersRes = await axios.get("http://localhost:5002/api/admin/orders", adminConfig);
    const adminOrders = adminOrdersRes.data.data;
    console.log(`✅ Fetched admin orders. Total: ${adminOrders.length}`);
    const matchedOrder = adminOrders.find(o => o.id === orderData.order.id);
    if (!matchedOrder) {
      throw new Error("Created order was not found in admin orders list!");
    }
    console.log("Matched Order Details:");
    console.log("- Order Number:", matchedOrder.order_number);
    console.log("- Customer Name:", matchedOrder.customer_name);
    console.log("- Subtotal:", matchedOrder.subtotal);
    console.log("- GST Amount:", matchedOrder.gst);
    console.log("- Total Amount:", matchedOrder.total);
    console.log("- Items List:", matchedOrder.items);

    // 6. Test customers fetch (port 5002)
    console.log("\n6. Fetching customers from http://localhost:5002/api/admin/customers...");
    const adminCustRes = await axios.get("http://localhost:5002/api/admin/customers", adminConfig);
    const adminCust = adminCustRes.data.data;
    console.log(`✅ Fetched admin customers. Count: ${adminCust.length}`);
    const matchedCustomer = adminCust.find(c => c.email === "devon@luxury.com");
    if (!matchedCustomer) {
      throw new Error("Checkout customer not found in customers list!");
    }
    console.log("Matched Customer Details:");
    console.log("- Name:", matchedCustomer.name);
    console.log("- Email:", matchedCustomer.email);
    console.log("- Loyalty Points:", matchedCustomer.loyalty_points);

    // 7. Test custom create customer API (port 5002)
    console.log("\n7. Simulating creating a new customer via admin panel...");
    const newCustRes = await axios.post("http://localhost:5002/api/admin/customers", {
      name: "Jane Doe",
      email: `jane.doe-${Date.now()}@test.com`,
      phone: "+91 88888 88888",
      birthday: "1992-04-10"
    }, adminConfig);
    console.log("✅ Customer created successfully via admin endpoint:", newCustRes.data.message);
    console.log("New Customer profile:", newCustRes.data.data);

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! REAL-WORLD DATABASE FLOWS ARE FUNCTIONAL AND STABLE!");

  } catch (err) {
    console.error("\n❌ Test Suite Failed:");
    if (err.response) {
      console.error(`Status Code: ${err.response.status}`);
      console.error("Error Response Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

runTests();
