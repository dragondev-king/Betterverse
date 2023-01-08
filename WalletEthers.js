import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import contractAddress from '../contracts/address.json';
import EscrowAbi from '../contracts/escrow.abi.json';
import PrizeToken1Abi from '../contracts/PrizeToken1.abi.json';
import PrizeToken2Abi from '../contracts/PrizeToken2.abi.json';
import PrizeToken3Abi from '../contracts/PrizeToken3.abi.json';

const WalletEthers = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [signature, setSignature] = useState(null)
  const [buttonText, setButtonText] = useState('Connect Wallet')
  const [provider, setProvider] = useState()

  const connectWallet = async () => {
      if (window.ethereum) {
          setProvider(new ethers.providers.Web3Provider(window.ethereum))
          setIsConnected(true)
          setButtonText('Wallet Connected')
      }
      else {
          console.log('Need to install MetaMask');
          alert('Please install MetaMask browser extension to interact');
      }
  }

  const getAddress = async (signer) => {
      return await signer.getAddress();
  }

  const getSignature = async (signer) => {
      var dataKovan = [
          [
              { tokenAddress: "0xA477A87d3e3EB8172fC512eb41AA42B6E9ec1338", tokenAmount: "10000000000000000000" }, // Token1: 10
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "500000000000000" }, // 0.0005 Eth
              { tokenAddress: "0x4EEf62312f1BC30a4520B45ff89473bb8CBab7e6", tokenAmount: "2000000000000000000" }, // Token2 : 2
          ],
          [
              { tokenAddress: "0xA477A87d3e3EB8172fC512eb41AA42B6E9ec1338", tokenAmount: "5000000000000000000" }, // Token1 : 5
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
              { tokenAddress: "0xf8B698Bde8e370471AEfAC09B1f1249029658b35", tokenAmount: "3000000000000000000" }, // Token3 : 3
          ],
          [
              { tokenAddress: "0xA477A87d3e3EB8172fC512eb41AA42B6E9ec1338", tokenAmount: "2000000000000000000" }, // Token1 : 2
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
          ],
      ]

      var dataCelo = [
          [
              { tokenAddress: "0x6BdD5a8Ff2cc925bFAb326282C7Ce0Be0361A14a", tokenAmount: "10000000000000000000" }, // Token1: 10
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "500000000000000" }, // 0.0005 Eth
              { tokenAddress: "0x0cD73b00ABE380339c255a1fD8E977bcBA75770e", tokenAmount: "2000000000000000000" }, // Token2 : 2
          ],
          [
              { tokenAddress: "0x6BdD5a8Ff2cc925bFAb326282C7Ce0Be0361A14a", tokenAmount: "5000000000000000000" }, // Token1 : 5
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
              { tokenAddress: "0xD6f62f6948985e89076A2E26E89b8b1BA67e2533", tokenAmount: "3000000000000000000" }, // Token3 : 3
          ],
          [
              { tokenAddress: "0x6BdD5a8Ff2cc925bFAb326282C7Ce0Be0361A14a", tokenAmount: "2000000000000000000" }, // Token1 : 2
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
          ],
      ]

      var dataMatic = [
          [
              { tokenAddress: "0x0ee9bfD5A8cf9FC969b2D6994754646506CA98d8", tokenAmount: "10000000000000000000" }, // Token1: 10
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "500000000000000" }, // 0.0005 Eth
              { tokenAddress: "0x4348d8f13a5f3Cb5F3151282C8Ddc47729cda726", tokenAmount: "2000000000000000000" }, // Token2 : 2
          ],
          [
              { tokenAddress: "0x0ee9bfD5A8cf9FC969b2D6994754646506CA98d8", tokenAmount: "5000000000000000000" }, // Token1 : 5
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
              { tokenAddress: "0x2BFccfa5B25c6a1a92aD0F77830d2Ced30bfa761", tokenAmount: "3000000000000000000" }, // Token3 : 3
          ],
          [
              { tokenAddress: "0x0ee9bfD5A8cf9FC969b2D6994754646506CA98d8", tokenAmount: "2000000000000000000" }, // Token1 : 2
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
          ],
      ]

      var dataVelas = [
          [
              { tokenAddress: "0x43749Ed0A562503aB52005E4354391F85E38F189", tokenAmount: "10000000000000000000" }, // Token1: 10
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "500000000000000" }, // 0.0005 Eth
              { tokenAddress: "0xdf595437120640963b451000B82b1b872d818784", tokenAmount: "2000000000000000000" }, // Token2 : 2
          ],
          [
              { tokenAddress: "0x43749Ed0A562503aB52005E4354391F85E38F189", tokenAmount: "5000000000000000000" }, // Token1 : 5
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
              { tokenAddress: "0x967DAc99929423755e59064ecCf7D28Eeb4B2966", tokenAmount: "3000000000000000000" }, // Token3 : 3
          ],
          [
              { tokenAddress: "0x43749Ed0A562503aB52005E4354391F85E38F189", tokenAmount: "2000000000000000000" }, // Token1 : 2
              { tokenAddress: "0x0000000000000000000000000000000000000000", tokenAmount: "200000000000000" }, // 0.0002 ETH
          ],
      ]

      var data = dataVelas;

      var result = "0x";

      for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < data[i].length; j++) {
              result = ethers.utils.solidityPack(
                  ['bytes', 'address', 'uint256'],
                  [result, data[i][j].tokenAddress, data[i][j].tokenAmount]
              );
          }
      }

      const messageHash = ethers.utils.keccak256(result);

      let messageHashBytes = ethers.utils.arrayify(messageHash)

      let flagSig = await signer.signMessage(messageHashBytes);

      let recovered = ethers.utils.verifyMessage(messageHashBytes, flagSig);

      console.log("recover address:", recovered);

      return flagSig;
  }

  const approvePrizeToken1 = async () => {
      const signer = await provider.getSigner();
      const PrizeToken1 = new ethers.Contract(contractAddress.PrizeToken1, PrizeToken1Abi, signer)
      await PrizeToken1.approve(contractAddress.Escrow, "10000000000000000000000")
  }

  const approvePrizeToken2 = async () => {
      const signer = await provider.getSigner();
      const PrizeToken2 = new ethers.Contract(contractAddress.PrizeToken2, PrizeToken2Abi, signer)
      await PrizeToken2.approve(contractAddress.Escrow, "10000000000000000000000")
  }

  const approvePrizeToken3 = async () => {
      const signer = await provider.getSigner();
      const PrizeToken3 = new ethers.Contract(contractAddress.PrizeToken3, PrizeToken3Abi, signer)
      await PrizeToken3.approve(contractAddress.Escrow, "10000000000000000000000")
  }

  const sendEthToContract = async () => {
      const signer = await provider.getSigner();
      const escrow = new ethers.Contract(contractAddress.Escrow, EscrowAbi, signer)
      await escrow.sendETHToContract(getSignature(signer), { value: ethers.utils.parseEther("0.001") })
  }

  const create = async () => {
    const signer = await provider.getSigner();
    const escrow = new ethers.Contract(contractAddress.Escrow, EscrowAbi, signer)
    await escrow.createContest(
      getSignature(signer),
      [
        [
          ["0x43749Ed0A562503aB52005E4354391F85E38F189", "10000000000000000000"],
          ["0x0000000000000000000000000000000000000000", "500000000000000"],
          ["0xdf595437120640963b451000B82b1b872d818784", "2000000000000000000"]
        ],
        [
          ["0x43749Ed0A562503aB52005E4354391F85E38F189", "5000000000000000000"],
          ["0x0000000000000000000000000000000000000000", "200000000000000"],
          ["0x967DAc99929423755e59064ecCf7D28Eeb4B2966", "3000000000000000000"]
        ],
        [
          ["0x43749Ed0A562503aB52005E4354391F85E38F189", "2000000000000000000"],
          ["0x0000000000000000000000000000000000000000", "200000000000000"]
        ]
      ]
    )
  }


  useEffect(async () => {
      if (isConnected) {
          const signer = await provider.getSigner();
          setCurrentAccount(await getAddress(signer));
          setSignature(await getSignature(signer));
      };
  }, [isConnected]);
  return (
      <div>
          <h3>Connect React to Metamask using ethers.js</h3>
          <button onClick={connectWallet}>{buttonText}</button>
          {currentAccount && <div>
              <h5>Address:{currentAccount}</h5>
              <p>Signature:{signature}</p>
          </div>}

          <button onClick={() => approvePrizeToken1()}>ApprovePrizeToken1</button>
          <button onClick={() => approvePrizeToken2()}>ApprovePrizeToken2</button>
          <button onClick={() => approvePrizeToken3()}>ApprovePrizeToken3</button>
          <button onClick={() => sendEthToContract()}>Send Eth</button>
          <button onClick={() => create()}>Create Contest</button>
      </div>
  )
}

export default WalletEthers