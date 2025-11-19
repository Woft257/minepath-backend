# Database Schema

This document outlines the database schema for the Minepath application. The diagram below illustrates the main entities and their relationships.

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    Player {
        string uuid PK
        string username
        string password
        string solanaAddress
        string refCode
        string role
        string referredBy FK
        string managedBy FK
    }

    TransactionLog {
        int id PK
        string playerUuid FK
        string transactionType
        decimal solAmount
        datetime createdAt
    }

    RefLog {
        int id PK
        string referrerUuid FK
        string referredUuid FK
        datetime createdAt
    }

    CommissionLog {
        int id PK
        string playerUuid FK
        string currency
        decimal amount
        datetime createdAt
    }

    Player ||--o{ TransactionLog : "has"
    Player ||--o{ RefLog : "is referrer in"
    Player ||--o{ RefLog : "is referred in"
    Player ||--o{ CommissionLog : "earns"
    Player }o--|| Player : "is managed by"
```

## Entity Descriptions

- **Player**: The central entity representing a user. It stores login credentials, wallet information, referral details, and role (`Admin`, `KOL`, `User`, `BD`).
- **TransactionLog**: Records all transactions in the system, such as deposits or other SOL-related activities. Used to calculate total volume spent by users.
- **RefLog**: Logs every successful referral event, linking a `referrer` to a `referred` user.
- **CommissionLog**: Records every commission (in MINE or SOL) earned by a KOL.

