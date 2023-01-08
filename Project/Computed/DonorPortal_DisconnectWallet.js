return function(){

  //User Identifier
  var currentUserRowKey = this.DonorPortal_GetCurrentUserRowKey();

  let text = "Disconnect wallet from account?\nClick OK to disconnect wallet.";
  if (confirm(text) == true) {
      //Remove Wallet Address Value from User row (Set to null)
      $setDataGridVal('users', currentUserRowKey + '.walletAddress', null)
      $setDataGridVal('users', currentUserRowKey + '.walletProvider', null)

      //Disconnect wallet here

      //this.DonorPortal_DisableRamp()
      const walletProvider = this.DonorPortal_GetCurrentUserWalletProvider()
      const { ethereum } = window
      if(walletProvider == 'torus') {
          this.DonorPortal_HideTorusButton()
      }
      return true
  } else {
      return null
  }
}
