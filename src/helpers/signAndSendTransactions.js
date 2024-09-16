import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';
import { refreshAccount } from '@multiversx/sdk-dapp/utils/account/refreshAccount';

export const signAndSendTransactions = async ({
  transactions,
}) => {
  await refreshAccount();

  const { sessionId } = await sendTransactions({
    transactions,
    redirectAfterSign: false,
  });

  return sessionId;
};
