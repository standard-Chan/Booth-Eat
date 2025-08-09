# REST API 명세서

## 0. 공통 규칙

- **Base URL**: `/api`
- **응답 포맷**: `application/json`

- **에러 응답**: => 일단 보류

- **상태 코드 가이드**:

  - `200 OK`: 조회/갱신 성공
  - `201 Created`: 생성 성공
  - `204 No Content`: 삭제 성공
  - `400 Bad Request`: 잘못된 요청
  - `401 Unauthorized`: 인증 실패
  - `403 Forbidden`: 권한 없음
  - `404 Not Found`: 리소스 없음
  - `409 Conflict`: 중복/충돌
  - `422 Unprocessable Entity`: 검증 실패

---

## 1. 부스 메뉴 목록 조회

**GET** `/api/v1/booths/{boothId}/menuItems`

**Response**

```json
{
  [
    {
      "id": 1,
      "name": "치즈버거",
      "description": "고소한 치즈와 두툼한 패티",
      "price": 5000,
      "imageUrl": "https://example.com/images/1.jpg",
      "isAvailable": true
    },
    {
      "id": 2,
      "name": "오징어 튀김",
      "description": "오징어",
      "price": 7000,
      "imageUrl": "https://example.com/images/1.jpg",
      "isAvailable": true
    },
    ...
  ]
}
```

---

## 2. 단일 메뉴 조회

**GET** `/api/v1/booths/{boothId}/menuItems/{menuItemId}`

**Response**

```json
{
  "id": 1,
  "name": "치즈버거",
  "description": "고소한 치즈와 두툼한 패티",
  "price": 5000,
  "imageUrl": "https://example.com/images/1.jpg",
  "isAvailable": true
}
```

---

## 3. 부스 계좌 정보 조회

**GET** `/api/v1/booths/{boothId}/account`

**Response**

```json
{
  "bank": "카카오뱅크",
  "account": "123-****-****",
  "accountHolder": "정석찬"
}
```

---

## 4. 주문 생성

**POST** `/api/v1/orders`
**Headers**:

**Request Body**

```json
{
  "boothId": 1,
  "tableNo": 7,
  "items": [
    { "foodId": 11, "quantity": 2 },
    { "foodId": 12, "quantity": 1 }
  ],
  "payment": {
    "payerName": "정석찬",
    "amount" : 43000
  }
}
```

**Response** (`201 Created`)

```json
{
  "orderId": 123,
  "status": "CREATED",
  "amount": 43000,
  "createdAt": "2025-08-09T11:30:00Z"
}
```

---

## 5. 주문 조회

**GET** `/api/v1/orders/{orderId}`

**Response**

```json
{
  "orderId": 123,
  "status": "PAYMENT_PENDING",
  "amount": 43000,
  "createdAt": "2025-08-09T11:30:00Z"
}
```

---

## 6. 실시간 주문 상태 업데이트 (SSE) => 일단 보류

=> 일단 보류

**GET** `/api/v1/orders/stream`
**Query**: `boothId=1`
**응답**: `text/event-stream`

**이벤트 예시**

```
event: order.updated
data: {
  "eventId": "evt_001",
  "occurredAt": "2025-08-09T11:35:00Z",
  "orderId": 123,
  "boothId": 1,
  "status": "PAID",
  "version": 2
}
```
