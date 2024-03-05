import { useState, useRef, useEffect } from "react";
import image from "./assets/OBJECTS.png";
import "./App.css";
import { fetchWinner } from "./api/winner-api";

const App = () => {
  const [winner, setWinner] = useState(null);
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
  const [isSpinning, setIsSpinning] = useState(false);
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
    const fetchWinnerData = async () => {
      try {
        const response = await fetchWinner();
        // console.log(response, "resp");
        setWinner(response?.data);
      } catch (error) {
        setWinner(error?.response?.data);
      }
    };

    fetchWinnerData();
  }, []);
  // console.log(winner,"winner");
  return (
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
      <button onClick={action} disabled={isSpinning}>
        Start
      </button>
    </div>
  );
};

export default App;
