import { supabase } from '../config/supabase.js'
import AppError from '../utils/AppError.js'

const isUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

// ============================================
// GET ALL PRODUCTS SERVICE
// ============================================
export const getAllProductsService = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(*),
            product_images(*),
            product_variants(*)
        `)

    if (error) {
        throw new AppError(error.message, 500)
    }

    return data
}

// ============================================
// GET PRODUCT BY ID SERVICE
// ============================================
export const getProductByIdService = async (id) => {
    const query = supabase
        .from('products')
        .select(`
            *,
            categories(*),
            product_images(*),
            product_variants(*)
        `);

    if (isUUID(id)) {
        query.eq('id', id);
    } else {
        query.eq('sku', id);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Product not found', 404)
        }
        throw new AppError(error.message, 500)
    }

    return data
}

// ============================================
// CREATE PRODUCT SERVICE
// ============================================
export const createProductService = async (productData) => {
    // 1. Resolve category_id
    let categoryId = productData.category_id;
    if (!categoryId && productData.category) {
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', productData.category)
            .single();
        if (catData) {
            categoryId = catData.id;
        } else {
            const { data: newCat } = await supabase
                .from('categories')
                .insert([{ name: productData.category, description: `${productData.category} Collection` }])
                .select()
                .single();
            if (newCat) categoryId = newCat.id;
        }
    }

    // 2. Resolve price
    let price = productData.price;
    const weight = parseFloat(productData.weight) || 0;
    const makingCharges = parseFloat(productData.making_charges) || 0;
    const metal = productData.metal || 'Gold';
    const purity = productData.purity || '22K';
    
    if (!price && weight) {
        let rate = 7620;
        const { data: latestRate } = await supabase
            .from('gold_rates')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1);
        let rate24k = 7620;
        if (latestRate && latestRate.length > 0) {
            rate24k = parseFloat(latestRate[0].rate_24k) || 7620;
        }

        const safeMetal = metal.toLowerCase();
        if (safeMetal === 'gold' || safeMetal === 'rose gold') {
            if (purity === '24K') rate = rate24k;
            else if (purity === '22K') rate = rate24k * 0.916;
            else if (purity === '18K') rate = rate24k * 0.75;
            else rate = rate24k * 0.585;
        } else if (safeMetal === 'platinum' || safeMetal === 'pt950') {
            rate = 3450;
        } else if (safeMetal === 'silver') {
            rate = 95;
        }

        const metalValue = rate * weight;
        const makingValue = makingCharges * weight;
        const subtotal = metalValue + makingValue;
        price = parseFloat((subtotal * 1.03).toFixed(2));
    }

    // 3. Serialize description with metal and making charges
    const serializedDescription = JSON.stringify({
        text: productData.description || '',
        metal: metal,
        making_charges: makingCharges
    });

    // 4. Construct DB product object
    const dbProduct = {
        sku: productData.sku,
        name: productData.name,
        description: serializedDescription,
        price: price || 0,
        weight: weight,
        purity: purity,
        stock_quantity: parseInt(productData.stock_quantity ?? productData.stock_count ?? 5),
        category_id: categoryId,
        is_available: productData.is_available !== undefined ? productData.is_available : true
    };

    const { data: createdProduct, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

    if (error) {
        throw new AppError(error.message, 400)
    }

    // Insert image if provided
    if (productData.image_url) {
        await supabase
            .from('product_images')
            .insert([{
                product_id: createdProduct.id,
                image_url: productData.image_url,
                is_primary: true
            }]);
    }

    return createdProduct
}

// ============================================
// UPDATE PRODUCT SERVICE
// ============================================
export const updateProductService = async (id, productData) => {
    // 1. Resolve category_id
    let categoryId = productData.category_id;
    if (!categoryId && productData.category) {
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', productData.category)
            .single();
        if (catData) {
            categoryId = catData.id;
        }
    }

    // 2. Resolve price
    let price = productData.price;
    const weight = parseFloat(productData.weight) || 0;
    const makingCharges = parseFloat(productData.making_charges) || 0;
    const metal = productData.metal || 'Gold';
    const purity = productData.purity || '22K';
    
    if (!price && weight) {
        let rate = 7620;
        const { data: latestRate } = await supabase
            .from('gold_rates')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1);
        let rate24k = 7620;
        if (latestRate && latestRate.length > 0) {
            rate24k = parseFloat(latestRate[0].rate_24k) || 7620;
        }

        const safeMetal = metal.toLowerCase();
        if (safeMetal === 'gold' || safeMetal === 'rose gold') {
            if (purity === '24K') rate = rate24k;
            else if (purity === '22K') rate = rate24k * 0.916;
            else if (purity === '18K') rate = rate24k * 0.75;
            else rate = rate24k * 0.585;
        } else if (safeMetal === 'platinum' || safeMetal === 'pt950') {
            rate = 3450;
        } else if (safeMetal === 'silver') {
            rate = 95;
        }

        const metalValue = rate * weight;
        const makingValue = makingCharges * weight;
        const subtotal = metalValue + makingValue;
        price = parseFloat((subtotal * 1.03).toFixed(2));
    }

    // 3. Construct DB product object
    const dbProduct = {};
    if (productData.sku) dbProduct.sku = productData.sku;
    if (productData.name) dbProduct.name = productData.name;
    if (productData.description !== undefined || productData.metal || productData.making_charges) {
        dbProduct.description = JSON.stringify({
            text: productData.description || '',
            metal: metal,
            making_charges: makingCharges
        });
    }
    if (price !== undefined) dbProduct.price = price;
    if (productData.weight !== undefined) dbProduct.weight = weight;
    if (productData.purity !== undefined) dbProduct.purity = purity;
    if (productData.stock_quantity !== undefined || productData.stock_count !== undefined) {
        dbProduct.stock_quantity = parseInt(productData.stock_quantity ?? productData.stock_count);
    }
    if (categoryId) dbProduct.category_id = categoryId;
    if (productData.is_available !== undefined) dbProduct.is_available = productData.is_available;

    const query = supabase.from('products').update(dbProduct);
    if (isUUID(id)) {
        query.eq('id', id);
    } else {
        query.eq('sku', id);
    }

    const { data: updatedProduct, error } = await query.select().single();

    if (error) {
        throw new AppError(error.message, 400)
    }

    // Update image if provided
    if (productData.image_url) {
        // Delete old primary images
        await supabase
            .from('product_images')
            .delete()
            .eq('product_id', updatedProduct.id);

        // Insert new primary image
        await supabase
            .from('product_images')
            .insert([{
                product_id: updatedProduct.id,
                image_url: productData.image_url,
                is_primary: true
            }]);
    }

    return updatedProduct
}

// ============================================
// DELETE PRODUCT SERVICE
// ============================================
export const deleteProductService = async (id) => {
    const query = supabase.from('products').delete();
    if (isUUID(id)) {
        query.eq('id', id);
    } else {
        query.eq('sku', id);
    }

    const { data, error } = await query.select().single();

    if (error) {
        throw new AppError(error.message, 400)
    }

    return data
}

// ============================================
// SEARCH PRODUCTS SERVICE
// ============================================
export const searchProductsService = async ({
    search = '',
    minPrice = 0,
    maxPrice = 999999999,
    sortBy = 'created_at',
    order = 'desc',
    page = 1,
    limit = 10
}) => {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .range(from, to)
        .order(sortBy, { ascending: order === 'asc' })

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
        throw new AppError(error.message, 500)
    }

    return {
        products: data,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit)
        }
    }
}