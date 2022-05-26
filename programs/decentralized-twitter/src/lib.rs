use anchor_lang::prelude::*;

declare_id!("4u1pQBd6oZHYGHqHeyb9b3hW1XGeiz2msD7qiTcedNuP");

#[program]
pub mod twitter_program {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
