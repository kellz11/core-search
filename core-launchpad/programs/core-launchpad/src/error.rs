use anchor_lang::prelude::*;

#[error_code]
pub enum LaunchpadError {
    #[msg("The migration threshold must be greater than zero.")] InvalidThreshold,
    #[msg("The platform fee cannot exceed 10%.")] FeeTooHigh,
    #[msg("Token name exceeds 32 bytes.")] NameTooLong,
    #[msg("Token symbol exceeds 10 bytes.")] SymbolTooLong,
    #[msg("Metadata URI exceeds 200 bytes.")] UriTooLong,
    #[msg("Launch tokens must use six decimals.")] InvalidDecimals,
    #[msg("The mint already has supply.")] MintAlreadyUsed,
    #[msg("Invalid mint authority.")] InvalidMintAuthority,
    #[msg("Launch mints cannot have a freeze authority.")] InvalidFreezeAuthority,
    #[msg("Supply must be nonzero.")] InvalidSupply,
    #[msg("Curve and migration allocations must exactly equal total supply.")] InvalidAllocation,
    #[msg("Virtual reserves are invalid.")] InvalidVirtualReserves,
    #[msg("This curve would run out of sale tokens before reaching the configured migration threshold.")] CurveCannotReachThreshold,
    #[msg("Arithmetic overflow or underflow.")] MathOverflow,
    #[msg("Amount must be greater than zero.")] ZeroAmount,
    #[msg("Calculated output is zero.")] ZeroOutput,
    #[msg("Trading is no longer open.")] TradingClosed,
    #[msg("Slippage limit exceeded.")] SlippageExceeded,
    #[msg("Not enough tokens remain on the curve.")] InsufficientCurveTokens,
    #[msg("Not enough SOL remains on the curve.")] InsufficientCurveSol,
    #[msg("The curve has not reached its migration threshold.")] MigrationNotReady,
    #[msg("The curve is in the wrong lifecycle state.")] InvalidStatus,
    #[msg("Invalid migration pool.")] InvalidPool,
}
