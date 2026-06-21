use anchor_lang::prelude::*;
use crate::{contexts::{InitializeConfig, UpdateConfig}, error::LaunchpadError, state::ConfigInitialized};

pub fn initialize_config(ctx: Context<InitializeConfig>, migration_authority: Pubkey, fee_receiver: Pubkey, core_mint: Pubkey, migration_threshold_lamports: u64, fee_bps: u16) -> Result<()> {
    require!(migration_threshold_lamports > 0, LaunchpadError::InvalidThreshold);
    require!(fee_bps <= 1_000, LaunchpadError::FeeTooHigh);
    let config = &mut ctx.accounts.global;
    config.admin = ctx.accounts.admin.key();
    config.migration_authority = migration_authority;
    config.fee_receiver = fee_receiver;
    config.core_mint = core_mint;
    config.migration_threshold_lamports = migration_threshold_lamports;
    config.fee_bps = fee_bps;
    config.bump = ctx.bumps.global;
    emit!(ConfigInitialized { admin: config.admin, migration_authority, fee_receiver, core_mint, migration_threshold_lamports, fee_bps });
    Ok(())
}

pub fn update_config(ctx: Context<UpdateConfig>, migration_authority: Pubkey, fee_receiver: Pubkey, migration_threshold_lamports: u64, fee_bps: u16) -> Result<()> {
    require!(migration_threshold_lamports > 0, LaunchpadError::InvalidThreshold);
    require!(fee_bps <= 1_000, LaunchpadError::FeeTooHigh);
    let config = &mut ctx.accounts.global;
    config.migration_authority = migration_authority;
    config.fee_receiver = fee_receiver;
    config.migration_threshold_lamports = migration_threshold_lamports;
    config.fee_bps = fee_bps;
    Ok(())
}
