use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub migration_authority: Pubkey,
    pub fee_receiver: Pubkey,
    pub core_mint: Pubkey,
    pub migration_threshold_lamports: u64,
    pub fee_bps: u16,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Curve {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub token_vault: Pubkey,
    #[max_len(32)] pub name: String,
    #[max_len(10)] pub symbol: String,
    #[max_len(200)] pub uri: String,
    pub total_supply: u64,
    pub curve_token_allocation: u64,
    pub migration_token_allocation: u64,
    pub migration_authority: Pubkey,
    pub fee_receiver: Pubkey,
    pub migration_threshold_lamports: u64,
    pub fee_bps: u16,
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub migration_token_reserves: u64,
    pub withdrawn_sol_amount: u64,
    pub withdrawn_token_amount: u64,
    pub migrated_core_amount: u64,
    pub migrated_token_amount: u64,
    pub status: u8,
    pub migration_pool: Pubkey,
    pub created_at: i64,
    pub bump: u8,
}

#[event]
pub struct ConfigInitialized { pub admin: Pubkey, pub migration_authority: Pubkey, pub fee_receiver: Pubkey, pub core_mint: Pubkey, pub migration_threshold_lamports: u64, pub fee_bps: u16 }
#[event]
pub struct LaunchCreated { pub curve: Pubkey, pub mint: Pubkey, pub creator: Pubkey, pub total_supply: u64, pub curve_token_allocation: u64, pub migration_token_allocation: u64 }
#[event]
pub struct Trade { pub curve: Pubkey, pub user: Pubkey, pub is_buy: bool, pub sol_amount: u64, pub token_amount: u64, pub fee_amount: u64 }
#[event]
pub struct MigrationReady { pub curve: Pubkey, pub mint: Pubkey, pub sol_raised: u64 }
#[event]
pub struct MigrationAssetsWithdrawn { pub curve: Pubkey, pub mint: Pubkey, pub migration_authority: Pubkey, pub sol_amount: u64, pub token_amount: u64 }
#[event]
pub struct MigrationFinalized { pub curve: Pubkey, pub mint: Pubkey, pub pool: Pubkey, pub core_amount: u64, pub token_amount: u64 }
