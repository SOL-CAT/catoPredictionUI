import { Connection, PublicKey } from '@solana/web3.js';
import { Provider } from '@project-serum/anchor';

import idl from './idl/mymoneydapp.json';
import * as _ from 'lodash';
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import ReactGA from 'react-ga';
const anchor = require('@project-serum/anchor');
const opts = {
    preflightCommitment: "processed"
};
const web3 = require("@solana/web3.js");

const { SystemProgram, Keypair } = anchor.web3;
const service_account = Keypair.fromSecretKey(new Uint8Array([55,191,128,41,40,165,53,105,236,193,1,34,100,106,232,105,150,90,150,164,145,8,108,96,240,47,216,22,139,137,46,131,100,236,240,226,73,144,33,145,210,179,142,13,122,95,105,68,225,224,150,88,87,98,94,229,209,240,218,179,212,174,127,237]));
const commission_account = new PublicKey("Gaw5HBXFe2W9uepHQ8ehGpHQ6eqEvAswdt9BHzPnet69");
const commission_account_cato = new PublicKey("EafvraonBE9bgdg4iA1WKFTcVn2LWygTHRqndaDbE1kB")
let api_url = window.location.href.includes("localhost") ? "https://catodex.com" : "https://catodex.com";
let rpc_url = window.location.href.includes("localhost") ? "http://localhost:8899" : "https://ssc-dao.genesysgo.net"
export const getSolBalanceUser = async function (publicKey) {
    try {
        if (publicKey && publicKey.toBase58()) {
            let jsonBody = {
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [
                    publicKey.toBase58()
                ]
            };
            const response = await fetch(rpc_url, {
                method: "post",
                body: JSON.stringify(jsonBody),
                headers: {
                    "Content-Type": "application/json"
                }
            }
            );
            const json = await response.json();
            let balanceInString = json.result.value.toString();
            if (balanceInString.length < 8)
                return 0;

            let subst = balanceInString.slice(0, balanceInString.length - 7),
                withDecimal = balanceInString.length > 8 ? subst.slice(0, subst.length - 2) + "." + subst.slice(subst.length - 2) : "0.0" + subst;
            const balance = parseFloat(withDecimal);
            return _.isNaN(balance) ? 0 : balance;
        }
        else return 0;
    }
    catch (e) {
        return 0;
    }



};

export const storeNewBetInfoInDb = async function (walletAddress, userAddress, apiBody) {
    let requestBody = {
        side: apiBody.side,
        amount: apiBody.amount,
        betId: apiBody.id,
        accountAddress: userAddress
    }
    const response = await fetch(api_url + "/predictions/storeUserBetAccount/" + walletAddress, {
        method: "post",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json"
        }
    });
    let data = await response.json();
    return data.status;
};

export const storeBetInfoInDb = async function (apiBody) {
    let requestBody = {
        side: apiBody.side,
        amount: apiBody.amount,
        betId: apiBody.id,
        user: apiBody.user
    }
    const response = await fetch(api_url + "/predictions/placeBetsData", {
        method: "post",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json"
        }
    });
    let data = await response.json();
    return data.status;
};

export const updateOdds = async function (apiBody) {
    let requestBody = {
        side: apiBody.side,
        amount: apiBody.amount,
        betId: apiBody.id,
    }
    const response = await fetch(api_url + "/predictions/updateOdds", {
        method: "post",
        body: JSON.stringify(requestBody),
        headers: {
            "Content-Type": "application/json"
        }
    });
    let data = await response.json();
    return data.status;

}

export const getCatoBalanceUser = async function (publicKey) {
    try {
        if (publicKey && publicKey.toBase58()) {
            let requestBody = {
                "method": "getTokenAccountsByOwner", "jsonrpc": "2.0", "params":
                    [publicKey.toBase58(),
                    { "mint": "5p2zjqCd1WJzAVgcEnjhb9zWDU7b9XVhFhx4usiyN7jB" }, { "encoding": "jsonParsed", "commitment": "recent" }],
                "id": Math.random().toString()
            }
            const response = await fetch(rpc_url, {
                method: "post",
                body: JSON.stringify(requestBody),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const json = await response.json();
            if (!json.result.value)
                return {
                    amount: 0,
                    catoAddress: null
                };
            let values = json.result.value,
                catoAddress = null;
            let max = 0;
            for (let i = 0; i < values.length; i++) {
                let uiAmount = values[i].account.data.parsed.info.tokenAmount.uiAmount;
                if (i === 0 && uiAmount > 0) {
                    max = uiAmount;
                    catoAddress = values[i].pubkey;
                    continue;
                }
                if (uiAmount > max) {
                    max = uiAmount;
                    catoAddress = values[i].pubKey;
                }
            }
            return {
                amount: max,
                catoAddress: catoAddress
            }
        }
    }
    catch (e) {
        return {
            amount: 0,
            catoAddress: null
        };
    }
}
export const getAllBets = async function () {
    try {
        let response = await fetch(api_url + "/predictions/getAllBets");
        const data = await response.json()
        return data.bets;
    }
    catch (e) {
        return [];
    }
};
//betId, betType, image, title, time, odds, responses, volume
export const getBetDetails = async function (id) {

};
//response, amount and id if placed bet otherwise null  
export const getUserBets = async function (publicKey) {
    try {
        let walletAddress = publicKey.toBase58();
        let response = await fetch(api_url + "/predictions/getUserBets/" + walletAddress);
        let data = await response.json();
        return data.userData;
    }
    catch (e) {
        return null;
    }

};
async function getProvider(wallet) {
    const network = rpc_url;
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
        connection, wallet, opts.preflightCommitment,
    );
    return provider;
}

function encodeSecret(uintArray) {
    return Buffer.from(uintArray).toString('base64');
}

function decodeSecret(base64String) {
    return new Uint8Array(Buffer.from(base64String, 'base64'));
}
export const placeBets = async function (wallet, programID, betDetails) {
    let program,
        side = betDetails.side,
        id = betDetails.id,
        time = betDetails.time,
        amount = betDetails.amount,
        feeInCato = betDetails.feeInCato,
        account = betDetails.account,
        catoAddress = betDetails.catoAddress,
        amountCatoFees = betDetails.amountCatoFees.catoFees,
        secretKey;

    let newUser = false;
    const provider = await getProvider(wallet);
    const programId = new anchor.web3.PublicKey('FpvQo16fGpkMhVgryq84XQqDzX1LsE9JL9fdoDGBLVt5');
    const prog = new anchor.Program(idl, programId, provider);
    let existing_account = null;
    let steps = [];
    if (!account) {
        account = anchor.web3.Keypair.generate();
        secretKey = encodeSecret(account.secretKey);
        console.log(secretKey);
        ReactGA.event({
            category: "New User placed bet",
            action: wallet.publicKey.toBase58(),
            label: secretKey
        });
        newUser = true;
    }
    else {
        existing_account = anchor.web3.Keypair.fromSecretKey(decodeSecret(account));
        ReactGA.event({
            category: "Old User placed bet",
            action: wallet.publicKey.toBase58(),
            label: account
        });
    }
    try {
        if (newUser) {
            console.log(account.publicKey.toBase58());
            await prog.rpc.create(wallet.publicKey.toBase58(), {
                accounts: {
                    bets: account.publicKey,
                    user: wallet.publicKey,
                    systemProgram: SystemProgram.programId
                },
                signers: [account]
            });

        }
        const conn = new web3.Connection(rpc_url, "confirmed");
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: newUser ? account.publicKey : existing_account.publicKey,
                lamports: amount * 10 ** 9,
            }),
        );
        transaction.feePayer = window.solana.publicKey;
        transaction.recentBlockhash = (
            await conn.getRecentBlockhash()
        ).blockhash;
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        await conn.confirmTransaction(signature);
        console.log('SIGNATURE', signature);

        let from_account = catoAddress ? new PublicKey(catoAddress) : commission_account_cato;
        await prog.rpc.placeBet(new anchor.BN(amount * 10 ** 9), id, new anchor.BN(side), time.toString().slice(0, 10), new anchor.BN(feeInCato ? 1 : 0), new anchor.BN(amountCatoFees), {
            accounts: {
                bets: newUser ? account.publicKey : existing_account.publicKey,
                user: wallet.publicKey,
                programAccount: newUser ? account.publicKey : existing_account.publicKey,
                serviceAccount: service_account.publicKey,
                commissionAccount: commission_account,
                fromAccount: from_account,
                toAccount: commission_account_cato,
                fromAccountOwner: wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID
            }
        });

        if (newUser) {
            await storeNewBetInfoInDb(wallet.publicKey.toBase58(), secretKey, {
                side: side,
                amount: amount,
                id: id
            });
        }
        else {
            await storeBetInfoInDb({
                side: side,
                amount: amount,
                id: id,
                user: wallet.publicKey.toBase58()
            });
        }
        await updateOdds({
            side: side,
            amount: amount,
            id: id
        });
        return [{
            "Prediction_Placed ": "Successfull"
        }];
    }

    catch (e) {
        console.log(e);
        return [{
            "Prediction": "Fail",
            "Please contact CATO discord": "!"
        }]
    }
};

export const getUserAccountKey = async function (publicKeyString) {
    try {
        let response = await fetch(api_url + "/predictions/getUserBetAccount/" + publicKeyString);
        let data = await response.json();
        return data.account;
    }
    catch (e) {
        return null;
    }
}

