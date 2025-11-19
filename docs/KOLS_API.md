# KOLs Management API Documentation

## Overview
This document describes the APIs for managing KOLs (Key Opinion Leaders) in the Minepath Dashboard.

## Base URL
All endpoints are prefixed with `/admin/kols`

---

## Endpoints

### 1. Get KOL Statistics
**GET** `/admin/kols/stats`

Returns the top KOL by volume and top KOL by referrals.

**Response:**
```json
{
  "topByVolume": {
    "username": "StreamerX",
    "uuid": "abc-123",
    "volume": 15.2
  },
  "topByReferrals": {
    "username": "StreamerX",
    "uuid": "abc-123",
    "referrals": 1204
  }
}
```

---

### 2. Get All KOLs
**GET** `/admin/kols`

Returns a list of all KOLs with optional search and filtering.

**Query Parameters:**
- `search` (optional): Search by username, wallet address, or ref code
- `status` (optional): Filter by status (ACTIVE, BANNED, etc.)

**Response:**
```json
[
  {
    "uuid": "abc-123",
    "username": "StreamerX",
    "wallet": "9k...j7s",
    "refCode": "ABC123",
    "managedBy": "Zuy",
    "totalReferrals": 1204,
    "totalVolume": 15.2,
    "status": "ACTIVE"
  }
]
```

---

### 3. Get BD Managers
**GET** `/admin/kols/bd-managers`

Returns a list of all Business Development managers.

**Response:**
```json
[
  {
    "uuid": "bd-uuid-1",
    "username": "Zuy"
  },
  {
    "uuid": "bd-uuid-2",
    "username": "Tuan"
  }
]
```

---

### 4. Add New KOL
**POST** `/admin/kols`

Assigns the KOL role to an existing user.

**Request Body:**
```json
{
  "usernameOrRefCode": "StreamerX",
  "managedByUuid": "bd-uuid-1"
}
```

**Response:**
```json
{
  "message": "KOL added successfully",
  "kol": {
    "uuid": "abc-123",
    "username": "StreamerX",
    "refCode": "ABC123"
  }
}
```

---

### 5. Get KOL Details
**GET** `/admin/kols/:uuid`

Returns detailed information about a specific KOL, including performance metrics, top users, and commission history.

**Response:**
```json
{
  "kol": {
    "uuid": "abc-123",
    "username": "StreamerX",
    "wallet": "9k...j7s",
    "refCode": "ABC123",
    "managedBy": "Zuy",
    "managedByUuid": "bd-uuid-1",
    "solCommissionRate": 10.0,
    "mineCommissionRate": 2.0
  },
  "performance": {
    "totalReferrals": 1204,
    "f1Referrals": 350,
    "totalVolume": 15.2,
    "unpaidCommission": 1.52,
    "referralGrowth": [
      { "month": "2025-07-01", "count": 250 },
      { "month": "2025-08-01", "count": 350 }
    ]
  },
  "topUsers": [
    {
      "username": "MineHero",
      "wallet": "9p...k2r",
      "totalSpent": 0.8
    }
  ],
  "commissionHistory": [
    {
      "date": "2025-11-10",
      "solAmount": 1.52,
      "mineAmount": 24089,
      "status": "PAID",
      "txnHash": "5f...e8y"
    }
  ]
}
```

---

### 6. Update KOL Configuration
**PUT** `/admin/kols/:uuid`

Updates a KOL's BD Manager assignment and commission rates.

**Request Body:**
```json
{
  "managedByUuid": "bd-uuid-2",
  "solCommissionRate": 12.0,
  "mineCommissionRate": 3.0
}
```

**Response:**
```json
{
  "message": "KOL updated successfully",
  "kol": {
    "uuid": "abc-123",
    "username": "StreamerX",
    "solCommissionRate": 12.0,
    "mineCommissionRate": 3.0
  }
}
```

---

### 7. Remove KOL
**DELETE** `/admin/kols/:uuid`

Removes the KOL role from a user (changes role back to USER).

**Response:**
```json
{
  "message": "KOL removed successfully"
}
```

---

## Database Setup

### Run Migration
To create the necessary database tables and columns, run the seed file:

```bash
psql -h <host> -U <username> -d <database> -f src/database/seeds/kol-seed.sql
```

Or manually execute the migration in your database client.

---

## Notes

1. **KOL Role**: Users with `role = 'KOL'` are considered KOLs
2. **BD Manager Role**: Users with `role = 'BD'` can be assigned as BD Managers
3. **Commission Rates**: Stored as percentages (e.g., 10.0 = 10%)
4. **Commission Logs**: Track all commission payouts to KOLs

