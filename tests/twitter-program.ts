import * as anchor from '@project-serum/anchor'
import { Program } from '@project-serum/anchor'
import * as assert from 'assert'

import { TwitterProgram } from '../target/types/twitter_program'

describe('twitter-program', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.TwitterProgram as Program<TwitterProgram>

  it('can send a new tweet', async () => {
    const tweet = anchor.web3.Keypair.generate()

    await program.methods
      .sendTweet('crypto', 'bullish on price action')
      .accounts({
        tweet: tweet.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()

    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey)
    assert.equal(tweetAccount.author.toBase58(), provider.wallet.publicKey.toBase58())
    assert.equal(tweetAccount.topic, 'crypto')
    assert.equal(tweetAccount.content, 'bullish on price action')
    assert.ok(tweetAccount.timestamp)
  })

  it('can send a new tweet without a topic', async () => {
    const tweet = anchor.web3.Keypair.generate()

    await program.methods
      .sendTweet('', 'without topic')
      .accounts({
        tweet: tweet.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([tweet])
      .rpc()

    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey)
    assert.equal(tweetAccount.author.toBase58(), provider.wallet.publicKey.toBase58())
    assert.equal(tweetAccount.topic, '')
    assert.equal(tweetAccount.content, 'without topic')
    assert.ok(tweetAccount.timestamp)
  })

  it('can send a new tweet from a different author', async () => {
    const otherUser = anchor.web3.Keypair.generate()
    const airdropSignature = await provider.connection.requestAirdrop(
      otherUser.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL,
    )
    const latestBlockhash = await provider.connection.getLatestBlockhash()
    await provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSignature,
    })

    const tweet = anchor.web3.Keypair.generate()

    await program.methods
      .sendTweet('topic', 'content')
      .accounts({
        tweet: tweet.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([otherUser, tweet])
      .rpc()

    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey)
    assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58())
    assert.equal(tweetAccount.topic, 'topic')
    assert.equal(tweetAccount.content, 'content')
    assert.ok(tweetAccount.timestamp)
  })

  it('cannot provide a topic with more than 50 chars', async () => {
    try {
      const tweet = anchor.web3.Keypair.generate()
      const tooLongTopic = 'x'.repeat(51)

      await program.methods
        .sendTweet(tooLongTopic, 'content having too long topic')
        .accounts({
          tweet: tweet.publicKey,
          author: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweet])
        .rpc()
    } catch (err) {
      assert.equal(err.error.errorMessage, 'Topic must be less than 50 characters')
      return
    }

    assert.fail("The transaction should've failed with a TooLongTopic error")
  })

  it('cannot provide a content with more than 280 chars', async () => {
    try {
      const tweet = anchor.web3.Keypair.generate()
      const tooLongContent = 'x'.repeat(281)

      await program.methods
        .sendTweet('topic', tooLongContent)
        .accounts({
          tweet: tweet.publicKey,
          author: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([tweet])
        .rpc()
    } catch (err) {
      assert.equal(err.error.errorMessage, 'Content must be less than 280 characters')
      return
    }

    assert.fail("The transaction should've failed with a TooLongContent error")
  })
})
