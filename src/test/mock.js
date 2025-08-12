export const MOCK_FOOD = {
  foods: [
    {
      id: 1,
      category: 'FOOD',
      badge: 'Best!',
      name: '오징어 튀김',
      description:
        '부드러운 오징어 튀김\n얇고 바삭한 튀김옷을 입은\n부드러운 오징어링!\n*잘 어울리는 소스와 함께 제공됩니다 :)',
      price: 6900,
      previewImage:
        'https://placehold.co/600x400',
      available: true,
    },
    {
      id: 2,
      category: 'FOOD',
      name: '떡볶이',
      description: '달콤하고 적당히 매콤한\n국민 분식 떡볶이!',
      price: 6900,
      previewImage:
        'https://placehold.co/600x400',
      available: false,
    },
    {
      id: 3,
      category: 'FOOD',
      name: '김치볶음밥',
      description:
        '스팸과 김치가 듬뿍 들어간 김치볶음밥\n*볶음밥 위에 계란후라이가 올라갑니다.',
      price: 7900,
      previewImage:
        'https://placehold.co/600x400',
      available: true,
    },
    {
      id: 4,
      category: 'FOOD',
      name: '오뎅탕',
      description: '뜨끈한 국물이 일품인 오뎅탕\n*부산어묵 5개',
      price: 10900,
      previewImage:
        'https://placehold.co/600x400',
      available: true,
    },
    {
      id: 5,
      category: 'DRINK',
      name: '사이다',
      price: 2900,
      previewImage:
        'https://placehold.co/600x400',
      available: true,
    },
    {
      id: 6,
      category: 'DRINK',
      name: '콜라',
      price: 2900,
      previewImage:
        'https://placehold.co/600x400',
      available: true,
    },
  ],
};

export const MOCK_ACCOUNT = {
  bank: '카카오뱅크',
  account: '123-****-****',
  accountHolder: '정석찬',
};


export const MOCK_ORDERS = [
  {
    orderId: 75941,
    boothName : "벤처주점오세요",
    status: 'PENDING',        // PENDING | APPROVED | REJECTED
    tableNo: 7,
    items: [
      { foodId: 11, name: '오징어튀김', price: 7000, imageUrl: 'https://placehold.co/600x400', quantity: 2 },
      { foodId: 12, name: '떡볶이', price: 6900, imageUrl: 'https://placehold.co/600x400', quantity: 1 },
      { foodId: 13, name: '김치볶음밥', price: 7900, imageUrl: 'https://placehold.co/600x400', quantity: 1 },
      { foodId: 14, name: '콜라', price: 2900, imageUrl: 'https://placehold.co/600x400', quantity: 1 },
    ],
    amount: 17700,
    createdAt: '2025-08-13T17:45:00Z',
  },
  {
    orderId: 75942,
    status: 'REJECTED',
    tableNo: 7,
    items: [{}, {}, {}],
    amount: 21800,
    createdAt: '2025-08-13T17:25:00Z',
  },
  {
    orderId: 75943,
    status: 'APPROVED',
    tableNo: 7,
    items: [{}, {}, {}, {}],
    amount: 21800,
    createdAt: '2025-08-13T17:15:00Z',
  },
];