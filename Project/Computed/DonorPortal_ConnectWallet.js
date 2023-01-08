/* DonorPortal_ConnectWallet.js */

var currentUserRowKey = this.DonorPortal_GetCurrentUserRowKey()
var currentUserRow = this.DonorPortal_GetCurrentUser()
var currentSubTab = this.currentSubTab

return function (event) {

  //METAMASK
  let walletProvider = event.submitter.name

  if (walletProvider == 'connect-metamask') {
    const connectWalletHandler = async () => {
      const { ethereum } = window
      if (
        ethereum &&
        ethereum['providers'] &&
        ethereum.providers.find(({ isMetaMask }) => isMetaMask)
      ) {
        try {
          const MetamaskProvider = ethereum.providers.find(
            ({ isMetaMask }) => isMetaMask
          )
          const accounts = await MetamaskProvider.request({
            method: 'eth_requestAccounts'
          })
          wallet = accounts[0]

          //Save Wallet Address to User Profile Row
          $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
          $setDataGridVal(
            'users',
            currentUserRowKey + '.walletProvider',
            'metamask'
          )
          if (
            currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
            currentUserRow.walletAddress != null
          ) {
            $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
          }
        } catch (err) {
          console.log(err)
        }
      } else if (ethereum && ethereum.isMetaMask) {
        try {
          const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
          })
          wallet = accounts[0]

          //Save Wallet Address to User Profile Row
          $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
          $setDataGridVal(
            'users',
            currentUserRowKey + '.walletProvider',
            'metamask'
          )
          if (
            currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
            currentUserRow.walletAddress != null
          ) {
            $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
          }
          //this.DonorPortal_CloseConnectWalletModal()
        } catch (err) {
          console.log(err)
        }
      } else {
        alert('Please install MetaMask')
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
          window.open("https://metamask.io/faqs/")
        }
        else{
          window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en")
        }
      }
    }

    connectWalletHandler()

  //TORUS
  } else if (walletProvider == 'connect-torus') {
    const connectTorus = async () => {
      const torus = new Torus()
      window.torus = torus
      await window.torus.init({
        buildEnv: 'test', // default: production
        enableLogging: true, // default: false
        network: {
          host: 'mumbai', // default: mainnet
          chainId: 80001, // default: 1
          networkName: 'Mumbai Test Network' // default: Main Ethereum Network
        }
        // showTorusButton: false // default: true
      })
      await window.torus.login() // await torus.ethereum.enable()
      const web3 = new Web3(window.torus.provider)
      wallet = (await web3.eth.getAccounts())[0]
      //     const web3 = new Web3(torus.provider)
      //     const balance = await web3.eth.getBalance(wallet)
      $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
      $setDataGridVal('users', currentUserRowKey + '.walletProvider', 'torus')

      //If user is on the register page and connected wallet successful, redirect to topup page
      if (
        currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
        currentUserRow.walletAddress != null
      ) {
        $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
      }
      //this.DonorPortal_CloseConnectWalletModal()
    }

    connectTorus()

  //COINBASE
  } else if (walletProvider == 'connect-coinbase') {
    const connectWalletHandler = async () => {
      const { ethereum } = window

      if (
        ethereum &&
        ethereum['providers'] &&
        ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet)
      ) {
        try {
          const CoinbaseProvider = ethereum.providers.find(
            ({ isCoinbaseWallet }) => isCoinbaseWallet
          )
          const accounts = await CoinbaseProvider.request({
            method: 'eth_requestAccounts'
          })
          wallet = accounts[0]

          //Save Wallet Address to User Profile Row
          $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
           $setDataGridVal(
            'users',
            currentUserRowKey + '.walletProvider',
            'coinbase'
          )
          if (
            currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
            currentUserRow.walletAddress != null
          ) {
            $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
          }
        } catch (err) {
          console.log(err)
        }
      } else if (ethereum && ethereum.isCoinbaseWallet) {
        try {
          const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
          })
          wallet = accounts[0]

          //Save Wallet Address to User Profile Row
          $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
          $setDataGridVal(
            'users',
            currentUserRowKey + '.walletProvider',
            'coinbase'
          )
          if (
            currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
            currentUserRow.walletAddress != null
          ) {
            $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
          }

        } catch (err) {
          console.log(err)
        }
      } else {
        alert('Please install MetaMask/Coinbase')
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
          window.open("https://metamask.io/faqs/")
        }
        else{
          window.open("https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad?hl=en")
        }
      }
    }

    connectWalletHandler()

  //SLIDE
  } else if (walletProvider === "connect-slide") {
    const connectSlide = async () => {
      const slide = new Slide()
      await slide.init();

      const wallet = await slide.request({ method: "eth_requestAcccounts " })

      $setDataGridVal('users', currentUserRowKey + '.walletAddress', wallet)
      $setDataGridVal('users', currentUserRowKey + '.walletProvider', 'slide')

      //If user is on the register page and connected wallet successful, redirect to topup page
      if (
        currentSubTab == '-N4UIKK5MmraPqo_BhCH' &&
        currentUserRow.walletAddress != null
      ) {
        $setCurrentSubTab('-N6OJKPA76EZPTjdgEMp', '-Mx_5FLL2jlxjXYUMdIL')
      }
    }
  }

  return null
}
