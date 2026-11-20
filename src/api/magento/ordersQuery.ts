/** Customer-token orders query for Magento 2.4.4 and newer. */
export const CUSTOMER_ORDERS_QUERY = `
  query MetalCloakOrders {
    customer {
      orders(pageSize: 50, currentPage: 1) {
        items {
          id
          number
          order_date
          status
          items {
            product_sku
            product_name
            product_url_key
            quantity_ordered
            product_sale_price { value currency }
          }
          total {
            grand_total { value currency }
            subtotal { value currency }
            total_shipping { value currency }
            total_tax { value currency }
            discounts { label amount { value currency } }
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            country_code
            telephone
          }
          payment_methods { name type }
          shipments {
            id
            number
            tracking { title carrier number }
          }
        }
      }
    }
  }
`;

export function restOrderSearch(customerId: string): string {
  const query = new URLSearchParams({
    'searchCriteria[filterGroups][0][filters][0][field]': 'customer_id',
    'searchCriteria[filterGroups][0][filters][0][value]': customerId,
    'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq',
    'searchCriteria[sortOrders][0][field]': 'created_at',
    'searchCriteria[sortOrders][0][direction]': 'DESC',
    'searchCriteria[pageSize]': '50',
  });
  return `/rest/V1/orders?${query.toString()}`;
}
