return function(walletProvider){
  var currentUserRowKey = this.DonorPortal_GetCurrentUserRowKey();
  //Wallet Variable
  var wallet = null

  if(walletProvider == "Slide"){
      // wallet = 'TorusWalletAddressHere'

      (async () => {
          const slide = new Slide()
          await slide.init();

          const wallet = await slide.request({ method: "eth_requestAccounts" });

          const web3 = new Web3(slide);

          //$setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
          //$setDataGridVal('users', currentUserRowKey + '.walletProvider', 'slide')

          //If user is on the register page and connected wallet successful, redirect to topup page
          if (
          currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
          currentUserRow.walletAddress != null
          ) {
          $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
          }
      })()

  }

   return null
}