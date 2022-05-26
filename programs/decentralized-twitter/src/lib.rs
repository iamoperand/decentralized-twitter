use anchor_lang::prelude::*;

declare_id!("Akgh7h4d9LzAgZVb4TxM4j86k3KDN5SuKWRDyjgJiozr");

#[program]
pub mod twitter_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
