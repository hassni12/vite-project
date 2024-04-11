import axios from "axios";
export const URL_API = import.meta.env.VITE_HOST_API;
// export const URL_API = import.meta.env.VITE_HOST_API_LIVE;

export const fetchWinner = async () => {
    return await axios.post(`${URL_API}/api/get_winner`);
  };

  export const winnerLisitng = async () => {
    return await axios.get(`${URL_API}/api/get_winners_of_competitions`);
  };


  export const winnerweeklyLisitng = async () => {
    return await axios.post(`${URL_API}/api/start_competition_weekly`);
  };
