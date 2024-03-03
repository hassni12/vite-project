
import  { useState, useRef, useEffect } from "react";
import image from "./assets/OBJECTS.png";
import "./App.css";
import { fetchWinner } from "./api/winner-api";
const App = () => {
 
  const tMax = 5000; // animation time, ms
  const height = 210;
  const reels = [
    [3, 3, 3], // Reel 1
    [4, 4, 4], // Reel 2
    [5, 5, 5], // Reel 3
    [6, 6, 6], // Reel 4
    [7, 7, 7], // Reel 5
    [8, 8, 8], // Reel 6
    [9, 9, 9], // Reel 7
    [0, 0, 0], // Reel 8
    [2, 2, 2], // Reel 9
    [1, 1, 1], // Reel 10
  ];

  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
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

    for (let i = 0; i < 10; ++i) {
      speeds.current[i] = Math.random() + 0.5;
      r.current[i] = (((Math.random() * 3) | 0) * height) / 3;
    }

    animate(performance.now());
  };

  const animate = (now) => {
    if (!start.current) start.current = now;
    const t = now - start.current || 0;

    for (let i = 0; i < 10; ++i) {
      reelsRefs.current[i].scrollTop =
        ((speeds.current[i] / tMax / 2) * (tMax - t) * (tMax - t) + r.current[i]) % height;
    }

    if (t < tMax) {
      requestAnimationFrame(animate);
    } else {
      setIsSpinning(false); // Disable spinning when animation ends
      setMsg("DD");
    }
  };
  useEffect(() => {
    const response =fetchWinner()
    setWinner(response.data);
  },[])
  console.log(winner,"winner");
  return (
    <div id="sm">
      <h1>Slot Machine</h1>
      <div className="image-container">
        <img src={image} alt="Your Image" className="image" />
        <p className="msg">{msg}</p>
      </div>
      <div className="group">
        {reels.map((reel, index) => (
          <div key={index} className="reel" ref={(el) => (reelsRefs.current[index] = el)}>
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
