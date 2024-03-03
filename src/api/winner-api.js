import axios from "axios";
export const URL_API = import.meta.env.VITE_HOST_API;

export const fetchWinner = async () => {
    return await axios.post(`${URL_API}/api/get_winner`);
  };
  