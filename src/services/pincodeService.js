export const fetchAddressByPincode = async (pincode) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();

    if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.District,
        state: postOffice.State,
        area: postOffice.Name,
        fullAddress: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`,
      };
    }
    return null;
  } catch (err) {
    console.error("Pincode fetch failed:", err);
    return null;
  }
};