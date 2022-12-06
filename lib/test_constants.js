const ascReturnResult = {
    "rows": [
        {
            "name": "test001",
            "email": "test001@vanderbilt.edu",
            "visions": 1,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test002",
            "email": "test002@vanderbilt.edu",
            "visions": 2,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test003",
            "email": "test003@vanderbilt.edu",
            "visions": 3,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test005",
            "email": "test005@vanderbilt.edu",
            "visions": 5,
            "type": "vuceptor",
            "status": "unregistered"
        }
    ],
    "pages": 1
  };

const descReturnResult = {
    "rows": [
        {
            "name": "test005",
            "email": "test005@vanderbilt.edu",
            "visions": 5,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test003",
            "email": "test003@vanderbilt.edu",
            "visions": 3,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test002",
            "email": "test002@vanderbilt.edu",
            "visions": 2,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test001",
            "email": "test001@vanderbilt.edu",
            "visions": 1,
            "type": "vuceptor",
            "status": "unregistered"
        }
    ],
    "pages": 1
  };

const emptyReturnResult = {"rows": [], "pages": 0};

const origReturnResult = {
    "rows": [
        {
            "name": "test001",
            "email": "test001@vanderbilt.edu",
            "visions": 1,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test002",
            "email": "test002@vanderbilt.edu",
            "visions": 2,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test003",
            "email": "test003@vanderbilt.edu",
            "visions": 3,
            "type": "vuceptor",
            "status": "unregistered"
        },
        {
            "name": "test005",
            "email": "test005@vanderbilt.edu",
            "visions": 5,
            "type": "vuceptor",
            "status": "unregistered"
        }
    ],
    "pages": 1
};

const fyOrigReturnResult = {
    "rows": [
        {
            "fy_name": "test001",
            "fy_email": "test001@vanderbilt.edu",
            "visions": 1,
            "vuceptor_name": null
        },
        {
            "fy_name": "test002",
            "fy_email": "test002@vanderbilt.edu",
            "visions": 2,
            "vuceptor_name": null
        },
        {
            "fy_name": "test005",
            "fy_email": "test005@vanderbilt.edu",
            "visions": 5,
            "vuceptor_name": null
        }
    ],
    "pages": 1
};

const ascfyReturnResult = {
        "rows": [
            {
                "fy_name": "test001",
                "fy_email": "test001@vanderbilt.edu",
                "visions": 1,
                "vuceptor_name": null
            },
            {
                "fy_name": "test002",
                "fy_email": "test002@vanderbilt.edu",
                "visions": 2,
                "vuceptor_name": null
            },
            {
                "fy_name": "test005",
                "fy_email": "test005@vanderbilt.edu",
                "visions": 5,
                "vuceptor_name": null
            }
        ],
        "pages": 1
};

module.exports = {
    ascReturnResult,
    descReturnResult,
    emptyReturnResult,
    origReturnResult,
    fyOrigReturnResult,
    ascfyReturnResult
}