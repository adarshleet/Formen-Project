function generateMixedReferralCode(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const isLetter = i % 2 === 0;
      const characterPool = isLetter ? characters.slice(0, 26) : characters.slice(26);
      const randomIndex = Math.floor(Math.random() * characterPool.length);
      randomString += characterPool.charAt(randomIndex);
    }
    return randomString;
  }
  
  // Generate a mixed referral code of length 5
  const mixedReferralCode = generateMixedReferralCode(5);
  console.log(mixedReferralCode);