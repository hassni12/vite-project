import axios from "axios";
export const URL_API = import.meta.env.VITE_HOST_API;

export const fetchWinner = async () => {
    return await axios.post(`https://new.fustekaice.com/api/get_winner`);
  };

  export const winnerLisitng = async () => {
    return await axios.get(`https://new.fustekaice.com/api/get_winners_of_competitions`);
  };
