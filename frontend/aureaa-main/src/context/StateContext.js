"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
const StateContext = createContext();

// Seed initial luxury products
import ringsData from '../data/rings.json';
import necklacesData from '../data/necklaces.json';
import earringsData from '../data/earrings.json';
import banglesData from '../data/bangles.json';
import ankletsData from '../data/anklets.json';

const INITIAL_PRODUCTS = [
  ...ringsData,
  ...necklacesData,
  ...earringsData,
  ...banglesData,
  ...ankletsData
];

// Seed initial customers
const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Devon Lane",
    email: "devon@luxury.com",
    phone: "+91 98765 43210",
    loyalty_points: 420,
    birthday: "1995-06-15",
    gold_scheme_status: "Active",
    scheme_id: "scheme-101"
  },
  {
    id: "cust-2",
    name: "Eleanor Pena",
    email: "eleanor@monarch.in",
    phone: "+91 87654 32109",
    loyalty_points: 1150,
    birthday: "1990-11-28",
    gold_scheme_status: "Matured",
    scheme_id: "scheme-102"
  },
  {
    id: "cust-3",
    name: "Guy Hawkins",
    email: "guy@hawkins.net",
    phone: "+91 76543 21098",
    loyalty_points: 80,
    birthday: "1988-02-09",
    gold_scheme_status: "Inactive",
    scheme_id: null
  }
];

// Seed ledger entries
const INITIAL_LEDGER = [
  {
    id: "led-1",
    transaction_date: "2026-05-01T10:00:00.000Z",
    description: "Opening Capital Deposit",
    type: "Credit",
    amount: 15000000.00,
    running_balance: 15000000.00
  },
  {
    id: "led-2",
    transaction_date: "2026-05-02T14:30:00.000Z",
    description: "Showroom Lease Capital Expense",
    type: "Debit",
    amount: 450000.00,
    running_balance: 14550000.00
  },
  {
    id: "led-3",
    transaction_date: "2026-05-05T12:00:00.000Z",
    description: "Aesthetic Fitments & Lighting Setup",
    type: "Debit",
    amount: 320000.00,
    running_balance: 14230000.00
  },
  {
    id: "led-4",
    transaction_date: "2026-05-15T18:00:00.000Z",
    description: "Inventory Sourcing - Initial Stock",
    type: "Debit",
    amount: 2500000.00,
    running_balance: 11730000.00
  }
];

// Seed gold savings schemes
const INITIAL_GOLD_SCHEMES = [
  {
    id: "scheme-101",
    customer_id: "cust-1",
    customer_name: "Devon Lane",
    monthly_installment: 15000,
    months_paid: 6,
    total_invested: 90000,
    start_date: "2025-11-15",
    maturity_date: "2026-10-15",
    status: "Active"
  },
  {
    id: "scheme-102",
    customer_id: "cust-2",
    customer_name: "Eleanor Pena",
    monthly_installment: 20000,
    months_paid: 10,
    total_invested: 200000,
    start_date: "2025-07-20",
    maturity_date: "2026-05-20",
    status: "Matured"
  }
];

// Seed repairs
const INITIAL_REPAIRS = [
  {
    id: "rep-1",
    customer_name: "Devon Lane",
    customer_phone: "+91 98765 43210",
    item_description: "Claw tightening on 1ct Diamond Cluster Studs",
    estimated_cost: 3200,
    status: "Ready",
    created_at: "2026-05-18T10:20:00.000Z"
  },
  {
    id: "rep-2",
    customer_name: "Eleanor Pena",
    customer_phone: "+91 87654 32109",
    item_description: "Polishing and gold electroplating of 22K Bangle",
    estimated_cost: 1800,
    status: "In Progress",
    created_at: "2026-05-20T14:40:00.000Z"
  },
  {
    id: "rep-3",
    customer_name: "Guy Hawkins",
    customer_phone: "+91 76543 21098",
    item_description: "Laser sizing of Platinum Band from size 10 to 9",
    estimated_cost: 2500,
    status: "Received",
    created_at: "2026-05-22T08:15:00.000Z"
  }
];

export function StateProvider({ children }) {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  const [goldSchemes, setGoldSchemes] = useState(INITIAL_GOLD_SCHEMES);
  const [repairs, setRepairs] = useState(INITIAL_REPAIRS);
  const [orders, setOrders] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [cart, setCart] = useState([]);

  // Simulated live gold price ticket tape tick (24K Gold price per gram)
  const [liveGoldPrice24K, setLiveGoldPrice24K] = useState(7620); // base price
  const [goldRates, setGoldRates] = useState({
    "24K": 7620, "22K": 6985, "18K": 5715, "14K": 4450, "PT950": 3100, "925": 85
  });

  // Fetch products from Express Backend
  const { data: fetchedProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || [];
    }
  });

  // Sync fetched products with local state for backward compatibility
  useEffect(() => {
    // Disabled to show old local images
    // if (fetchedProducts && fetchedProducts.length > 0) {
    //   setProducts(fetchedProducts);
    // }
  }, [fetchedProducts]);

  useEffect(() => {
    // Check local storage persistence on load
    if (typeof window !== "undefined") {
      const storedProducts = localStorage.getItem("aurea_products");
      const storedCustomers = localStorage.getItem("aurea_customers");
      const storedLedger = localStorage.getItem("aurea_ledger");
      const storedSchemes = localStorage.getItem("aurea_schemes");
      const storedRepairs = localStorage.getItem("aurea_repairs");
      const storedOrders = localStorage.getItem("aurea_orders");
      const storedSubscribers = localStorage.getItem("aurea_subscribers");

      setTimeout(() => {
        // Bypass local storage to force old images
        // if (storedProducts && (!fetchedProducts || fetchedProducts.length === 0)) {
        //   const parsed = JSON.parse(storedProducts);
        //   if (parsed.length < INITIAL_PRODUCTS.length) {
        //     setProducts(INITIAL_PRODUCTS);
        //   } else {
        //     setProducts(parsed);
        //   }
        // }
        setProducts(INITIAL_PRODUCTS);
        if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
        if (storedLedger) setLedger(JSON.parse(storedLedger));
        if (storedSchemes) setGoldSchemes(JSON.parse(storedSchemes));
        if (storedRepairs) setRepairs(JSON.parse(storedRepairs));
        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedSubscribers) setSubscribers(JSON.parse(storedSubscribers));
      }, 0);
    }

    // Fetch gold rates from our API on load
    fetch("/api/gold-rate")
      .then(res => res.json())
      .then(data => {
        if (data.rates) {
          setGoldRates(data.rates);
          setLiveGoldPrice24K(data.rates["24K"] || 7620);
        }
      })
      .catch(() => {/* silently fallback to default */});

    // Dynamic price ticker interval (tick every 12 seconds)
    const priceTicker = setInterval(() => {
      setLiveGoldPrice24K((prev) => {
        const drift = (Math.random() - 0.49) * 8; // gentle positive drift fluctuation
        return parseFloat((prev + drift).toFixed(2));
      });
    }, 12000);

    return () => clearInterval(priceTicker);
  }, []);

  // Sync back to local storage whenever states alter
  useEffect(() => {
    localStorage.setItem("aurea_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("aurea_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("aurea_ledger", JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem("aurea_schemes", JSON.stringify(goldSchemes));
  }, [goldSchemes]);

  useEffect(() => {
    localStorage.setItem("aurea_repairs", JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem("aurea_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("aurea_subscribers", JSON.stringify(subscribers));
  }, [subscribers]);

  // Live metal price mapping based on current 24K ticker
  const getMetalRatePerGram = (metal, purity) => {
    if (metal.toLowerCase() === "gold") {
      if (purity === "24K") return liveGoldPrice24K;
      if (purity === "22K") return parseFloat((liveGoldPrice24K * 0.916).toFixed(2));
      if (purity === "18K") return parseFloat((liveGoldPrice24K * 0.75).toFixed(2));
      return parseFloat((liveGoldPrice24K * 0.585).toFixed(2)); // 14K
    }
    if (metal.toLowerCase() === "platinum" || metal.toLowerCase() === "pt950") {
      return 3450.00; // stable premium platinum rate
    }
    if (metal.toLowerCase() === "silver") {
      return 95.00; // silver rate per gram
    }
    if (metal.toLowerCase() === "rose gold") {
      return parseFloat((liveGoldPrice24K * 0.75).toFixed(2)); // rose gold 18k base
    }
    return 2000.00; // fallback default
  };

  // Get absolute item pricing
  const calculateProductPrice = (product) => {
    const metalRate = getMetalRatePerGram(product.metal, product.purity);
    const metalVal = metalRate * product.weight;
    const makingVal = product.making_charges * product.weight;
    const subtotal = metalVal + makingVal;
    const gstVal = subtotal * 0.03; // 3% GST
    const total = subtotal + gstVal;

    return {
      metalValue: parseFloat(metalVal.toFixed(2)),
      makingCharges: parseFloat(makingVal.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      gst: parseFloat(gstVal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  // CART WORKFLOW
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.sku === product.sku);
      if (existing) {
        return prevCart.map((item) =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (sku) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== sku));
  };

  const updateCartQuantity = (sku, quantity) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.sku === sku ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  // SUBMIT ONLINE CUSTOMER CHECKOUT
  const checkoutCart = (customerDetails, paymentMethod = "Razorpay") => {
    if (cart.length === 0) return { success: false, error: "Cart is empty" };

    // 1. Calculate checkout figures
    let subtotal = 0;
    let makingCharges = 0;
    
    cart.forEach((item) => {
      const prices = calculateProductPrice(item);
      subtotal += prices.metalValue * item.quantity;
      makingCharges += prices.makingCharges * item.quantity;
    });

    const combinedSub = subtotal + makingCharges;
    const gst = combinedSub * 0.03;
    const total = combinedSub + gst;

    // 2. Reduce stock counts
    setProducts((prevProd) =>
      prevProd.map((p) => {
        const cartItem = cart.find((c) => c.sku === p.sku);
        if (cartItem) {
          return { ...p, stock_count: Math.max(0, p.stock_count - cartItem.quantity) };
        }
        return p;
      })
    );

    // 3. Upsert customer / update loyalty points
    let finalCust = customers.find(
      (c) => c.email.toLowerCase() === customerDetails.email.toLowerCase()
    );

    const loyaltyEarned = Math.floor(total / 1000);

    if (finalCust) {
      setCustomers((prevCust) =>
        prevCust.map((c) =>
          c.id === finalCust.id
            ? { ...c, loyalty_points: c.loyalty_points + loyaltyEarned }
            : c
        )
      );
    } else {
      const newCust = {
        id: `cust-${Date.now()}`,
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone || "",
        loyalty_points: loyaltyEarned,
        birthday: customerDetails.birthday || "",
        gold_scheme_status: "Inactive",
        scheme_id: null
      };
      setCustomers((prevCust) => [...prevCust, newCust]);
      finalCust = newCust;
    }

    // 4. Create Order Transaction
    const orderNo = `AUREA-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: orderNo,
      customer_id: finalCust.id,
      customer_name: finalCust.name,
      items: cart.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: calculateProductPrice(item).total
      })),
      subtotal,
      making_charges: makingCharges,
      gst,
      total,
      payment_method: paymentMethod,
      payment_status: "Completed",
      created_at: new Date().toISOString()
    };

    setOrders((prevOrd) => [newOrder, ...prevOrd]);

    // 5. Post to Ledger
    setLedger((prevLed) => {
      const balance = prevLed[prevLed.length - 1].running_balance + total;
      const newLedEntry = {
        id: `led-${Date.now()}`,
        transaction_date: new Date().toISOString(),
        description: `eCommerce Order: ${orderNo} (${finalCust.name})`,
        type: "Credit",
        amount: total,
        running_balance: balance
      };
      return [...prevLed, newLedEntry];
    });

    clearCart();
    return { success: true, orderNumber: orderNo, total };
  };

  // SUBMIT POS STORE SALE
  const processPOSSale = (saleItems, customerId, paymentMethod, discountPercentage = 0) => {
    if (saleItems.length === 0) return { success: false, error: "No products added to bill" };

    let rawSubtotal = 0;
    let rawMaking = 0;

    saleItems.forEach((item) => {
      const prices = calculateProductPrice(item);
      rawSubtotal += prices.metalValue * item.quantity;
      rawMaking += prices.makingCharges * item.quantity;
    });

    const combinedSub = rawSubtotal + rawMaking;
    const discountVal = combinedSub * (discountPercentage / 100);
    const activeSub = combinedSub - discountVal;
    const gst = activeSub * 0.03;
    const total = activeSub + gst;

    // 1. Stock deduction
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const billed = saleItems.find((s) => s.sku === p.sku);
        if (billed) {
          return { ...p, stock_count: Math.max(0, p.stock_count - billed.quantity) };
        }
        return p;
      })
    );

    // 2. CRM Update
    const activeCust = customers.find((c) => c.id === customerId);
    const pointsEarned = Math.floor(total / 800); // POS loyalty multiplier
    if (activeCust) {
      setCustomers((prevCust) =>
        prevCust.map((c) =>
          c.id === customerId
            ? { ...c, loyalty_points: c.loyalty_points + pointsEarned }
            : c
        )
      );
    }

    // 3. Register transaction order
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: invoiceNumber,
      customer_id: customerId || "Walk-in Customer",
      customer_name: activeCust ? activeCust.name : "Walk-in Customer",
      items: saleItems.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: calculateProductPrice(item).total
      })),
      subtotal: rawSubtotal,
      making_charges: rawMaking,
      discount: discountVal,
      gst,
      total,
      payment_method: paymentMethod,
      payment_status: "Completed",
      created_at: new Date().toISOString()
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);

    // 4. Register accounting ledger credit entry
    setLedger((prevLed) => {
      const balance = prevLed[prevLed.length - 1].running_balance + total;
      return [
        ...prevLed,
        {
          id: `led-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          description: `POS Bill Invoice ${invoiceNumber}`,
          type: "Credit",
          amount: total,
          running_balance: balance
        }
      ];
    });

    return { success: true, invoiceNumber, total };
  };

  // INVENTORY WORKFLOWS
  const addProductMutation = useMutation({
    mutationFn: async (newItem) => {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ sku, updatedItem }) => {
      // Using SKU as the identifier for now based on the frontend structure
      const res = await fetch(`http://localhost:5000/api/products/${sku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem)
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const removeProductMutation = useMutation({
    mutationFn: async (sku) => {
      const res = await fetch(`http://localhost:5000/api/products/${sku}`, {
        method: "DELETE"
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const addInventoryItem = (newItem) => {
    setProducts((prev) => [...prev, newItem]); // Optimistic update
    addProductMutation.mutate(newItem);
  };

  const updateInventoryItem = (sku, updatedItem) => {
    setProducts((prev) =>
      prev.map((item) => (item.sku === sku ? { ...item, ...updatedItem } : item))
    ); // Optimistic update
    updateProductMutation.mutate({ sku, updatedItem });
  };

  const removeInventoryItem = (sku) => {
    setProducts((prev) => prev.filter((item) => item.sku !== sku)); // Optimistic update
    removeProductMutation.mutate(sku);
  };

  // CRM CUSTOMER MANAGEMENT
  const addCustomer = (customer) => {
    const fresh = {
      id: `cust-${Date.now()}`,
      loyalty_points: 0,
      gold_scheme_status: "Inactive",
      scheme_id: null,
      ...customer
    };
    setCustomers((prev) => [...prev, fresh]);
  };

  const updateCustomerDetails = (id, updatedDetails) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedDetails } : c))
    );
  };

  // REPAIR JOBS WORKFLOW
  const addRepairJob = (job) => {
    const freshJob = {
      id: `rep-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...job
    };
    setRepairs((prev) => [freshJob, ...prev]);

    // Debit cost tracking setup in Ledger (debit tracking repair expenses/parts, later customer credits)
    // For simplicity, Repair estimate isn't posted to ledger until status is set to "Delivered" (Revenue collected)
  };

  const updateRepairStatus = (id, newStatus) => {
    let repairRecord = repairs.find((r) => r.id === id);
    setRepairs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    if (newStatus === "Delivered" && repairRecord) {
      // Post collected cash to General Ledger
      setLedger((prevLed) => {
        const balance = prevLed[prevLed.length - 1].running_balance + repairRecord.estimated_cost;
        return [
          ...prevLed,
          {
            id: `led-${Date.now()}`,
            transaction_date: new Date().toISOString(),
            description: `Repairs Collected - Job #${id.slice(-4)} (${repairRecord.customer_name})`,
            type: "Credit",
            amount: repairRecord.estimated_cost,
            running_balance: balance
          }
        ];
      });
    }
  };

  // GOLD SAVINGS SCHEMES WORKFLOWS
  const enrollInGoldScheme = (customerId, installment) => {
    const activeCust = customers.find((c) => c.id === customerId);
    if (!activeCust) return;

    const schemeId = `scheme-${Date.now().toString().slice(-4)}`;
    const newScheme = {
      id: schemeId,
      customer_id: customerId,
      customer_name: activeCust.name,
      monthly_installment: installment,
      months_paid: 1,
      total_invested: installment,
      start_date: new Date().toISOString().split("T")[0],
      maturity_date: new Date(new Date().setMonth(new Date().getMonth() + 11)).toISOString().split("T")[0],
      status: "Active"
    };

    setGoldSchemes((prev) => [...prev, newScheme]);
    setCustomers((prevCust) =>
      prevCust.map((c) =>
        c.id === customerId ? { ...c, gold_scheme_status: "Active", scheme_id: schemeId } : c
      )
    );

    // Initial payment posted to ledger
    setLedger((prevLed) => {
      const balance = prevLed[prevLed.length - 1].running_balance + installment;
      return [
        ...prevLed,
        {
          id: `led-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          description: `Gold Scheme Enrollment: ${schemeId} (${activeCust.name})`,
          type: "Credit",
          amount: installment,
          running_balance: balance
        }
      ];
    });
  };

  const paySchemeInstallment = (schemeId) => {
    const scheme = goldSchemes.find((s) => s.id === schemeId);
    if (!scheme || scheme.status === "Redeemed") return;

    const updatedPaid = scheme.months_paid + 1;
    const totalNew = scheme.total_invested + scheme.monthly_installment;
    const isMatured = updatedPaid >= 11;

    setGoldSchemes((prev) =>
      prev.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              months_paid: updatedPaid,
              total_invested: totalNew,
              status: isMatured ? "Matured" : "Active"
            }
          : s
      )
    );

    if (isMatured) {
      setCustomers((prevCust) =>
        prevCust.map((c) =>
          c.id === scheme.customer_id ? { ...c, gold_scheme_status: "Matured" } : c
        )
      );
    }

    // Post payment installment to ledger
    setLedger((prevLed) => {
      const balance = prevLed[prevLed.length - 1].running_balance + scheme.monthly_installment;
      return [
        ...prevLed,
        {
          id: `led-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          description: `Gold Scheme Installment Pymt - ${schemeId} (${scheme.customer_name})`,
          type: "Credit",
          amount: scheme.monthly_installment,
          running_balance: balance
        }
      ];
    });
  };

  const redeemGoldScheme = (schemeId) => {
    const scheme = goldSchemes.find((s) => s.id === schemeId);
    if (!scheme) return;

    setGoldSchemes((prev) =>
      prev.map((s) => (s.id === schemeId ? { ...s, status: "Redeemed" } : s))
    );
    setCustomers((prevCust) =>
      prevCust.map((c) =>
        c.id === scheme.customer_id ? { ...c, gold_scheme_status: "Inactive", scheme_id: null } : c
      )
    );

    // Redeeming represents delivering gold, which matches a ledger debit event (Liability cleared, assets converted)
    setLedger((prevLed) => {
      const balance = prevLed[prevLed.length - 1].running_balance - scheme.total_invested;
      return [
        ...prevLed,
        {
          id: `led-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          description: `Gold Scheme Redeemed/Gold Issued - ${schemeId} (${scheme.customer_name})`,
          type: "Debit",
          amount: scheme.total_invested,
          running_balance: balance
        }
      ];
    });
  };

  // MANUAL LEDGER ENTRY
  const addLedgerEntry = (description, type, amount) => {
    setLedger((prevLed) => {
      const lastEntry = prevLed[prevLed.length - 1];
      const prevBalance = lastEntry ? lastEntry.running_balance : 0;
      const newBalance = type === "Credit" ? prevBalance + amount : prevBalance - amount;
      return [
        ...prevLed,
        {
          id: `led-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          description,
          type,
          amount,
          running_balance: newBalance
        }
      ];
    });
  };

  // NEWSLETTER CAPTURE
  const subscribeEmail = (email) => {
    if (subscribers.includes(email)) return { success: false, error: "Already subscribed." };
    setSubscribers((prev) => [email, ...prev]);
    return { success: true };
  };

  return (
    <StateContext.Provider
      value={{
        products,
        customers,
        ledger,
        goldSchemes,
        repairs,
        orders,
        subscribers,
        cart,
        liveGoldPrice24K,
        goldRates,
        getMetalRatePerGram,
        calculateProductPrice,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        processPOSSale,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        addCustomer,
        updateCustomerDetails,
        addRepairJob,
        updateRepairStatus,
        enrollInGoldScheme,
        paySchemeInstallment,
        redeemGoldScheme,
        subscribeEmail,
        addLedgerEntry
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  return useContext(StateContext);
}
