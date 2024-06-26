import { useState, useRef, useEffect } from "react";
import image from "./assets/OBJECTS.png";
import "./App.css";
import {
  checkWinnerWeekly,
  fetchWinner,
  winnerLisitng,
  winnerweeklyLisitng,
} from "./api/winner-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Confetti from "react-confetti";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useWindowSize } from "react-use";

const App = () => {
  const [winner, setWinner] = useState(null);
  const [tableData, setTableData] = useState([]);
  const { width, height: WINDOWHEIGHT } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isStart, setIsStart] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);
  const useFetchWinnerWeekly = () => {
    const mutation = useMutation({
      mutationFn: winnerweeklyLisitng,
      onSuccess: async (data) => {
        if (data?.data?.is_start) {
          setIsStart(true);
        } else if (data?.data?.is_start === false) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "The competition has not started yet!",
          });
        }
      },
      onError: async () => {
        setIsStart(true);

        // Swal.fire({
        //   icon: "error",
        //   title: "Oops...",
        //   text: data?.response?.data?.message || "Something went wrong!",
        // });
      },
    });

    return mutation;
  };
  const { mutate: mutateWeek } = useFetchWinnerWeekly();
  // checkWinnerWeekly

  const useFetchCheckWinnerMutation = () =>
    useQuery({
      queryKey: ["winner-check-listing-all"],
      queryFn: () => checkWinnerWeekly(),
      refetchOnWindowFocus: false,
    });
  const {
    data,
    isLoading: isCheckLoading,
    isError: isCheckError,
  } = useFetchCheckWinnerMutation();
  
  useEffect(() => {
    const handleStartCompetition = () => {
      if (!data?.data?.is_start) {
        Swal.fire({
          title: "Are you sure you want to start the competition?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, initiate competition",
          cancelButtonText: "Cancel",
          customClass: {
            confirmButton: "start-competition-btn",
          },
          showCloseButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            mutateWeek();
          }
        });
      }
      // else {
      //   setIsStart(true);
      // }
    };

    if (!isCheckLoading && !isCheckError) {
      handleStartCompetition();
    }
  }, [data, isCheckLoading, isCheckError]);
  const useFetchWinnerMutation = () =>
    useQuery({
      queryKey: ["winner-listing-all"],
      queryFn: () => winnerLisitng(),
      refetchOnWindowFocus: false,
      enabled: isStart,
    });
  const {
    data: winnerListing,
    isError,
    isSuccess,
    isLoading,
  } = useFetchWinnerMutation();

  useEffect(() => {
    if (!isError && isSuccess && winnerListing) {
      const newData = winnerListing?.data?.data;
      if (newData && newData.length > 0) {
        updateDataGradually(newData, 0);
      }
    }
  }, [isError, isSuccess, winnerListing]);

  const updateDataGradually = (data, index) => {
    if (index < data.length) {
      setTimeout(() => {
        setTableData((prevData) => {
          const newData = [...prevData];
          newData[index] = data[index];
          return newData;
        });
        updateDataGradually(data, index + 1);
      }, 3000);
    }
  };

  const tMax = 5000;
  const height = 196;

  const [reels, setReels] = useState( [
    [1, 3, 5, 6, 7, 9],
    [2, 4, 6, 7, 8, 5],
    [3, 6, 7, 9, 4],
    [4, 5, 7, 0, 1],
    [5, 7, 8, 2, 6],
    [6, 7, 9, 1, 3],
    [0, 3, 4, 7, 8],
    [1, 4, 7, 8, 2, 0],
    [2, 5, 7, 9, 1, 4],
    [0, 3, 6, 7, 5],
  ]);
  useEffect(() => {
    if (winner && winner?.data && winner?.data?.code) {
      const codeLength = winner.data.code.length;
      const newReels = Array.from({ length: codeLength }, () =>
        Array.from({ length: 4 }, () => Math.floor(Math.random() * 10))
      );
      setReels(newReels);
    }
  }, [winner]);

  const [msg, setMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [gift, setGift] = useState("");
  const reelsRefs = useRef([]);
  const speeds = useRef([]);
  const r = useRef([]);
  const start = useRef(null);
  const action = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setMsg("Spinning...");
    setPhone("");
    setGift("");
    start.current = performance.now();
    const codeLength =
      winner && winner?.data && winner?.data?.code
        ? winner?.data?.code?.length
        : 10;
    // console.log(codeLength);
    for (let i = 0; i < codeLength; ++i) {
      speeds.current[i] = Math.random() + 3.5;
      r.current[i] = (((Math.random() * 10) | 0) * height) / 3;
    }
    animate(performance.now());
  };

  const animate = (now) => {
    if (!start.current) start.current = now;
    const t = now - start.current || 0;
    const codeLength =
      winner && winner.data && winner.data.code ? winner.data.code.length : 10;

    for (let i = 0; i < codeLength; ++i) {
      if (reelsRefs.current[i]) {
        reelsRefs.current[i].scrollTop =
          ((speeds.current[i] / tMax / 2) * (tMax - t) * (tMax - t) +
            r.current[i]) %
          height;
      }
    }
    if (t < tMax) {
      requestAnimationFrame(animate);
    } else {
      setIsSpinning(false);
      setMsg(winner?.data?.full_name || winner?.message);
      setPhone(`*******${winner?.data?.phone.slice(-4) || ""}`);
      setGift(winner?.data?.gift || "");
      if (winner && winner?.data && winner?.data?.code) {
        setReels(
          winner?.data?.code
            ?.split("")
            ?.map((digit) => [
              parseInt(digit),
              parseInt(digit),
              parseInt(digit),
            ])
        );
      }
    }
  };

  useEffect(() => {
    if (winner !== null) {
      action();
    }
  }, [winner]);

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
    setIsStart(true);
    mutate();
    setReels( [
      [1, 3, 5, 6, 7, 9],
      [2, 4, 6, 7, 8, 5],
      [3, 6, 7, 9, 4],
      [4, 5, 7, 0, 1],
      [5, 7, 8, 2, 6],
      [6, 7, 9, 1, 3],
      [0, 3, 4, 7, 8],
      [1, 4, 7, 8, 2, 0],
      [2, 5, 7, 9, 1, 4],
      [0, 3, 6, 7, 5],
    ]);
  };
  return (
    <>
      {showConfetti && !isSpinning && (
        <Confetti width={width} height={WINDOWHEIGHT} tweenDuration={0.01} />
      )}
      <div id="sm">
        <h1>Fusteka Group</h1>
        <div className="image-container">
          <img src={image} alt="Your Image" className="image" />

          <p className="msg">{msg}</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <p className="other-paragraphs">{gift}</p>
            <p className="other-paragraphs-phone">{phone}</p>
          </div>
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
        <button onClick={handleClick}>أبدأ</button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div className="responsiveDiv">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
              قائمة الفائزين{" "}
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              overflow: "auto",
              maxHeight: "120px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Raleway",
                  fontSize: "16px",
                  fontWeight: "700",
                  lineHeight: "21.13px",
                  textAlign: "center",
                }}
              >
                أسم الفائز
              </p>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "gray",
                  width: "100%",
                  marginBottom: "6px",
                }}
              ></div>
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
                        display: "flex",
                        justifyContent: "center",
                        fontFamily: "Raleway",
                        fontSize: "16px",
                        fontWeight: "500",
                        lineHeight: "21.13px",
                        textAlign: "center",
                      }}
                    >
                      {user?.full_name}
                    </li>
                  ))
                ) : (
                  <p
                    style={{
                      fontFamily: "Raleway",
                      fontSize: "12px",
                      fontWeight: "600",
                      lineHeight: "21.13px",
                      textAlign: "center",
                    }}
                  >
                    winner not found
                  </p>
                )}
              </ul>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Raleway",
                  fontSize: "16px",
                  fontWeight: "700",
                  lineHeight: "21.13px",
                  textAlign: "center",
                }}
              >
                الجائزة
              </p>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "gray",
                  width: "100%",
                  marginBottom: "6px",
                }}
              ></div>
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
                        display: "flex",
                        justifyContent: "center",
                        fontFamily: "Raleway",
                        fontSize: "12px",
                        fontWeight: "500",
                        lineHeight: "21.13px",
                        textAlign: "center",
                      }}
                    >
                      {user?.gift_ar ? user.gift_ar : user.gift}
                    </li>
                  ))
                ) : (
                  <p
                    style={{
                      fontFamily: "Raleway",
                      fontSize: "12px",
                      fontWeight: "600",
                      lineHeight: "21.13px",
                      textAlign: "center",
                    }}
                  >
                    winner not found
                  </p>
                )}
              </ul>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "Raleway",
                  fontSize: "16px",
                  fontWeight: "700",
                  lineHeight: "21.13px",
                  textAlign: "center",
                }}
              >
                رقم الهاتف
              </p>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "gray",
                  width: "100%",
                  marginBottom: "6px",
                }}
              ></div>
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
                        display: "flex",
                        justifyContent: "center",
                        fontFamily: "Raleway",
                        fontSize: "16px",
                        fontWeight: "500",
                        lineHeight: "21.13px",
                        textAlign: "center",
                      }}
                    >
                      {`*******${user?.phone.slice(-4)}`}
                    </li>
                  ))
                ) : (
                  <p
                    style={{
                      fontFamily: "Raleway",
                      fontSize: "12px",
                      fontWeight: "600",
                      lineHeight: "21.13px",
                      textAlign: "center",
                    }}
                  >
                    winner not found
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
