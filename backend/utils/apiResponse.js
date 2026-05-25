// ============================================
// SUCCESS RESPONSE
// ============================================

export const successResponse = (

    res,

    {

        statusCode = 200,

        message = 'Success',

        data = null,

        pagination = null

    }

) => {

    return res.status(statusCode).json({

        success: true,

        message,

        data,

        pagination

    })

}

// ============================================
// ERROR RESPONSE
// ============================================

export const errorResponse = (

    res,

    {

        statusCode = 500,

        message = 'Something went wrong',

        error = null

    }

) => {

    return res.status(statusCode).json({

        success: false,

        message,

        error

    })

}