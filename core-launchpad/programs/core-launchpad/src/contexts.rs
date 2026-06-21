use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{Mint, Token, TokenAccount}};
use crate::{error::LaunchpadError, state::{Curve, GlobalConfig}};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)] pub admin: Signer<'info>,
    #[account(init, payer = admin, space = 8 + GlobalConfig::INIT_SPACE, seeds = [b"global"], bump)]
    pub global: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut, address = global.admin)] pub admin: Signer<'info>,
    #[account(mut, seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
}

#[derive(Accounts)]
pub struct CreateLaunch<'info> {
    #[account(seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
    #[account(mut)] pub creator: Signer<'info>,
    #[account(mut, constraint = mint.mint_authority == anchor_lang::solana_program::program_option::COption::Some(creator.key()) @ LaunchpadError::InvalidMintAuthority)]
    pub mint: Account<'info, Mint>,
    #[account(init, payer = creator, space = 8 + Curve::INIT_SPACE, seeds = [b"curve", mint.key().as_ref()], bump)]
    pub curve: Account<'info, Curve>,
    #[account(init, payer = creator, associated_token::mint = mint, associated_token::authority = curve)]
    pub token_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
    #[account(mut, seeds = [b"curve", mint.key().as_ref()], bump = curve.bump, has_one = mint)] pub curve: Account<'info, Curve>,
    pub mint: Account<'info, Mint>,
    #[account(mut, address = curve.token_vault)] pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub buyer: Signer<'info>,
    #[account(init_if_needed, payer = buyer, associated_token::mint = mint, associated_token::authority = buyer)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    /// CHECK: Address is snapshotted into the curve at launch.
    #[account(mut, address = curve.fee_receiver)] pub fee_receiver: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
    #[account(mut, seeds = [b"curve", mint.key().as_ref()], bump = curve.bump, has_one = mint)] pub curve: Account<'info, Curve>,
    pub mint: Account<'info, Mint>,
    #[account(mut, address = curve.token_vault)] pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)] pub seller: Signer<'info>,
    #[account(mut, associated_token::mint = mint, associated_token::authority = seller)] pub seller_token_account: Account<'info, TokenAccount>,
    /// CHECK: Address is snapshotted into the curve at launch.
    #[account(mut, address = curve.fee_receiver)] pub fee_receiver: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MigrationAuthorityAction<'info> {
    #[account(seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
    #[account(mut, seeds = [b"curve", curve.mint.as_ref()], bump = curve.bump)] pub curve: Account<'info, Curve>,
    #[account(address = curve.migration_authority)] pub migration_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawMigrationAssets<'info> {
    #[account(seeds = [b"global"], bump = global.bump)] pub global: Account<'info, GlobalConfig>,
    #[account(mut, seeds = [b"curve", mint.key().as_ref()], bump = curve.bump, has_one = mint)] pub curve: Account<'info, Curve>,
    pub mint: Account<'info, Mint>,
    #[account(mut, address = curve.token_vault)] pub token_vault: Account<'info, TokenAccount>,
    #[account(mut, address = curve.migration_authority)] pub migration_authority: Signer<'info>,
    #[account(init_if_needed, payer = migration_authority, associated_token::mint = mint, associated_token::authority = migration_authority)]
    pub authority_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
