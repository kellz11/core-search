use anchor_lang::prelude::*;
use crate::{constants::BPS_DENOMINATOR, error::LaunchpadError};

pub fn gross_from_net(net_amount: u64, fee_bps: u16) -> Result<u64> {
    let denominator = BPS_DENOMINATOR.checked_sub(fee_bps as u128).ok_or(LaunchpadError::MathOverflow)?;
    let numerator = (net_amount as u128).checked_mul(BPS_DENOMINATOR).ok_or(LaunchpadError::MathOverflow)?;
    let gross = ceil_div(numerator, denominator)?;
    u64::try_from(gross).map_err(|_| error!(LaunchpadError::MathOverflow))
}

pub fn calculate_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    let fee = (amount as u128).checked_mul(fee_bps as u128).ok_or(LaunchpadError::MathOverflow)?.checked_div(BPS_DENOMINATOR).ok_or(LaunchpadError::MathOverflow)?;
    u64::try_from(fee).map_err(|_| error!(LaunchpadError::MathOverflow))
}

pub fn quote_buy(virtual_sol: u64, virtual_tokens: u64, net_sol_in: u64) -> Result<u64> {
    let k = (virtual_sol as u128).checked_mul(virtual_tokens as u128).ok_or(LaunchpadError::MathOverflow)?;
    let new_virtual_sol = (virtual_sol as u128).checked_add(net_sol_in as u128).ok_or(LaunchpadError::MathOverflow)?;
    let new_virtual_tokens = ceil_div(k, new_virtual_sol)?;
    let output = (virtual_tokens as u128).checked_sub(new_virtual_tokens).ok_or(LaunchpadError::MathOverflow)?;
    u64::try_from(output).map_err(|_| error!(LaunchpadError::MathOverflow))
}

pub fn quote_sell(virtual_sol: u64, virtual_tokens: u64, token_in: u64) -> Result<u64> {
    let k = (virtual_sol as u128).checked_mul(virtual_tokens as u128).ok_or(LaunchpadError::MathOverflow)?;
    let new_virtual_tokens = (virtual_tokens as u128).checked_add(token_in as u128).ok_or(LaunchpadError::MathOverflow)?;
    let new_virtual_sol = ceil_div(k, new_virtual_tokens)?;
    let output = (virtual_sol as u128).checked_sub(new_virtual_sol).ok_or(LaunchpadError::MathOverflow)?;
    u64::try_from(output).map_err(|_| error!(LaunchpadError::MathOverflow))
}

fn ceil_div(numerator: u128, denominator: u128) -> Result<u128> {
    require!(denominator > 0, LaunchpadError::MathOverflow);
    numerator.checked_add(denominator - 1).ok_or(LaunchpadError::MathOverflow)?.checked_div(denominator).ok_or_else(|| error!(LaunchpadError::MathOverflow))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn default_curve_reaches_exactly_one_hundred_sol() {
        assert_eq!(quote_buy(30_000_000_000, 1_031_030_000_000_000, 100_000_000_000).unwrap(), 793_100_000_000_000);
    }
}
