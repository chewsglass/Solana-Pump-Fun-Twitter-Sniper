import { Scraper } from '@the-convocation/twitter-scraper';
import { PublicKey, Connection, SystemProgram, Transaction, TransactionInstruction, Keypair, ComputeBudgetProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as spl from "@solana/spl-token"
import { struct, u32, u8 } from '@solana/buffer-layout';
import { u64, publicKey, bool } from "@solana/buffer-layout-utils"
import BN from "bn.js"
import bs58 from "bs58"
const rpcUrl = "https://api.mainnet-beta.solana.com"
const connection = new Connection(rpcUrl)
const pumpProgram = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
const mpl = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const bondingLayout = struct([u64('virtualTokenReserves'), u64('virtualSolReserves'), u64('realTokenReserves'), u64('realSolReserves'), u64('supply'), u8('completed')])
const privateKey = [123, 123, 123, ...] // get this from solflare -> export private key
const solAmount = 0.028*10**9
const wallet = Keypair.fromSecretKey(Uint8Array.from(privateKey))
const scraper = new Scraper();
let lastSeenTweetId = null;

await scraper.login('username', 'password');
async function login() {
        const tweet = await scraper.getLatestTweet('kanyewest', false);
        if (!tweet || tweet.id === lastSeenTweetId) {
            return;
        }
        lastSeenTweetId = tweet.id;
        console.log('\nNew tweet found:');
        console.log(`Text: ${tweet.text}`);
        console.log(`Time: ${tweet.timeParsed}`);
        console.log(`URL: ${tweet.permanentUrl}`);
        const base58Regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
        const base58Matches = tweet.text.match(base58Regex);
        if (base58Matches) {
            console.log('\nBase58 strings found:');
        const base58Regex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
        const base58Matches = tweet.text.match(base58Regex);
		for (const each of base58Matches) {
			let pumpKeys
			try {
			if (bs58.decode(each).length === 32) {
			console.log("found")
			if (each !== "GoL6RVGQFzTD7MdoNEHUQmNp6SgXBn6f9khxAW5Bpump") {
            pumpKeys = await getPumpKeys(new PublicKey(each)) } }
			} catch (e) { console.log(e) }
			if (pumpKeys) {
			console.log("pumping:", each)
			while(true) {
			try {
            const tokensAmount = await getTokensAmountForSolAmount(pumpKeys, solAmount)
            await buyPumpToken(pumpKeys, tokensAmount)
			} catch (E) { console.log(E) }
			}
			}
		}
			}
}


async function getTokensAmountForSolAmount(pumpKeys) {
const info = await connection.getAccountInfo(pumpKeys.bonding)
const bonding = bondingLayout.decode(info.data.slice(8, 1000))
const virtualSol = bonding.virtualSolReserves
const virtualToken = bonding.virtualTokenReserves
const price = Number(virtualSol) / Number(virtualToken)
const tokensAmount = solAmount / price
return (tokensAmount) }

let compute2 = ComputeBudgetProgram.setComputeUnitPrice({microLamports: 2050000})
async function buyPumpToken(pumpKeys, buyTokensAmountRaw) {
    const maxSolCostRaw = 99999999999
    const createAta = spl.createAssociatedTokenAccountIdempotentInstruction(wallet.publicKey, pumpKeys.userAssociatedToken, wallet.publicKey, pumpKeys.mint)
    const buffer = Buffer.alloc(24)
    const obj = { amount: new BN(buyTokensAmountRaw), maxSolCost: new BN(maxSolCostRaw) }
    obj.amount.toArrayLike(Buffer, 'le', 8).copy(buffer, 8)
    obj.maxSolCost.toArrayLike(Buffer, 'le', 8).copy(buffer, 16)
    Buffer.from("66063d1201daebea", "hex").copy(buffer, 0)
    const accountMetas = [
        { pubkey: new PublicKey(pumpKeys.global), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.feeRecipient), isSigner: false, isWritable: true },
        { pubkey: new PublicKey(pumpKeys.mint), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.bonding), isSigner: false, isWritable: true },
        { pubkey: new PublicKey(pumpKeys.associatedBondingCurve), isSigner: false, isWritable: true },
        { pubkey: new PublicKey(pumpKeys.userAssociatedToken), isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: new PublicKey(pumpKeys.systemProgram), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.tokenProgram), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.rent), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.sellEventAuthority), isSigner: false, isWritable: false },
        { pubkey: new PublicKey(pumpKeys.program), isSigner: false, isWritable: false }]
    const programId = new PublicKey(pumpKeys.program)
    const instruction = new TransactionInstruction({ keys: accountMetas, programId, data: buffer })
    const tx = new Transaction().add(compute2).add(createAta).add(instruction)
    const sent = await connection.sendTransaction(tx, [wallet], { skipPreflight: false, preflightCommitment: "confirmed" })
	let confirmed
	while(!confirmed) {
	confirmed = await connection.confirmTransaction(sent, "processed")
	console.log("confirmed:", confirmed)  }
    return (sent)
}

async function getOwnerAta(mint, pubkey) {
    const foundAta = PublicKey.findProgramAddressSync([pubkey.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0]
    return (foundAta)
}

async function getPumpKeys(mint) {
    let pumpKeys = {}
    const program = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
    const mplTokenMetadata = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    const mintAuthority = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM")
    const eventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1")
    const feeRecipient = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg")
    const rent = new PublicKey("SysvarRent111111111111111111111111111111111")
    const seeds = [Buffer.from('global', 'utf-8'), Buffer.from('bonding-curve', 'utf-8'), Buffer.from('metadata', 'utf-8')]
    const global = PublicKey.findProgramAddressSync([seeds[0]], program)[0]
    const metaData = PublicKey.findProgramAddressSync([Buffer.from('metadata'), mpl.toBuffer(), mint.toBuffer()], mpl)[0]
    const userAssociatedToken = await getOwnerAta(mint, wallet.publicKey)
    const bonding = PublicKey.findProgramAddressSync([Buffer.from('bonding-curve'), mint.toBuffer()], pumpProgram)[0]
    const associatedBondingCurve = await getOwnerAta(mint, bonding)
    pumpKeys.metadata = metaData
    pumpKeys.userAssociatedToken = userAssociatedToken
    pumpKeys.associatedBondingCurve = associatedBondingCurve
    pumpKeys.user = wallet.publicKey
    pumpKeys.mint = mint
    pumpKeys.bonding = bonding
    pumpKeys.mintAuthority = mintAuthority
    pumpKeys.global = global
    pumpKeys.mplTokenMetadata = mplTokenMetadata
    pumpKeys.systemProgram = PublicKey.default
    pumpKeys.tokenProgram = spl.TOKEN_PROGRAM_ID
    pumpKeys.associatedTokenProgram = spl.ASSOCIATED_TOKEN_PROGRAM_ID
    pumpKeys.rent = rent
    pumpKeys.eventAuthority = eventAuthority,
    pumpKeys.program = program
    pumpKeys.sellEventAuthority = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1")
    pumpKeys.feeRecipient = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM")
    return (pumpKeys)
}

await login();
setInterval(login, 5000);
