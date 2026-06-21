use anchor_lang::{prelude::*, solana_program::program_option::COption};
use anchor_spl::token::{self, AuthorityType, MintTo, SetAuthority};
use crate::{constants::{STATUS_TRADING, TOKEN_DECIMALS}, contexts::CreateLaunch, error::LaunchpadError, math::quote_buy, state::LaunchCreated};

#[allow(clippy::too_many_arguments)]
pub fn create_launch(ctx: Context<CreateLaunch>, name: String, symbol: String, uri: String, total_supply: u64, curve_token_allocation: u64, migration_token_allocation: u64, initial_virtual_sol_reserves: u64, initial_virtual_token_reserves: u64) -> Result<()> {
    require!(name.as_bytes().len() <= 32, LaunchpadError::NameTooLong);
    require!(symbol.as_bytes().len() <= 10, LaunchpadError::SymbolTooLong);
    require!(uri.as_bytes().len() <= 200, LaunchpadError::UriTooLong);
    require!(ctx.accounts.mint.decimals == TOKEN_DECIMALS, LaunchpadError::InvalidDecimals);
    require!(ctx.accounts.mint.supply == 0, LaunchpadError::MintAlreadyUsed);
    require!(ctx.accounts.mint.freeze_authority == COption::None, LaunchpadError::InvalidFreezeAuthority);
    require!(total_supply > 0 && curve_token_allocation > 0 && migration_token_allocation > 0, LaunchpadError::InvalidSupply);
    require!(curve_token_allocation.checked_add(migration_token_allocation).ok_or(LaunchpadError::MathOverflow)? == total_supply, LaunchpadError::InvalidAllocation);
    require!(initial_virtual_sol_reserves > 0 && initial_virtual_token_reserves >= curve_token_allocation, LaunchpadError::InvalidVirtualReserves);
    let required = quote_buy(initial_virtual_sol_reserves, initial_virtual_token_reserves, ctx.accounts.global.migration_threshold_lamports)?;
    require!(required <= curve_token_allocation, LaunchpadError::CurveCannotReachThreshold);

    let curve_key = ctx.accounts.curve.key();
    let mint_key = ctx.accounts.mint.key();
    let creator_key = ctx.accounts.creator.key();
    {
        let curve = &mut ctx.accounts.curve;
        curve.creator = creator_key;
        curve.mint = mint_key;
        curve.token_vault = ctx.accounts.token_vault.key();
        curve.name = name;
        curve.symbol = symbol;
        curve.uri = uri;
        curve.total_supply = total_supply;
        curve.curve_token_allocation = curve_token_allocation;
        curve.migration_token_allocation = migration_token_allocation;
        curve.migration_authority = ctx.accounts.global.migration_authority;
        curve.fee_receiver = ctx.accounts.global.fee_receiver;
        curve.migration_threshold_lamports = ctx.accounts.global.migration_threshold_lamports;
        curve.fee_bps = ctx.accounts.global.fee_bps;
        curve.virtual_sol_reserves = initial_virtual_sol_reserves;
        curve.virtual_token_reserves = initial_virtual_token_reserves;
        curve.real_sol_reserves = 0;
        curve.real_token_reserves = curve_token_allocation;
        curve.migration_token_reserves = migration_token_allocation;
        curve.withdrawn_sol_amount = 0;
        curve.withdrawn_token_amount = 0;
        curve.migrated_core_amount = 0;
        curve.migrated_token_amount = 0;
        curve.status = STATUS_TRADING;
        curve.migration_pool = Pubkey::default();
        curve.created_at = Clock::get()?.unix_timestamp;
        curve.bump = ctx.bumps.curve;
    }
    token::mint_to(CpiContext::new(ctx.accounts.token_program.to_account_info(), MintTo { mint: ctx.accounts.mint.to_account_info(), to: ctx.accounts.token_vault.to_account_info(), authority: ctx.accounts.creator.to_account_info() }), total_supply)?;
    token::set_authority(CpiContext::new(ctx.accounts.token_program.to_account_info(), SetAuthority { account_or_mint: ctx.accounts.mint.to_account_info(), current_authority: ctx.accounts.creator.to_account_info() }), AuthorityType::MintTokens, None)?;
    emit!(LaunchCreated { curve: curve_key, mint: mint_key, creator: creator_key, total_supply, curve_token_allocation, migration_token_allocation });
    Ok(())
}
