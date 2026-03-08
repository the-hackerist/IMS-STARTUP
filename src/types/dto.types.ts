export type ParamsProducts = {
  productId: string;
};

export type ParamsRetrieveProducts = {
  search: string;
};

export type QueryRetrieveProducts = {
  page: string;
  limit: string;
  filterField: 'store_id' | 'name' | 'created_at' | 'stock_quantity' | 'price';
  filter: string;
  sortBy: 'name' | 'created_at' | 'stock_quantity' | 'price';
  sortDirection: 'ASC' | 'DESC';
};

export type QueryProducts = {
  field: 'product_id' | 'name' | 'barcode';
};
