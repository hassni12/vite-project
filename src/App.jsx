import { useState, useRef, useEffect } from "react";
import image from "./assets/OBJECTS.png";
import "./App.css";
import { fetchWinner, winnerLisitng } from "./api/winner-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Confetti from "react-confetti";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useWindowSize } from "react-use";

const App = () => {
  const [winner, setWinner] = useState(null);
  const [tableData, setTableData] = useState([]);
  const { width, height: WINDOWHEIGHT } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);
  const useFetchWinnerMutation = () =>
    useQuery({
      queryKey: ["winner-listing-all"],
      queryFn: () => winnerLisitng(),
      refetchOnWindowFocus: false,
    });
  const {
    data: winnerListing,
    isError,
    isSuccess,
    isLoading,
  } = useFetchWinnerMutation();
  useEffect(() => {
    if (!isError && isSuccess && winnerListing) {
      setTableData(winnerListing?.data?.data);
    }
  }, [isError, isSuccess, winnerListing]);

  const tMax = 5000;
  const height = 210;
  let reels;
  if (winner && winner?.data && winner?.data?.code) {
    reels = winner?.data?.code
      ?.split("")
      ?.map((digit) => [parseInt(digit), parseInt(digit), parseInt(digit)]);
  } else {
    reels = [
      [3, 3, 3],
      [4, 4, 4],
      [5, 5, 5],
      [6, 6, 6],
      [7, 7, 7],
      [8, 8, 8],
      [9, 9, 9],
      [0, 0, 0],
      [2, 2, 2],
      [1, 1, 1],
    ];
  }
  const [msg, setMsg] = useState("");
  const reelsRefs = useRef([]);
  const speeds = useRef([]);
  const r = useRef([]);
  const start = useRef(null);

  const action = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setMsg("Spinning...");
    start.current = performance.now();
    const codeLength =
      winner && winner.data && winner.data.code ? winner.data.code.length : 10;
    for (let i = 0; i < codeLength; ++i) {
      speeds.current[i] = Math.random() + 0.5;
      r.current[i] = (((Math.random() * 3) | 0) * height) / 3;
    }
    animate(performance.now());
  };

  const animate = (now) => {
    if (!start.current) start.current = now;
    const t = now - start.current || 0;
    const codeLength =
      winner && winner.data && winner.data.code ? winner.data.code.length : 10;

    for (let i = 0; i < codeLength; ++i) {
      reelsRefs.current[i].scrollTop =
        ((speeds.current[i] / tMax / 2) * (tMax - t) * (tMax - t) +
          r.current[i]) %
        height;
    }
    if (t < tMax) {
      requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
      setMsg(winner?.data?.full_name || winner?.message);
    }
  };
  useEffect(() => {
    if (winner !== null) {
      action();
    }
  }, [winner]);
  // useEffect(() => {
  //     const fetchWinnerData = async () => {
  //       try {
  //         const response = await fetchWinner();
  //         // console.log(response, "resp");
  //         setWinner(response?.data);
  //       } catch (error) {
  //         setWinner(error?.response?.data);
  //       }
  //     };

  //     fetchWinnerData();
  //   }, []);
  const useGetWinnerMutation = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationFn: fetchWinner,
      onSuccess: async (data) => {
        queryClient.invalidateQueries({ queryKey: ["winner-listing-all"] });
        setShowConfetti(true);
        setWinner(data?.data);
      },
      onError: async (data) => {
        setWinner(data?.response?.data);
        // setShowConfetti(true);
      },
    });

    return mutation;
  };
  const { mutate } = useGetWinnerMutation();
  const handleClick = async () => {
    setShowConfetti(false);
    mutate();
  };
  return (
    <>
      {showConfetti && !isSpinning && (
        <Confetti width={width} height={WINDOWHEIGHT} tweenDuration={0.01} />
      )}
      <div id="sm">
        <h1>Slot Machine</h1>
        <div className="image-container">
          <img src={image} alt="Your Image" className="image" />
          <p className="msg">{msg}</p>
        </div>
        <div className="group">
          {reels?.map((reel, index) => (
            <div
              key={index}
              className="reel"
              ref={(el) => (reelsRefs.current[index] = el)}
            >
              {reel.map((number, rowIndex) => (
                <div key={rowIndex}>
                  {reel.map((num, columnIndex) => (
                    <p key={columnIndex}>{num}</p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "16px" }}></div>
        <button onClick={handleClick} disabled={isSpinning}>
          Start
        </button>
      </div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}
      >
        <div
          style={{
            width: "224px",
            height: "159px",
            gap: "0px",
            borderRadius: "10px",
            opacity: "0px",
            position: "absolute",
            backgroundColor: "rgba(239, 239, 239, 1)",
            border: "3px solid rgba(26, 26, 26, 1)",
            padding: "0.5em 0.5em 0.5em 0.5em",
            boxShadow: "0px 8px 4px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "end",
            }}
          >
            <p
              style={{
                fontFamily: "Raleway",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "23.48px",
                textAlign: "left",
                color: "rgba(236, 49, 49, 1)",
                padding: "0.3rem 0 0.5rem 0",
              }}
            >
              Recent Winners
            </p>
          </div>
          <div
            style={{
              height: "1px",
              backgroundColor: "gray",
              width: "100%",
              marginBottom: "6px",
            }}
          ></div>
          <div style={{ overflow: "auto", maxHeight: "120px" }}>
            <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
              {isLoading ? (
                <SkeletonTheme baseColor="#b5b5b5" highlightColor="#444">
                  <p>
                    <Skeleton count={4} style={{ marginBottom: "12px" }} />
                  </p>
                </SkeletonTheme>
              ) : tableData?.length > 0 ? (
                tableData?.map((user, index) => (
                  <li
                    key={index}
                    style={{
                      fontFamily: "Raleway",
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "21.13px",
                      textAlign: "left",
                    }}
                  >
                    {user?.full_name}
                  </li>
                ))
              ) : (
                <p   style={{
                  fontFamily: "Raleway",
                  fontSize: "16px",
                  fontWeight: "600",
                  lineHeight: "21.13px",
                  textAlign: "left",
                }}>winner not found</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
