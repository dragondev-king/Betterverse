return async (tokenID, wallet, user, charity, cause, paymentMethod, currency, location, amount, gas, date, nftCount) => {

  //Get specific charity project details
  let project = $dataGrid('charityProjects')[cause]
  let pricePerTree = project.pricePerTree
  let yearlyCO2Sequestration = project.yearlyCO2Sequestration

  //5% of Donation
  let donationCut = amount * 0.05
  let donationAmount = amount - donationCut 

  //Donation Amount in £ and €
  let donationAmountGBP = await this.Global_ConvertUSDtoGBP(donationAmount)
  let donationAmountEUR = await this.Global_ConvertUSDtoEUR(donationAmount)

  if(project.inactiveProject != true && charity != null && cause != null && amount != null && nftCount != null && user != null){        
          //Single nft & donation
          if(nftCount == 1){
                  
                  //Impact Data
                  let numberOfTrees = Math.floor(donationAmount/pricePerTree)
                  let totalCarbonSequestration = (yearlyCO2Sequestration*numberOfTrees)

                  let newRow = await $dgAddRow('capturedDonationData',  {tokenID: tokenID,
                                                                          walletAddress: wallet,
                                                                          user: user,
                                                                          charity: charity, 
                                                                          charityProject: cause,
                                                                          paymentMethod: paymentMethod,
                                                                          //Default USDC
                                                                          currency: "-MvOSbx1QKOeHNJWW7pQ",
                                                                          donationLocation: location,
                                                                          donationAmount: donationAmount,
                                                                          gas: gas,
                                                                          donationDate: date,
                                                                          numberOfTreesPlanted: numberOfTrees,
                                                                          yearlyCarbonSequestration: totalCarbonSequestration,
                                                                          donationAmountGBP: donationAmountGBP,
                                                                          donationAmountEUR: donationAmountEUR
                                                                          })
                  console.log("Donation row created: " + newRow)

                  return newRow
          }
          
          //Multiple nfts with donation split equally
          else if(nftCount >= 2 && nftCount <= 10){
                  //Donation rows array
                  let donationRowsArray = []

                  //Impact Data
                  let equalDonationAmount = donationAmount / nftCount
                  let equalDonationAmountGBP = donationAmountGBP / nftCount
                  let equalDonationAmountEUR = donationAmountEUR / nftCount

                  let equalNumberOfTrees = Math.floor(equalDonationAmount/pricePerTree)
                  let equalCarbonSequestration = (yearlyCO2Sequestration*equalNumberOfTrees)

                  for(let i = 0; i < nftCount; i++){
                          let newRow = await $dgAddRow('capturedDonationData',  {tokenID: tokenID,
                                                                                  walletAddress: wallet,
                                                                                  user: user,
                                                                                  charity: charity, 
                                                                                  charityProject: cause,
                                                                                  paymentMethod: paymentMethod,
                                                                                  //Default USDC
                                                                                  currency: "-MvOSbx1QKOeHNJWW7pQ",
                                                                                  donationLocation: location,
                                                                                  donationAmount: equalDonationAmount,
                                                                                  gas: gas,
                                                                                  donationDate: date,
                                                                                  numberOfTreesPlanted: equalNumberOfTrees,
                                                                                  yearlyCarbonSequestration: equalCarbonSequestration,
                                                                                  donationAmountGBP: equalDonationAmountGBP,
                                                                                  donationAmountEUR: equalDonationAmountEUR
                                                                          })
                          console.log("Donation row " + i + " created: " + newRow)
                          donationRowsArray[i] = newRow
                  }
                  return donationRowsArray
          }
          else{
                  alert("Invalid NFT count value")
                  let errorLog = await $dgAddRow('rowCreationErrorLogs',  {name: 'Donation row creation error',
                                  errorDetails: 'Invalid NFT count value.',
                                  tokenID: tokenID,
                                  walletAddress: wallet,
                                  owner: user,
                                  charity: charity, 
                                  charityProject: cause,
                                  //Default USDC
                                  currency: "-MvOSbx1QKOeHNJWW7pQ",
                                  donationAmount: equalDonationAmount,
                                  donationDate: date
                          })
                  return null
          }
  }
  else{
          console.log("Error creating donation row, creating log")
          let errorLog = await $dgAddRow('rowCreationErrorLogs',  {name: 'Donation row creation error',
                                                  errorDetails: 'Vital values/parameters were missing therefore the IF statement to create the donation row(s) did not execute.',
                                                  tokenID: tokenID,
                                                  walletAddress: wallet,
                                                  owner: user,
                                                  charity: charity, 
                                                  charityProject: cause,
                                                  //Default USDC
                                                  currency: "-MvOSbx1QKOeHNJWW7pQ",
                                                  donationAmount: equalDonationAmount,
                                                  donationDate: date
                                          })
          return null
  }
}
