const mailchimp = require("@mailchimp/mailchimp_marketing");
const listId = process.env.AUDIENCE_ID;

module.exports = {
  subcribeHandler: async function subscribeUser(subscribingUser) {
    try {
      const response = await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
          FNAME: subscribingUser.firstName,
          LNAME: subscribingUser.lastName
        }
      });

      console.log(
        `Successfully added contact as an audience member. The contact's id is ${response.id}.`
      );
    } catch (e) {
      console.log(e);
    }
  },
  getUserName: function getUser(userEmail){
      return userEmail.split("@")[0];
  }
};
