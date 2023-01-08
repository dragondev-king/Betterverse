return function(charityRowKey){

  $setUser('charityProfile', charityRowKey)
  console.log("Current chartity profile changed to: " + charityRowKey)

  return null
}
