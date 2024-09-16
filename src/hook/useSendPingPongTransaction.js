import { Address, Account, SmartContract, AbiRegistry } from '@multiversx/sdk-core'
import { useState, useCallback } from 'react';
import PingPongABI from '../contract/ping-pong.abi.json'
import { signAndSendTransactions } from '../helpers/signAndSendTransactions';
import { newTransaction } from '@multiversx/sdk-dapp/models';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount'



export const useSendPingPongTransaction = () => {

  const { address } = useGetAccount()
  
    const sendPingTransactionFromAbi = useCallback(
      async () => {

        const abi = AbiRegistry.create(PingPongABI);

        const contractAddress = "erd1qqqqqqqqqqqqqpgqm6ad6xrsjvxlcdcffqe8w58trpec09ug9l5qde96pq"
    
        const smartContract = new SmartContract({
          address: new Address(contractAddress),
          abi
        });

        // const address = 'erd1445qn0zgvmepmgs3dqc6h2y253r9ep6lf0hd2s0hhzxqrtun5l8sqg9stj'
        // const GAS_PRICE = 1000000000;

        // const pingTransaction = newTransaction({
        //   value: "1",
        //   data: 'ping',
        //   receiver: contractAddress,
        //   gasLimit: 60000000,
        //   gasPrice: GAS_PRICE,
        //   chainID: "D",
        //   nonce: "4",
        //   sender: address,
        //   version: 1
        // });
  
        const pingTransaction = smartContract.methodsExplicit
          .ping()
          .withSender(new Address(address))
          .withValue('1')
          .withGasLimit(60000000)
          .withChainID("D")
          .buildTransaction();
  
        const sessionId = await signAndSendTransactions({
          transactions: [pingTransaction],
        });

        console.log("sessionId:", sessionId);
  

      },
      []
    );
  
    return {
      sendPingTransactionFromAbi
    };
};
  

export default useSendPingPongTransaction;