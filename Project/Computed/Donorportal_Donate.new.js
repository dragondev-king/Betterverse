const TestBTRCAddress = this.Contracts().TestBTRCAddress
const TreeContractAddress = this.Contracts().TreeContractAddress
const MinterContractAddress = this.Contracts().MinterContractAddress
const TreeContractABI = this.Contracts().TreeContractABI
const MinterContractABI = this.Contracts().MinterContractABI
const TestBTRCABI = this.Contracts().TestBTRCABI

const getTokenURI = this.DonorPortal_GetTokenURI
const walletProvider = this.DonorPortal_GetCurrentUserWalletProvider()

return async function (tokenID, wallet, user, charity, cause, paymentMethod, currency, location, amount, gas, date, nftCount) {
  if (!walletProvider) {
    alert('No wallet connected')
  } else {

    // Preparing data for workflows
    const userRow = await ($dataGrid('users')[this.DonorPortal_GetCurrentUserRowKey()])
    const userParam = await JSON.stringify(userRow)
    const causeRow = await ($dataGrid('charityProjects')[cause])
    const projectParam = await JSON.stringify(causeRow)
    console.log({userRow, userParam, causeRow, projectParam}, '-----')

    //Declaring charity variables needed for checks
    var project
    var pricePerTree
    var yearlyCO2Sequestration

    var donationSuccess
    var nftMint
    let web3
    let provider

    if (walletProvider == 'torus') {
      web3 = new Web3(window.torus.provider)
      provider = new ethers.providers.Web3Provider(window.torus.provider)
    } else {
      let ethereum
      if (window.ethereum.providers && window.ethereum.providers.length == 2) {

        if (walletProvider == 'coinbase') {
          ethereum = window.ethereum.providers[0]
        } else {
          ethereum = window.ethereum.providers[1]
        }
      } else {
        ethereum = window.ethereum
      }

      web3 = new Web3(ethereum)
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{
            chainId: '0x13881', //mumbai test network chain id 80001
        }]
      })
      provider = new ethers.providers.Web3Provider(ethereum)
    }

    const TreeContract = new web3.eth.Contract(TreeContractABI, TreeContractAddress, {
      from: wallet,
    });
    
    const MinterContract = new web3.eth.Contract(MinterContractABI, MinterContractAddress);

    const TestBTRContract = new web3.eth.Contract(TestBTRCABI, TestBTRCAddress, {
      from: wallet
    })
    const signer = await provider.getSigner()
    const TreeContractWithEther = new ethers.Contract(TreeContractAddress, TreeContractABI, signer)
    const TestBTRContractWithEther = new ethers.Contract(TestBTRCAddress, TestBTRCABI, signer)

    //Check if charity and cause values are not null/invalid
    if (charity == null || cause == null) {
      let pricePerTree = null
      let yearlyCO2Sequestration = null
      alert("Error donating to charity. Invalid or null charity and/or project selected.")
    }
    else if (charity != null && cause != null) {
      let project = $dataGrid('charityProjects')[cause]
      let charityRow = $dataGrid('charities')[charity]
      let pricePerTree = project.pricePerTree
      let yearlyCO2Sequestration = project.yearlyCO2Sequestration

      //Check if selected cause/project is valid
      if (project.inactiveProject == true) {
        alert("Error, inactive project selected. Please select an active project.")
      }
      else if (project.inactiveProject != true) {
        //Check if nft count value is within valid range
        if (nftCount => 1 && nftCount <= 10) {

          //Value to work out whether donation amount and nft count combination is valid
          var nftCountByDonationAmount = amount / nftCount

          //Check if donation amount and nft count values are ♦valid♠
          if (amount < 10 || amount == null) {
            alert("Invalid donation amount, the donation needs to be atleast $10")
          }
          else if (nftCountByDonationAmount < 10) {
            alert("Invalid donation amount and NFT count combination. Each NFT has a minimum donation amount of $10")
          }
          else if (nftCountByDonationAmount => 10) {

            //If wallet is not connected, alert user
            if (wallet == null) {
              alert("No wallet connected!");
            }
            //If wallet is connected
            else if (wallet != null) {

              //Task 3.1 trees.sol - treesInStorage() - Check if there are trees available to be minted
              const availableTrees = await TreeContract.methods.treesInStorage().call()

              if (nftCount > availableTrees) {
                alert("Not enough trees available in smart contract.")
              }
              else {
                var currencyCode = $dataGrid('currencies')[currency].code
                var currencyContractAddress = $dataGrid('currencies')[currency].contract
                console.log('Selected currency is: ' + currencyCode + ' with the address of: ' + currencyContractAddress)

                //Task 3.2 minter.sol - UsableTokens[] - 0x4A35ef8931a6636AA1e97303D82b38E34A57aB7A                          
                //- User var currencyContractAddress here to check if this token is within the UsableTokens[]
                try {
                  const { token } = await MinterContract.methods.tokens(tokenID).call() // get address from tokenID
                  console.log(token, 'token')
                  if (currencyContractAddress === token) {

                    //Get Charity ID from db
                    var charityID = charityRow.smartContractCharityID

                    //Task 3.3 minter.sol - function mintTree - 0x4A35ef8931a6636AA1e97303D82b38E34A57aB7A
                    const approveAmount = Web3.utils.toWei(amount.toString(), 'ether')
                    if(walletProvider == 'coinbase') {
                      const tx = await TestBTRContractWithEther.approve(MinterContractAddress, approveAmount)
                      await tx.wait()
                    } else {
                      await TestBTRContract.methods.approve(MinterContractAddress, approveAmount).send({
                        from: wallet
                      })
                    }
                   
                    
                    console.log('==============after approval')

                    MinterContract.methods.mintTree(nftCount, charityID, approveAmount, TestBTRCAddress).send({ from: wallet }, async (err, txHash) => {
                      if (err) {
                        console.log("An error occured", err)
                        donationSuccess = false
                        nftMint = false
                      } else {
                        // successfully minted
                        donationSuccess = true
                        nftMint = true

                        //Task 3.4 Save NFT Data
                        let nftIDs = []
                        let jsonArray = []
                        TreeContractWithEther.on('minted', async (token, user, event) => {
                          const mintedTokenID = web3.utils.hexToNumber(token)
                          console.log(mintedTokenID, '====minted Token ID')
                          if (user.toLowerCase() == wallet.toLowerCase()) {
                            nftIDs.push(mintedTokenID)
                          }

                          if (nftCount == nftIDs.length) {
                            for (let i = 0; i < nftCount; i++) {
                              let tokenURI = await getTokenURI(nftIDs[i])
                              jsonArray.push(tokenURI)
                            }

                            let data = []
                            web3.eth.getTransaction(txHash, async (error, res) => {
                              gas = res.gasPrice
                              nftIDs.map((nftID, idx) => {
                                data.push({
                                  nftID,
                                  gas,
                                  json: jsonArray[idx]
                                })
                              })

                              let collectedIDs = []
                              data.map(item => {
                                if(item && item.nftID) collectedIDs.push(item.nftID)
                              })
                              console.log({nftIDs, collectedIDs})

                              const isSame = nftIDs.length >= 1 && collectedIDs.length >= 1 && (nftIDs.length == collectedIDs.length) && nftIDs.every((item, idx) => item === collectedIDs[idx])
                              if(isSame) console.log(data,  '=======data')

                              //Once donation is succesful create a row to store data
                              if (donationSuccess == true && nftMint == true) {

                                if (nftCount == 1) {

                                  console.log("YES")
                                  nftCount = 1

                                  const finalDonationAmount = await this.DonorPortal_DonationCut(amount)
                                  const donationAmountGBP = await this.Global_ConvertUSDtoGBP(finalDonationAmount)
                                  const donationAmountEUR = await this.Global_ConvertUSDtoEUR(finalDonationAmount)
                                  const numberOfTrees = await this.DonorPortal_CalculateDonationTreesPlanted(finalDonationAmount, causeRow.pricePerTree)
                                  const carbonSequestration = await this.DonorPortal_CalculateDonationCarbonSequestration(causeRow.yearlyCO2Sequestration, numberOfTrees)

                                  console.log('calling create row NFT and Donation row workflow')
                                  this.callWf({
                                    workflow: '-NAA9tsNod6psXPRUZr0',
                                    payload: {
                                      tokenID: tokenID,
                                      wallet: wallet,
                                      user: userParam,
                                      charity: charity,
                                      cause: projectParam,
                                      numberOfTrees: numberOfTrees,
                                      carbonSequestration: carbonSequestration,
                                      paymentMethod: paymentMethod,
                                      currency: currency,
                                      location: location,
                                      donationAmount: finalDonationAmount,
                                      donationAmountGBP: donationAmountGBP,
                                      donationAmountEUR: donationAmountEUR,
                                      gas: gas,
                                      date: date,
                                      nftCount: nftCount,
                                      json: jsonArray
                                    },
                                  })

                                }
                                else if (nftCount >= 2 && nftCount <= 10) {

                                  const finalDonationAmount = await this.DonorPortal_DonationCut(amount)
                                  const donationAmountGBP = await this.Global_ConvertUSDtoGBP(finalDonationAmount)
                                  const donationAmountEUR = await this.Global_ConvertUSDtoEUR(finalDonationAmount)
                                  const equalDonationAmount = await finalDonationAmount / nftCount

                                  const equalDonationAmountGBP = await donationAmountGBP / nftCount
                                  const equalDonationAmountEUR = await donationAmountEUR / nftCount

                                  const equalNumberOfTrees = await this.DonorPortal_CalculateDonationTreesPlanted(equalDonationAmount, causeRow.pricePerTree)
                                  const equalCarbonSequestration = await this.DonorPortal_CalculateDonationCarbonSequestration(causeRow.yearlyCO2Sequestration, equalNumberOfTrees)

                                  console.log('calling create multiple row NFT and Donation rows workflow')
                                  this.callWf({
                                    workflow: '-NAA9tsNod6psXPRUZr0',
                                    payload: {
                                      tokenID: tokenID,
                                      wallet: wallet,
                                      user: userParam,
                                      charity: charity,
                                      cause: projectParam,
                                      numberOfTrees: equalNumberOfTrees,
                                      carbonSequestration: equalCarbonSequestration,
                                      paymentMethod: paymentMethod,
                                      currency: currency,
                                      location: location,
                                      donationAmount: equalDonationAmount,
                                      donationAmountGBP: equalDonationAmountGBP,
                                      donationAmountEUR: equalDonationAmountEUR,
                                      gas: gas,
                                      date: date,
                                      nftCount: nftCount,
                                      json: jsonArray
                                    },
                                  })

                                }
                              }
                              else {
                                alert("Error with transaction/mint. Please contact support@betterverse.app");
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                } catch (ex) {
                  console.log('error occured on minting nft')
                  console.log('error msg:', ex)
                }
              }
            }
          }
          else {
            return null
          }
        }
        else {
          alert("Invalid NFT count value");
          return null
        }
      }
      else {
        console.log("Error obtaining cause/charity data")
        alert("Error, there is something wrong with obtaining the charity project data. Please contact support@betterverse.app.")
      }
    }
    return null
  }
}
