/* DonorPortal_GetCurrentUserWalletBalance.js */

const tokenAddresses = {
  ETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
}

const tokenBalances = {
  ETH: '0',
  USDT: '0',
  USDC: '0'
}

const tokenABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    type: 'function'
  }
]

return async (walletAddress, currency = 'USDC') => {
  if (!walletAddress) return

  try {
    let amount = null

    const network_provider = new ethers.providers.JsonRpcProvider(
      'https://polygon-rpc.com/'
    )

    const get_balance = async currency => {
      const contract = new ethers.Contract(
        tokenAddresses[currency],
        tokenABI,
        network_provider
      )

      const res = await contract.balanceOf(walletAddress)
      tokenBalances[currency] = ethers.utils.formatUnits(res._hex, 6)
    }

    await get_balance(currency)

    switch (currency) {
      case 'ETH':
        return tokenBalances.ETH

      case 'USDC':
        return tokenBalances.USDC

      case 'USDT':
        return tokenBalances.USDT

      default:
        return tokenBalances
    }
  } catch (err) {
    console.error('DonorPortal_GetCurrentUserWalletBalance')
    console.error(err)
  }
}
