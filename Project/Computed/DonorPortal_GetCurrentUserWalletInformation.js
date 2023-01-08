/* DonorPortal_GetCurrentUserWalletInformation.js */

return async () => {
  let current_user, address, balance, provider

  current_user = this.DonorPortal_GetCurrentUser()
  address = current_user.walletAddress
  provider = current_user.walletProvider
  balance = await this.DonorPortal_GetCurrentUserWalletBalance(
    this.DonorPortal_GetCurrentUserWalletAddress(),
    'USDC'
  )

  return {
    address: address,
    provider: this.DonorPortal_GetCurrentUserWalletProvider(),
    balance: await this.DonorPortal_DisplayUSDCBalance()
  }
}
