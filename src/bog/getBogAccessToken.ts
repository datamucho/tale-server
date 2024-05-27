import axios from "axios";
import qs from "qs";

let data = qs.stringify({
  grant_type: "client_credentials",
});

const username = process.env.BOG_USERNAME;
const password = process.env.BOG_PASSWORD;

const authString = Buffer.from(`${username}:${password}`).toString("base64");

let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${authString}`,
    Cookie:
      "TS012d4351=01db23c6985c520095a2254f468c095aaae608625ff9a239121d1bc3d93215a0a548710ba049acd1362cc0bd671fed7f9e7638e42c88acdaafc15c8e61a5d936b1e33b3517; TS0127356e=01db23c698048af499636fdd817cb666c07056bbe4f9a239121d1bc3d93215a0a548710ba060f2bd3f641fef0c55a663ab83fbdfe0",
  },
  data: data,
};

const getBogAccessToken = () =>
  axios
    .request(config)
    .then((response) => {
      return response?.data?.access_token;
    })
    .catch((error) => {
      console.log({ error });
      return null;
    });

export { getBogAccessToken };
