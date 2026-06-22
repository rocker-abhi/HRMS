ERRORS = {

    # Missing Token
    "JWT_TOKEN_001": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_001",
        "message": "Authorization token is required.",
    },

    # Expired Token
    "JWT_TOKEN_002": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_002",
        "message": "Token has expired.",
    },

    # Invalid Token
    "JWT_TOKEN_003": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_003",
        "message": "Invalid token.",
    },

    # Invalid Signature
    "JWT_TOKEN_004": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_004",
        "message": "Token signature is invalid.",
    },

    # Invalid Token Type
    "JWT_TOKEN_005": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_005",
        "message": "Invalid token type.",
    },

    # Refresh Token Expired
    "JWT_TOKEN_006": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_006",
        "message": "Refresh token has expired.",
    },

    # Refresh Token Invalid
    "JWT_TOKEN_007": {
        "status_code": 401,
        "error_code": "JWT_TOKEN_007",
        "message": "Invalid refresh token.",
    },

    # Missing Request Parameter
    "JWT_TOKEN_008": {
        "status_code": 500,
        "error_code": "JWT_TOKEN_008",
        "message": "Function must receive a 'request: Request' parameter to use the decorator.",
    },

    # Permission Denied
    "JWT_TOKEN_009": {
        "status_code": 403,
        "error_code": "JWT_TOKEN_009",
        "message": "Access denied. Missing required permissions.",
    }
}