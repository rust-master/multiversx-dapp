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

function App() {

  const [connect, setConnected] = useState(true)

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
    ...commonProps,
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
  ] = useLedgerLogin({ callbackRoute, nativeAuth });

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
     callbackRoute,
     nativeAuth,
     logoutRoute,
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

  return (
    <DappProvider environment="mainnet"
            customNetworkConfig={{
              name: 'customConfig',
              walletConnectV2ProjectId: 'd9ab4f9c4fd16c4c376ff4c5c4fce213',
              walletConnectV2RelayAddresses: ['wss://eu-central-1.relay.walletconnect.com']
            }}
          >
      <div className="app-container">
  
      <button className="btn" onClick={onClickLedgerLogin}>
          Login Ledger
        </button>
        <button className="btn" onClick={loginMx}>
          Login
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

        <div style={{ textAlign: 'center', marginTop: '50px', width: '250px'}}>
            <h1 className='xPortal'>Connect xPortal Wallet</h1>
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
        </div>
      </div>
    </DappProvider>
  );
}

export default App;
