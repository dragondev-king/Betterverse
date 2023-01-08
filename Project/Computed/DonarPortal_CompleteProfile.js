return async () => {

  document.getElementById("bv__right__arrow").style.display = "none";
  document.getElementById("bv__spinner").style.display = "block";

  await new Promise(r => setTimeout(r, 2000));

  const users = $getGrid('users')
  const now = this.DonorPortal_GetDateTime()
  let currentUserUID = fbUser.uid
  let currentUser = _.find(users, { user: fbUser.uid })
  let currentUserRowKey = currentUser.rowKey

  await $setDataGridVal('users', currentUserRowKey + '.profileComplete', true)
  $setDataGridVal('users', currentUserRowKey + '.dateJoined', now)
  let paramUserRow = ($dataGrid('users')[currentUserRowKey])
  let paramc = JSON.stringify(paramUserRow)

  $setUser('ProfileSetUpStage', 'complete')

  //Email confirmation
  this.callWf({
    workflow: '-N05ktsmJ1-FlKZtHjLi',
    payload: {
        val1: paramc,
    },
  })

  //Redirect User to Dashboard
  $setCurrentTab('-Mx_5FLL2jlxjXYUMdIL')
  
}