use anchor_lang::prelude::*;

mod constants;
mod contexts;
mod error;
mod instructions;
mod math;
mod state;

use contexts::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZVY6W2BeZ7FEfcYkgMQhg");

#[program]
pub mod core_launchpad {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>, migration_authority: Pubkey, fee_receiver: Pubkey, core_mint: Pubkey, migration_threshold_lamports: u64, fee_bps: u16) -> Result<()> {
        instructions::config::initialize_config(ctx, migration_authority, fee_receiver, core_mint, migration_threshold_lamports, fee_bps)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, migration_authority: Pubkey, fee_receiver: Pubkey, migration_threshold_lamports: u64, fee_bps: u16) -> Result<()> {
        instructions::config::update_config(ctx, migration_authority, fee_receiver, migration_threshold_lamports, fee_bps)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn create_launch(ctx: Context<CreateLaunch>, name: String, symbol: String, uri: String, total_supply: u64, curve_token_allocation: u64, migration_token_allocation: u64, initial_virtual_sol_reserves: u64, initial_virtual_token_reserves: u64) -> Result<()> {
        instructions::launch::create_launch(ctx, name, symbol, uri, total_supply, curve_token_allocation, migration_token_allocation, initial_virtual_sol_reserves, initial_virtual_token_reserves)
    }

    pub fn buy(ctx: Context<Buy>, sol_amount_in: u64, minimum_tokens_out: u64) -> Result<()> {
        instructions::trade::buy(ctx, sol_amount_in, minimum_tokens_out)
    }

    pub fn sell(ctx: Context<Sell>, token_amount_in: u64, minimum_sol_out: u64) -> Result<()> {
        instructions::trade::sell(ctx, token_amount_in, minimum_sol_out)
    }

    pub fn begin_migration(ctx: Context<MigrationAuthorityAction>) -> Result<()> {
        instructions::migration::begin_migration(ctx)
    }

    pub fn withdraw_migration_assets(ctx: Context<WithdrawMigrationAssets>) -> Result<()> {
        instructions::migration::withdraw_migration_assets(ctx)
    }

    pub fn finalize_migration(ctx: Context<MigrationAuthorityAction>, pool: Pubkey, core_amount: u64, token_amount: u64) -> Result<()> {
        instructions::migration::finalize_migration(ctx, pool, core_amount, token_amount)
    }
}
