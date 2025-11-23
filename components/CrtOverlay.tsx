
import React from 'react';

export const CrtOverlay: React.FC = () => {
  return (
    <>
      <style>
        {`
          .crt-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            pointer-events: none;
            overflow: hidden;
          }

          /* 
             Realistic Scanlines:
             A dense, static pattern. Real monitors have hundreds of lines.
             We simulate this with a 3px repeat.
             1px transparent, 2px slight dark.
          */
          .crt-scanlines {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0) 50%,
              rgba(0, 0, 0, 0.2) 50%
            );
            background-size: 100% 4px;
            z-index: 2;
          }

          /* 
             Vignette & Glass Curve:
             Simulates the physical curvature of the tube and the plastic bezel shadow.
             Static, no pulsing.
          */
          .crt-vignette {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background: radial-gradient(circle, rgba(0,0,0,0) 70%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0.6) 100%);
            box-shadow: inset 0 0 4rem rgba(0,0,0,0.2);
            z-index: 3;
          }
        `}
      </style>
      <div className="crt-container">
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
      </div>
    </>
  );
};
