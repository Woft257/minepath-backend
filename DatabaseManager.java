package com.minepath.login.db;

import com.minepath.login.MinepathLogin;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.bukkit.configuration.file.FileConfiguration;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import java.util.UUID;
import java.util.Map;
public class DatabaseManager {

    private final MinepathLogin plugin;
    private HikariDataSource dataSource;

    public DatabaseManager(MinepathLogin plugin) {
        this.plugin = plugin;
    }

    public void connect() {
        FileConfiguration config = plugin.getConfig();
        HikariConfig hikariConfig = new HikariConfig();

        String host = config.getString("database.host", "localhost");
        int port = config.getInt("database.port", 5432);
        String database = config.getString("database.database", "minepath");
        String user = config.getString("database.user", "user");
        String password = config.getString("database.password", "password");

        hikariConfig.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + "/" + database);
        hikariConfig.setUsername(user);
        hikariConfig.setPassword(password);
        hikariConfig.setDriverClassName("org.postgresql.Driver");

        // Production-ready settings
        hikariConfig.setMaximumPoolSize(10); // Max 10 connections
        hikariConfig.setMinimumIdle(5); // Keep at least 5 idle connections
        hikariConfig.setConnectionTimeout(30000); // 30 seconds to get a connection
        hikariConfig.setIdleTimeout(600000); // 10 minutes for an idle connection to be retired
        hikariConfig.setMaxLifetime(1800000); // 30 minutes max lifetime for a connection

        try {
            this.dataSource = new HikariDataSource(hikariConfig);
            plugin.getLogger().info("Successfully connected to the database using HikariCP!");
        } catch (Exception e) {
            plugin.getLogger().severe("Could not create database connection pool: " + e.getMessage());
            throw new RuntimeException("Database connection failed.", e);
        }
    }

    public void disconnect() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            plugin.getLogger().info("Database connection pool has been closed.");
        }
    }

    public void createTable() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS players (" +
                "uuid VARCHAR(36) PRIMARY KEY," +
                "password VARCHAR(255) NOT NULL" +
                ");";

        String addWalletIdSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS fystack_wallet_id VARCHAR(255);";
        String addSolanaAddressSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS solana_address VARCHAR(255);";
        String addMineBalanceSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS mine_balance BIGINT NOT NULL DEFAULT 0;";
        String addSolBalanceSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS sol_balance NUMERIC(38, 18) NOT NULL DEFAULT 0.0;";
        String alterSolBalanceTypeSql = "ALTER TABLE players ALTER COLUMN sol_balance TYPE NUMERIC(38, 18) USING sol_balance::NUMERIC(38, 18);"; // For existing installations
        String addLastLoginSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;";
        String addUsernameSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS username VARCHAR(16);";

        // Referral system columns
        String addRefCodeSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS ref_code VARCHAR(6);";
        String addReferredBySql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS referred_by VARCHAR(36);"; // UUID of referrer
        String addTotalRefRewardSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_ref_reward BIGINT NOT NULL DEFAULT 0;";
        String addTotalReferredSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_referred INTEGER NOT NULL DEFAULT 0;"; // F1 only
        String addAllReferredSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS all_referred INTEGER NOT NULL DEFAULT 0;"; // F1 + F2 + F3 + ... (all levels)

        // Role and Commission Rate Columns
        String addRoleSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'USER';";
        String addCommissionRateSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS commission_rate DOUBLE PRECISION NOT NULL DEFAULT 0.3;";
        String addSolFeeShareSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS sol_fee_share DOUBLE PRECISION NOT NULL DEFAULT 0.0;";
        String addTotalSolShareSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_sol_share NUMERIC(38, 18) NOT NULL DEFAULT 0.0;";
        String addTotalPayoutSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_payout NUMERIC(38, 18) NOT NULL DEFAULT 0.0;";
        String addManagedByUUIDColumnSql = "ALTER TABLE players ADD COLUMN IF NOT EXISTS managed_by_uuid VARCHAR(36) NULL;";
        String addManagedByUUIDConstraintSql = "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_managed_by') THEN ALTER TABLE players ADD CONSTRAINT fk_managed_by FOREIGN KEY (managed_by_uuid) REFERENCES players(uuid) ON DELETE SET NULL; END IF; END $$;";

        // Add source_player_uuid to transaction_logs if it doesn't exist (for existing databases)
        String addSourcePlayerUUIDColumnSql = "ALTER TABLE transaction_logs ADD COLUMN IF NOT EXISTS source_player_uuid VARCHAR(36) NULL;";
        String addSourcePlayerUUIDConstraintSql = "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_source_player') THEN ALTER TABLE transaction_logs ADD CONSTRAINT fk_source_player FOREIGN KEY (source_player_uuid) REFERENCES players(uuid) ON DELETE SET NULL; END IF; END $$;";

        // Create ref_logs table - Lưu lịch sử referral
        String createRefLogsTable = "CREATE TABLE IF NOT EXISTS ref_logs (" +
                "id SERIAL PRIMARY KEY," +
                "referrer_uuid VARCHAR(36) NOT NULL," +
                "referred_uuid VARCHAR(36) NOT NULL," +
                "ref_code VARCHAR(6) NOT NULL," +
                "created_at TIMESTAMPTZ NOT NULL DEFAULT (now() at time zone 'utc')," +
                "FOREIGN KEY (referrer_uuid) REFERENCES players(uuid) ON DELETE CASCADE," +
                "FOREIGN KEY (referred_uuid) REFERENCES players(uuid) ON DELETE CASCADE" +
                ");";

        // Create transaction_logs table - Lưu lịch sử giao dịch SOL
        String createTransactionLogsTable = "CREATE TABLE IF NOT EXISTS transaction_logs (" +
                "id SERIAL PRIMARY KEY," +
                "player_uuid VARCHAR(36) NOT NULL," +
                "transaction_type VARCHAR(50) NOT NULL," +
                "method VARCHAR(50) NOT NULL," +
                "amount BIGINT NOT NULL," +
                "sol_amount DECIMAL(20, 9)," +
                "transaction_hash VARCHAR(255)," +
                "status VARCHAR(20) NOT NULL DEFAULT 'PENDING'," +
                "source_player_uuid VARCHAR(36)," + // Who generated this transaction (for commissions)
                "created_at TIMESTAMPTZ NOT NULL DEFAULT (now() at time zone 'utc')," +
                "FOREIGN KEY (player_uuid) REFERENCES players(uuid) ON DELETE CASCADE," +
                "FOREIGN KEY (source_player_uuid) REFERENCES players(uuid) ON DELETE SET NULL" + // Set null if source player is deleted
                ");";

        // Create mine_to_earn table for player upgrades
        String createMineToEarnTable = "CREATE TABLE IF NOT EXISTS mine_to_earn (" +
                "player_uuid VARCHAR(36) PRIMARY KEY," +
                "upgrade_speed INTEGER NOT NULL DEFAULT 0," +
                "upgrade_inventory INTEGER NOT NULL DEFAULT 0," +
                "upgrade_reset_cooldown INTEGER NOT NULL DEFAULT 0," +
                "upgrade_passive_income INTEGER NOT NULL DEFAULT 0," +
                "upgrade_mining_area INTEGER NOT NULL DEFAULT 0," +
                "FOREIGN KEY (player_uuid) REFERENCES players(uuid) ON DELETE CASCADE" +
                ");";

        // Create indexes for better query performance
        String createRefLogsIndexReferrer = "CREATE INDEX IF NOT EXISTS idx_ref_logs_referrer ON ref_logs(referrer_uuid);";
        String createRefLogsIndexReferred = "CREATE INDEX IF NOT EXISTS idx_ref_logs_referred ON ref_logs(referred_uuid);";
        String createRefLogsIndexCreatedAt = "CREATE INDEX IF NOT EXISTS idx_ref_logs_created_at ON ref_logs(created_at);";

        String createTransactionLogsIndexPlayer = "CREATE INDEX IF NOT EXISTS idx_transaction_logs_player ON transaction_logs(player_uuid);";
        String createTransactionLogsIndexMethod = "CREATE INDEX IF NOT EXISTS idx_transaction_logs_method ON transaction_logs(method);";
        String createTransactionLogsIndexCreatedAt = "CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at);";
        String createTransactionLogsIndexSourcePlayer = "CREATE INDEX IF NOT EXISTS idx_transaction_logs_source_player ON transaction_logs(source_player_uuid);";

        try (Connection conn = getConnection(); Statement statement = conn.createStatement()) {
            statement.execute(createTableSql);
            statement.execute(addWalletIdSql);
            statement.execute(addSolanaAddressSql);
            statement.execute(addMineBalanceSql);
            statement.execute(addSolBalanceSql);
            statement.execute(alterSolBalanceTypeSql);
            statement.execute(addLastLoginSql);
            statement.execute(addUsernameSql);
            statement.execute(addRefCodeSql);
            statement.execute(addReferredBySql);
            statement.execute(addTotalRefRewardSql);
            statement.execute(addTotalReferredSql);
            statement.execute(addAllReferredSql);
            statement.execute(addRoleSql);
            statement.execute(addCommissionRateSql);
            statement.execute(addSolFeeShareSql);
            statement.execute(addTotalSolShareSql);
            statement.execute(addManagedByUUIDColumnSql);
            statement.execute(addTotalPayoutSql);
            statement.execute(addManagedByUUIDConstraintSql);
            statement.execute(addSourcePlayerUUIDColumnSql);
            statement.execute(addSourcePlayerUUIDConstraintSql);

            // Create new tables
            statement.execute(createMineToEarnTable);
            statement.execute(createRefLogsTable);
            statement.execute(createTransactionLogsTable);

            // Create indexes
            statement.execute(createRefLogsIndexReferrer);
            statement.execute(createRefLogsIndexReferred);
            statement.execute(createRefLogsIndexCreatedAt);
            statement.execute(createTransactionLogsIndexPlayer);
            statement.execute(createTransactionLogsIndexMethod);
            statement.execute(createTransactionLogsIndexCreatedAt);
            statement.execute(createTransactionLogsIndexSourcePlayer);

            plugin.getLogger().info("Database schema is up to date.");
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update database schema: " + e.getMessage());
            throw new RuntimeException("Failed to initialize database schema.", e);
        }
    }

    public Connection getConnection() throws SQLException {
        if (dataSource == null) {
            throw new SQLException("Database connection pool is not initialized.");
        }
        return dataSource.getConnection();
    }

    public String getFystackWalletId(UUID uuid) {
        String sql = "SELECT fystack_wallet_id FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, uuid.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("fystack_wallet_id");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get Fystack wallet ID for player " + uuid + ": " + e.getMessage());
        }
        return null;
    }

    public void addMineBalance(UUID uuid, long amountToAdd) {
        String sql = "UPDATE players SET mine_balance = mine_balance + ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, amountToAdd);
            pstmt.setString(2, uuid.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update MINE balance for player " + uuid + ": " + e.getMessage());
        }
    }

    /**
     * Adds MINE balance to a player without any commission logic.
     * This is a simple, direct update.
     */
    public void addMineBalanceSimple(UUID uuid, long amountToAdd) {
        String sql = "UPDATE players SET mine_balance = mine_balance + ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, amountToAdd);
            pstmt.setString(2, uuid.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update MINE balance for player " + uuid + ": " + e.getMessage());
        }
    }


    /**
     * Adds MINE balance to a player and distributes referral commission if applicable.
     */
    public void addMineBalanceWithCommission(UUID playerUUID, long amountToAdd) {
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                // The original player is the source of the transaction chain
                addMineBalanceWithCommission(playerUUID, amountToAdd, conn, playerUUID);
                conn.commit();
            } catch (SQLException e) {
                plugin.getLogger().severe("Error during commission transaction for player " + playerUUID + ", rolling back. Error: " + e.getMessage());
                conn.rollback();
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Failed to get connection or manage transaction for commission: " + e.getMessage());
        }
    }

    private void addMineBalanceWithCommission(UUID initialPlayerUUID, long initialAmount, Connection conn, UUID sourcePlayerUUID) throws SQLException {
        // Step 1: Add the initial amount to the first player's balance
        String addBalanceSql = "UPDATE players SET mine_balance = mine_balance + ? WHERE uuid = ?;";
        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(addBalanceSql)) {
            pstmt.setLong(1, initialAmount);
            pstmt.setString(2, initialPlayerUUID.toString());
            pstmt.executeUpdate();
        }

        // Step 2: Log the initial transaction (e.g., MINING, PASSIVE_INCOME)
        String initialMethod = initialPlayerUUID.equals(sourcePlayerUUID) ? "MINING" : "REFERRAL_REWARD";
        logTransaction(initialPlayerUUID, "IN", initialMethod, initialAmount, null, null, "SUCCESS", sourcePlayerUUID);

        // Step 3: Iteratively process the referral chain
        UUID currentPlayerUUID = initialPlayerUUID;
        long currentCommissionBase = initialAmount;

        while (true) {
            UUID referrerUUID = getReferredBy(currentPlayerUUID, conn);

            // Stop if there's no referrer
            if (referrerUUID == null) {
                break;
            }

            // Calculate commission for this level
            double commissionRate = getCommissionRate(referrerUUID, conn);
            long commissionAmount = (long) (currentCommissionBase * commissionRate);

            // Stop if the commission is negligible
            if (commissionAmount <= 0) {
                break;
            }

            // Add the commission to the referrer's balance and update their total reward stat
            addReferralReward(referrerUUID, commissionAmount, conn, sourcePlayerUUID);

            // Prepare for the next iteration
            currentPlayerUUID = referrerUUID;
            currentCommissionBase = commissionAmount;
        }
    }

    /**
     * Distributes referral commissions up the chain asynchronously.
     * @param playerUUID The UUID of the player who initiated the action that generated the commission.
     * @param baseAmount The base amount from which commissions are calculated.
     */
    public void distributeReferralCommissions(UUID playerUUID, long baseAmount) {
        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false);
            try {
                UUID currentPlayerUUID = playerUUID;
                long currentCommissionBase = baseAmount;

                while (true) {
                    UUID referrerUUID = getReferredBy(currentPlayerUUID, conn);
                    if (referrerUUID == null) {
                        break;
                    }

                    double commissionRate = getCommissionRate(referrerUUID, conn);
                    long commissionAmount = (long) (currentCommissionBase * commissionRate);

                    if (commissionAmount <= 0) {
                        break;
                    }

                    addReferralReward(referrerUUID, commissionAmount, conn, playerUUID);

                    currentPlayerUUID = referrerUUID;
                    currentCommissionBase = commissionAmount;
                }
                conn.commit();
            } catch (SQLException e) {
                plugin.getLogger().severe("Error during commission distribution for player " + playerUUID + ", rolling back. Error: " + e.getMessage());
                conn.rollback();
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Failed to get connection or manage transaction for commission distribution: " + e.getMessage());
        }
    }

    /**
     * Distributes the SOL fee share to the direct referrer (F1) if they are a KOL.
     * @param f1PlayerUUID The player who made the claim.
     * @param solAmountPaid The amount of SOL paid for the claim.
     */
    public void distributeSolFeeShare(UUID f1PlayerUUID, java.math.BigDecimal solAmountPaid) {
        UUID referrerUUID = getReferredBy(f1PlayerUUID);
        if (referrerUUID == null) {
            return; // No referrer, no commission.
        }

        double solFeeShareRate = getSolFeeShare(referrerUUID);
        if (solFeeShareRate <= 0) {
            return; // Referrer is not a KOL or has no share rate.
        }

        java.math.BigDecimal commissionAmount = solAmountPaid.multiply(java.math.BigDecimal.valueOf(solFeeShareRate));
        if (commissionAmount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return; // Commission is zero or less.
        }

        // As per the user's request, the Fystack API transfer is skipped.
        // We will only record the earned commission in the database.

        // Update the total_sol_share for the referrer
        updateTotalSolShare(referrerUUID, commissionAmount);

        // Log the transaction for the referrer, indicating it's a credit to be paid out later.
        logTransaction(
            referrerUUID,
            "IN",
            "SOL_FEE_SHARE",
            0, // MINE amount is 0
            commissionAmount,
            "DATABASE_ONLY", // No on-chain hash, marked as internal record
            "SUCCESS",
            f1PlayerUUID // The source of the commission
        );
    }

    private void updateTotalSolShare(UUID playerUUID, java.math.BigDecimal amountToAdd) {
        String sql = "UPDATE players SET total_sol_share = total_sol_share + ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setBigDecimal(1, amountToAdd);
            pstmt.setString(2, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update total_sol_share for player " + playerUUID + ": " + e.getMessage());
        }
    }







    public long getMineBalance(UUID uuid) {
        String sql = "SELECT mine_balance FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, uuid.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("mine_balance");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get MINE balance for player " + uuid + ": " + e.getMessage());
        }
        return 0;
    }

    public String getSolanaAddress(UUID uuid) {
        String sql = "SELECT solana_address FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, uuid.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("solana_address");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get Solana address for player " + uuid + ": " + e.getMessage());
        }
        return null;
    }

    // --- Mining Upgrade Methods ---

    public int getUpgradeLevel(UUID playerUUID, String upgradeName) {
        String columnName = getColumnNameForUpgrade(upgradeName);
        String sql = "SELECT " + columnName + " FROM mine_to_earn WHERE player_uuid = ?;";

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(columnName);
                } else {
                    // If no record exists, create a default one and return 0
                    createDefaultUpgradeEntry(playerUUID);
                    return 0;
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get upgrade level for " + upgradeName + " for player " + playerUUID + ": " + e.getMessage());
        }
        return 0;
    }

    /**
     * Creates a default entry for a player in the mine_to_earn table if it doesn't exist.
     * This ensures that future UPDATE queries will work correctly.
     */
    private void createDefaultUpgradeEntry(UUID playerUUID) {
        String sql = "INSERT INTO mine_to_earn (player_uuid) VALUES (?) ON CONFLICT (player_uuid) DO NOTHING;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not create default upgrade entry for player " + playerUUID + ": " + e.getMessage());
        }
    }

    public void setUpgradeLevel(UUID playerUUID, String upgradeName, int level) {
        String columnName = getColumnNameForUpgrade(upgradeName);
        // Use INSERT ... ON CONFLICT (UPSERT) to ensure the row exists and is updated atomically.
        String sql = "INSERT INTO mine_to_earn (player_uuid, " + columnName + ") VALUES (?, ?) " +
                     "ON CONFLICT (player_uuid) DO UPDATE SET " + columnName + " = EXCLUDED." + columnName + ";";

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.setInt(2, level);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not set upgrade level for " + upgradeName + " for player " + playerUUID + ": " + e.getMessage());
        }
    }

    public void incrementUpgradeLevel(UUID playerUUID, String upgradeName) {
        int currentLevel = getUpgradeLevel(playerUUID, upgradeName);
        setUpgradeLevel(playerUUID, upgradeName, currentLevel + 1);
    }

    public void resetPlayerUpgrades(UUID playerUUID) {
        String sql = "UPDATE mine_to_earn SET upgrade_speed = 0, upgrade_inventory = 0, upgrade_reset_cooldown = 0, upgrade_passive_income = 0, upgrade_mining_area = 0 WHERE player_uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not reset upgrades for player " + playerUUID + ": " + e.getMessage());
        }
    }

    private double getCommissionRate(UUID playerUUID, Connection conn) throws SQLException {
        String sql = "SELECT commission_rate FROM players WHERE uuid::text = ?;";
        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("commission_rate");
                }
            }
        }
        // Return default USER rate if not found
        return 0.3;
    }


    public double getCommissionRate(UUID playerUUID) {
        String sql = "SELECT commission_rate FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("commission_rate");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get commission rate for player " + playerUUID + ": " + e.getMessage());
        }
        // Return a default value if not found or on error
        return 0.3; // Default commission rate
    }

    private String getColumnNameForUpgrade(String upgradeName) {
        if (upgradeName == null) {
            throw new IllegalArgumentException("Upgrade name cannot be null");
        }
        // Whitelist validation to prevent any chance of SQL injection
        switch (upgradeName.toLowerCase()) {
            case "speed":
                return "upgrade_speed";
            case "inventory":
                return "upgrade_inventory";
            case "reset_cooldown":
                return "upgrade_reset_cooldown";
            case "passive_income":
                return "upgrade_passive_income";
            case "mining_area":
                return "upgrade_mining_area";
            default:
                throw new IllegalArgumentException("Invalid upgrade name: " + upgradeName);
        }
    }

    // ==================== REFERRAL SYSTEM METHODS ====================

    /**
     * Tạo ref code mới và lưu vào database cho player
     * @return ref code đã tạo, hoặc null nếu thất bại
     */
    public String createRefCode(UUID playerUUID) {
        String refCode = generateRefCode();

        // Kiểm tra xem ref code đã tồn tại chưa (rất hiếm)
        while (isRefCodeExists(refCode)) {
            refCode = generateRefCode();
        }

        String sql = "UPDATE players SET ref_code = ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, refCode);
            pstmt.setString(2, playerUUID.toString());
            pstmt.executeUpdate();
            return refCode;
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not create ref code for player " + playerUUID + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Sinh ref code ngẫu nhiên 6 ký tự (chữ + số)
     */
    private String generateRefCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        java.util.Random random = new java.util.Random();

        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }

        return code.toString();
    }

    /**
     * Kiểm tra ref code đã tồn tại chưa
     */
    public boolean isRefCodeExists(String refCode) {
        String sql = "SELECT COUNT(*) FROM players WHERE ref_code = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, refCode);
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not check ref code existence: " + e.getMessage());
        }
        return false;
    }

    /**
     * Lấy UUID của player từ ref code
     */
    public UUID getPlayerByRefCode(String refCode) {
        String sql = "SELECT uuid FROM players WHERE ref_code = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, refCode);
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return UUID.fromString(rs.getString("uuid"));
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get player by ref code: " + e.getMessage());
        }
        return null;
    }

    /**
     * Set người giới thiệu cho player
     */
    public void setReferredBy(UUID playerUUID, UUID referrerUUID) {
        String sql = "UPDATE players SET referred_by = ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            pstmt.setString(2, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not set referrer for player " + playerUUID + ": " + e.getMessage());
        }
    }

    /**
     * Lấy UUID người giới thiệu của player
     */
    public UUID getReferredBy(UUID playerUUID) {
        try (Connection conn = getConnection()) {
            return getReferredBy(playerUUID, conn);
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get referrer for player " + playerUUID + ": " + e.getMessage());
        }
        return null;
    }

    private UUID getReferredBy(UUID playerUUID, Connection conn) throws SQLException {
        String sql = "SELECT referred_by FROM players WHERE uuid = ?;";
        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String referrerUUIDStr = rs.getString("referred_by");
                    if (referrerUUIDStr != null) {
                        return UUID.fromString(referrerUUIDStr);
                    }
                }
            }
        }
        return null;
    }


    /**
     * Lấy ref code của player
     */
    public String getRefCode(UUID playerUUID) {
        String sql = "SELECT ref_code FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("ref_code");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get ref code for player " + playerUUID + ": " + e.getMessage());
        }
        return null;
    }

    /**
     * Tăng số lượng người đã giới thiệu của một player.
     */
    public void incrementTotalReferred(UUID referrerUUID) {
        String sql = "UPDATE players SET total_referred = total_referred + 1 WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not increment total referred for player " + referrerUUID + ": " + e.getMessage());
        }
    }

    /**
     * Tăng số lượng người đã giới thiệu (tất cả các cấp) của một player.
     */
    public void incrementAllReferred(UUID referrerUUID) {
        String sql = "UPDATE players SET all_referred = all_referred + 1 WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not increment all_referred for player " + referrerUUID + ": " + e.getMessage());
        }
    }

    /**
     * Registers a new player, optionally with a referrer, within a single database transaction.
     * @param playerUUID The new player's UUID.
     * @param hashedPassword The player's hashed password.
     * @param referrerUUID The referrer's UUID (can be null).
     * @param refCode The referral code used (can be null).
     * @return true if registration was successful, false otherwise.
     */
    public boolean registerPlayerWithReferral(UUID playerUUID, String username, String hashedPassword, UUID referrerUUID, String refCode) {
        String registerSql = "INSERT INTO players (uuid, username, password) VALUES (?, ?, ?)";
        String setReferredBySql = "UPDATE players SET referred_by = ? WHERE uuid = ?;";
        String incrementTotalReferredSql = "UPDATE players SET total_referred = total_referred + 1 WHERE uuid = ?;";
        String logReferralSql = "INSERT INTO ref_logs (referrer_uuid, referred_uuid, ref_code) VALUES (?, ?, ?);";

        try (Connection conn = getConnection()) {
            conn.setAutoCommit(false); // Start transaction

            try {
                // 1. Register the new player
                try (java.sql.PreparedStatement pstmt = conn.prepareStatement(registerSql)) {
                    pstmt.setString(1, playerUUID.toString());
                    pstmt.setString(2, username);
                    pstmt.setString(3, hashedPassword);
                    pstmt.executeUpdate();
                }

                // 2. If there's a referrer, update all related tables
                if (referrerUUID != null && refCode != null) {
                    // Set referred_by
                    try (java.sql.PreparedStatement pstmt = conn.prepareStatement(setReferredBySql)) {
                        pstmt.setString(1, referrerUUID.toString());
                        pstmt.setString(2, playerUUID.toString());
                        pstmt.executeUpdate();
                    }

                    // Increment total_referred for the referrer (F1 only)
                    try (java.sql.PreparedStatement pstmt = conn.prepareStatement(incrementTotalReferredSql)) {
                        pstmt.setString(1, referrerUUID.toString());
                        pstmt.executeUpdate();
                    }

                    // Increment all_referred for all levels (F1, F2, F3, ...)
                    UUID currentReferrer = referrerUUID;
                    int maxLevels = 100; // Safety limit to prevent infinite loops
                    int level = 0;
                    String incrementAllReferredSql = "UPDATE players SET all_referred = all_referred + 1 WHERE uuid = ?;";

                    while (currentReferrer != null && level < maxLevels) {
                        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(incrementAllReferredSql)) {
                            pstmt.setString(1, currentReferrer.toString());
                            pstmt.executeUpdate();
                        }

                        // Get the next level referrer
                        currentReferrer = getReferredBy(currentReferrer, conn);
                        level++;
                    }

                    // Log the referral
                    try (java.sql.PreparedStatement pstmt = conn.prepareStatement(logReferralSql)) {
                        pstmt.setString(1, referrerUUID.toString());
                        pstmt.setString(2, playerUUID.toString());
                        pstmt.setString(3, refCode);
                        pstmt.executeUpdate();
                    }
                }

                conn.commit(); // Commit transaction
                return true;

            } catch (SQLException e) {
                plugin.getLogger().severe("Error during registration transaction for player " + playerUUID + ", rolling back. Error: " + e.getMessage());
                conn.rollback(); // Rollback on any error
                return false;
            } finally {
                conn.setAutoCommit(true); // Always restore default behavior
            }

        } catch (SQLException e) {
            plugin.getLogger().severe("Failed to get connection or manage transaction for registration: " + e.getMessage());
            return false;
        }
    }

    /**
     * Cộng MINE thưởng từ referral và cập nhật tổng số MINE đã nhận.
     */
    public void addReferralReward(UUID referrerUUID, long amount) {
        try (Connection conn = getConnection()) {
            // When this is called directly, the referrer is the source of this specific transaction chain.
            addReferralReward(referrerUUID, amount, conn, referrerUUID);
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not add referral reward for player " + referrerUUID + ": " + e.getMessage());
        }
    }

    private void addReferralReward(UUID referrerUUID, long amount, Connection conn, UUID sourcePlayerUUID) throws SQLException {
        // Step 1: Add the commission amount to the referrer's balance
        String addBalanceSql = "UPDATE players SET mine_balance = mine_balance + ? WHERE uuid = ?;";
        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(addBalanceSql)) {
            pstmt.setLong(1, amount);
            pstmt.setString(2, referrerUUID.toString());
            pstmt.executeUpdate();
        }

        // Step 2: Log this specific commission transaction
        logTransaction(referrerUUID, "IN", "REFERRAL_REWARD", amount, null, null, "SUCCESS", sourcePlayerUUID);

        // Step 3: Update the total referral reward statistic for the referrer
        String updateTotalSql = "UPDATE players SET total_ref_reward = total_ref_reward + ? WHERE uuid = ?;";
        try (java.sql.PreparedStatement pstmt = conn.prepareStatement(updateTotalSql)) {
            pstmt.setLong(1, amount);
            pstmt.setString(2, referrerUUID.toString());
            pstmt.executeUpdate();
        }
    }


    /**
     * Adds passive income to multiple players and logs the transactions in a single database transaction.
     * This is highly optimized for performance.
     * @param incomeMap A map of Player UUIDs to the income amount they should receive.
     */
    public void batchAddPassiveIncome(Map<UUID, Integer> incomeMap) {
        if (incomeMap == null || incomeMap.isEmpty()) {
            return;
        }

        // Instead of batching, we now call the commission-aware method for each player.
        // This ensures referral commissions are paid on passive income.
        for (Map.Entry<UUID, Integer> entry : incomeMap.entrySet()) {
            UUID playerUUID = entry.getKey();
            int income = entry.getValue();
            if (income > 0) {
                // This will handle the balance update and the entire recursive commission chain.
                addMineBalanceWithCommission(playerUUID, income);
            }
        }
        plugin.getLogger().info("Processed passive income for " + incomeMap.size() + " players, including referral commissions.");
    }

    /**
     * Lấy tổng số người đã được một player giới thiệu.
     */
    public int getTotalReferred(UUID playerUUID) {
        String sql = "SELECT total_referred FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("total_referred");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get total referred for player " + playerUUID + ": " + e.getMessage());
        }
        return 0;
    }

    /**
     * Lấy tổng số người đã được một player giới thiệu (tất cả các cấp).
     */
    public int getAllReferred(UUID playerUUID) {
        String sql = "SELECT all_referred FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("all_referred");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get all referred for player " + playerUUID + ": " + e.getMessage());
        }
        return 0;
    }

    /**
     * Lấy tổng số MINE thưởng mà một player đã nhận được từ referral.
     */
    public long getTotalRefReward(UUID playerUUID) {
        String sql = "SELECT total_ref_reward FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("total_ref_reward");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get total ref reward for player " + playerUUID + ": " + e.getMessage());
        }
        return 0;
    }

    // ==================== REF LOGS METHODS ====================

    /**
     * Ghi log khi có người dùng ref code để đăng ký
     * @param referrerUUID UUID người giới thiệu
     * @param referredUUID UUID người được giới thiệu
     * @param refCode Mã ref đã sử dụng
     */
    public void logReferral(UUID referrerUUID, UUID referredUUID, String refCode) {
        String sql = "INSERT INTO ref_logs (referrer_uuid, referred_uuid, ref_code) VALUES (?, ?, ?);";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            pstmt.setString(2, referredUUID.toString());
            pstmt.setString(3, refCode);
            pstmt.executeUpdate();
            plugin.getLogger().info("Logged referral: " + referrerUUID + " referred " + referredUUID + " with code " + refCode);
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not log referral: " + e.getMessage());
        }
    }

    /**
     * Lấy danh sách tất cả người được giới thiệu bởi một player (cho dashboard)
     * @param referrerUUID UUID người giới thiệu
     * @return List các RefLogEntry
     */
    public java.util.List<RefLogEntry> getRefLogsByReferrer(UUID referrerUUID) {
        String sql = "SELECT referred_uuid, ref_code, created_at FROM ref_logs WHERE referrer_uuid = ? ORDER BY created_at DESC;";
        java.util.List<RefLogEntry> logs = new java.util.ArrayList<>();

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    UUID referredUUID = UUID.fromString(rs.getString("referred_uuid"));
                    String refCode = rs.getString("ref_code");
                    java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
                    logs.add(new RefLogEntry(referrerUUID, referredUUID, refCode, createdAt));
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get ref logs for referrer " + referrerUUID + ": " + e.getMessage());
        }

        return logs;
    }

    /**
     * Lấy danh sách ref logs trong khoảng thời gian (cho dashboard analytics)
     */
    public java.util.List<RefLogEntry> getRefLogsByDateRange(UUID referrerUUID, java.sql.Timestamp startDate, java.sql.Timestamp endDate) {
        String sql = "SELECT referred_uuid, ref_code, created_at FROM ref_logs " +
                     "WHERE referrer_uuid = ? AND created_at BETWEEN ? AND ? " +
                     "ORDER BY created_at DESC;";
        java.util.List<RefLogEntry> logs = new java.util.ArrayList<>();

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            pstmt.setTimestamp(2, startDate);
            pstmt.setTimestamp(3, endDate);
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    UUID referredUUID = UUID.fromString(rs.getString("referred_uuid"));
                    String refCode = rs.getString("ref_code");
                    java.sql.Timestamp createdAt = rs.getTimestamp("created_at");
                    logs.add(new RefLogEntry(referrerUUID, referredUUID, refCode, createdAt));
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get ref logs by date range: " + e.getMessage());
        }

        return logs;
    }

    // ==================== TRANSACTION LOGS METHODS ====================

    /**
     * Ghi log giao dịch claim
     * @param playerUUID UUID người chơi
     * @param method Phương thức: MINING, PASSIVE_INCOME, REFERRAL_REWARD
     * @param amount Số lượng MINE
     * @param solAmount Số lượng SOL (có thể null)
     * @param transactionHash Hash giao dịch Solana (có thể null)
     * @param status Trạng thái: PENDING, SUCCESS, FAILED
     */
    public void logTransaction(UUID playerUUID, String transactionType, String method, long amount, java.math.BigDecimal solAmount,
                               String transactionHash, String status, UUID sourcePlayerUUID) {
        String sql = "INSERT INTO transaction_logs (player_uuid, transaction_type, method, amount, sol_amount, transaction_hash, status, source_player_uuid) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.setString(2, transactionType);
            pstmt.setString(3, method);
            pstmt.setLong(4, amount);

            if (solAmount != null) {
                pstmt.setBigDecimal(5, solAmount);
            } else {
                pstmt.setNull(5, java.sql.Types.DECIMAL);
            }

            if (transactionHash != null) {
                pstmt.setString(6, transactionHash);
            } else {
                pstmt.setNull(6, java.sql.Types.VARCHAR);
            }

            pstmt.setString(7, status);

            if (sourcePlayerUUID != null) {
                pstmt.setString(8, sourcePlayerUUID.toString());
            } else {
                pstmt.setNull(8, java.sql.Types.VARCHAR);
            }

            pstmt.executeUpdate();

            if (plugin.getConfig().getBoolean("debug")) {
                plugin.getLogger().info("Logged transaction: " + playerUUID + " type " + transactionType + " for " + amount + " MINE via " + method);
            }
        } catch (SQLException e) {
            plugin.getLogger().log(java.util.logging.Level.SEVERE, "Could not log transaction", e);
        }
    }

    /**
     * Lấy lịch sử giao dịch của một player
     */
    public java.util.List<TransactionLogEntry> getTransactionLogs(UUID playerUUID, int limit) {
        String sql = "SELECT id, transaction_type, method, amount, sol_amount, transaction_hash, status, created_at " +
                     "FROM transaction_logs WHERE player_uuid = ? ORDER BY created_at DESC LIMIT ?;";
        java.util.List<TransactionLogEntry> logs = new java.util.ArrayList<>();

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.setInt(2, limit);
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    TransactionLogEntry entry = new TransactionLogEntry(
                        rs.getInt("id"),
                        playerUUID,
                        rs.getString("transaction_type"),
                        rs.getString("method"),
                        rs.getLong("amount"),
                        rs.getDouble("sol_amount"),
                        rs.getString("transaction_hash"),
                        rs.getString("status"),
                        rs.getTimestamp("created_at")
                    );
                    logs.add(entry);
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get transaction logs for player " + playerUUID + ": " + e.getMessage());
        }

        return logs;
    }

    /**
     * Lấy tổng số SOL đã claim của tất cả người được giới thiệu (cho dashboard)
     */
    public double getTotalSolClaimedByReferrals(UUID referrerUUID) {
        String sql = "SELECT COALESCE(SUM(tl.sol_amount), 0) as total " +
                     "FROM transaction_logs tl " +
                     "INNER JOIN ref_logs rl ON tl.player_uuid = rl.referred_uuid " +
                     "WHERE rl.referrer_uuid = ? AND tl.status = 'SUCCESS' AND tl.sol_amount IS NOT NULL;";

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("total");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get total SOL claimed by referrals: " + e.getMessage());
        }

        return 0.0;
    }

    /**
     * Lấy chi tiết claim của từng người được giới thiệu (cho dashboard)
     */
    public java.util.Map<UUID, ReferralStats> getReferralStats(UUID referrerUUID) {
        String sql = "SELECT rl.referred_uuid, " +
                     "COALESCE(SUM(CASE WHEN tl.status = 'SUCCESS' AND tl.sol_amount IS NOT NULL THEN tl.sol_amount ELSE 0 END), 0) as total_sol_claimed, " +
                     "COALESCE(SUM(CASE WHEN tl.status = 'SUCCESS' THEN tl.amount ELSE 0 END), 0) as total_mine_claimed, " +
                     "COUNT(tl.id) as total_transactions " +
                     "FROM ref_logs rl " +
                     "LEFT JOIN transaction_logs tl ON rl.referred_uuid = tl.player_uuid " +
                     "WHERE rl.referrer_uuid = ? " +
                     "GROUP BY rl.referred_uuid;";

        java.util.Map<UUID, ReferralStats> stats = new java.util.HashMap<>();

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, referrerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    UUID referredUUID = UUID.fromString(rs.getString("referred_uuid"));
                    double totalSolClaimed = rs.getDouble("total_sol_claimed");
                    long totalMineClaimed = rs.getLong("total_mine_claimed");
                    int totalTransactions = rs.getInt("total_transactions");

                    stats.put(referredUUID, new ReferralStats(referredUUID, totalSolClaimed, totalMineClaimed, totalTransactions));
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get referral stats: " + e.getMessage());
        }

        return stats;
    }


    public void updateSolBalance(UUID playerUUID, double balance) {
        String sql = "UPDATE players SET sol_balance = ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setDouble(1, balance);
            pstmt.setString(2, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update SOL balance for player " + playerUUID + ": " + e.getMessage());
        }
    }

    public void updateLastLogin(UUID playerUUID) {
        String sql = "UPDATE players SET last_login = NOW() WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not update last login for player " + playerUUID + ": " + e.getMessage());
        }
    }

    public double getSolBalance(UUID playerUUID) {
        String sql = "SELECT sol_balance FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("sol_balance");
                }

            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get SOL balance for player " + playerUUID + ": " + e.getMessage());
        }
        return 0.0;
    }

    public double getSolFeeShare(UUID playerUUID) {
        String sql = "SELECT sol_fee_share FROM players WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, playerUUID.toString());
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("sol_fee_share");
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get sol_fee_share for player " + playerUUID + ": " + e.getMessage());
        }
        return 0.0;
    }

    public void setPlayerRole(UUID playerUUID, String role, double commissionRate) {
        String sql = "UPDATE players SET role = ?, commission_rate = ? WHERE uuid = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, role.toUpperCase());
            pstmt.setDouble(2, commissionRate);
            pstmt.setString(3, playerUUID.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not set role for player " + playerUUID + ": " + e.getMessage());
        }
    }

    public UUID getPlayerUUIDBySolanaAddress(String solanaAddress) {
        String sql = "SELECT uuid FROM players WHERE solana_address = ?;";
        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, solanaAddress);
            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return UUID.fromString(rs.getString("uuid"));
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().severe("Could not get player UUID by Solana address " + solanaAddress + ": " + e.getMessage());
        }
        return null;
    }


    /**
     * Gets a map of player UUIDs to their Solana addresses for a given list of players.
     * This is optimized to fetch all data in a single query.
     * @param playerUUIDs A list of player UUIDs to look up.
     * @return A map where the key is the player's UUID and the value is their Solana address.
     */
    public java.util.Map<UUID, String> getOnlinePlayerSolanaAddresses(java.util.List<UUID> playerUUIDs) {
        java.util.Map<UUID, String> addressMap = new java.util.HashMap<>();
        if (playerUUIDs == null || playerUUIDs.isEmpty()) {
            return addressMap;
        }

        // Using PostgreSQL's ANY clause is more efficient than a long list of ORs or INs with many parameters.
        String sql = "SELECT uuid, solana_address FROM players WHERE uuid::text = ANY(?) AND solana_address IS NOT NULL AND solana_address <> '';";

        try (Connection conn = getConnection();
             java.sql.PreparedStatement pstmt = conn.prepareStatement(sql)) {

            String[] uuidStrings = playerUUIDs.stream().map(UUID::toString).toArray(String[]::new);
            java.sql.Array uuidArray = conn.createArrayOf("varchar", uuidStrings);
            pstmt.setArray(1, uuidArray);

            try (java.sql.ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    UUID playerUUID = UUID.fromString(rs.getString("uuid"));
                    String solanaAddress = rs.getString("solana_address");
                    addressMap.put(playerUUID, solanaAddress);
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().log(java.util.logging.Level.SEVERE, "Could not get batch Solana addresses", e);
        }
        return addressMap;
    }

    // ==================== DATA CLASSES ====================

    /**
     * Class đại diện cho một entry trong ref_logs
     */
    public static class RefLogEntry {
        public final UUID referrerUUID;
        public final UUID referredUUID;
        public final String refCode;
        public final java.sql.Timestamp createdAt;

        public RefLogEntry(UUID referrerUUID, UUID referredUUID, String refCode, java.sql.Timestamp createdAt) {
            this.referrerUUID = referrerUUID;
            this.referredUUID = referredUUID;
            this.refCode = refCode;
            this.createdAt = createdAt;
        }
    }

    /**
     * Class đại diện cho một entry trong transaction_logs
     */
    public static class TransactionLogEntry {
        public final int id;
        public final UUID playerUUID;
        public final String transactionType;
        public final String method;
        public final long amount;
        public final Double solAmount;
        public final String transactionHash;
        public final String status;
        public final java.sql.Timestamp createdAt;

        public TransactionLogEntry(int id, UUID playerUUID, String transactionType, String method,
                                  long amount, Double solAmount, String transactionHash,
                                  String status, java.sql.Timestamp createdAt) {
            this.id = id;
            this.playerUUID = playerUUID;
            this.transactionType = transactionType;
            this.method = method;
            this.amount = amount;
            this.solAmount = solAmount;
            this.transactionHash = transactionHash;
            this.status = status;
            this.createdAt = createdAt;
        }
    }

    /**
     * Class đại diện cho thống kê của một người được giới thiệu
     */
    public static class ReferralStats {
        public final UUID referredUUID;
        public final double totalSolClaimed;
        public final long totalMineClaimed;
        public final int totalTransactions;

        public ReferralStats(UUID referredUUID, double totalSolClaimed, long totalMineClaimed, int totalTransactions) {
            this.referredUUID = referredUUID;
            this.totalSolClaimed = totalSolClaimed;
            this.totalMineClaimed = totalMineClaimed;
            this.totalTransactions = totalTransactions;
        }
    }
}

