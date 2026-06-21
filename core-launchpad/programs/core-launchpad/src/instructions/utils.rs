use anchor_lang::prelude::*;
use crate::error::LaunchpadError;

pub fn transfer_program_lamports(from: &AccountInfo, to: &AccountInfo, amount: u64) -> Result<()> {
    require!(amount > 0, LaunchpadError::ZeroAmount);
    let from_balance = from.lamports();
    require!(from_balance >= amount, LaunchpadError::InsufficientCurveSol);
    **from.try_borrow_mut_lamports()? = from_balance.checked_sub(amount).ok_or(LaunchpadError::MathOverflow)?;
    let to_balance = to.lamports();
    **to.try_borrow_mut_lamports()? = to_balance.checked_add(amount).ok_or(LaunchpadError::MathOverflow)?;
    Ok(())
}
