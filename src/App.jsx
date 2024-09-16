import { useEffect, useState, useCallback } from 'react';
import './App.css';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { useExtensionLogin } from '@multiversx/sdk-dapp/hooks/login/useExtensionLogin';
import { logout } from '@multiversx/sdk-dapp/utils/logout';
import { useSignMessage } from '@multiversx/sdk-dapp/hooks/signMessage/useSignMessage';
import { useGetSignMessageSession } from '@multiversx/sdk-dapp/hooks/signMessage/useGetSignMessageSession';
import { getAddress } from "@multiversx/sdk-dapp/utils/account";
// import { useLedgerLogin } from '@multiversx/sdk-dapp/hooks/login/useLedgerLogin';
import { useWalletConnectV2Login } from '@multiversx/sdk-dapp/hooks/login/useWalletConnectV2Login'
import QRCode from 'qrcode'
import { useCrossWindowLogin } from '@multiversx/sdk-dapp/hooks/login/useCrossWindowLogin';
import { ContractLoader } from './contract/ContractLoader'
import PingPongABI from './contract/ping-pong.abi.json'
import { Address, Account} from '@multiversx/sdk-core'
import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount'
// import { useSendPingPongTransaction } from './hook/useSendPingPongTransaction';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals/SignTransactionsModals';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal/NotificationModal';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList/TransactionsToastList';
import { ContractFunction } from '@multiversx/sdk-core/out/smartcontracts/function';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks/useGetNetworkConfig';
import { ResultsParser } from '@multiversx/sdk-core/out/smartcontracts/resultsParser';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out/proxyNetworkProvider';

const resultsParser = new ResultsParser();

const contractAddress = 'erd1qqqqqqqqqqqqqpgqm6ad6xrsjvxlcdcffqe8w58trpec09ug9l5qde96pq';

function App() {

  const { network } = useGetNetworkConfig();
  const proxy = new ProxyNetworkProvider(network.apiAddress);

  // const {
  //   sendPingTransactionFromAbi,
  // } = useSendPingPongTransaction({});

  const [connect, setConnected] = useState(true)

  const { address } = useGetAccount()

  // const commonProps = {
  //   callbackRoute: '/',
  //   onLoginRedirect: () => {
  //     window.location = '/';
  //   },
  // };

  const callbackUrl = `/`;
  const onRedirect = undefined; // use this to redirect with useNavigate to a specific page after logout
  const shouldAttemptReLogin = true; // use for special cases where you want to re-login after logout
  const options = {
    shouldBroadcastLogoutAcrossTabs: true,
    hasConsentPopup: true,
  };

  const [onInitiateLogin] = useExtensionLogin({
    nativeAuth: true,
    onLoginRedirect: () => { }
  });

  const { sessionId, signMessage, onAbort } = useSignMessage();
  const messageSession = useGetSignMessageSession(sessionId);

  function loginMx() {
    onInitiateLogin();
  }

  async function signMessageMx() {
    try {
      const message = 'SigningtheCryptool';

      if (messageSession) {
        onAbort();
      }
      if (!message.trim()) {
        return;
      }

      const sig = await signMessage({
        message,
        callbackUrl,
      });

      console.log("sig", sig.signature)
    } catch (error) {
      throw Error(error);
    }
  }

  async function logoutMx() {
    setConnected(false);
    logout(
      callbackUrl,
      /*
       * following are optional params. Feel free to remove them in your implementation
       */
      onRedirect,
      shouldAttemptReLogin,
      options
    );
  }

  useEffect(() => {
    const fetchAddress = async () => {
      const address = await getAddress();
      if (address) {
        setConnected(true);
        console.log("🚀 ~ useEffect ~ address:", address);
      } else {
        setConnected(false);
      }
    };

    fetchAddress();
  }, []);

  // Legder Account Provider
  // const callbackRoute = '/'
  // const nativeAuth = true

  // Ledger States useLedgerLogin
  // const [
  //   onStartLogin,
  //   ledgerErrorLoadingState,
  //   {
  //     accounts,
  //     onConfirmSelectedAddress,
  //     onGoToNextPage,
  //     onGoToPrevPage,
  //     onSelectAddress,
  //     selectedAddress,
  //     showAddressList,
  //     startIndex
  //   }
  // ] = useLedgerLogin({
  //   nativeAuth: true,
  //   onLoginRedirect: () => { }
  // });

  // Ledger Login
  // const onClickLedgerLogin = async () => {
  //   try {
  //     onStartLogin()
  //   } catch (error) {
  //     console.log("🚀 ~ onClickLedgerLogin ~ error:", error);
  //   }
  // };

  // xPortal States
  const customRequestMethods = []
  const [qrCodeSvg, setQrCodeSvg] = useState('')

  // xPortal States useWalletConnectV2Login
  const [
    initLoginWithWalletConnectV2,
    { error: walletConnectErrorV2, isLoading },
    {
      connectExisting,
      removeExistingPairing,
      uriDeepLink: walletConnectDeepLinkV2,
      walletConnectUri: walletConnectUriV2,
      wcPairings,
    },
  ] = useWalletConnectV2Login({
    nativeAuth: true,
    onLoginRedirect: () => { },
    customRequestMethods,
  })

  // xPortal generateQRCode
  const generateQRCode = async () => {
    if (!walletConnectUriV2) {
      return;
    }
    console.log('connectExisting', connectExisting)
    console.log(':removeExistingPairing', removeExistingPairing)
    console.log('walletConnectDeepLinkV2', walletConnectDeepLinkV2)
    console.log('walletConnectUriV2', walletConnectUriV2)
    console.log('wcPairings', wcPairings)
    const mxAddress = await getAddress()
    console.log("mxAddress:", mxAddress);

    const svg = await QRCode.toString(walletConnectUriV2, {
      type: 'svg',
    })
    console.log('generateQRCode ~ svg:', svg)


    if (svg) {
      setQrCodeSvg(svg)
    }
  }

  const onClickLoginxPortal = async () => {
    try {
      generateQRCode()
    } catch (error) {
      console.log("🚀 ~ onClickLedgerLogin ~ error:", error);
    }
  }

  // xPortal init walletconnect login
  useEffect(() => {
    initLoginWithWalletConnectV2()
  }, [])


  // Web Wallet Login
  const [onInitiateWebLogin] = useCrossWindowLogin({
    nativeAuth: true,
    onLoginRedirect: () => { }
  });





  const loadContract = async () => {
    const contractLoader = new ContractLoader(PingPongABI);
    try {
      const contract = await contractLoader.getContract(contractAddress);
      console.log("contractLoader:", contractLoader);

      return contract;
    } catch (error) {
      console.error("Failed to load contract:", error);
    }
  }

  // const getNonce = async () => {
  //   const deployerAddressBech32 = address
  //   const deployerAsAddress = Address.fromBech32(deployerAddressBech32);
  //   const deployerAsAccount = new Account(deployerAsAddress);

  //   const deployerOnNetwork = await apiNetworkProvider.getAccount(deployerAsAddress);
  //   deployerAsAccount.update(deployerOnNetwork);

  //   const nonce = deployerAsAccount.getNonceThenIncrement().valueOf()
  //   return nonce;
  // }

  const sendPingtransaction = async () => {
    const smartContract = await loadContract()

    const query = smartContract.createQuery({
      func: new ContractFunction('getPingAmount')
    });
    const queryResponse = await proxy.queryContract(query);

    const endpointDefinition = smartContract.getEndpoint('getPingAmount');

    const { firstValue: amount } = resultsParser.parseQueryResponse(
      queryResponse,
      endpointDefinition
    );

    const pingAmount = amount?.valueOf()?.toString(10);

    const pingTransaction = smartContract.methodsExplicit
      .ping()
      .withSender(new Address(address))
      .withValue(pingAmount)
      .withGasLimit(60000000)
      .withChainID("D")
      .buildTransaction();

    const sessionId = await sendTransactions({
      transactions: [pingTransaction],
      signWithoutSending: false,
      hasConsentPopup: false,
    })

    console.log("sessionId:", sessionId);

  }

  const sendPongtransaction = async () => {
    const smartContract = await loadContract()
    const pongTransaction = smartContract.methodsExplicit
      .pong()
      .withSender(new Address(address))
      .withValue('0')
      .withGasLimit(60000000)
      .withChainID("D")
      .buildTransaction();

    const sessionId = await sendTransactions({
      transactions: [pongTransaction],
      signWithoutSending: false,
      hasConsentPopup: false,
    });
    console.log("sessionId:", sessionId);
  }

  return (
    <DappProvider
      environment="devnet"
      customNetworkConfig={{
        name: 'customConfig',
        walletConnectV2ProjectId: 'd9ab4f9c4fd16c4c376ff4c5c4fce213',
        walletConnectV2RelayAddresses: ['wss://eu-central-1.relay.walletconnect.com']
      }}
      dappConfig={{
        shouldUseWebViewProvider: true,
      }}
      customComponents={{
        transactionTracker: {
          // uncomment this to use the custom transaction tracker
          // component: TransactionsTracker,
          props: {
            onSuccess: (sessionId) => {
              console.log(`Session ${sessionId} successfully completed`);
            },
            onFail: (sessionId, errorMessage) => {
              console.log(`Session ${sessionId} failed. ${errorMessage ?? ''}`);
            }
          }
        }
      }}
    >
      <div className="app-container">
        <TransactionsToastList />
        <NotificationModal />
        <SignTransactionsModals />

        <h3>Multiversx dApp</h3>

        <button className="btn" onClick={onInitiateWebLogin}>
          Login Web Wallet
        </button>

        {/* <button className="btn" onClick={onClickLedgerLogin}>
          Login Ledger
        </button> */}
        <button className="btn" onClick={loginMx}>
          Login DeFi Wallet
        </button>
        <button className="btn" onClick={onClickLoginxPortal}>
          Login xPortal
        </button>

        <button className="btn" onClick={signMessageMx} disabled={!connect} >
          Sign Message
        </button>
        <button className="btn" onClick={logoutMx}>
          Logout
        </button>

    

        <h4>Smart Contract Interaction:</h4>

        <button className="btn" onClick={sendPingtransaction}>
          Ping - 1
        </button>
        <button className="btn" onClick={sendPongtransaction}>
          Pong
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px', width: '250px' }}>
          {qrCodeSvg ? <h5 className='xPortal'>Scan QR Code to connect xPortal Wallet</h5> : <span></span>}
          <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
        </div>

        <span className='footer'>
        Made by{" "} 
        <a style={{ color: "#000", marginLeft: "5px" }} href="https://github.com/rust-master" target="_blank" rel="noreferrer">
          {" "}Rust Master <span style={{ color: "#00ddf1" }}>❤️</span>{" "}
        </a>
      </span>
      </div>
    </DappProvider>
  );
}

export default App;
