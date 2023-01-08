/* DonorPortal_TriggerDonateModal.js */

return function (value) {
  //Redirect to sign in
  if (this.DonorPortal_GetCurrentUserProfileComplete() != true) {
    this.DonorPortal_RedirectToSignIn()
  } else {
    $setUser('DonorPortal_DonationAmount', '100')
    var element = document.getElementById('bv__donatemodal')
    console.log(element)
    element.style.display = value
  }
}
