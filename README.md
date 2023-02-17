import React, { useState, useEffect } from "react";

const EtherscanAPIKey = "Your Etherscan API Key"; // Replace with your API key

function TokenDetails({ tokenAddress, userAddress }) {
  const [tokenData, setTokenData] = useState(null);
  const [userBalance, setUserBalance] = useState(null);

  useEffect(() => {
    async function fetchTokenData() {
      const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&address=${tokenAddress}&sort=desc&apikey=${EtherscanAPIKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "1" && data.result.length > 0) {
        const token = data.result[0];
        setTokenData({
          name: token.tokenName,
          symbol: token.tokenSymbol,
          decimals: parseInt(token.tokenDecimal),
          totalSupply: parseInt(token.tokenSupply),
        });
      }
    }
    fetchTokenData();
  }, [tokenAddress]);

  useEffect(() => {
    async function fetchUserBalance() {
      const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${userAddress}&tag=latest&apikey=${EtherscanAPIKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "1") {
        const balance = parseInt(data.result) / Math.pow(10, tokenData.decimals);
        setUserBalance(balance);
      }
    }
    if (tokenData) {
      fetchUserBalance();
    }
  }, [tokenAddress, userAddress, tokenData]);

  if (!tokenData || userBalance === null) {
    return <div>Loading token data and user balance...</div>;
  }

  return (
    <div>
      <h2>{tokenData.name} ({tokenData.symbol})</h2>
      <p>Decimals: {tokenData.decimals}</p>
      <p>Total supply: {tokenData.totalSupply}</p>
      <p>User balance: {userBalance} {tokenData.symbol}</p>
    </div>
  );
}

export default TokenDetails;
