import { Injectable } from '@angular/core';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";

declare type RunningMode = "IMAGE" | "VIDEO";

@Injectable()
export class ServiceService
{
  handLandmarker!: HandLandmarker;
  enableWebcamButton!: HTMLButtonElement;
  video!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;
  canvasCtx!: CanvasRenderingContext2D | null;
  runningMode: RunningMode = "IMAGE";
  webcamRunning: Boolean = false;

  constructor()
  {
    FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    ).then((v) =>
    {
      console.log(v);

      const vision = v;
      HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: this.runningMode,
        numHands: 2,
      }).then((h) =>
      {
        console.log(h);
        this.handLandmarker = h;
      });
    });
  }

  // Check if webcam access is supported.
  hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

  // Enable the live webcam view and start detection.
  enableCam(_event: any)
  {
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (!this.hasGetUserMedia())
    {
      console.warn("getUserMedia() is not supported by your browser");
      alert("getUserMedia is not supported by your browser");
    }

    if (!this.handLandmarker)
    {
      console.log("Wait! objectDetector not loaded yet.");
      alert("Wait! objectDetector not loaded yet.")
      return;
    }

    if (this.webcamRunning === true)
    {
      this.webcamRunning = false;
      this.enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    } else
    {
      this.webcamRunning = true;
      this.enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }

    // getUsermedia parameters.
    const constraints = {
      video: true,
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) =>
    {
      this.video.srcObject = stream;
    });
  }

  lastVideoTime = -1;
  results: any;

  predictWebcam()
  {

    this.canvasElement.style.width = this.video.videoWidth.toString();
    this.canvasElement.style.height = this.video.videoHeight.toString();
    this.canvasElement.width = this.video.videoWidth;
    this.canvasElement.height = this.video.videoHeight;

    // Now let's start detecting the stream.
    if (this.runningMode === "IMAGE")
    {
      this.runningMode = "VIDEO";
      this.handLandmarker.setOptions({ runningMode: "VIDEO" }).then(() =>
      {
        this.callback();
        console.log("Running in video mode");
      });
    }
    else
    {
      this.callback();
    }
  }

  callback()
  {
    if (this.canvasCtx === null)
    {
      console.log("Wait! canvas is not loaded yet.");
      return;
    }

    let startTimeMs = performance.now();
    if (this.lastVideoTime !== this.video.currentTime)
    {
      this.lastVideoTime = this.video.currentTime;
      this.results = this.handLandmarker.detectForVideo(this.video, startTimeMs);
    }
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    if (this.results.landmarks)
    {
      for (const landmarks of this.results.landmarks)
      {
        drawConnectors(this.canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(this.canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    this.canvasCtx.restore();

    // Call this function again to keep predicting when the browser is ready.
    if (this.webcamRunning === true)
    {
      window.requestAnimationFrame(() => this.predictWebcam());
    }
  }
}
