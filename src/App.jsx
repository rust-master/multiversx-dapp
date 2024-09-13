import { useEffect, useState } from 'react';
import './App.css';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { useExtensionLogin } from '@multiversx/sdk-dapp/hooks/login/useExtensionLogin';
import { logout } from '@multiversx/sdk-dapp/utils/logout';
import { useSignMessage } from '@multiversx/sdk-dapp/hooks/signMessage/useSignMessage';
import { useGetSignMessageSession } from '@multiversx/sdk-dapp/hooks/signMessage/useGetSignMessageSession';
import { getAddress } from "@multiversx/sdk-dapp/utils/account";
import { useLedgerLogin } from '@multiversx/sdk-dapp/hooks/login/useLedgerLogin';
import { useWalletConnectV2Login } from '@multiversx/sdk-dapp/hooks/login/useWalletConnectV2Login'
import QRCode from 'qrcode'
import { useCrossWindowLogin } from '@multiversx/sdk-dapp/hooks/login/useCrossWindowLogin';
import { ContractLoader } from './contract/ContractLoader'
import FactoryABI from './contract/factory.abi.json'
import {getTransactionPayload} from './contract/04.deployRaisePoolPayload'
import { Address, Account } from '@multiversx/sdk-core'
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount'

const apiNetworkProvider = new ApiNetworkProvider(
  "https://devnet-api.multiversx.com",
);

const FACTORY_CONTRACT_ADDRESS = "erd1qqqqqqqqqqqqqpgq4px4kmh4zvhnejhfnducdv6kmya6d7kp7wpqcqq6j0";



function App() {

  const [connect, setConnected] = useState(true)

  const { address } = useGetAccount()

  const commonProps = {
    callbackRoute: '/',
    onLoginRedirect: () => {
      window.location = '/';
    },
  };

  const callbackUrl = `/`;
  const onRedirect = undefined; // use this to redirect with useNavigate to a specific page after logout
  const shouldAttemptReLogin = true; // use for special cases where you want to re-login after logout
  const options = {
    shouldBroadcastLogoutAcrossTabs: true,
    hasConsentPopup: true,
  };

  const [onInitiateLogin] = useExtensionLogin({
    nativeAuth: true,
    onLoginRedirect: () => {}
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
   const callbackRoute = '/'
   const nativeAuth = true

   // Ledger States useLedgerLogin
   const [
    onStartLogin,
    ledgerErrorLoadingState,
    {
      accounts,
      onConfirmSelectedAddress,
      onGoToNextPage,
      onGoToPrevPage,
      onSelectAddress,
      selectedAddress,
      showAddressList,
      startIndex
    }
  ] = useLedgerLogin({  nativeAuth: true,
    onLoginRedirect: () => {}});

  // Ledger Login
  const onClickLedgerLogin = async () => {
    try {
      onStartLogin()
    } catch (error) {
      console.log("🚀 ~ onClickLedgerLogin ~ error:", error);
    }
  };

   // xPortal States
   const logoutRoute = `${window.location.origin}/profile`
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
    onLoginRedirect: () => {},
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
    onLoginRedirect: () => {}
  });



 

  const loadContract = async () => {
    const contractLoader = new ContractLoader(FactoryABI);
    try {
      const contract = await contractLoader.getContract(FACTORY_CONTRACT_ADDRESS);
      console.log("contractLoader:", contractLoader);

      return contract;
    } catch (error) {
      console.error("Failed to load contract:", error);
    }
  }

  const getNonce = async () => {
    const deployerAddressBech32 = 'erd1445qn0zgvmepmgs3dqc6h2y253r9ep6lf0hd2s0hhzxqrtun5l8sqg9stj'
    const deployerAsAddress = Address.fromBech32(deployerAddressBech32);
    const deployerAsAccount = new Account(deployerAsAddress);
  
    const deployerOnNetwork = await apiNetworkProvider.getAccount(deployerAsAddress);
    deployerAsAccount.update(deployerOnNetwork);
  
    const nonce = deployerAsAccount.getNonceThenIncrement().valueOf()
    return nonce;
  }

  const sendtransaction = async () => { 
    const contract = await loadContract()
    const nonce = await getNonce()

    const deployerAddressBech32 = 'erd1445qn0zgvmepmgs3dqc6h2y253r9ep6lf0hd2s0hhzxqrtun5l8sqg9stj'

    const transactionPayload = getTransactionPayload();

    const transaction = contract.methods
    .deployRaisePool(transactionPayload)
    .withGasLimit(60000000)
    .withChainID("D")
    .withSender(new Address(deployerAddressBech32))
    .buildTransaction();

    const sessionId = await sendTransactions({
      transactions: [transaction],
      signWithoutSending: false,
      hasConsentPopup: true
    })

    console.log("sessionId:", sessionId);

  }
  
  return (
    <DappProvider environment="devnet"
            customNetworkConfig={{
              name: 'customConfig',
              walletConnectV2ProjectId: 'd9ab4f9c4fd16c4c376ff4c5c4fce213',
              walletConnectV2RelayAddresses: ['wss://eu-central-1.relay.walletconnect.com']
            }}
          >
      <div className="app-container">

      <button className="btn" onClick={onInitiateWebLogin}>
          Login Web Wallet
        </button>
  
      <button className="btn" onClick={onClickLedgerLogin}>
          Login Ledger
        </button>
        <button className="btn" onClick={loginMx}>
          Login DeFi Wallet
        </button>
        <button className="btn" onClick={signMessageMx} disabled={!connect} >
          Sign Message
        </button>
        <button className="btn" onClick={logoutMx}>
          Logout
        </button>

        <button className="btn" onClick={onClickLoginxPortal}>
          Login xPortal
        </button>

        <button className="btn" onClick={sendtransaction}>
          Deploy Raise Pool
        </button>

        <div style={{ textAlign: 'center', marginTop: '50px', width: '250px'}}>
            <h1 className='xPortal'>Connect xPortal Wallet</h1>
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
        </div>
      </div>
    </DappProvider>
  );
}

export default App;
