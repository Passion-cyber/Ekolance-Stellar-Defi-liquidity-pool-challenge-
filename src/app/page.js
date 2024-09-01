"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components";
import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Asset,
  Operation,
  LiquidityPoolAsset,
  getLiquidityPoolId,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

function App() {
  const [keypair, setKeypair] = useState(null);
  const [log, setLog] = useState("");
  const [liquidityPoolId, setLiquidityPoolId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState({
    generateKeypair: false,
    fundAccount: false,
    createLiquidityPool: false,
    withdrawFromPool: false,
  });

  const addLog = (message) => {
    setLog(message);
  };

  const generateKeypair = () => {
    setLoading((prev) => ({ ...prev, generateKeypair: true }));
    const newKeypair = Keypair.random();
    setKeypair(newKeypair);
    addLog(`Generated new keypair. Public key: ${newKeypair.publicKey()}`);
    setLoading((prev) => ({ ...prev, generateKeypair: false }));
  };

  const fundAccount = async () => {
    if (!keypair) {
      addLog("Please generate a keypair first.");
      return;
    }

    setLoading((prev) => ({ ...prev, fundAccount: true }));
    const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
    try {
      const response = await fetch(friendbotUrl);
      if (response.ok) {
        addLog(`Account ${keypair.publicKey()} successfully funded.`);
      } else {
        addLog(`Something went wrong funding account: ${keypair.publicKey()}.`);
      }
    } catch (error) {
      addLog(`Error funding account ${keypair.publicKey()}: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, fundAccount: false }));
  };

  const createLiquidityPool = async () => {
    if (!keypair || !assetName || !tokenAAmount || !tokenBAmount) {
      addLog(
        "Please ensure you have a keypair, asset name, and token amounts."
      );
      return;
    }

    setLoading((prev) => ({ ...prev, createLiquidityPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const customAsset = new Asset(assetName, keypair.publicKey());
      const lpAsset = new LiquidityPoolAsset(Asset.native(), customAsset, 30);
      const lpId = getLiquidityPoolId("constant_product", lpAsset).toString(
        "hex"
      );
      setLiquidityPoolId(lpId);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({ asset: lpAsset }))
        .addOperation(
          Operation.liquidityPoolDeposit({
            liquidityPoolId: lpId,
            maxAmountA: tokenAAmount,
            maxAmountB: tokenBAmount,
            minPrice: { n: 1, d: 1 },
            maxPrice: { n: 1, d: 1 },
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      addLog(
        <>
          Liquidity Pool created. Transaction URL:{" "}
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
          >
            View Transaction
          </Link>
        </>
      );
    } catch (error) {
      addLog(`Error creating Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, createLiquidityPool: false }));
  };

  const withdrawFromPool = async () => {
    if (!keypair || !liquidityPoolId || !withdrawAmount) {
      addLog(
        "Please ensure you have a keypair, liquidity pool ID, and withdrawal amount."
      );
      return;
    }

    setLoading((prev) => ({ ...prev, withdrawFromPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.liquidityPoolWithdraw({
            liquidityPoolId: liquidityPoolId,
            amount: withdrawAmount,
            minAmountA: "0",
            minAmountB: "0",
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      addLog(
        <>
          Withdrawal successful. Transaction URL:{" "}
          <Link
            href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
          >
            View Transaction
          </Link>
        </>
      );
    } catch (error) {
      addLog(`Error withdrawing from Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, withdrawFromPool: false }));
  };

  return (
    <section className="w-full max-w-[1200px] bg-[#e3e2e2] mx-auto justify-center border rounded-md p-6 shadow-sm ">
      <h3 className="font-semibold text-3xl text-center font-roboto">
        Illustration of a Simple DeFi Liquidity Pool
      </h3>
      <div className="border-b w-full my-4"></div>

      <section className="w-full flex flex-col gap-8">
        <div className="w-full p-6 rounded-md bg-[#FFFFFF] flex items-start flex-col md:flex-row gap-6 md:gap-4">
          <blockquote className="w-full flex items-start flex-col gap-4">
            <div className="w-full flex flex-col md:flex-row items-center gap-3">
              <div className="w-full">
                <Button
                  disabled={loading.generateKeypair}
                  isLoading={loading.generateKeypair}
                  name={"Generate A Keypair"}
                  onClick={generateKeypair}
                />
              </div>
              <div className="w-full">
                <Button
                  disabled={loading.fundAccount}
                  isLoading={loading.fundAccount}
                  name={"Fund Your Account"}
                  onClick={fundAccount}
                />
              </div>
            </div>

            <div className="w-full flex  flex-col md:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Assset Name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full border rounded py-2 px-4 outline-none"
              />
              <input
                type="number"
                placeholder="Token A Amount (XLM)"
                value={tokenAAmount}
                onChange={(e) => setTokenAAmount(e.target.value)}
                className="w-full border rounded py-2 px-4 outline-none"
              />
            </div>

            <input
              type="number"
              placeholder="Token B Amount (Custom Asset)"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(e.target.value)}
              className="w-full border rounded py-2 px-4 outline-none"
            />

            <div className="w-full">
              <Button
                outline
                style={{ backgroundColor: "#ffffff" }}
                disabled={loading.createLiquidityPool}
                isLoading={loading.createLiquidityPool}
                name={"Create Liquidity Pool"}
                onClick={createLiquidityPool}
              />
            </div>
          </blockquote>

          <blockquote className="w-full flex items-start flex-col gap-4">
            <div className="w-full flex flex-col md:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Liquidity Pool ID"
                value={liquidityPoolId}
                onChange={(e) => setLiquidityPoolId(e.target.value)}
                className="w-full border rounded py-2 px-4 outline-none"
              />

              <input
                type="number"
                placeholder="Withdrawal Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full border rounded py-2 px-4 outline-none"
              />
            </div>

            <div className="w-full">
              <Button
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #198F51",
                }}
                disabled={loading.withdrawFromPool}
                isLoading={loading.withdrawFromPool}
                name={"Withdraw from Pool"}
                onClick={withdrawFromPool}
                shade={"border border-[#198F51]"}
                className={"text-[#198F51] border-[#198F51]"}
              />
            </div>
          </blockquote>
        </div>
        <div>
          <div className="p-3 bg-[#e8f5e9] max-h-[400px] overflow-auto">
            <h4 className="text-[#388e3c] font-semibold ">Latest Log</h4>
            <p className="text-sm font-normal">{log}</p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default App;
