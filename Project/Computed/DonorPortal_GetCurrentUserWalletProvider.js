return function () {
  let currentUser = this.DonorPortal_GetCurrentUser()

  var walletProvider

  if (currentUser.walletProvider != null) {
    walletProvider = currentUser.walletProvider
  }

  if (currentUser.walletProvider == null) {
    walletProvider = null
  }

  return walletProvider
}
