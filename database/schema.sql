--
-- PostgreSQL database dump
--



-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number :=
      'AUR-' ||
      TO_CHAR(NOW(), 'YYYYMM') ||
      '-' ||
      LPAD(nextval('order_number_seq')::TEXT, 5, '0');
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_inventory_on_movement(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inventory_on_movement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO inventory (
    product_id,
    variant_id,
    quantity_on_hand
  )
  VALUES (
    NEW.product_id,
    NEW.variant_id,
    NEW.quantity_change
  )
  ON CONFLICT (product_id, variant_id)
  DO UPDATE
  SET quantity_on_hand =
      inventory.quantity_on_hand + NEW.quantity_change,
      updated_at = NOW();

  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid,
    full_name character varying(200) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    employee_code character varying(50),
    avatar_url text,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id character varying(100),
    customer_id uuid,
    event_name character varying(100) NOT NULL,
    event_category character varying(50),
    page_path text,
    referrer text,
    product_id uuid,
    order_id uuid,
    properties jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    country character varying(50),
    city character varying(100),
    device_type character varying(30),
    browser character varying(100),
    os character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    purpose text,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: ar_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    session_token character varying(100),
    device_type character varying(50),
    browser character varying(100),
    duration_seconds integer,
    interaction_count integer DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: ar_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    customer_id uuid,
    product_id uuid,
    image_url text NOT NULL,
    shared_to character varying(30),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_type character varying(20),
    actor_id uuid,
    action character varying(100) NOT NULL,
    table_name character varying(100),
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    image_url text,
    banner_url text,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    valid_from date,
    valid_until date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_usages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    coupon_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    order_id uuid NOT NULL,
    discount_applied numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    discount_percentage numeric(5,2),
    valid_from date,
    valid_until date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customer_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    session_id character varying(100),
    type character varying(50) NOT NULL,
    product_id uuid,
    category_id uuid,
    order_id uuid,
    page_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    type character varying(20) DEFAULT 'home'::character varying,
    full_name character varying(200) NOT NULL,
    phone character varying(20) NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) DEFAULT 'Kerala'::character varying,
    pincode character varying(10) NOT NULL,
    country character varying(50) DEFAULT 'India'::character varying,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customer_addresses_type_check CHECK (((type)::text = ANY ((ARRAY['home'::character varying, 'office'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    admin_id uuid,
    note text NOT NULL,
    is_pinned boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    email character varying(255),
    phone character varying(20) NOT NULL,
    whatsapp character varying(20),
    date_of_birth date,
    anniversary_date date,
    gender character varying(20),
    gstin character varying(20),
    pan_number character varying(20),
    customer_tier character varying(20) DEFAULT 'bronze'::character varying,
    total_purchases numeric(15,2) DEFAULT 0,
    total_orders integer DEFAULT 0,
    loyalty_points_balance integer DEFAULT 0,
    referral_code character varying(20),
    referred_by_id uuid,
    is_active boolean DEFAULT true,
    marketing_opt_in boolean DEFAULT true,
    whatsapp_opt_in boolean DEFAULT true,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customers_customer_tier_check CHECK (((customer_tier)::text = ANY ((ARRAY['bronze'::character varying, 'silver'::character varying, 'gold'::character varying, 'platinum'::character varying, 'diamond'::character varying])::text[]))),
    CONSTRAINT customers_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying, 'prefer_not_to_say'::character varying])::text[])))
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category character varying(100) NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    vendor_name character varying(200),
    vendor_gstin character varying(20),
    invoice_number character varying(50),
    expense_date date NOT NULL,
    payment_method character varying(30),
    ledger_account_id uuid,
    gst_amount numeric(10,2) DEFAULT 0,
    net_amount numeric(10,2),
    receipt_url text,
    is_gst_eligible boolean DEFAULT false,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: gold_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gold_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rate_22k numeric(10,2) NOT NULL,
    rate_24k numeric(10,2) NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: gold_scheme_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gold_scheme_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_number character varying(30) NOT NULL,
    scheme_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    installment_amount numeric(10,2) NOT NULL,
    start_date date NOT NULL,
    expected_completion_date date NOT NULL,
    total_paid numeric(12,2) DEFAULT 0,
    bonus_credited boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying,
    maturity_amount numeric(12,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: gold_scheme_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gold_scheme_installments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    installment_number integer NOT NULL,
    due_date date NOT NULL,
    paid_date date,
    amount_due numeric(10,2) NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0,
    is_bonus boolean DEFAULT false,
    payment_method character varying(30),
    payment_reference character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    collected_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: gold_scheme_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gold_scheme_redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    order_id uuid,
    redemption_date date DEFAULT CURRENT_DATE NOT NULL,
    total_paid numeric(12,2) NOT NULL,
    bonus_amount numeric(12,2) DEFAULT 0,
    redemption_value numeric(12,2) NOT NULL,
    gold_rate_at_redemption numeric(10,2),
    redemption_type character varying(20) DEFAULT 'purchase'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    processed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: gold_schemes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gold_schemes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scheme_code character varying(30) NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(30) DEFAULT 'monthly'::character varying,
    duration_months integer DEFAULT 11 NOT NULL,
    bonus_months integer DEFAULT 1 NOT NULL,
    description text,
    terms_and_conditions text,
    min_installment numeric(10,2) DEFAULT 1000,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: gst_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gst_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period_month integer NOT NULL,
    period_year integer NOT NULL,
    gstin character varying(20) NOT NULL,
    return_type character varying(10) NOT NULL,
    total_taxable_value numeric(15,2) DEFAULT 0,
    total_cgst numeric(12,2) DEFAULT 0,
    total_sgst numeric(12,2) DEFAULT 0,
    total_igst numeric(12,2) DEFAULT 0,
    total_gst numeric(12,2) DEFAULT 0,
    total_sales numeric(15,2) DEFAULT 0,
    status character varying(20) DEFAULT 'draft'::character varying,
    filed_at timestamp with time zone,
    acknowledgement_number character varying(100),
    generated_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gst_reports_period_month_check CHECK (((period_month >= 1) AND (period_month <= 12)))
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    low_stock_threshold integer DEFAULT 5,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(50) NOT NULL,
    order_id uuid NOT NULL,
    customer_id uuid,
    type character varying(20) DEFAULT 'tax_invoice'::character varying,
    status character varying(20) DEFAULT 'generated'::character varying,
    invoice_date date DEFAULT CURRENT_DATE NOT NULL,
    due_date date,
    subtotal numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0,
    taxable_amount numeric(12,2) NOT NULL,
    cgst_rate numeric(5,2) DEFAULT 1.50,
    cgst_amount numeric(10,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 1.50,
    sgst_amount numeric(10,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    igst_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    amount_in_words text,
    seller_gstin character varying(20),
    buyer_gstin character varying(20),
    hsn_code character varying(20) DEFAULT '7113'::character varying,
    pdf_url text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'generated'::character varying, 'sent'::character varying, 'paid'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT invoices_type_check CHECK (((type)::text = ANY ((ARRAY['tax_invoice'::character varying, 'proforma'::character varying, 'credit_note'::character varying, 'debit_note'::character varying])::text[])))
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entry_number character varying(30) NOT NULL,
    type character varying(30),
    reference_type character varying(50),
    reference_id uuid,
    description text NOT NULL,
    entry_date date DEFAULT CURRENT_DATE NOT NULL,
    total_debit numeric(15,2) NOT NULL,
    total_credit numeric(15,2) NOT NULL,
    is_posted boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT journal_entries_check CHECK ((total_debit = total_credit))
);


--
-- Name: ledger_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledger_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(30) NOT NULL,
    sub_type character varying(50),
    description text,
    is_system_account boolean DEFAULT false,
    is_active boolean DEFAULT true,
    normal_balance character varying(10),
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ledger_accounts_normal_balance_check CHECK (((normal_balance)::text = ANY ((ARRAY['debit'::character varying, 'credit'::character varying])::text[]))),
    CONSTRAINT ledger_accounts_type_check CHECK (((type)::text = ANY ((ARRAY['asset'::character varying, 'liability'::character varying, 'equity'::character varying, 'revenue'::character varying, 'expense'::character varying, 'contra_asset'::character varying])::text[])))
);


--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    journal_entry_id uuid NOT NULL,
    account_id uuid NOT NULL,
    type character varying(10) NOT NULL,
    amount numeric(15,2) NOT NULL,
    narration text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ledger_entries_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT ledger_entries_type_check CHECK (((type)::text = ANY ((ARRAY['debit'::character varying, 'credit'::character varying])::text[])))
);


--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    order_id uuid,
    type character varying(30) NOT NULL,
    points integer NOT NULL,
    balance_after integer NOT NULL,
    description text,
    expires_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT loyalty_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['earn'::character varying, 'redeem'::character varying, 'expire'::character varying, 'adjust'::character varying, 'bonus'::character varying])::text[])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL
);


--
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    order_status character varying(50) DEFAULT 'pending'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    shipping_address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50),
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    transaction_id character varying(255),
    paid_at timestamp without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    image_url text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tags (
    product_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    sku character varying(100) NOT NULL,
    barcode character varying(50),
    name character varying(200),
    size character varying(50),
    color character varying(50),
    gross_weight numeric(8,3),
    net_weight numeric(8,3),
    price_adjustment numeric(10,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sku character varying(100),
    price numeric(12,2) NOT NULL,
    weight numeric(10,2),
    purity character varying(50),
    stock_quantity integer DEFAULT 0,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    payment_id uuid NOT NULL,
    customer_id uuid,
    reason character varying(50),
    amount numeric(12,2) NOT NULL,
    refund_method character varying(30),
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    approved_by uuid,
    processed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT refunds_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT refunds_reason_check CHECK (((reason)::text = ANY ((ARRAY['customer_request'::character varying, 'defective'::character varying, 'incorrect_item'::character varying, 'not_delivered'::character varying, 'cancelled'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT refunds_refund_method_check CHECK (((refund_method)::text = ANY ((ARRAY['original_method'::character varying, 'bank_transfer'::character varying, 'store_credit'::character varying, 'cash'::character varying, 'loyalty_points'::character varying])::text[]))),
    CONSTRAINT refunds_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'processing'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: repair_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repair_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_number character varying(30) NOT NULL,
    customer_id uuid NOT NULL,
    type character varying(50),
    description text NOT NULL,
    item_description text NOT NULL,
    item_weight numeric(8,3),
    item_purity character varying(20),
    estimated_amount numeric(10,2),
    advance_paid numeric(10,2) DEFAULT 0,
    final_amount numeric(10,2),
    status character varying(20) DEFAULT 'received'::character varying,
    received_date date DEFAULT CURRENT_DATE NOT NULL,
    promised_date date,
    completed_date date,
    delivered_date date,
    technician_id uuid,
    received_by uuid,
    delivered_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: repair_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repair_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    repair_job_id uuid NOT NULL,
    old_status character varying(20),
    new_status character varying(20) NOT NULL,
    notes text,
    changed_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    label character varying(200),
    description text,
    group_name character varying(50),
    is_public boolean DEFAULT false,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    variant_id uuid,
    type character varying(30) NOT NULL,
    quantity_change integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_after integer NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stock_movements_type_check CHECK (((type)::text = ANY ((ARRAY['purchase'::character varying, 'sale'::character varying, 'return'::character varying, 'adjustment'::character varying, 'reserved'::character varying, 'unreserved'::character varying, 'transfer'::character varying, 'damage'::character varying, 'repair_in'::character varying, 'repair_out'::character varying])::text[])))
);


--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    name character varying(200),
    source character varying(50) DEFAULT 'website'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    phone character varying(20),
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'customer'::character varying])::text[])))
);


--
-- Name: visitor_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visitor_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id character varying(100) NOT NULL,
    customer_id uuid,
    landing_page text,
    utm_source character varying(100),
    utm_medium character varying(100),
    utm_campaign character varying(100),
    referrer text,
    ip_address inet,
    country character varying(50),
    city character varying(100),
    device_type character varying(30),
    browser character varying(100),
    os character varying(50),
    page_views integer DEFAULT 1,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone
);


--
-- Name: webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source character varying(50) NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    headers jsonb,
    signature character varying(500),
    is_verified boolean DEFAULT false,
    is_processed boolean DEFAULT false,
    processing_error text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_employee_code_key UNIQUE (employee_code);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: ar_sessions ar_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_sessions
    ADD CONSTRAINT ar_sessions_pkey PRIMARY KEY (id);


--
-- Name: ar_sessions ar_sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_sessions
    ADD CONSTRAINT ar_sessions_session_token_key UNIQUE (session_token);


--
-- Name: ar_snapshots ar_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_snapshots
    ADD CONSTRAINT ar_snapshots_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customer_activities customer_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_referral_code_key UNIQUE (referral_code);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: gold_rates gold_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_rates
    ADD CONSTRAINT gold_rates_pkey PRIMARY KEY (id);


--
-- Name: gold_scheme_enrollments gold_scheme_enrollments_enrollment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_enrollments
    ADD CONSTRAINT gold_scheme_enrollments_enrollment_number_key UNIQUE (enrollment_number);


--
-- Name: gold_scheme_enrollments gold_scheme_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_enrollments
    ADD CONSTRAINT gold_scheme_enrollments_pkey PRIMARY KEY (id);


--
-- Name: gold_scheme_installments gold_scheme_installments_enrollment_id_installment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_installments
    ADD CONSTRAINT gold_scheme_installments_enrollment_id_installment_number_key UNIQUE (enrollment_id, installment_number);


--
-- Name: gold_scheme_installments gold_scheme_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_installments
    ADD CONSTRAINT gold_scheme_installments_pkey PRIMARY KEY (id);


--
-- Name: gold_scheme_redemptions gold_scheme_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_redemptions
    ADD CONSTRAINT gold_scheme_redemptions_pkey PRIMARY KEY (id);


--
-- Name: gold_schemes gold_schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_schemes
    ADD CONSTRAINT gold_schemes_pkey PRIMARY KEY (id);


--
-- Name: gold_schemes gold_schemes_scheme_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_schemes
    ADD CONSTRAINT gold_schemes_scheme_code_key UNIQUE (scheme_code);


--
-- Name: gst_reports gst_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gst_reports
    ADD CONSTRAINT gst_reports_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_key UNIQUE (product_id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_entry_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_entry_number_key UNIQUE (entry_number);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: ledger_accounts ledger_accounts_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_code_key UNIQUE (code);


--
-- Name: ledger_accounts ledger_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_pkey PRIMARY KEY (id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_module_action_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_action_key UNIQUE (module, action);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id);


--
-- Name: product_variants product_variants_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_barcode_key UNIQUE (barcode);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: repair_jobs repair_jobs_job_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_job_number_key UNIQUE (job_number);


--
-- Name: repair_jobs repair_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_pkey PRIMARY KEY (id);


--
-- Name: repair_status_history repair_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_status_history
    ADD CONSTRAINT repair_status_history_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_key UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visitor_tracking visitor_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitor_tracking
    ADD CONSTRAINT visitor_tracking_pkey PRIMARY KEY (id);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: idx_inventory_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_product ON public.inventory USING btree (product_id);


--
-- Name: idx_orders_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created ON public.orders USING btree (created_at DESC);


--
-- Name: idx_payments_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_order ON public.payments USING btree (order_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_reviews_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_product ON public.reviews USING btree (product_id);


--
-- Name: idx_stock_movements_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_product ON public.stock_movements USING btree (product_id, created_at DESC);


--
-- Name: customers trg_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders trg_generate_order_number; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_generate_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();


--
-- Name: stock_movements trg_inventory_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_inventory_update AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_movement();


--
-- Name: orders trg_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products trg_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_sessions admin_sessions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: admins admins_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: analytics_events analytics_events_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: analytics_events analytics_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: analytics_events analytics_events_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: ar_sessions ar_sessions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_sessions
    ADD CONSTRAINT ar_sessions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: ar_snapshots ar_snapshots_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_snapshots
    ADD CONSTRAINT ar_snapshots_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: ar_snapshots ar_snapshots_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_snapshots
    ADD CONSTRAINT ar_snapshots_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: ar_snapshots ar_snapshots_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_snapshots
    ADD CONSTRAINT ar_snapshots_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ar_sessions(id) ON DELETE CASCADE;


--
-- Name: coupon_usages coupon_usages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_usages coupon_usages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: coupon_usages coupon_usages_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: customer_activities customer_activities_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: customer_activities customer_activities_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_activities customer_activities_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: customer_activities customer_activities_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_activities
    ADD CONSTRAINT customer_activities_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customer_notes customer_notes_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id);


--
-- Name: customer_notes customer_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers customers_referred_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES public.customers(id);


--
-- Name: expenses expenses_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admins(id);


--
-- Name: expenses expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: expenses expenses_ledger_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_ledger_account_id_fkey FOREIGN KEY (ledger_account_id) REFERENCES public.ledger_accounts(id);


--
-- Name: appointments fk_appointments_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_cart; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: carts fk_carts_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: inventory fk_inventory_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: notifications fk_notifications_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders fk_orders_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments fk_payments_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payments fk_payments_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_images fk_product_images_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products fk_products_category; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: reviews fk_reviews_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews fk_reviews_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist fk_wishlist_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: wishlist fk_wishlist_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: gold_scheme_enrollments gold_scheme_enrollments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_enrollments
    ADD CONSTRAINT gold_scheme_enrollments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: gold_scheme_enrollments gold_scheme_enrollments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_enrollments
    ADD CONSTRAINT gold_scheme_enrollments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: gold_scheme_enrollments gold_scheme_enrollments_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_enrollments
    ADD CONSTRAINT gold_scheme_enrollments_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.gold_schemes(id);


--
-- Name: gold_scheme_installments gold_scheme_installments_collected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_installments
    ADD CONSTRAINT gold_scheme_installments_collected_by_fkey FOREIGN KEY (collected_by) REFERENCES public.admins(id);


--
-- Name: gold_scheme_installments gold_scheme_installments_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_installments
    ADD CONSTRAINT gold_scheme_installments_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.gold_scheme_enrollments(id) ON DELETE CASCADE;


--
-- Name: gold_scheme_redemptions gold_scheme_redemptions_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_redemptions
    ADD CONSTRAINT gold_scheme_redemptions_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.gold_scheme_enrollments(id);


--
-- Name: gold_scheme_redemptions gold_scheme_redemptions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_redemptions
    ADD CONSTRAINT gold_scheme_redemptions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: gold_scheme_redemptions gold_scheme_redemptions_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_scheme_redemptions
    ADD CONSTRAINT gold_scheme_redemptions_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.admins(id);


--
-- Name: gold_schemes gold_schemes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gold_schemes
    ADD CONSTRAINT gold_schemes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: gst_reports gst_reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gst_reports
    ADD CONSTRAINT gst_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.admins(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: ledger_accounts ledger_accounts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_accounts
    ADD CONSTRAINT ledger_accounts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.ledger_accounts(id);


--
-- Name: ledger_entries ledger_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.ledger_accounts(id);


--
-- Name: ledger_entries ledger_entries_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: loyalty_transactions loyalty_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: loyalty_transactions loyalty_transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: loyalty_transactions loyalty_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: product_tags product_tags_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_tags product_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: refunds refunds_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.admins(id);


--
-- Name: refunds refunds_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: refunds refunds_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: repair_jobs repair_jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: repair_jobs repair_jobs_delivered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_delivered_by_fkey FOREIGN KEY (delivered_by) REFERENCES public.admins(id);


--
-- Name: repair_jobs repair_jobs_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_received_by_fkey FOREIGN KEY (received_by) REFERENCES public.admins(id);


--
-- Name: repair_jobs repair_jobs_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_jobs
    ADD CONSTRAINT repair_jobs_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.admins(id);


--
-- Name: repair_status_history repair_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_status_history
    ADD CONSTRAINT repair_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.admins(id);


--
-- Name: repair_status_history repair_status_history_repair_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repair_status_history
    ADD CONSTRAINT repair_status_history_repair_job_id_fkey FOREIGN KEY (repair_job_id) REFERENCES public.repair_jobs(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admins(id);


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_movements stock_movements_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);


--
-- Name: visitor_tracking visitor_tracking_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitor_tracking
    ADD CONSTRAINT visitor_tracking_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- PostgreSQL database dump complete
--



