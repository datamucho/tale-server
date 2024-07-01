import { initiateBogPayResponse } from "../types/bog.types";

import axios from "axios";

const initiateBogPay = async (
  token: string,
  pid: string,
  exid: string,
  price: number,
  callbackUrl: string,
  successUrl: string,
  errorUrl: string
): Promise<initiateBogPayResponse | void> => {
  let data = JSON.stringify({
    callback_url: callbackUrl,
    external_order_id: exid,
    purchase_units: {
      currency: "GEL",
      total_amount: 1,
      basket: [
        {
          quantity: 1,
          unit_price: price,
          product_id: pid,
        },
      ],
    },
    redirect_urls: {
      fail: errorUrl,
      success: successUrl,
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.bog.ge/payments/v1/ecommerce/orders",
    headers: {
      "Accept-Language": "ka",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return axios
    .request(config)
    .then((response: { data: initiateBogPayResponse }) => {
      return response?.data;
    })
    .catch((error: any) => {
      console.log(error);
    });
};

export { initiateBogPay };
