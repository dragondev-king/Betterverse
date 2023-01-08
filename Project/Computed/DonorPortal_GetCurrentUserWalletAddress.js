return function () {
  let currentUser = this.DonorPortal_GetCurrentUser()

  if (!currentUser.walletAddress) return null

  if (currentUser.walletAddress.length < 30) {
    return null
  }


  return currentUser.walletAddress

  /*
  
  else if (currentUser.walletAddress.length < 30){
    return null
  }

  else{ 
    return null
  }
*/
}
