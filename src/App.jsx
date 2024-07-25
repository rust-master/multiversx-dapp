import { useEffect, useState } from 'react';
import './App.css';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { useExtensionLogin } from '@multiversx/sdk-dapp/hooks/login/useExtensionLogin';
import { logout } from '@multiversx/sdk-dapp/utils/logout';
import { useSignMessage } from '@multiversx/sdk-dapp/hooks/signMessage/useSignMessage';
import { useGetSignMessageSession } from '@multiversx/sdk-dapp/hooks/signMessage/useGetSignMessageSession';
import { getAddress } from "@multiversx/sdk-dapp/utils/account";

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

  return (
    <DappProvider environment="mainnet">
      <div className="app-container">
        <button className="btn" onClick={loginMx}>
          Login
        </button>
        <button className="btn" onClick={signMessageMx} disabled={!connect} >
          Sign Message
        </button>
        <button className="btn" onClick={logoutMx}>
          Logout
        </button>
      </div>
    </DappProvider>
  );
}

export default App;
