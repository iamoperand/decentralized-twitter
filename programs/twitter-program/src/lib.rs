use anchor_lang::prelude::*;

declare_id!("4u1pQBd6oZHYGHqHeyb9b3hW1XGeiz2msD7qiTcedNuP");

#[program]
pub mod twitter_program {
    use super::*;

    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;
        let author = &ctx.accounts.author;
        let clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return err!(ErrorCode::TopicTooLong);
        }

        if content.chars().count() > 50 {
            return err!(ErrorCode::ContentTooLong);
        }

        tweet.author = *author.key;
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }
}

#[account]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // stores the size of the string
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max

impl Tweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + TIMESTAMP_LENGTH
        + STRING_LENGTH_PREFIX
        + MAX_TOPIC_LENGTH
        + STRING_LENGTH_PREFIX
        + MAX_CONTENT_LENGTH;
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 chars long max.")]
    TopicTooLong,
    #[msg("The provided content should be 280 chars long max")]
    ContentTooLong,
}
