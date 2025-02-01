// Add this to the top of the file, so that it can reference the global.d.ts file
/// <reference path="../global.d.ts" />

const go = async () => {
  // Prints out the Lit Auth context
  console.log("[action] Lit.Auth:", Lit.Auth);
  // Converts the public key to a token ID
  const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey });
  console.log("[action] tokenId:", tokenId);
  // Gets the permitted auth methods for the token ID
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({
    tokenId,
  });
  console.log("[action] permittedAuthMethods:", permittedAuthMethods);
  // Signs the ECDSA signature
  const signature = await Lit.Actions.signEcdsa({ publicKey, toSign, sigName });
  // Sets the response to the Lit Actions context
  Lit.Actions.setResponse({
    response: JSON.stringify({
      HelloName: helloName,
      timestamp: Date.now().toString(),
    }),
  });
  // Returns the signature
  return signature;
};

go();
