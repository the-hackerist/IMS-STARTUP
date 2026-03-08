# Inventory API

A simple REST API for managing products and inventory.

---

# Base URL

```
/api/v1/inventory
```

Example:

```
http://localhost:8080/api/v1/inventory
```

---

# Table of Contents

* [Authentication](#authentication)
* [Response Format](#response-format)
* [Products](#products)
  * [Retrieve All Products](#retrieve-all-products)

  * [Retrieve Product](#retrieve-product)

  * [Create Product](#create-product)

  * [Update Product](#update-product)

  * [Delete Product](#delete-product)

* [Product Model](#product-model)
* [Error Codes](#error-codes)

---

# Response Format

### Successful Response

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": ""
}
```

---

# Products

## 1️⃣ Retrieve All Products

Returns a paginated list of products.

### Endpoint

```
GET /products
```

### Query Parameters

| Parameter     | Type   | Accepted Value/s                           |Required|
| ------------- | ------ | ------------------------------------- |------ |
| page          | number | A minimum of `1`; `1 (default)`             |no |
| limit         | number | Select between `1-100`; `10 (default)`| no|
| sortBy        | string | `name`, `stock_quantity`, `price`, `created_at (default)`                |no |
| sortDirection | string | `ASC` or `DESC (default)`                    |no| 
| filterField   | string | `store_id`, `name`, `created_at`, `stock_quantity`, `price`     |no |
| filter        | string | If filter field is set to price then filter =  `50`                   | no|

### Example Request

```
GET /product?filterField=name&filter=go
```

### Example Response

```json
{
    "success": true,
    "message": "success! retrieved all products",
    "data": {
        "products": [
            {
                "product_id": 10,
                "store_id": 1,
                "name": "Goto Sweat 44L",
                "price": "153.00",
                "barcode": null,
                "stock_quantity": 20,
                "created_at": "2026-03-08T03:46:28.000Z",
                "udpated_at": "2026-03-08T03:46:28.000Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "totalPages": 1
        }
    }
}
```

---

## 2️⃣ Retrieve One Product

Returns a single product.

### Endpoint

```
GET /product/:search
```

### Query Parameters

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| field         | string | no       |`product_id (default)`, `name`, or `barcode`|

### Params Parameters

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| field         | string | yes       |`search string based on field`             |

### Example Request

```
GET /product/7
```

### Example Response

```json
{
    "success": true,
    "message": "success! retrieved one product",
    "data": [
        {
            "product_id": 7,
            "store_id": 1,
            "name": "Pocari Sweat 1L",
            "price": "53.00",
            "barcode": "323456789012",
            "stock_quantity": 20,
            "created_at": "2026-03-04T21:06:24.000Z",
            "udpated_at": "2026-03-04T21:06:24.000Z"
        }
    ]
}
```

---

## 3️⃣ Create Product

Creates a new product.

### Endpoint

```
POST /add-product
```

### Body Parameters

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| name          | string | yes       |`any string between 3 and 150 characters`  |
| barcode       | string | no        |`any string between 8 and 100 characters` or `null`|
| stockQuantity | number | yes       |`minimum of 1`|
| price         | number | yes       |`any number, but decimal is limited to 2`|

### Request Body

```json
{
    "name": "RTX 9090",
    "barcode": "523456789012",
    "stockQuantity": 2000,
    "price": 15300.22
}
```

### Example Response

```json
{
    "success": true,
    "message": "success! added a product",
    "data": [
        {
            "product_id": 15,
            "store_id": 1,
            "name": "RTX 9090",
            "price": "15300.22",
            "barcode": "523456789012",
            "stock_quantity": 2000,
            "created_at": "2026-03-08T05:44:06.000Z",
            "udpated_at": "2026-03-08T05:44:06.000Z"
        }
    ]
}
```

---

## 4️⃣ Update Product

Updates one or more fields of a product.

### Endpoint

```
PATCH /products/:productId
```

### Params Parameters

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| productId     | string | yes       |`any valid productId`  |

### Body Parameters
⚠️ At least one field should have a value. 

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| name          | string | no       |`any string between 3 and 150 characters`  |
| barcode       | string | no       |`any string between 8 and 100 characters` or `null`|
| stockQuantity | number | no       |`minimum of 1`|
| price         | number | no       |`any number, but decimal is limited to 2`|


### Request Body

All fields are optional.

```json
{
    "name":"Sleep 12",
}
```

### Example Response

```json
{
    "success": true,
    "message": "success! updated a product",
    "data": {
        "name": "Sleep 12"
    }
}
```

---

## 5️⃣ Delete Product

Deletes a product.

### Endpoint

```
DELETE /products/:productId
```

### Params Parameters

| Parameter     | Type   | Required | Accepted Value/s                           |
| ------------- | ------ | ---------| ------------------------------------------ |
| productId     | string | yes       |`any valid productId`  |


### Example Request

```
DELETE /products/12
```

### Example Response

```json
204 - No Content
```

---

# Error Codes

| Status Code | Description                    |
| ----------- | ------------------------------ |
| 400         | Bad request / validation error |
| 404         | Resource not found             |
| 409         | Conflict (duplicate resource)  |
| 500         | Internal server error          |

---

# Running the Project

1️⃣ Install dependencies:

```
npm install
```

2️⃣ Setup .env file (https://tinyurl.com/mskt43eb), use local MySQL server for consistent connection 

3️⃣ Start development server:

```
npm run start:dev
```

4️⃣ Run postman (https://shorturl.at/UyMh4)

---
