import React from "react";
import { BrowserProvider, formatEther } from "ethers";
import "./index.css";

const EtherscanAPIKey = "IIGB2FH4NYTXP9DHUCPFZVIEZZNGJUGFHH";

export default function App() {
  const [account, setAccount] = React.useState("");
  const [userBalance, setUserBalance] = React.useState(0);
  const [userAddedTokens, setUserAddedTokens] = React.useState([]);
  const [loadingBalance, setLoadingBalance] = React.useState(false);
  const [newToken, setNewToken] = React.useState({
    address: "",
    name: "",
    symbol: "",
    decimals: "",
    totalSupply: 0,
    balance: 0,
  });

  React.useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
      console.log("MetaMask is installed!");
    } else {
      alert("MetaMask is not installed!");
    }
  }, []);

  const handleConnectButton = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setAccount(address);
      setLoadingBalance(true);
      getBalance(address);
      setLoadingBalance(false);

      const userAddedTokens = JSON.parse(localStorage.getItem("tokens")) || [];
      setUserAddedTokens(userAddedTokens);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogoutButton = () => {
    setAccount("");
  };

  const getBalance = async (a) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(a);
      const formattedBalance = formatEther(balance);
      setUserBalance(formattedBalance);
    } catch (error) {
      console.log(error);
    }
  };

  async function fetchTokenData(e) {
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${e.target.value}&sort=desc&apikey=${EtherscanAPIKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "1" && data.result.length > 0) {
      const token = data.result[0];
      const userBalance = await fetchUserBalance(
        token.contractAddress,
        token.tokenDecimal
      );
      console.log(userBalance);
      setNewToken({
        address: token.contractAddress,
        name: token.tokenName,
        symbol: token.tokenSymbol,
        decimals: parseInt(token.tokenDecimal),
        totalSupply: parseInt(token.tokenSupply),
        balance: userBalance,
      });
    }
  }

  function setTokenOnLocalStorage(e) {
    e.preventDefault();
    userAddedTokens.push(newToken);
    const tokens = JSON.parse(localStorage.getItem("tokens")) || [];
    tokens.push(newToken);
    localStorage.setItem("tokens", JSON.stringify(tokens));
    setNewToken({
      address: "",
      name: "",
      symbol: "",
      decimals: "",
      totalSupply: 0,
      balance: 0,
    });
  }

  async function fetchUserBalance(tAddr, tDecimals) {
    const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tAddr}&address=${account}&tag=latest&apikey=${EtherscanAPIKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "1") {
      const balance = parseInt(data.result) / Math.pow(10, tDecimals);
      return balance;
    }
  }

  return (
    <div className="app__container">
      <h1 className="pageTitle">eSewa integration for ALT Tokens Market.</h1>

      {account !== "" ? (
        <div className="walletDetails">
          <p>{account}</p>
          <button onClick={handleLogoutButton}>Logout</button>
        </div>
      ) : (
        <div className="walletDetails">
          <button onClick={handleConnectButton}>Connect Metamask</button>
        </div>
      )}

      <div className="transaction__container">
        <div className="portfolio">
          <h1>Portfolio</h1>
          <div className="addTokenOnList">
            <p>Don't see your token here? Add Manually!</p>
          </div>
          <form onSubmit={setTokenOnLocalStorage}>
            <label htmlFor="">Token Address</label>
            <input
              type="text"
              onBlur={fetchTokenData}
              onChange={(e) =>
                setNewToken({ ...newToken, address: e.target.value })
              }
              value={newToken.address}
              placeholder="0x...."
            />

            <label htmlFor="">Token Name</label>
            <input
              type="text"
              value={newToken.name}
              onChange={(e) =>
                setNewToken({ ...newToken, name: e.target.value })
              }
              placeholder="Jcka Labs"
            />

            <label htmlFor="">Token Symbol</label>
            <input
              type="text"
              value={newToken.symbol}
              onChange={(e) =>
                setNewToken({ ...newToken, symbol: e.target.value })
              }
              placeholder="JCKA"
            />

            <label htmlFor="">Token Decimals</label>
            <input
              type="text"
              value={newToken.decimals}
              onChange={(e) =>
                setNewToken({ ...newToken, decimals: e.target.value })
              }
              placeholder="18"
            />

            <button type="submit">Add Token</button>
          </form>
          <div className="tokenLists__container">
            <div className="titles">
              <p>Token</p>
              <p>Balance</p>
            </div>
            <div className="tokens">
              <p>ETH</p>
              <p>{loadingBalance ? "Loading Balance" : userBalance}</p>
            </div>

            {userAddedTokens.length > 0 &&
              userAddedTokens.map((token) => {
                return (
                  <div className="tokens" key={token.symbol}>
                    <p>{token.symbol}</p>
                    <p>{token.balance}</p>
                  </div>
                );
              })}
          </div>
          <b>Note: Balance is currently fetched from Localstorage as per token added timestamp. Need to be dynamic on each event listener must be added.</b>
        </div>
        <div className="buy__container">
          <h1>Markets</h1>
        </div>
      </div>
    </div>
  );
}
