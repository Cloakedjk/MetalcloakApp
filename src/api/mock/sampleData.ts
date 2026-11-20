import type { Customer, Order, RewardsSnapshot } from '../../domain';

/**
 * SAMPLE DATA.
 * Alex Rivera is a fictional customer. Order numbers, the address, phone,
 * payment label, and tracking numbers are made up. A few prices are public
 * "as low as" catalog figures; the rest are illustrative. Product links are
 * public metalcloak.com pages so "Leave a review" opens a real review section.
 * Nothing here was loaded from the store API.
 */
export const sampleAccount = {
  email: 'alex.rivera@example.com',
  password: 'trailrated',
};

export const SAMPLE_TOKEN = 'mock:10482';

export const sampleCustomer: Customer = {
  id: '10482',
  email: sampleAccount.email,
  firstName: 'Alex',
  lastName: 'Rivera',
  createdAt: '2019-04-12',
};

const address = {
  name: 'Alex Rivera',
  street: ['1842 Canyon Ridge Rd'],
  city: 'Moab',
  region: 'UT',
  postcode: '84532',
  country: 'US',
  telephone: '(435) 555-0148',
};

export const sampleOrders: Order[] = [
  {
    id: '5001',
    number: '100048812',
    placedOn: '2026-11-12',
    status: 'processing',
    statusLabel: 'Processing',
    paymentMethod: 'Visa •••• 1881',
    shippingAddress: address,
    shipments: [],
    totals: {
      subtotal: 6224,
      shipping: 189,
      tax: 391.19,
      discount: 0,
      grandTotal: 6804.19,
      currency: 'USD',
    },
    items: [
      {
        sku: 'A2235',
        name: 'Jeep JL Wrangler 3.5" Game-Changer Suspension & Lift Kit',
        quantity: 1,
        unitPrice: 5495,
        rowTotal: 5495,
        currency: 'USD',
        urlKey: 'jl-wrangler-3-5-game-changer-suspension-system',
        productUrl: 'https://metalcloak.com/jl-wrangler-3-5-game-changer-suspension-system.html',
      },
      {
        sku: 'JL-LCA',
        name: 'Duroflex Control Arms, JL Wrangler, Lower Front',
        quantity: 1,
        unitPrice: 729,
        rowTotal: 729,
        currency: 'USD',
        urlKey: 'control-arms-jl-wrangler-lower-front',
        productUrl: 'https://metalcloak.com/control-arms-jl-wrangler-lower-front.html',
      },
    ],
  },
  {
    id: '5002',
    number: '100047331',
    placedOn: '2026-10-03',
    status: 'complete',
    statusLabel: 'Complete',
    paymentMethod: 'Visa •••• 1881',
    shippingAddress: address,
    shipments: [
      {
        id: 'shp-5002',
        carrier: 'UPS',
        trackingNumber: '1Z000SAMPLETRACK1',
        trackingUrl: 'https://www.ups.com/track?tracknum=1Z000SAMPLETRACK1',
        shippedAt: '2026-10-04',
        deliveredAt: null,
      },
    ],
    totals: {
      subtotal: 1988,
      shipping: 49,
      tax: 124.26,
      discount: 0,
      grandTotal: 2161.26,
      currency: 'USD',
    },
    items: [
      {
        sku: 'JL-OTF-F',
        name: 'Overland Tube Fenders, JL Wrangler | JT Gladiator, Front, Pair',
        quantity: 1,
        unitPrice: 949,
        rowTotal: 949,
        currency: 'USD',
        urlKey: 'overland-tube-fenders-jl-wrangler-front',
        productUrl: 'https://metalcloak.com/overland-tube-fenders-jl-wrangler-front.html',
      },
      {
        sku: '6400-AL',
        name: 'Aluminum Overland Tube Fenders, JL Wrangler, Rear, Pair',
        quantity: 1,
        unitPrice: 1039,
        rowTotal: 1039,
        currency: 'USD',
        urlKey: 'jl-wrangler-overland-aluminum-rear-fenders',
        productUrl: 'https://metalcloak.com/jl-wrangler-overland-aluminum-rear-fenders.html',
      },
    ],
  },
  {
    id: '5003',
    number: '100045102',
    placedOn: '2026-06-21',
    status: 'complete',
    statusLabel: 'Complete',
    paymentMethod: 'Visa •••• 1881',
    shippingAddress: address,
    shipments: [
      {
        id: 'shp-5003',
        carrier: 'FedEx',
        trackingNumber: '748920013847221',
        trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=748920013847221',
        shippedAt: '2026-06-22',
        deliveredAt: '2026-06-26',
      },
    ],
    totals: {
      subtotal: 2448,
      shipping: 129,
      tax: 156.89,
      discount: 5,
      grandTotal: 2728.89,
      currency: 'USD',
    },
    items: [
      {
        sku: '6360',
        name: 'UnderCloak Integrated Armor System, 4-Door, JL Wrangler',
        quantity: 1,
        unitPrice: 1599,
        rowTotal: 1599,
        currency: 'USD',
        urlKey: '4-door-jl-wrangler-undercloak-integrated-armor-systems',
        productUrl: 'https://metalcloak.com/4-door-jl-wrangler-undercloak-integrated-armor-systems.html',
      },
      {
        sku: 'JL-ORR-4D',
        name: 'Overline Rocker Rail, Pair, JL 4-Door',
        quantity: 1,
        unitPrice: 849,
        rowTotal: 849,
        currency: 'USD',
        urlKey: 'overline-rocker-rail-pair-jl-4-door-options',
        productUrl: 'https://metalcloak.com/overline-rocker-rail-pair-jl-4-door-options.html',
      },
    ],
  },
  {
    id: '5004',
    number: '100041220',
    placedOn: '2026-01-09',
    status: 'complete',
    statusLabel: 'Complete',
    paymentMethod: 'Visa •••• 1881',
    shippingAddress: address,
    shipments: [
      {
        id: 'shp-5004',
        carrier: 'UPS',
        trackingNumber: '1Z000SAMPLETRACK2',
        trackingUrl: 'https://www.ups.com/track?tracknum=1Z000SAMPLETRACK2',
        shippedAt: '2026-01-10',
        deliveredAt: '2026-01-15',
      },
    ],
    totals: {
      subtotal: 2918,
      shipping: 49,
      tax: 180.99,
      discount: 0,
      grandTotal: 3147.99,
      currency: 'USD',
    },
    items: [
      {
        sku: '7429F',
        name: 'JL/JT Jeep Front 6Pak BLACK Shocks, Pair',
        quantity: 1,
        unitPrice: 1469,
        rowTotal: 1469,
        currency: 'USD',
        urlKey: '7429f-jt-gladiator-front-6pak-black-shocks',
        productUrl: 'https://metalcloak.com/7429f-jt-gladiator-front-6pak-black-shocks.html',
      },
      {
        sku: '7433R',
        name: 'JL Wrangler Rear 6Pak BLACK Shocks, Pair',
        quantity: 1,
        unitPrice: 1449,
        rowTotal: 1449,
        currency: 'USD',
        urlKey: '7428r-jl-wrangler-rear-6pak-black-shocks',
        productUrl: 'https://metalcloak.com/7428r-jl-wrangler-rear-6pak-black-shocks.html',
      },
    ],
  },
];

export const sampleRewards: RewardsSnapshot = {
  provider: 'sample',
  balance: {
    points: 1840,
    currencyValue: 18.4,
    currency: 'USD',
    conversionNote: 'Sample rate: 100 points = $1.00. A live store uses its Amasty conversion setting.',
  },
  history: [
    {
      id: 'rw-8',
      date: '2026-11-12',
      points: 248,
      label: 'Earned on order #100048812',
      comment: null,
      action: 'earn',
      orderNumber: '100048812',
    },
    {
      id: 'rw-7',
      date: '2026-10-04',
      points: 96,
      label: 'Earned on order #100047331',
      comment: null,
      action: 'earn',
      orderNumber: '100047331',
    },
    {
      id: 'rw-6',
      date: '2026-06-21',
      points: -500,
      label: 'Spent on order #100045102',
      comment: '500 points applied at checkout',
      action: 'spend',
      orderNumber: '100045102',
    },
    {
      id: 'rw-5',
      date: '2026-06-21',
      points: 165,
      label: 'Earned on order #100045102',
      comment: null,
      action: 'earn',
      orderNumber: '100045102',
    },
    {
      id: 'rw-4',
      date: '2026-01-09',
      points: 118,
      label: 'Earned on order #100041220',
      comment: null,
      action: 'earn',
      orderNumber: '100041220',
    },
    {
      id: 'rw-3',
      date: '2025-11-01',
      points: -40,
      label: 'Points expired',
      comment: 'Unused points passed their expiration date',
      action: 'expire',
      orderNumber: null,
    },
    {
      id: 'rw-2',
      date: '2025-04-12',
      points: 50,
      label: 'Anniversary bonus',
      comment: null,
      action: 'earn',
      orderNumber: null,
    },
    {
      id: 'rw-1',
      date: '2019-04-12',
      points: 1703,
      label: 'Opening balance',
      comment: 'Sample history imported with the account',
      action: 'adjust',
      orderNumber: null,
    },
  ],
};
