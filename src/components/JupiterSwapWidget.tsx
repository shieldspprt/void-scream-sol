import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import "@jup-ag/terminal/css";

const JupiterSwapWidget = () => {
  const walletProps = useWallet();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@jup-ag/terminal").then((mod) => {
        const init = mod.init;
        init({
          displayMode: "widget",
          formProps: {
            referralFee: 70,
            referralAccount: "AEdNLi8aoj9HWgogEEgMyHm9yzisvBcFfWRWVmtCTDK7",
          },
        });
      });
    }
  }, []);

  return (
    <div className="jupiter-terminal-container">
      <div id="jupiter-terminal" />
    </div>
  );
};

export default JupiterSwapWidget;