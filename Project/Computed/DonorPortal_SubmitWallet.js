/* DonorPortal_SubmitWallet.js */

return async event => {
  let submitter = event.submitter.name

  switch (submitter) {
    case 'connect-metamask':
      console.error('Metamask not implemented')
    case 'connect-torus':
      console.error('Torus not implemented')
    case 'connect-coinbase':
      console.error('Coinbase not implemented')
    case 'create-torus':
      console.error('Create Torus wallet not implemented')
  }
}
